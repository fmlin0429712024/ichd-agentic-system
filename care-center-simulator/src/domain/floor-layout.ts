export type WaypointId =
  | "nurse-station"
  | "chair-01"
  | "chair-02"
  | "chair-03"
  | "chair-04";

export type Position2D = readonly [x: number, z: number];

export type Chair = {
  id: Exclude<WaypointId, "nurse-station">;
  number: number;
  patient: string;
  position: Position2D;
  status: "stable" | "watch" | "attention";
  bp: string;
  heartRate: number;
  remaining: string;
};

export type Waypoint = {
  id: WaypointId;
  position: Position2D;
};

const chairs: Chair[] = [
  { id: "chair-01", number: 1, patient: "Daniel Kim", position: [-4.6, -2.5], status: "stable", bp: "128/74", heartRate: 72, remaining: "1h 18m" },
  { id: "chair-02", number: 2, patient: "Noah Carter", position: [4.6, -2.5], status: "watch", bp: "142/82", heartRate: 78, remaining: "0h 42m" },
  { id: "chair-03", number: 3, patient: "Emma Morgan", position: [-4.6, 3.2], status: "attention", bp: "86/54", heartRate: 96, remaining: "2h 06m" },
  { id: "chair-04", number: 4, patient: "Priya Shah", position: [4.6, 3.2], status: "watch", bp: "118/70", heartRate: 76, remaining: "1h 44m" }
];

export const floorLayout = {
  atlasHome: "nurse-station" as const,
  nurseStation: { id: "nurse-station" as const, position: [0, 6.7] as Position2D },
  chairs,
  waypoints: [
    { id: "nurse-station", position: [0, 5.2] },
    ...chairs.map(({ id, position }) => ({
      id,
      position: [position[0], position[1] - 1.55] as Position2D
    }))
  ] satisfies Waypoint[]
};

export function getWaypoint(id: string): Waypoint | undefined {
  return floorLayout.waypoints.find((point) => point.id === id);
}
