import { useEffect, useMemo, useState } from "react";
import { floorLayout } from "../domain/floor-layout";
import type { AtlasState } from "../domain/atlas-machine";
import { getRoute, routeCoordinates, routeNetworkSegments, type RoutePointId } from "../domain/route-planner";

type CareFloorProps = {
  atlas: AtlasState;
  activityLabel: string;
  motionPhase: string;
  selectedChair: string | null;
  onChairSelect: (chairId: string) => void;
  onAtlasArrive: () => void;
};

const chairScreenPositions = [
  { left: "20%", top: "22%" },
  { left: "80%", top: "22%" },
  { left: "20%", top: "76%" },
  { left: "80%", top: "76%" }
];

function ChairPod({ index, selected, onSelect }: { index: number; selected: boolean; onSelect: () => void }) {
  const chair = floorLayout.chairs[index];
  return (
    <button className={`floor-chair ${chair.status} ${selected ? "selected" : ""}`} style={chairScreenPositions[index]} onClick={onSelect} aria-label={`Chair ${chair.number}, ${chair.patient}`}>
      <div className="patient-avatar"><i className="patient-head" /><i className="patient-body" /></div>
      <div className="chair-shell"><i className="chair-back" /><i className="chair-seat" /><i className="dialysis-machine"><b /></i></div>
      <div className="floor-chair-label"><span>CHAIR {chair.number}</span><strong>{chair.patient}</strong><small>{chair.bp} · HR {chair.heartRate}</small></div>
    </button>
  );
}

function RouteAndAtlas({ atlas, activityLabel, motionPhase, onArrive }: { atlas: AtlasState; activityLabel: string; motionPhase: string; onArrive: () => void }) {
  const [point, setPoint] = useState<RoutePointId>(atlas.location);
  const activeRoute = useMemo(() => atlas.destination ? getRoute(atlas.location, atlas.destination) : [atlas.location], [atlas.destination, atlas.location]);

  useEffect(() => {
    if (!atlas.destination) { setPoint(atlas.location); return; }
    let index = 0;
    setPoint(activeRoute[0]);
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= activeRoute.length) { window.clearInterval(timer); onArrive(); return; }
      setPoint(activeRoute[index]);
    }, 950);
    return () => window.clearInterval(timer);
  }, [activeRoute, atlas.destination, atlas.location, onArrive]);

  const coordinate = routeCoordinates[point];
  const polyline = activeRoute.map((id) => `${routeCoordinates[id].x},${routeCoordinates[id].y}`).join(" ");
  const network = routeNetworkSegments
    .map(([from, to]) => `M${routeCoordinates[from].x} ${routeCoordinates[from].y} L${routeCoordinates[to].x} ${routeCoordinates[to].y}`)
    .join(" ");
  return (
    <div className="route-layer" aria-label="Atlas route visualization">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="route-network" d={network} />
        {atlas.destination && <polyline className="active-route" points={polyline} />}
      </svg>
      <div className={`atlas-sprite ${atlas.status}`} data-testid="atlas-sprite" data-motion-phase={motionPhase} style={{ left: `${coordinate.x}%`, top: `${coordinate.y}%` }}>
        <div className="atlas-cargo">{atlas.item === "coffee" ? "☕" : atlas.item === "water" ? "●" : atlas.item === "blanket" ? "▰" : ""}</div>
        <div className="atlas-head"><i /><i /></div><div className="atlas-body">A</div><div className="atlas-wheels"><i /><i /></div>
        <span><strong>ATLAS</strong>{activityLabel}</span>
      </div>
    </div>
  );
}

export function CareFloor(props: CareFloorProps) {
  return (
    <div className="care-floor-2d">
      <div className="floor-grid" />
      <div className="operations-hub"><div className="hub-surface"><i className="supply water" /><i className="supply coffee" /><i className="supply blanket" /></div><span>CARE OPERATIONS HUB<strong>Atlas Home · Supplies</strong></span></div>
      {floorLayout.chairs.map((chair, index) => <ChairPod key={chair.id} index={index} selected={props.selectedChair === chair.id} onSelect={() => props.onChairSelect(chair.id)} />)}
      <RouteAndAtlas atlas={props.atlas} activityLabel={props.activityLabel} motionPhase={props.motionPhase} onArrive={props.onAtlasArrive} />
    </div>
  );
}
