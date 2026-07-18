import { floorLayout, getWaypoint, type WaypointId } from "./floor-layout";

export type CarryItem = "water" | "coffee" | "blanket";
export type AtlasStatus = "idle" | "moving" | "arrived" | "patrolling";

export type AtlasState = {
  location: WaypointId;
  destination: WaypointId | null;
  status: AtlasStatus;
  item: CarryItem | null;
};

export type AtlasCommand =
  | { type: "move"; destination: string }
  | { type: "carry"; item: CarryItem }
  | { type: "arrive" }
  | { type: "deliver" }
  | { type: "stop" }
  | { type: "reset" };

export function createInitialAtlasState(): AtlasState {
  return {
    location: floorLayout.atlasHome,
    destination: null,
    status: "idle",
    item: null
  };
}

export function atlasReducer(state: AtlasState, command: AtlasCommand): AtlasState {
  switch (command.type) {
    case "move": {
      if (!getWaypoint(command.destination)) return state;
      return {
        ...state,
        destination: command.destination as WaypointId,
        status: "moving"
      };
    }
    case "carry":
      return { ...state, item: command.item };
    case "arrive":
      if (!state.destination) return state;
      return {
        ...state,
        location: state.destination,
        destination: null,
        status: "arrived"
      };
    case "deliver":
      return { ...state, item: null, status: "idle" };
    case "stop":
      return { ...state, destination: null, status: "idle" };
    case "reset":
      return createInitialAtlasState();
  }
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createPatrolRoute(seed: number): WaypointId[] {
  const random = seededRandom(seed);
  const route = floorLayout.chairs.map((chair) => chair.id);
  for (let index = route.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [route[index], route[swapIndex]] = [route[swapIndex], route[index]];
  }
  return [...route, floorLayout.atlasHome];
}
