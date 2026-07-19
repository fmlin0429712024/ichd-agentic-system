import type { WaypointId } from "./floor-layout";

export const PATROL_STOPS = [
  "chair-01",
  "chair-02",
  "chair-04",
  "chair-03",
  "nurse-station"
] as const satisfies readonly WaypointId[];

export function getNextPatrolStop(currentLocation: WaypointId): WaypointId {
  const index = PATROL_STOPS.indexOf(currentLocation as (typeof PATROL_STOPS)[number]);
  return PATROL_STOPS[index < 0 || index === PATROL_STOPS.length - 1 ? 0 : index + 1];
}

export function getPatrolDwellMs(currentLocation: WaypointId): number {
  return currentLocation === "nurse-station" ? 2200 : 1400;
}
