import { describe, expect, it } from "vitest";
import {
  agvMotionReducer,
  createIdleMotionState,
  type AgvMotionState
} from "../src/domain/agv-motion-emulator";

function startMission(currentLocation: AgvMotionState["currentLocation"] = "nurse-station") {
  return agvMotionReducer(createIdleMotionState(currentLocation), {
    type: "start-delivery",
    missionId: "mission-daniel-coffee",
    chairId: "chair-01",
    item: "coffee",
    currentLocation
  });
}

describe("AGV motion emulator", () => {
  it("runs a hub-to-chair delivery and completes at the chair so patrol can resume", () => {
    let state = startMission();
    expect(state.phase).toBe("picking-up");
    expect(state.destination).toBeNull();

    state = agvMotionReducer(state, { type: "pickup-complete" });
    expect(state.phase).toBe("moving-to-chair");
    expect(state.destination).toBe("chair-01");
    expect(state.itemOnboard).toBe("coffee");

    state = agvMotionReducer(state, { type: "arrived" });
    expect(state.phase).toBe("delivering");
    expect(state.currentLocation).toBe("chair-01");

    state = agvMotionReducer(state, { type: "delivery-complete" });
    expect(state.phase).toBe("completed");
    expect(state.destination).toBeNull();
    expect(state.itemOnboard).toBeNull();
    expect(state.currentLocation).toBe("chair-01");
  });

  it("returns to the hub before pickup when Atlas starts at another chair", () => {
    let state = startMission("chair-03");
    expect(state.phase).toBe("moving-to-hub");
    expect(state.destination).toBe("nurse-station");

    state = agvMotionReducer(state, { type: "arrived" });
    expect(state.phase).toBe("picking-up");
    expect(state.currentLocation).toBe("nurse-station");
  });

  it("accepts every known patient chair as a delivery destination", () => {
    for (const chairId of ["chair-01", "chair-02", "chair-03", "chair-04"] as const) {
      let state = agvMotionReducer(createIdleMotionState(), {
        type: "start-delivery",
        missionId: `mission-${chairId}`,
        chairId,
        item: "water",
        currentLocation: "nurse-station"
      });
      state = agvMotionReducer(state, { type: "pickup-complete" });
      expect(state.destination).toBe(chairId);
    }
  });

  it("ignores phase events that are invalid for the current mission state", () => {
    const idle = createIdleMotionState();
    expect(agvMotionReducer(idle, { type: "arrived" })).toEqual(idle);

    const pickingUp = startMission();
    expect(agvMotionReducer(pickingUp, { type: "delivery-complete" })).toEqual(pickingUp);
  });
});
