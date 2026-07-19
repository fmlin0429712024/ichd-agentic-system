import assert from "node:assert/strict";
import test from "node:test";

import { createMiraChatRuntime, coordinateRoutinePatientRequest } from "../runtime/mira-chat.mjs";

test("Mira coordinates Daniel's patient request and returns an Atlas motion mission", async () => {
  const result = await coordinateRoutinePatientRequest(
    { patientId: "demo-p001", patientName: "Daniel Kim", chairId: "chair-01", item: "coffee", statement: "Coffee please" },
    { coordinateRoutine: async (event) => ({ artifact: { taskId: "task-coffee-1", chairId: event.chairId, status: "completed", evidenceRefs: ["sim-event-1"] } }) }
  );

  assert.equal(result.status, "accepted");
  assert.equal(result.coordination.artifact.chairId, "chair-01");
  assert.deepEqual(result.motionMission, {
    missionId: "task-coffee-1",
    type: "deliver_item",
    item: "coffee",
    pickup: "nurse-station",
    destination: "chair-01"
  });
});

test("Mira keeps patient and RN sessions separate", async () => {
  const sessions = [];
  const runtime = createMiraChatRuntime({
    apiKeyAvailable: true,
    runAgent: async (agent, _input, options) => {
      sessions.push({ name: agent.name, session: options.session });
      return { finalOutput: `${agent.name} response` };
    },
    coordinateRoutine: async () => ({})
  });

  const patient = await runtime.chatPatient({ sessionId: "shared-id", patientId: "demo-p001", message: "Hello" });
  const rn = await runtime.chatRn({ sessionId: "shared-id", message: "Status?" });
  assert.equal(patient.agent, "mira");
  assert.equal(patient.audience, "patient");
  assert.equal(rn.audience, "rn");
  assert.notEqual(sessions[0].session, sessions[1].session);
});

test("Mira RN chat uses a stable SDK session and fixed RN identity", async () => {
  const calls = [];
  const runtime = createMiraChatRuntime({
    apiKeyAvailable: true,
    runAgent: async (agent, input, options) => {
      calls.push({ agent, input, session: options.session });
      return { finalOutput: "Chair 1 is stable in the synthetic snapshot." };
    }
  });

  const first = await runtime.chatRn({ sessionId: "rn-demo", message: "What is happening at Chair 1?" });
  const second = await runtime.chatRn({ sessionId: "rn-demo", message: "Summarize again." });
  assert.equal(first.agent, "mira");
  assert.equal(first.speaker, "Jordan Lee, RN");
  assert.equal(calls[0].session, calls[1].session);
  assert.match(second.reply, /Chair 1/);
});

test("Mira chat reports a clear configuration error without an API key", async () => {
  const runtime = createMiraChatRuntime({ apiKeyAvailable: false });
  await assert.rejects(
    runtime.chatRn({ sessionId: "rn-demo", message: "Status?" }),
    (error) => error.code === "OPENAI_API_KEY_REQUIRED"
  );
});
