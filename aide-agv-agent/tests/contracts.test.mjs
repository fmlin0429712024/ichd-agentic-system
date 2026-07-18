import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const contractsUrl = new URL("../contracts/", import.meta.url);
const readJson = async (name) => JSON.parse(await readFile(new URL(name, contractsUrl), "utf8"));

test("Agent Card exposes only bounded Atlas operational skills", async () => {
  const card = await readJson("agent-card.json");
  const skillIds = card.skills.map((skill) => skill.id);

  assert.equal(card.name, "Atlas Aide AGV Agent");
  assert.deepEqual(skillIds, ["routine-item-delivery", "chairside-evidence-collection"]);
  assert.match(card.description, /no medical judgment/i);
});

test("task contract accepts a routine coffee delivery", async () => {
  const schema = await readJson("atlas-task-request.schema.json");
  const example = await readJson("examples/valid-deliver-coffee.request.json");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  assert.equal(ajv.compile(schema)(example), true);
});

test("task contract rejects unsupported clinical action", async () => {
  const schema = await readJson("atlas-task-request.schema.json");
  const example = await readJson("examples/invalid-clinical-action.request.json");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  assert.equal(ajv.compile(schema)(example), false);
});

test("artifact contract requires evidence provenance", async () => {
  const schema = await readJson("atlas-task-artifact.schema.json");
  const valid = await readJson("examples/valid-deliver-coffee.artifact.json");
  const invalid = await readJson("examples/invalid-missing-provenance.artifact.json");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  assert.equal(validate(valid), true);
  assert.equal(validate(invalid), false);
});
