import { readFile } from "node:fs/promises";
import { Role, TaskState } from "@a2a-js/sdk";
import { ClientFactory, DefaultAgentCardResolver } from "@a2a-js/sdk/client";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const atlasArtifactSchema = JSON.parse(
  await readFile(new URL("../../aide-agv-agent/contracts/atlas-task-artifact.schema.json", import.meta.url), "utf8")
);
const validateAtlasArtifact = ajv.compile(atlasArtifactSchema);

export function assertValidAtlasArtifact(artifact) {
  if (!validateAtlasArtifact(artifact)) {
    const error = new Error("Atlas provider artifact failed schema validation");
    error.code = "INVALID_ATLAS_ARTIFACT";
    error.validationErrors = structuredClone(validateAtlasArtifact.errors ?? []);
    throw error;
  }
}

export class AtlasA2AClient {
  constructor(baseUrl = "http://127.0.0.1:8043") {
    this.baseUrl = baseUrl;
    this.factory = new ClientFactory();
    this.resolver = new DefaultAgentCardResolver();
  }

  async discover() {
    return this.resolver.resolve(this.baseUrl);
  }

  async dispatch(request) {
    const client = await this.factory.createFromUrl(this.baseUrl);
    const result = await client.sendMessage({
      tenant: "",
      message: {
        messageId: crypto.randomUUID(),
        contextId: "",
        taskId: "",
        role: Role.ROLE_USER,
        parts: [{
          content: { $case: "data", value: request },
          metadata: undefined,
          filename: "atlas-task-request.json",
          mediaType: "application/json"
        }],
        metadata: { sender: "mira" },
        extensions: [],
        referenceTaskIds: []
      },
      configuration: {
        acceptedOutputModes: ["application/json"],
        taskPushNotificationConfig: undefined,
        returnImmediately: false
      },
      metadata: { incidentId: request.incidentId, providerTaskId: request.taskId }
    });

    if (result.status?.state !== TaskState.TASK_STATE_COMPLETED) {
      throw new Error(`Atlas A2A task did not complete (state ${result.status?.state ?? "unknown"})`);
    }
    const artifact = result.artifacts
      ?.flatMap((candidate) => candidate.parts ?? [])
      .find((part) => part.content?.$case === "data")?.content?.value;
    if (!artifact || typeof artifact !== "object") throw new Error("Atlas returned no provider artifact");
    assertValidAtlasArtifact(artifact);
    return { a2aTaskId: result.id, artifact };
  }
}
