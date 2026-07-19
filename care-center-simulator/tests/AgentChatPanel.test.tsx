import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentChatPanel } from "../src/components/AgentChatPanel";

afterEach(cleanup);

describe("AgentChatPanel", () => {
  it("routes a patient conversation through Mira and forwards the verified Atlas mission", async () => {
    const onAtlasMission = vi.fn();
    render(<AgentChatPanel
      onAtlasMission={onAtlasMission}
      onTrace={() => undefined}
      sendPatient={async () => ({
        agent: "mira", audience: "patient", sessionId: "patient-session", reply: "I assigned Atlas to bring your coffee.",
        motionMission: { missionId: "task-1", type: "deliver_item", item: "coffee", pickup: "nurse-station", destination: "chair-01" }
      })}
      sendRn={async () => ({ agent: "mira", audience: "rn", sessionId: "rn-session", reply: "Ready." })}
    />);
    fireEvent.change(screen.getByLabelText("Message Mira"), { target: { value: "Please bring me coffee" } });
    fireEvent.click(screen.getByRole("button", { name: "Send to Mira" }));
    await waitFor(() => expect(screen.getByText("I assigned Atlas to bring your coffee.")).toBeInTheDocument());
    expect(onAtlasMission).toHaveBeenCalledWith(expect.objectContaining({ destination: "chair-01" }), expect.anything());
  });

  it("switches to the RN conversation without showing field controls", () => {
    render(<AgentChatPanel onAtlasMission={() => undefined} onTrace={() => undefined} />);
    expect(screen.getByRole("button", { name: "Patient → Mira" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "RN → Mira" }));
    expect(screen.getByLabelText("Message Mira")).toBeInTheDocument();
    expect(screen.queryByText("Field controls")).not.toBeInTheDocument();
  });
});
