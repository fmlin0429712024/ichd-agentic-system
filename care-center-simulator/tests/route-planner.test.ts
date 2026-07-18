import { describe, expect, it } from "vitest";
import { getRoute, routeCoordinates } from "../src/domain/route-planner";

describe("deterministic Atlas routes", () => {
  it("routes to Chair 1 through the central exit and north corridor", () => {
    expect(getRoute("nurse-station", "chair-01")).toEqual([
      "nurse-station",
      "center-north",
      "north-west-turn",
      "chair-01"
    ]);
  });

  it("returns home by reversing the known route", () => {
    expect(getRoute("chair-04", "nurse-station")).toEqual([
      "chair-04",
      "south-east-turn",
      "center-south",
      "nurse-station"
    ]);
  });

  it("provides a visible coordinate for every route point", () => {
    const route = getRoute("nurse-station", "chair-03");
    expect(route.every((point) => routeCoordinates[point])).toBe(true);
  });
});
