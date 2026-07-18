import { describe, expect, it } from "vitest";
import {
  atlasReducer,
  createInitialAtlasState,
  createPatrolRoute
} from "../src/domain/atlas-machine";

describe("Atlas movement state", () => {
  it("accepts a known destination and rejects an unknown one", () => {
    const initial = createInitialAtlasState();
    const moving = atlasReducer(initial, { type: "move", destination: "chair-03" });
    const rejected = atlasReducer(moving, { type: "move", destination: "pharmacy" });

    expect(moving.status).toBe("moving");
    expect(moving.destination).toBe("chair-03");
    expect(rejected).toEqual(moving);
  });

  it("stops, resets, and clears carried items after delivery", () => {
    let state = createInitialAtlasState();
    state = atlasReducer(state, { type: "carry", item: "water" });
    state = atlasReducer(state, { type: "move", destination: "chair-01" });
    state = atlasReducer(state, { type: "arrive" });
    state = atlasReducer(state, { type: "deliver" });
    expect(state.item).toBeNull();

    state = atlasReducer(state, { type: "move", destination: "chair-04" });
    state = atlasReducer(state, { type: "stop" });
    expect(state.status).toBe("idle");
    expect(state.destination).toBeNull();
    expect(atlasReducer(state, { type: "reset" })).toEqual(createInitialAtlasState());
  });

  it("creates a repeatable patrol route from a seed", () => {
    expect(createPatrolRoute(42)).toEqual(createPatrolRoute(42));
    expect(createPatrolRoute(42)).not.toEqual(createPatrolRoute(43));
    expect(createPatrolRoute(42).at(-1)).toBe("nurse-station");
  });
});
