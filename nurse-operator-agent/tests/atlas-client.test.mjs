import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { assertValidAtlasArtifact } from "../a2a/atlas-client.mjs";

async function atlasFixture(name) {
  return JSON.parse(await readFile(new URL(`../../aide-agv-agent/contracts/examples/${name}`, import.meta.url), "utf8"));
}

test("Mira accepts a provider-schema-valid Atlas artifact", async () => {
  const artifact = await atlasFixture("valid-deliver-coffee.artifact.json");
  assert.doesNotThrow(() => assertValidAtlasArtifact(artifact));
});

test("Mira rejects an Atlas artifact missing provenance", async () => {
  const artifact = await atlasFixture("invalid-missing-provenance.artifact.json");
  assert.throws(
    () => assertValidAtlasArtifact(artifact),
    (error) => error.code === "INVALID_ATLAS_ARTIFACT"
  );
});
