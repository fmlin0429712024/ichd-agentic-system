import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { coordinateRoutineEvent } from "../a2a/mira-coordinator.mjs";

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`../contracts/examples/${name}`, import.meta.url), "utf8"));
}

const atlasCard = {
  skills: [{ id: "routine-item-delivery" }]
};

test("Mira converts Daniel's approved coffee event into one Atlas dispatch", async () => {
  const dispatched = [];
  const result = await coordinateRoutineEvent(await fixture("valid-daniel-coffee.event.json"), {
    discoverAtlas: async () => atlasCard,
    dispatchAtlas: async (request) => {
      dispatched.push(request);
      return {
        a2aTaskId: "a2a-task-001",
        artifact: {
          contractVersion: "1.0",
          taskId: request.taskId,
          incidentId: request.incidentId,
          chairId: request.chairId,
          capability: request.capability,
          status: "completed",
          observations: [{ type: "delivery", item: "coffee", outcome: "delivered" }],
          patientStatements: [],
          evidenceRefs: ["sim-event-task-deliver-coffee-001"],
          completedAt: "2026-07-18T22:12:05.718Z",
          provenance: { source: "atlas-simulator", sourceType: "simulated", capturedAt: "2026-07-18T22:12:05.718Z" }
        }
      };
    }
  });

  assert.equal(dispatched.length, 1);
  assert.deepEqual(dispatched[0].parameters, { item: "coffee", preApproved: true });
  assert.equal(dispatched[0].requestedBy, "mira");
  assert.equal(result.status, "completed");
  assert.equal(result.a2aTaskId, "a2a-task-001");
});

test("Mira fails closed before discovery when routine support is not pre-approved", async () => {
  let discovered = false;
  await assert.rejects(
    coordinateRoutineEvent(await fixture("invalid-unapproved-coffee.event.json"), {
      discoverAtlas: async () => { discovered = true; return atlasCard; },
      dispatchAtlas: async () => assert.fail("must not dispatch")
    }),
    (error) => error.code === "INVALID_MIRA_EVENT"
  );
  assert.equal(discovered, false);
});

test("Mira rejects Atlas when the required capability is not declared", async () => {
  await assert.rejects(
    coordinateRoutineEvent(await fixture("valid-daniel-coffee.event.json"), {
      discoverAtlas: async () => ({ skills: [] }),
      dispatchAtlas: async () => assert.fail("must not dispatch")
    }),
    (error) => error.code === "ATLAS_CAPABILITY_UNAVAILABLE"
  );
});
