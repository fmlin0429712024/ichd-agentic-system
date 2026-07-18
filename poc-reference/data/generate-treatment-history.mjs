import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const outputUrl = new URL("./treatment-history.json", import.meta.url);
const anchorDate = new Date("2026-07-20T12:00:00Z");
const historyDates = [];

for (let week = 12; week >= 1; week -= 1) {
  for (const weekdayOffset of [0, 2, 4]) {
    const date = new Date(anchorDate);
    date.setUTCDate(anchorDate.getUTCDate() - week * 7 + weekdayOffset);
    historyDates.push(date.toISOString().slice(0, 10));
  }
}

const patientConfigs = [
  {
    patientId: "demo-p001",
    name: "Daniel Kim",
    prescribedMinutes: 240,
    bfr: 400,
    dryWeightKg: 72.4,
    baseUfMl: 2100,
    preSbp: 132,
    minSbp: 112,
    postSbp: 124,
    eventByIndex: {}
  },
  {
    patientId: "demo-p002",
    name: "Noah Carter",
    prescribedMinutes: 240,
    bfr: 350,
    dryWeightKg: 78.1,
    baseUfMl: 1900,
    preSbp: 136,
    minSbp: 114,
    postSbp: 128,
    eventByIndex: {
      25: {
        type: "early_termination_request",
        actualMinutes: 196,
        note: "Anxiety reported; simulated RN decision and shortened treatment documented."
      }
    }
  },
  {
    patientId: "demo-p003",
    name: "Emma Morgan",
    prescribedMinutes: 240,
    bfr: 400,
    dryWeightKg: 70.7,
    baseUfMl: 2100,
    preSbp: 126,
    minSbp: 103,
    postSbp: 118,
    eventByIndex: {
      6: { type: "hypotension", minSbp: 88, note: "Dizziness reported; simulated RN review recorded." },
      19: { type: "hypotension", minSbp: 86, note: "Nausea and low BP reported; simulated RN review recorded." },
      31: { type: "hypotension", minSbp: 89, note: "Low BP trend reported; simulated RN review recorded." }
    }
  },
  {
    patientId: "demo-p004",
    name: "Priya Shah",
    prescribedMinutes: 210,
    bfr: 350,
    dryWeightKg: 64.2,
    baseUfMl: 1800,
    preSbp: 130,
    minSbp: 108,
    postSbp: 122,
    eventByIndex: {
      17: { type: "access_discomfort", note: "Mild soreness reported; simulated RN review recorded." },
      32: { type: "access_discomfort", note: "Tenderness reported with otherwise stable treatment data." }
    }
  }
];

const round1 = (value) => Math.round(value * 10) / 10;
const average = (values) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

function buildSessions(config) {
  return historyDates.map((date, index) => {
    const event = config.eventByIndex[index] ?? null;
    const ufGoalMl = config.baseUfMl + [-200, 0, 100, 200, -100][index % 5];
    const actualMinutes = event?.actualMinutes ?? config.prescribedMinutes - (index % 11 === 0 ? 4 : 0);
    const completionRatio = actualMinutes / config.prescribedMinutes;
    const ufRemovedMl = Math.round(ufGoalMl * completionRatio - [0, 30, 60][index % 3]);
    const preWeightKg = round1(config.dryWeightKg + ufGoalMl / 1000 + [0.1, 0.2, 0][index % 3]);
    const postWeightKg = round1(preWeightKg - ufRemovedMl / 1000);
    const preSbp = config.preSbp + [-4, 0, 3, -2, 2][index % 5];
    const minSbp = event?.minSbp ?? config.minSbp + [-3, 0, 2, -1][index % 4];
    const postSbp = config.postSbp + [-3, 1, 0, 2][index % 4];

    return {
      treatmentId: `${config.patientId}-tx-${String(index + 1).padStart(3, "0")}`,
      treatmentDate: date,
      prescribedMinutes: config.prescribedMinutes,
      actualMinutes,
      completedAsPrescribed: actualMinutes >= config.prescribedMinutes - 5,
      preWeightKg,
      postWeightKg,
      ufGoalMl,
      ufRemovedMl,
      bloodPressure: {
        pre: { systolic: preSbp, diastolic: Math.round(preSbp * 0.55) },
        minimum: { systolic: minSbp, diastolic: Math.round(minSbp * 0.56) },
        post: { systolic: postSbp, diastolic: Math.round(postSbp * 0.55) }
      },
      meanBfrMlMin: config.bfr - (index % 9 === 0 ? 10 : 0),
      sessionMedicationContext: ["heparin order present"],
      events: event ? [{ eventType: event.type, note: event.note }] : []
    };
  });
}

const patientHistories = patientConfigs.map((config) => {
  const sessions = buildSessions(config);
  const events = sessions.flatMap((session) => session.events);

  return {
    patientId: config.patientId,
    displayName: config.name,
    summary: {
      scheduledTreatments: sessions.length,
      completedAsPrescribed: sessions.filter((session) => session.completedAsPrescribed).length,
      averageActualMinutes: average(sessions.map((session) => session.actualMinutes)),
      averageUfRemovedMl: average(sessions.map((session) => session.ufRemovedMl)),
      averagePreSystolic: average(sessions.map((session) => session.bloodPressure.pre.systolic)),
      averageMinimumSystolic: average(sessions.map((session) => session.bloodPressure.minimum.systolic)),
      hypotensionEvents: events.filter((event) => event.eventType === "hypotension").length,
      earlyTerminationRequests: events.filter((event) => event.eventType === "early_termination_request").length,
      accessDiscomfortReports: events.filter((event) => event.eventType === "access_discomfort").length
    },
    sessions
  };
});

const dataset = {
  metadata: {
    dataset: "CareLoop Demo Center compact treatment history",
    version: "1.0",
    synthetic: true,
    fictional: true,
    clinicalUse: false,
    historyWindow: {
      startDate: historyDates[0],
      endDate: historyDates.at(-1),
      weeks: 12,
      treatmentsPerPatient: 36,
      cadence: "Monday / Wednesday / Friday"
    },
    granularity: "One compact record per treatment; no minute-level telemetry.",
    purpose: "Provide longitudinal context for Mira and visible traceability for the four POC scenarios."
  },
  patientHistories
};

await writeFile(outputUrl, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(`Generated ${fileURLToPath(outputUrl)} with ${historyDates.length * patientConfigs.length} treatments.`);
