import { describe, expect, it } from "vitest";
import { getRoute, routeCoordinates } from "../src/domain/route-planner";

describe("deterministic Atlas routes", () => {
  it("routes from the hub onto the circulation loop without cutting across the floor", () => {
    expect(getRoute("nurse-station", "chair-01")).toEqual([
      "nurse-station",
      "hub-dock",
      "south-west-turn",
      "north-west-turn",
      "chair-01"
    ]);
  });

  it("moves directly between adjacent chairs on the loop instead of returning through the hub", () => {
    expect(getRoute("chair-01", "chair-02")).toEqual(["chair-01", "north-west-turn", "north-east-turn", "chair-02"]);
    expect(getRoute("chair-02", "chair-04")).toEqual(["chair-02", "north-east-turn", "south-east-turn", "chair-04"]);
  });

  it("provides a visible coordinate for every route point", () => {
    const route = getRoute("nurse-station", "chair-03");
    expect(route.every((point) => routeCoordinates[point])).toBe(true);
  });
});
