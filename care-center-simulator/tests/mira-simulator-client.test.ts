import { describe, expect, it } from "vitest";
import { buildDanielCoffeeEvent } from "../src/integration/mira-simulator-client";

describe("simulator to Mira boundary", () => {
  it("submits a patient event without constructing an Atlas task", () => {
    const event = buildDanielCoffeeEvent();
    expect(event).toMatchObject({
      contractVersion: "1.0",
      chairId: "chair-01",
      eventType: "routine_request",
      source: "care-center-simulator",
      routineSupport: { item: "coffee", preApproved: true }
    });
    expect(event).not.toHaveProperty("capability");
    expect(event).not.toHaveProperty("requestedBy");
    expect(event).not.toHaveProperty("taskId");
  });
});
