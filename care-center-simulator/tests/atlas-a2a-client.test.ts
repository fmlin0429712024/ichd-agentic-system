import { describe, expect, it } from "vitest";
import { buildDanielCoffeeRequest, extractAtlasArtifact } from "../src/integration/atlas-a2a-client";

describe("simulated Mira A2A client", () => {
  it("builds the bounded Daniel coffee request", () => {
    expect(buildDanielCoffeeRequest()).toMatchObject({
      contractVersion: "1.0",
      chairId: "chair-01",
      capability: "deliver_item",
      parameters: { item: "coffee", preApproved: true },
      requestedBy: "mira"
    });
  });

  it("extracts the provider artifact only from a completed A2A task", () => {
    const providerArtifact = { status: "completed", chairId: "chair-01", capability: "deliver_item" };
    const task = {
      status: { state: 3 },
      artifacts: [{ parts: [{ content: { $case: "data", value: providerArtifact } }] }]
    };
    expect(extractAtlasArtifact(task)).toEqual(providerArtifact);
  });

  it("fails closed when the A2A task has no provider artifact", () => {
    expect(() => extractAtlasArtifact({ status: { state: 3 }, artifacts: [] })).toThrow(/artifact/i);
  });
});
