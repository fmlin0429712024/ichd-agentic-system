import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const contracts = new URL("../contracts/", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, contracts), "utf8"));
const validators = new Map();

const cases = [
  ["atlas-task-request.schema.json", "examples/valid-deliver-coffee.request.json", true],
  ["atlas-task-request.schema.json", "examples/invalid-clinical-action.request.json", false],
  ["atlas-task-artifact.schema.json", "examples/valid-deliver-coffee.artifact.json", true],
  ["atlas-task-artifact.schema.json", "examples/invalid-missing-provenance.artifact.json", false]
];

for (const [schemaPath, examplePath, expected] of cases) {
  if (!validators.has(schemaPath)) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    validators.set(schemaPath, ajv.compile(await readJson(schemaPath)));
  }
  const validate = validators.get(schemaPath);
  const actual = validate(await readJson(examplePath));
  if (actual !== expected) {
    console.error(`${examplePath}: expected ${expected}, received ${actual}`, validate.errors);
    process.exitCode = 1;
  } else {
    console.log(`${examplePath}: ${expected ? "valid" : "rejected as expected"}`);
  }
}
