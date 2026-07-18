import type { WaypointId } from "./floor-layout";

export type RoutePointId =
  | WaypointId
  | "center-north"
  | "center-south"
  | "north-west-turn"
  | "north-east-turn"
  | "south-west-turn"
  | "south-east-turn";

export const routeCoordinates: Record<RoutePointId, { x: number; y: number }> = {
  "nurse-station": { x: 50, y: 52 },
  "center-north": { x: 50, y: 40 },
  "center-south": { x: 50, y: 64 },
  "north-west-turn": { x: 31, y: 40 },
  "north-east-turn": { x: 69, y: 40 },
  "south-west-turn": { x: 31, y: 64 },
  "south-east-turn": { x: 69, y: 64 },
  "chair-01": { x: 22, y: 26 },
  "chair-02": { x: 78, y: 26 },
  "chair-03": { x: 22, y: 77 },
  "chair-04": { x: 78, y: 77 }
};

const fromHome: Record<Exclude<WaypointId, "nurse-station">, RoutePointId[]> = {
  "chair-01": ["nurse-station", "center-north", "north-west-turn", "chair-01"],
  "chair-02": ["nurse-station", "center-north", "north-east-turn", "chair-02"],
  "chair-03": ["nurse-station", "center-south", "south-west-turn", "chair-03"],
  "chair-04": ["nurse-station", "center-south", "south-east-turn", "chair-04"]
};

export function getRoute(from: WaypointId, to: WaypointId): RoutePointId[] {
  if (from === to) return [from];
  if (from === "nurse-station") return [...fromHome[to as Exclude<WaypointId, "nurse-station">]];
  if (to === "nurse-station") return [...fromHome[from]].reverse();
  const homeward = [...fromHome[from]].reverse();
  return [...homeward, ...fromHome[to].slice(1)];
}
