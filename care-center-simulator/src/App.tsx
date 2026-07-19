import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AgentChatPanel } from "./components/AgentChatPanel";
import { CareFloor } from "./components/CareFloor";
import { atlasReducer, createInitialAtlasState, type CarryItem } from "./domain/atlas-machine";
import { agvMotionReducer, createIdleMotionState, type AgvMotionPhase } from "./domain/agv-motion-emulator";
import { getNextPatrolStop, getPatrolDwellMs } from "./domain/patrol-controller";
import type { MiraChatResponse, MotionMission } from "./integration/agent-chat-client";
import "./styles.css";

type TimelineEvent = { id: number; time: string; actor: string; message: string; tone: "system" | "atlas" | "attention" };
type PendingMission = { mission: MotionMission; item: CarryItem; missionId: string };

const initialEvents: TimelineEvent[] = [
  { id: 1, time: "09:42:00", actor: "SYSTEM", message: "Four-chair treatment floor initialized", tone: "system" },
  { id: 2, time: "09:42:01", actor: "ATLAS", message: "Starting routine operational round", tone: "atlas" }
];

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

const motionLabels: Record<AgvMotionPhase, string> = {
  idle: "idle",
  "moving-to-hub": "moving to hub",
  "picking-up": "picking up item",
  "moving-to-chair": "moving to chair",
  delivering: "delivering item",
  completed: "mission complete"
};

export default function App() {
  const [atlas, dispatch] = useReducer(atlasReducer, undefined, createInitialAtlasState);
  const [motion, motionDispatch] = useReducer(agvMotionReducer, undefined, createIdleMotionState);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const [events, setEvents] = useState(initialEvents);
  const [evidenceRef, setEvidenceRef] = useState<string | null>(null);
  const [pendingMission, setPendingMission] = useState<PendingMission | null>(null);
  const eventId = useRef(3);
  const motionActive = motion.phase !== "idle" && motion.phase !== "completed";
  const taskBusy = motionActive || pendingMission !== null;

  const log = useCallback((actor: string, message: string, tone: TimelineEvent["tone"] = "system") => {
    setEvents((current) => [...current, { id: eventId.current++, time: now(), actor, message, tone }].slice(-12));
  }, []);

  const beginDeliveryMission = useCallback((chairId: MotionMission["destination"], item: CarryItem, missionId: string) => {
    setSelectedChair(chairId);
    motionDispatch({
      type: "start-delivery",
      missionId,
      chairId,
      item,
      currentLocation: atlas.location
    });
  }, [atlas.location]);

  const startDeliveryMission = useCallback((mission: MotionMission) => {
    if (atlas.destination && motion.phase === "idle") {
      setPendingMission({ mission, item: mission.item, missionId: mission.missionId });
      log("ATLAS", "Worker task received · diverting at the next safe waypoint", "atlas");
      return;
    }
    beginDeliveryMission(mission.destination, mission.item, mission.missionId);
  }, [atlas.destination, beginDeliveryMission, log, motion.phase]);

  useEffect(() => {
    if (!pendingMission || atlas.destination || motion.phase !== "idle") return;
    const queued = pendingMission;
    setPendingMission(null);
    beginDeliveryMission(queued.mission.destination, queued.item, queued.missionId);
  }, [atlas.destination, beginDeliveryMission, motion.phase, pendingMission]);

  useEffect(() => {
    if (motion.phase !== "idle" || atlas.destination || pendingMission) return;
    const destination = getNextPatrolStop(atlas.location);
    const timer = window.setTimeout(() => {
      setSelectedChair(destination === "nurse-station" ? null : destination);
      dispatch({ type: "move", destination });
      log("ATLAS", `Routine round · moving to ${destination === "nurse-station" ? "operations hub" : destination.replace("chair-0", "Chair ")}`, "atlas");
    }, getPatrolDwellMs(atlas.location));
    return () => window.clearTimeout(timer);
  }, [atlas.destination, atlas.location, log, motion.phase, pendingMission]);

  useEffect(() => {
    let timer: number | undefined;

    if (motion.phase === "moving-to-hub" && motion.destination) {
      dispatch({ type: "move", destination: motion.destination });
      log("AGV MOTION", "Returning Atlas to the operations hub before pickup", "atlas");
    }

    if (motion.phase === "picking-up" && motion.requestedItem) {
      log("AGV MOTION", `Picking up ${motion.requestedItem} at the operations hub`, "atlas");
      timer = window.setTimeout(() => {
        dispatch({ type: "carry", item: motion.requestedItem as CarryItem });
        motionDispatch({ type: "pickup-complete" });
      }, 700);
    }

    if (motion.phase === "moving-to-chair" && motion.destination) {
      dispatch({ type: "move", destination: motion.destination });
      log("AGV MOTION", `Moving to ${motion.destination.replace("chair-0", "Chair ")}`, "atlas");
    }

    if (motion.phase === "delivering" && motion.chairId && motion.requestedItem) {
      log("AGV MOTION", `Delivering ${motion.requestedItem} at ${motion.chairId.replace("chair-0", "Chair ")}`, "atlas");
      timer = window.setTimeout(() => {
        dispatch({ type: "deliver" });
        motionDispatch({ type: "delivery-complete" });
      }, 850);
    }

    if (motion.phase === "completed") {
      log("AGV MOTION", `Mission ${motion.missionId ?? "completed"} complete · routine round will resume`, "atlas");
      if (evidenceRef) {
        log("A2A", `Trace closed · ${evidenceRef}`, "system");
      }
      setEvidenceRef(null);
      motionDispatch({ type: "clear", currentLocation: motion.currentLocation });
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [evidenceRef, log, motion.chairId, motion.currentLocation, motion.destination, motion.missionId, motion.phase, motion.requestedItem]);

  const onArrive = useCallback(() => {
    const destination = atlas.destination;
    dispatch({ type: "arrive" });
    if (destination) log("ATLAS", `Arrived at ${destination === "nurse-station" ? "operations center" : destination.replace("chair-0", "Chair ")}`, "atlas");
    if (destination && destination === motion.destination && ["moving-to-hub", "moving-to-chair"].includes(motion.phase)) {
      motionDispatch({ type: "arrived" });
      return;
    }
    if (destination) {
      log("ATLAS", destination === "nurse-station" ? "Routine round complete · brief pause at operations hub" : `Routine round pause at ${destination.replace("chair-0", "Chair ")}`, "atlas");
    }
  }, [atlas.destination, log, motion.destination, motion.phase]);

  const handleAtlasMission = (mission: MotionMission, response: MiraChatResponse) => {
    setEvidenceRef(response.coordination?.artifact?.evidenceRefs?.[0] ?? null);
    log("MIRA", `Dispatched ${mission.item} to Atlas · A2A task verified`, "system");
    startDeliveryMission(mission);
  };

  const activityLabel = motionActive
    ? motionLabels[motion.phase]
    : pendingMission
      ? "task queued"
      : atlas.destination
        ? "routine round"
        : atlas.location === "nurse-station"
          ? "at hub"
          : "round pause";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">C</div><div><span>IN-CENTER HEMODIALYSIS</span><h1>CareLoop Operations</h1></div></div>
        <div className="demo-badge"><i /> SIMULATION · CHICAGO POD</div>
        <div className="clock"><span>SESSION TIME</span><strong>09:42:18</strong></div>
      </header>

      <section className="workspace">
        <div className="scene-panel">
          <div className="scene-heading"><div><span>LIVE TREATMENT FLOOR</span><strong>Four-chair care pod</strong></div><div className="legend"><span><i className="stable" />Stable</span><span><i className="watch" />Watch</span><span><i className="attention" />Attention</span></div></div>
          <div className="canvas-wrap"><CareFloor atlas={atlas} activityLabel={activityLabel} motionPhase={motion.phase} selectedChair={selectedChair} onChairSelect={setSelectedChair} onAtlasArrive={onArrive} /><div className="view-label">FIXED 2.5D VIEW · ROUTINE ROUND</div></div>
        </div>

        <aside className="control-panel conversation-panel">
          <div className="panel-title"><div><span>DIGITAL CARE TEAM</span><h2>Mira Coordination</h2></div><div className={`status-pill ${atlas.status}`} data-testid="motion-phase"><i />{activityLabel}</div></div>

          <AgentChatPanel disabled={taskBusy} onAtlasMission={handleAtlasMission} onTrace={log} />

          <section className="timeline"><div className="timeline-heading"><span>LIVE EVENT TRACE</span><small>{events.length} events</small></div><div className="event-list">{events.map((event) => <div className={`event ${event.tone}`} key={event.id}><time>{event.time}</time><div><strong>{event.actor}</strong><p>{event.message}</p></div></div>)}</div></section>
        </aside>
      </section>
      <footer><span>FICTIONAL · SYNTHETIC DATA · NON-CLINICAL POC</span><span>MIRA ORCHESTRATION · FORMAL A2A · ATLAS WORKER</span></footer>
    </main>
  );
}
