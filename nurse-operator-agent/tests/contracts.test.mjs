import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

async function json(path) {
  return JSON.parse(await readFile(new URL(`../contracts/${path}`, import.meta.url), "utf8"));
}

test("Mira event contract accepts approved routine support and rejects unapproved support", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(await json("mira-event-input.schema.json"));
  assert.equal(validate(await json("examples/valid-daniel-coffee.event.json")), true);
  assert.equal(validate(await json("examples/invalid-unapproved-coffee.event.json")), false);
});

test("RN decision request cannot contain a digital-agent clinical decision", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(await json("rn-decision-request.schema.json"));
  assert.equal(validate(await json("examples/valid-rn-decision.request.json")), true);
  assert.equal(validate(await json("examples/invalid-agent-decision.request.json")), false);
});
