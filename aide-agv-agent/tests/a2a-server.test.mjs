import assert from "node:assert/strict";
import test from "node:test";

import { createAtlasApp } from "../a2a/server.mjs";
import { atlasAgentCard } from "../a2a/agent-card.mjs";

test("Atlas configures a discoverable A2A v1.0 Agent Card", () => {
  const app = createAtlasApp();
  const card = atlasAgentCard;

  assert.equal(typeof app, "function");
  assert.equal(card.name, "Atlas Aide AGV Agent");
  assert.equal(card.supportedInterfaces[0].protocolVersion, "1.0");
  assert.equal(card.supportedInterfaces[0].protocolBinding, "JSONRPC");
  assert.deepEqual(card.skills.map((skill) => skill.id), [
    "routine-item-delivery",
    "chairside-evidence-collection"
  ]);
});
