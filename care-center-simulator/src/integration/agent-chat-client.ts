import type { CarryItem } from "../domain/atlas-machine";
import type { WaypointId } from "../domain/floor-layout";

export type MotionMission = {
  missionId: string;
  type: "deliver_item";
  item: CarryItem;
  pickup: "nurse-station";
  destination: Exclude<WaypointId, "nurse-station">;
};

export type MiraChatResponse = {
  agent: "mira";
  audience: "patient" | "rn";
  speaker?: string;
  sessionId: string;
  reply: string;
  coordination?: { artifact?: { evidenceRefs?: string[] } };
  motionMission?: MotionMission;
};

type Fetcher = typeof fetch;

async function postJson<T>(url: string, body: unknown, fetcher: Fetcher): Promise<T> {
  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "Agent service unavailable");
  return payload as T;
}

export function sendMiraPatientMessage(
  input: { sessionId: string; patientId: string; message: string },
  options: { baseUrl?: string; fetcher?: Fetcher } = {}
) {
  return postJson<MiraChatResponse>(`${options.baseUrl ?? "http://127.0.0.1:8042"}/chat/patient`, input, options.fetcher ?? fetch);
}

export function sendMiraRnMessage(
  input: { sessionId: string; message: string },
  options: { baseUrl?: string; fetcher?: Fetcher } = {}
) {
  return postJson<MiraChatResponse>(`${options.baseUrl ?? "http://127.0.0.1:8042"}/chat/rn`, input, options.fetcher ?? fetch);
}
