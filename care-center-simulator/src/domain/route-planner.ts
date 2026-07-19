import type { WaypointId } from "./floor-layout";

export type RoutePointId =
  | WaypointId
  | "hub-dock"
  | "north-west-turn"
  | "north-east-turn"
  | "south-west-turn"
  | "south-east-turn";

export const routeCoordinates: Record<RoutePointId, { x: number; y: number }> = {
  "nurse-station": { x: 50, y: 52 },
  "hub-dock": { x: 50, y: 64 },
  "north-west-turn": { x: 31, y: 40 },
  "north-east-turn": { x: 69, y: 40 },
  "south-west-turn": { x: 31, y: 64 },
  "south-east-turn": { x: 69, y: 64 },
  "chair-01": { x: 22, y: 26 },
  "chair-02": { x: 78, y: 26 },
  "chair-03": { x: 22, y: 77 },
  "chair-04": { x: 78, y: 77 }
};

const graph: Record<RoutePointId, RoutePointId[]> = {
  "nurse-station": ["hub-dock"],
  "hub-dock": ["nurse-station", "south-west-turn", "south-east-turn"],
  "north-west-turn": ["chair-01", "north-east-turn", "south-west-turn"],
  "north-east-turn": ["chair-02", "south-east-turn", "north-west-turn"],
  "south-west-turn": ["chair-03", "north-west-turn", "hub-dock"],
  "south-east-turn": ["chair-04", "hub-dock", "north-east-turn"],
  "chair-01": ["north-west-turn"],
  "chair-02": ["north-east-turn"],
  "chair-03": ["south-west-turn"],
  "chair-04": ["south-east-turn"]
};

export function getRoute(from: WaypointId, to: WaypointId): RoutePointId[] {
  if (from === to) return [from];
  const queue: RoutePointId[][] = [[from]];
  const visited = new Set<RoutePointId>([from]);

  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    for (const next of graph[current]) {
      if (visited.has(next)) continue;
      const candidate = [...path, next];
      if (next === to) return candidate;
      visited.add(next);
      queue.push(candidate);
    }
  }
  return [from];
}

export const routeNetworkSegments: readonly (readonly [RoutePointId, RoutePointId])[] = [
  ["nurse-station", "hub-dock"],
  ["hub-dock", "south-west-turn"],
  ["hub-dock", "south-east-turn"],
  ["south-west-turn", "north-west-turn"],
  ["north-west-turn", "north-east-turn"],
  ["north-east-turn", "south-east-turn"],
  ["north-west-turn", "chair-01"],
  ["north-east-turn", "chair-02"],
  ["south-west-turn", "chair-03"],
  ["south-east-turn", "chair-04"]
];
