import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { CareFloor } from "./components/CareFloor";
import { atlasReducer, createInitialAtlasState, createPatrolRoute, type CarryItem } from "./domain/atlas-machine";
import { floorLayout, type WaypointId } from "./domain/floor-layout";
import "./styles.css";

type TimelineEvent = { id: number; time: string; actor: string; message: string; tone: "system" | "atlas" | "attention" };

const initialEvents: TimelineEvent[] = [
  { id: 1, time: "09:42:00", actor: "SYSTEM", message: "Four-chair treatment floor initialized", tone: "system" },
  { id: 2, time: "09:42:01", actor: "ATLAS", message: "Standing by at operations center", tone: "atlas" }
];

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export default function App() {
  const [atlas, dispatch] = useReducer(atlasReducer, undefined, createInitialAtlasState);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const [events, setEvents] = useState(initialEvents);
  const [patrol, setPatrol] = useState<WaypointId[]>([]);
  const eventId = useRef(3);

  const log = useCallback((actor: string, message: string, tone: TimelineEvent["tone"] = "system") => {
    setEvents((current) => [...current, { id: eventId.current++, time: now(), actor, message, tone }].slice(-12));
  }, []);

  const moveTo = useCallback((destination: WaypointId) => {
    setSelectedChair(destination === "nurse-station" ? null : destination);
    dispatch({ type: "move", destination });
    log("ATLAS", `Moving to ${destination === "nurse-station" ? "operations center" : destination.replace("chair-0", "Chair ")}`, "atlas");
  }, [log]);

  const onArrive = useCallback(() => {
    const destination = atlas.destination;
    dispatch({ type: "arrive" });
    if (destination) log("ATLAS", `Arrived at ${destination === "nurse-station" ? "operations center" : destination.replace("chair-0", "Chair ")}`, "atlas");
    setPatrol((route) => {
      if (route.length <= 1) return [];
      const next = route.slice(1);
      window.setTimeout(() => dispatch({ type: "move", destination: next[0] }), 500);
      return next;
    });
  }, [atlas.destination, log]);

  const startPatrol = () => {
    const route = createPatrolRoute(42);
    setPatrol(route);
    dispatch({ type: "move", destination: route[0] });
    log("SYSTEM", "Deterministic patrol started · seed 42");
  };

  const stop = () => {
    setPatrol([]);
    dispatch({ type: "stop" });
    log("ATLAS", "Movement stopped", "atlas");
  };

  const reset = () => {
    setPatrol([]);
    setSelectedChair(null);
    dispatch({ type: "reset" });
    setEvents(initialEvents);
    log("SYSTEM", "Simulation reset to known initial state");
  };

  const carry = (item: CarryItem) => {
    dispatch({ type: "carry", item });
    log("ATLAS", `Picked up ${item} at operations center`, "atlas");
  };

  const requestSupport = (item: CarryItem) => {
    if (!selectedPatient) return;
    setPatrol([]);
    log("PATIENT", `${selectedPatient.patient} requested ${item}`, "system");
    dispatch({ type: "carry", item });
    window.setTimeout(() => {
      dispatch({ type: "move", destination: selectedPatient.id });
      log("ATLAS", `Accepted ${item} delivery to Chair ${selectedPatient.number}`, "atlas");
    }, 120);
  };

  const deliver = () => {
    if (!atlas.item || atlas.location === "nurse-station") return;
    log("ATLAS", `Delivered ${atlas.item} at ${atlas.location.replace("chair-0", "Chair ")}`, "atlas");
    dispatch({ type: "deliver" });
  };

  const selectedPatient = useMemo(() => floorLayout.chairs.find((chair) => chair.id === selectedChair), [selectedChair]);

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
          <div className="canvas-wrap"><CareFloor atlas={atlas} selectedChair={selectedChair} onChairSelect={setSelectedChair} onAtlasArrive={onArrive} /><div className="view-label">FIXED 2.5D VIEW</div></div>
        </div>

        <aside className="control-panel">
          <div className="panel-title"><div><span>ATLAS PLAYGROUND</span><h2>Field controls</h2></div><div className={`status-pill ${atlas.status}`}><i />{atlas.status}</div></div>

          <section className="control-section">
            <label>DESTINATION</label>
            <div className="destination-grid">
              <button onClick={() => moveTo("nurse-station")}>⌂<span>Home</span></button>
              {floorLayout.chairs.map((chair) => <button key={chair.id} className={selectedChair === chair.id ? "active" : ""} onClick={() => moveTo(chair.id)}>{chair.number}<span>Chair</span></button>)}
            </div>
          </section>

          <section className="control-section">
            <label>CARRY FROM OPERATIONS CENTER</label>
            <div className="item-grid">
              <button className={atlas.item === "water" ? "active" : ""} onClick={() => carry("water")}>◒<span>Water</span></button>
              <button className={atlas.item === "coffee" ? "active" : ""} onClick={() => carry("coffee")}>◉<span>Coffee</span></button>
              <button className={atlas.item === "blanket" ? "active" : ""} onClick={() => carry("blanket")}>▰<span>Blanket</span></button>
            </div>
            <button className="primary-action" disabled={!atlas.item || atlas.location === "nurse-station"} onClick={deliver}>Complete delivery</button>
          </section>

          <section className="control-section actions">
            <button onClick={startPatrol}>↻ Start patrol</button><button onClick={stop}>■ Stop</button><button onClick={reset}>↺ Reset</button>
          </section>

          {selectedPatient && <section className={`patient-focus ${selectedPatient.status}`}><span>PATIENT REQUEST</span><strong>{selectedPatient.patient} · Chair {selectedPatient.number}</strong><div><b>{selectedPatient.bp}</b><small>BP mmHg</small><b>{selectedPatient.heartRate}</b><small>Heart rate</small></div><div className="request-actions"><button onClick={() => requestSupport("water")}>Water</button><button onClick={() => requestSupport("coffee")}>Coffee</button><button onClick={() => requestSupport("blanket")}>Blanket</button></div></section>}

          <section className="timeline"><div className="timeline-heading"><span>LIVE EVENT TRACE</span><small>{events.length} events</small></div><div className="event-list">{events.map((event) => <div className={`event ${event.tone}`} key={event.id}><time>{event.time}</time><div><strong>{event.actor}</strong><p>{event.message}</p></div></div>)}</div></section>
        </aside>
      </section>
      <footer><span>FICTIONAL · SYNTHETIC DATA · NON-CLINICAL POC</span><span>PLAYGROUND MODE · ROUTINE SUPPORT</span></footer>
    </main>
  );
}
