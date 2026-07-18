import { TaskState } from "@a2a-js/sdk";
import { AgentEvent } from "@a2a-js/sdk/server";
import { executeAtlasRequest } from "./atlas-executor.mjs";

function dataFromMessage(message) {
  const part = message.parts.find((candidate) => candidate.content?.$case === "data");
  if (!part) throw new Error("Atlas requires one application/json data part");
  return part.content.value;
}

export class AtlasAgentExecutor {
  async execute(context, eventBus) {
    const request = dataFromMessage(context.userMessage);
    const submittedAt = new Date().toISOString();
    const task = {
      id: context.taskId,
      contextId: context.contextId,
      status: { state: TaskState.TASK_STATE_WORKING, message: undefined, timestamp: submittedAt },
      artifacts: [],
      history: [context.userMessage],
      metadata: { incidentId: request.incidentId, providerTaskId: request.taskId }
    };
    eventBus.publish(AgentEvent.task(task));

    try {
      const result = await executeAtlasRequest(request);
      eventBus.publish(AgentEvent.artifactUpdate({
        taskId: context.taskId,
        contextId: context.contextId,
        artifact: {
          artifactId: `artifact-${request.taskId}`,
          name: "Atlas task result",
          description: "Schema-validated Atlas provider artifact",
          parts: [{ content: { $case: "data", value: result }, metadata: undefined, filename: "", mediaType: "application/json" }],
          metadata: { contractVersion: result.contractVersion },
          extensions: []
        },
        append: false,
        lastChunk: true,
        metadata: undefined
      }));
      eventBus.publish(AgentEvent.statusUpdate({
        taskId: context.taskId,
        contextId: context.contextId,
        status: { state: TaskState.TASK_STATE_COMPLETED, message: undefined, timestamp: result.completedAt },
        metadata: { providerStatus: result.status }
      }));
    } catch (error) {
      eventBus.publish(AgentEvent.statusUpdate({
        taskId: context.taskId,
        contextId: context.contextId,
        status: { state: TaskState.TASK_STATE_REJECTED, message: undefined, timestamp: new Date().toISOString() },
        metadata: { code: error.code ?? "ATLAS_EXECUTION_ERROR", validationErrors: error.validationErrors ?? [] }
      }));
    } finally {
      eventBus.finished();
    }
  }

  async cancelTask() {
    throw new Error("Atlas tasks are deterministic and not cancellable in this POC slice");
  }
}
