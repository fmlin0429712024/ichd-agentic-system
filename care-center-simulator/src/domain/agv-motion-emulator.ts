import type { CarryItem } from "./atlas-machine";
import type { WaypointId } from "./floor-layout";

export type AgvMotionPhase =
  | "idle"
  | "moving-to-hub"
  | "picking-up"
  | "moving-to-chair"
  | "delivering"
  | "completed";

export type AgvMotionState = {
  missionId: string | null;
  chairId: Exclude<WaypointId, "nurse-station"> | null;
  requestedItem: CarryItem | null;
  itemOnboard: CarryItem | null;
  currentLocation: WaypointId;
  destination: WaypointId | null;
  phase: AgvMotionPhase;
};

export type AgvMotionEvent =
  | {
      type: "start-delivery";
      missionId: string;
      chairId: Exclude<WaypointId, "nurse-station">;
      item: CarryItem;
      currentLocation: WaypointId;
    }
  | { type: "pickup-complete" }
  | { type: "delivery-complete" }
  | { type: "arrived" }
  | { type: "clear"; currentLocation?: WaypointId };

export function createIdleMotionState(currentLocation: WaypointId = "nurse-station"): AgvMotionState {
  return {
    missionId: null,
    chairId: null,
    requestedItem: null,
    itemOnboard: null,
    currentLocation,
    destination: null,
    phase: "idle"
  };
}

export function agvMotionReducer(state: AgvMotionState, event: AgvMotionEvent): AgvMotionState {
  switch (event.type) {
    case "start-delivery":
      return {
        missionId: event.missionId,
        chairId: event.chairId,
        requestedItem: event.item,
        itemOnboard: null,
        currentLocation: event.currentLocation,
        destination: event.currentLocation === "nurse-station" ? null : "nurse-station",
        phase: event.currentLocation === "nurse-station" ? "picking-up" : "moving-to-hub"
      };

    case "pickup-complete":
      if (state.phase !== "picking-up" || !state.chairId || !state.requestedItem) return state;
      return {
        ...state,
        itemOnboard: state.requestedItem,
        destination: state.chairId,
        phase: "moving-to-chair"
      };

    case "delivery-complete":
      if (state.phase !== "delivering") return state;
      return {
        ...state,
        itemOnboard: null,
        destination: null,
        phase: "completed"
      };

    case "arrived":
      if (state.phase === "moving-to-hub") {
        return {
          ...state,
          currentLocation: "nurse-station",
          destination: null,
          phase: "picking-up"
        };
      }
      if (state.phase === "moving-to-chair" && state.chairId) {
        return {
          ...state,
          currentLocation: state.chairId,
          destination: null,
          phase: "delivering"
        };
      }
      return state;

    case "clear":
      return createIdleMotionState(event.currentLocation ?? state.currentLocation);
  }
}
