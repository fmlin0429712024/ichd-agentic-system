import { describe, expect, it } from "vitest";
import { floorLayout } from "../src/domain/floor-layout";

describe("floor layout", () => {
  it("defines four uniquely identified treatment chairs", () => {
    expect(floorLayout.chairs.map((chair) => chair.id)).toEqual([
      "chair-01",
      "chair-02",
      "chair-03",
      "chair-04"
    ]);
    expect(new Set(floorLayout.waypoints.map((point) => point.id)).size).toBe(
      floorLayout.waypoints.length
    );
  });

  it("keeps Atlas home at the nurse station and every chair reachable", () => {
    expect(floorLayout.atlasHome).toBe("nurse-station");
    for (const chair of floorLayout.chairs) {
      expect(floorLayout.waypoints.some((point) => point.id === chair.id)).toBe(true);
    }
  });
});
