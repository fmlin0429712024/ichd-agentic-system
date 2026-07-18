import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const eventSchema = JSON.parse(
  await readFile(new URL("../contracts/mira-event-input.schema.json", import.meta.url), "utf8")
);
const validateEvent = ajv.compile(eventSchema);

export class MiraCoordinationError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = "MiraCoordinationError";
    this.code = code;
    this.details = details;
  }
}

export async function coordinateRoutineEvent(event, dependencies) {
  if (!validateEvent(event)) {
    throw new MiraCoordinationError(
      "INVALID_MIRA_EVENT",
      "Mira event failed closed",
      structuredClone(validateEvent.errors ?? [])
    );
  }

  const card = await dependencies.discoverAtlas();
  if (!card.skills?.some((skill) => skill.id === "routine-item-delivery")) {
    throw new MiraCoordinationError(
      "ATLAS_CAPABILITY_UNAVAILABLE",
      "Atlas does not declare routine-item-delivery"
    );
  }

  const atlasRequest = {
    contractVersion: "1.0",
    taskId: `task-${event.eventId.replace(/^event-/, "")}`,
    incidentId: event.incidentId,
    chairId: event.chairId,
    capability: "deliver_item",
    priority: "routine",
    parameters: event.routineSupport,
    requestedEvidence: ["delivery_completion"],
    requestedBy: "mira",
    contextText: "Pre-approved routine support request from the CareLoop simulator."
  };

  const response = await dependencies.dispatchAtlas(atlasRequest);
  if (
    response.artifact?.incidentId !== event.incidentId ||
    response.artifact?.taskId !== atlasRequest.taskId ||
    response.artifact?.chairId !== event.chairId
  ) {
    throw new MiraCoordinationError("ATLAS_CORRELATION_FAILED", "Atlas artifact identifiers do not match the Mira event");
  }

  return {
    contractVersion: "1.0",
    eventId: event.eventId,
    incidentId: event.incidentId,
    providerTaskId: atlasRequest.taskId,
    a2aTaskId: response.a2aTaskId,
    chairId: event.chairId,
    status: response.artifact.status,
    artifact: response.artifact
  };
}
