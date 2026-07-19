import { describe, expect, it } from "vitest";
import { getNextPatrolStop, PATROL_STOPS } from "../src/domain/patrol-controller";

describe("Atlas routine round", () => {
  it("follows a clockwise loop and returns to the hub only after all four chairs", () => {
    expect(PATROL_STOPS).toEqual(["chair-01", "chair-02", "chair-04", "chair-03", "nurse-station"]);
    expect(getNextPatrolStop("nurse-station")).toBe("chair-01");
    expect(getNextPatrolStop("chair-01")).toBe("chair-02");
    expect(getNextPatrolStop("chair-02")).toBe("chair-04");
    expect(getNextPatrolStop("chair-04")).toBe("chair-03");
    expect(getNextPatrolStop("chair-03")).toBe("nurse-station");
  });
});
