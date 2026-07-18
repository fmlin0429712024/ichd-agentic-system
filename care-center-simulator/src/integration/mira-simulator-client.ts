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

export type MiraCoordinationResult = {
  contractVersion: "1.0";
  eventId: string;
  incidentId: string;
  providerTaskId: string;
  a2aTaskId: string;
  chairId: AtlasProviderArtifact["chairId"];
  status: AtlasProviderArtifact["status"];
  artifact: AtlasProviderArtifact;
};

export function buildDanielCoffeeEvent() {
  return {
    contractVersion: "1.0",
    eventId: "event-deliver-coffee-001",
    incidentId: "incident-daniel-coffee-001",
    chairId: "chair-01",
    eventType: "routine_request",
    occurredAt: new Date().toISOString(),
    source: "care-center-simulator",
    evidenceRefs: ["sim-patient-request-001"],
    routineSupport: { item: "coffee", preApproved: true }
  } as const;
}

export async function requestDanielCoffee(miraBaseUrl = "http://127.0.0.1:8042"): Promise<MiraCoordinationResult> {
  const response = await fetch(`${miraBaseUrl}/poc/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDanielCoffeeEvent())
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Mira coordination failed");
  if (body.status !== "completed" || !body.artifact?.evidenceRefs?.length) {
    throw new Error("Mira returned no completed, traceable Atlas artifact");
  }
  return body as MiraCoordinationResult;
}
