import { Role, TaskState, type SendMessageResult } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";

export type AtlasProviderArtifact = {
  contractVersion: "1.0";
  taskId: string;
  incidentId: string;
  chairId: "chair-01" | "chair-02" | "chair-03" | "chair-04";
  capability: "deliver_item" | "collect_vital_sign" | "observe_patient" | "ask_patient";
  status: "completed" | "unable" | "human_help_required";
  observations: Array<Record<string, unknown>>;
  patientStatements: string[];
  evidenceRefs: string[];
  completedAt: string;
  provenance: { source: "atlas-simulator"; sourceType: "simulated"; capturedAt: string };
};

export function buildDanielCoffeeRequest() {
  return {
    contractVersion: "1.0",
    taskId: "task-deliver-coffee-001",
    incidentId: "incident-daniel-coffee-001",
    chairId: "chair-01",
    capability: "deliver_item",
    priority: "routine",
    parameters: { item: "coffee", preApproved: true },
    requestedEvidence: ["delivery_completion"],
    requestedBy: "mira",
    contextText: "Daniel requested his pre-approved coffee during a stable simulated treatment."
  } as const;
}

export function extractAtlasArtifact(result: unknown): AtlasProviderArtifact {
  const task = result as {
    status?: { state?: number };
    artifacts?: Array<{ parts?: Array<{ content?: { $case?: string; value?: unknown } }> }>;
  };
  if (task.status?.state !== TaskState.TASK_STATE_COMPLETED) {
    throw new Error("Atlas A2A task did not complete");
  }
  const data = task.artifacts
    ?.flatMap((artifact) => artifact.parts ?? [])
    .find((part) => part.content?.$case === "data")?.content?.value;
  if (!data || typeof data !== "object") throw new Error("Atlas A2A task returned no provider artifact");
  return data as AtlasProviderArtifact;
}

export async function dispatchDanielCoffee(baseUrl = "http://127.0.0.1:8043") {
  const client = await new ClientFactory().createFromUrl(baseUrl);
  const result: SendMessageResult = await client.sendMessage({
    tenant: "",
    message: {
      messageId: crypto.randomUUID(),
      contextId: "",
      taskId: "",
      role: Role.ROLE_USER,
      parts: [{
        content: { $case: "data", value: buildDanielCoffeeRequest() },
        metadata: undefined,
        filename: "atlas-task-request.json",
        mediaType: "application/json"
      }],
      metadata: { sender: "simulated-mira" },
      extensions: [],
      referenceTaskIds: []
    },
    configuration: {
      acceptedOutputModes: ["application/json"],
      taskPushNotificationConfig: undefined,
      returnImmediately: false
    },
    metadata: { scenario: "daniel-coffee" }
  });
  return extractAtlasArtifact(result);
}
