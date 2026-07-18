import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { executeAtlasRequest } from "../a2a/atlas-executor.mjs";

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`../contracts/examples/${name}`, import.meta.url), "utf8"));
}

test("Atlas completes a schema-valid routine coffee delivery", async () => {
  const result = await executeAtlasRequest(await fixture("valid-deliver-coffee.request.json"), {
    now: () => "2026-07-18T15:55:00-05:00"
  });

  assert.equal(result.status, "completed");
  assert.equal(result.chairId, "chair-01");
  assert.deepEqual(result.observations, [{ type: "delivery", item: "coffee", outcome: "delivered" }]);
  assert.deepEqual(result.evidenceRefs, ["sim-event-task-deliver-coffee-001"]);
  assert.equal(result.provenance.source, "atlas-simulator");
});

test("Atlas rejects a clinical action before simulator execution", async () => {
  await assert.rejects(
    executeAtlasRequest(await fixture("invalid-clinical-action.request.json")),
    (error) => error.code === "INVALID_ATLAS_TASK" && error.validationErrors.length > 0
  );
});
