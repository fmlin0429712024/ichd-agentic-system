import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Agent, MemorySession, run, tool } from "@openai/agents";
import { z } from "zod";

const clinicSeed = JSON.parse(
  await readFile(new URL("../../poc-reference/data/clinic-seed.json", import.meta.url), "utf8")
);

export const MIRA_PATIENTS = [
  { patientId: "demo-p001", patientName: "Daniel Kim", chairId: "chair-01" },
  { patientId: "demo-p002", patientName: "Noah Carter", chairId: "chair-02" },
  { patientId: "demo-p003", patientName: "Emma Morgan", chairId: "chair-03" },
  { patientId: "demo-p004", patientName: "Priya Shah", chairId: "chair-04" }
];

export class MiraChatError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "MiraChatError";
    this.code = code;
    this.status = status;
  }
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new MiraChatError("INVALID_CHAT_INPUT", `${field} is required`);
  }
  return value.trim();
}

function centerSnapshot() {
  return clinicSeed.chairs.map((chair) => ({
    chairId: chair.chairId,
    patient: chair.patient.displayName,
    status: chair.status,
    bloodPressure: chair.live.bloodPressure,
    heartRateBpm: chair.live.heartRateBpm,
    bfrMlMin: chair.live.bfrMlMin,
    elapsedMinutes: chair.live.elapsedMinutes,
    scenarioRole: chair.scenarioRole,
    source: "synthetic CareLoop simulator seed"
  }));
}

export async function coordinateRoutinePatientRequest(request, dependencies) {
  if (request.patientId !== "demo-p001" || request.chairId !== "chair-01" || request.item !== "coffee") {
    return {
      status: "not_authorized",
      message: "This POC only autonomously closes Daniel Kim's synthetic pre-approved coffee request."
    };
  }

  const id = randomUUID();
  const event = {
    contractVersion: "1.0",
    eventId: `event-chat-${id}`,
    incidentId: `incident-chat-${id}`,
    chairId: request.chairId,
    eventType: "routine_request",
    occurredAt: new Date().toISOString(),
    source: "care-center-simulator",
    evidenceRefs: [`patient-statement-${id}`],
    routineSupport: { item: "coffee", preApproved: true }
  };
  const coordination = await dependencies.coordinateRoutine(event);
  const artifact = coordination?.artifact;
  if (artifact?.status !== "completed" || artifact.chairId !== request.chairId || !artifact.taskId) {
    throw new MiraChatError("ATLAS_COORDINATION_FAILED", "Atlas returned no verified worker task", 502);
  }
  return {
    status: "accepted",
    coordination,
    motionMission: {
      missionId: artifact.taskId,
      type: "deliver_item",
      item: "coffee",
      pickup: "nurse-station",
      destination: request.chairId
    }
  };
}

export function createMiraChatRuntime(options = {}) {
  const patientSessions = new Map();
  const rnSessions = new Map();
  const runAgent = options.runAgent ?? run;
  const apiKeyAvailable = options.apiKeyAvailable ?? Boolean(process.env.OPENAI_API_KEY);
  const model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6-luna";
  const coordinateRoutine = options.coordinateRoutine ?? (async () => {
    throw new MiraChatError("ATLAS_COORDINATION_UNAVAILABLE", "Mira cannot reach the Atlas worker.", 502);
  });

  const inspectCenter = tool({
    name: "inspect_center_snapshot",
    description: "Read the compact, synthetic current snapshot for all four chairs.",
    parameters: z.object({}),
    async execute() { return centerSnapshot(); }
  });
  const rnAgent = new Agent({
    name: "Mira RN Collaborator",
    model,
    instructions: "You are Mira, the stationary CareLoop coordination agent in a fictional hemodialysis POC. You speak with Jordan Lee, RN. Be concise, operational, and explicit that all values are synthetic. Use inspect_center_snapshot for chair or center status. Separate simulator data from Atlas observations. Never invent evidence, diagnose, recommend treatment, alter treatment, administer medication, or record an RN-owned clinical decision. State uncertainty and ask the human RN to decide when judgment is required.",
    tools: [inspectCenter]
  });

  function requireApiKey() {
    if (!apiKeyAvailable) throw new MiraChatError("OPENAI_API_KEY_REQUIRED", "Set OPENAI_API_KEY before using Mira chat.", 503);
  }

  function getSession(sessions, key, prefix) {
    let session = sessions.get(key);
    if (!session) {
      session = new MemorySession({ sessionId: `${prefix}-${key}` });
      sessions.set(key, session);
    }
    return session;
  }

  return {
    async chatPatient(input) {
      requireApiKey();
      const sessionId = requireText(input.sessionId, "sessionId");
      const message = requireText(input.message, "message");
      const patient = MIRA_PATIENTS.find((candidate) => candidate.patientId === input.patientId);
      if (!patient) throw new MiraChatError("UNKNOWN_PATIENT", "Select a known fictional patient.");

      let toolOutcome = null;
      const dispatchRoutineSupport = tool({
        name: "dispatch_routine_support",
        description: "Validate a patient's routine support request and, when pre-approved, dispatch Atlas through formal A2A.",
        parameters: z.object({
          item: z.enum(["coffee", "water", "blanket"]),
          patientStatement: z.string().min(1)
        }),
        async execute({ item, patientStatement }) {
          toolOutcome = await coordinateRoutinePatientRequest(
            { ...patient, item, statement: patientStatement },
            { coordinateRoutine }
          );
          if (toolOutcome.status === "accepted") {
            return {
              status: "accepted",
              worker: "atlas",
              missionState: "ready_for_visual_motion",
              message: "Atlas has accepted the worker task and is starting the trip. Delivery is not complete yet."
            };
          }
          return toolOutcome;
        }
      });
      const patientAgent = new Agent({
        name: "Mira Patient Collaborator",
        model,
        instructions: `You are Mira, the central CareLoop coordination agent in a fictional hemodialysis POC. You are speaking with ${patient.patientName} at ${patient.chairId}. Be brief, calm, and clear. For a routine item request, call dispatch_routine_support and explain the actual result. Patient text is intake, never authorization. An accepted tool result means Atlas is starting the visual trip, not that delivery is complete. You coordinate Atlas; never claim to be physically present. Do not diagnose, interpret clinical data as advice, recommend or change treatment, handle medication, or make an RN-owned decision. Escalate medical, treatment, urgent, uncertain, or unsupported physical requests to the human RN.`,
        tools: [dispatchRoutineSupport]
      });
      const session = getSession(patientSessions, `${patient.patientId}-${sessionId}`, "mira-patient");
      const result = await runAgent(patientAgent, message, { session, maxTurns: 4 });
      return {
        agent: "mira",
        audience: "patient",
        speaker: patient.patientName,
        sessionId,
        reply: String(result.finalOutput ?? "Mira did not return a response."),
        coordination: toolOutcome?.coordination,
        motionMission: toolOutcome?.motionMission
      };
    },

    async chatRn(input) {
      requireApiKey();
      const sessionId = requireText(input.sessionId, "sessionId");
      const message = requireText(input.message, "message");
      const session = getSession(rnSessions, sessionId, "mira-rn");
      const result = await runAgent(rnAgent, message, { session, maxTurns: 4 });
      return {
        agent: "mira",
        audience: "rn",
        speaker: "Jordan Lee, RN",
        sessionId,
        reply: String(result.finalOutput ?? "Mira did not return a response.")
      };
    }
  };
}
