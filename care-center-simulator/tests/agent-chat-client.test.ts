import { describe, expect, it, vi } from "vitest";
import { sendMiraPatientMessage, sendMiraRnMessage } from "../src/integration/agent-chat-client";

describe("agent chat clients", () => {
  it("sends selected patient identity to Mira and accepts a semantic Atlas motion mission", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        agent: "mira",
        audience: "patient",
        sessionId: "patient-session",
        reply: "Mira approved the request.",
        motionMission: { missionId: "task-1", type: "deliver_item", item: "coffee", pickup: "nurse-station", destination: "chair-01" }
      })
    });
    const result = await sendMiraPatientMessage(
      { sessionId: "patient-session", patientId: "demo-p001", message: "Coffee please" },
      { fetcher }
    );
    expect(fetcher).toHaveBeenCalledWith("http://127.0.0.1:8042/chat/patient", expect.objectContaining({ method: "POST" }));
    expect(result.motionMission?.destination).toBe("chair-01");
  });

  it("routes RN text to Mira and preserves server errors", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Set OPENAI_API_KEY" }) });
    await expect(sendMiraRnMessage({ sessionId: "rn-session", message: "Status?" }, { fetcher })).rejects.toThrow("Set OPENAI_API_KEY");
  });
});
