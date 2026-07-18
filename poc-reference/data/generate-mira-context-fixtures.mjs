import { readFile, writeFile } from "node:fs/promises";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const profiles = await readJson("./patient-profiles.json");
const history = await readJson("./treatment-history.json");
const seed = await readJson("./clinic-seed.json");

const useCaseByPatient = {
  "demo-p001": "UC-01",
  "demo-p002": "UC-02",
  "demo-p003": "UC-03",
  "demo-p004": "UC-04"
};

const contexts = seed.chairs.map((chair) => {
  const patientId = chair.patient.patientId;
  const profile = profiles.patients.find((item) => item.patientId === patientId);
  const patientHistory = history.patientHistories.find((item) => item.patientId === patientId);
  const relevantTreatments = patientHistory.sessions.filter((session) => session.events.length > 0).slice(-3);

  return {
    useCaseId: useCaseByPatient[patientId],
    actor: "mira",
    patient: {
      patientId,
      displayName: profile.displayName,
      chairId: profile.chairId,
      age: profile.age
    },
    relevantProfile: {
      clinicalContext: profile.clinicalContext,
      vascularAccess: profile.vascularAccess,
      currentPrescription: profile.currentPrescription,
      medicationContext: profile.medicationContext,
      miraContext: profile.miraContext
    },
    historyContext: {
      window: history.metadata.historyWindow,
      summary: patientHistory.summary,
      relevantTreatments
    },
    currentTreatment: {
      identity: chair.currentTreatment,
      prescription: chair.prescription,
      live: chair.live,
      status: chair.status
    },
    currentTrigger: chair.scenarioInjection,
    authorityConstraints: [
      "Mira may explain, coordinate, request evidence, and escalate.",
      "Mira may not prescribe, administer, hold, or change medication.",
      "Mira may not execute an RN-owned treatment decision.",
      "A deterministic critical state cannot be suppressed or downgraded by an agent."
    ]
  };
});

const output = {
  metadata: {
    dataset: "Mira bounded context fixtures",
    version: "1.0",
    synthetic: true,
    fictional: true,
    clinicalUse: false,
    purpose: "Show the exact bounded context shape available to Mira for each patient scenario."
  },
  contexts
};

await writeFile(
  new URL("./mira-context-fixtures.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8"
);

console.log(`Generated ${contexts.length} Mira context fixtures.`);
