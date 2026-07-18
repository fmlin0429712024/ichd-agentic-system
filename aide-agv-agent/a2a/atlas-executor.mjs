import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const requestSchema = JSON.parse(
  await readFile(new URL("../contracts/atlas-task-request.schema.json", import.meta.url), "utf8")
);
const artifactSchema = JSON.parse(
  await readFile(new URL("../contracts/atlas-task-artifact.schema.json", import.meta.url), "utf8")
);
const validateRequest = ajv.compile(requestSchema);
const validateArtifact = ajv.compile(artifactSchema);

export class AtlasTaskError extends Error {
  constructor(message, validationErrors = []) {
    super(message);
    this.name = "AtlasTaskError";
    this.code = "INVALID_ATLAS_TASK";
    this.validationErrors = validationErrors;
  }
}

export async function executeAtlasRequest(request, options = {}) {
  if (!validateRequest(request)) {
    throw new AtlasTaskError("Atlas task request failed closed", structuredClone(validateRequest.errors ?? []));
  }

  if (request.capability !== "deliver_item") {
    throw new AtlasTaskError("Capability is declared but not implemented in this vertical slice", [
      { keyword: "capability", message: "only deliver_item is executable in this POC slice" }
    ]);
  }

  const completedAt = (options.now ?? (() => new Date().toISOString()))();
  const artifact = {
    contractVersion: "1.0",
    taskId: request.taskId,
    incidentId: request.incidentId,
    chairId: request.chairId,
    capability: request.capability,
    status: "completed",
    summary: `Pre-approved ${request.parameters.item} delivered to ${request.chairId}.`,
    observations: [{ type: "delivery", item: request.parameters.item, outcome: "delivered" }],
    patientStatements: [],
    evidenceRefs: [`sim-event-${request.taskId}`],
    completedAt,
    provenance: { source: "atlas-simulator", sourceType: "simulated", capturedAt: completedAt }
  };

  if (!validateArtifact(artifact)) {
    throw new AtlasTaskError("Atlas generated an invalid artifact", structuredClone(validateArtifact.errors ?? []));
  }
  return artifact;
}
