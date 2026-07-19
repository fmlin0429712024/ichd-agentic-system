import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("Atlas exposes only worker-facing A2A and no patient chat", () => {
  const app = createAtlasApp();
  const route = app.router.stack.find((layer) => layer.route?.path === "/chat/patient");
  assert.equal(route, undefined);
});

test("Atlas runtime is deterministic and has no model SDK dependency", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
  );
  const runtimeSources = await Promise.all(
    ["server.mjs", "atlas-executor.mjs", "sdk-executor.mjs"].map((name) =>
      readFile(new URL(`../a2a/${name}`, import.meta.url), "utf8")
    )
  );
  const dependencyNames = Object.keys({
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {})
  });

  assert.equal(
    dependencyNames.some((name) => /openai|agents-sdk/i.test(name)),
    false
  );
  assert.doesNotMatch(runtimeSources.join("\n"), /OPENAI_API_KEY|OPENAI_MODEL|from ["']openai["']/);
});
