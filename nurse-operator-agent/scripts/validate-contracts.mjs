import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const cases = [
  ["mira-event-input.schema.json", "examples/valid-daniel-coffee.event.json", true],
  ["mira-event-input.schema.json", "examples/invalid-unapproved-coffee.event.json", false],
  ["rn-decision-request.schema.json", "examples/valid-rn-decision.request.json", true],
  ["rn-decision-request.schema.json", "examples/invalid-agent-decision.request.json", false]
];
const validators = new Map();

for (const [schemaName, exampleName, expected] of cases) {
  if (!validators.has(schemaName)) {
    const schema = JSON.parse(await readFile(new URL(`../contracts/${schemaName}`, import.meta.url), "utf8"));
    validators.set(schemaName, ajv.compile(schema));
  }
  const example = JSON.parse(await readFile(new URL(`../contracts/${exampleName}`, import.meta.url), "utf8"));
  const valid = validators.get(schemaName)(example);
  if (valid !== expected) throw new Error(`${exampleName}: expected ${expected}, received ${valid}`);
  console.log(`${exampleName}: ${valid ? "valid" : "rejected as expected"}`);
}
