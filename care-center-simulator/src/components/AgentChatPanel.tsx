import { FormEvent, useRef, useState } from "react";
import { floorLayout } from "../domain/floor-layout";
import {
  sendMiraPatientMessage,
  sendMiraRnMessage,
  type MiraChatResponse,
  type MotionMission
} from "../integration/agent-chat-client";

type Message = { id: number; actor: string; text: string; kind: "user" | "agent" | "error" };

type Props = {
  disabled?: boolean;
  onAtlasMission: (mission: MotionMission, response: MiraChatResponse) => void;
  onTrace: (actor: string, message: string, tone?: "system" | "atlas" | "attention") => void;
  sendPatient?: typeof sendMiraPatientMessage;
  sendRn?: typeof sendMiraRnMessage;
};

const patientIds = ["demo-p001", "demo-p002", "demo-p003", "demo-p004"];

export function AgentChatPanel({
  disabled = false,
  onAtlasMission,
  onTrace,
  sendPatient = sendMiraPatientMessage,
  sendRn = sendMiraRnMessage
}: Props) {
  const [active, setActive] = useState<"patient" | "rn">("patient");
  const [patientId, setPatientId] = useState(patientIds[0]);
  const [patientInput, setPatientInput] = useState("");
  const [rnInput, setRnInput] = useState("");
  const [sending, setSending] = useState(false);
  const [patientMessages, setPatientMessages] = useState<Message[]>([
    { id: 1, actor: "Mira", text: "Hello Daniel. I coordinate CareLoop and can dispatch Atlas when physical support is needed.", kind: "agent" }
  ]);
  const [rnMessages, setRnMessages] = useState<Message[]>([
    { id: 1, actor: "Mira", text: "Jordan, I’m ready to coordinate the synthetic treatment floor.", kind: "agent" }
  ]);
  const messageId = useRef(2);
  const patientSession = useRef(`patient-${Date.now()}`);
  const rnSession = useRef(`rn-${Date.now()}`);
  const patientIndex = patientIds.indexOf(patientId);
  const selectedPatient = floorLayout.chairs[patientIndex];

  const submitPatient = async (event: FormEvent) => {
    event.preventDefault();
    const message = patientInput.trim();
    if (!message || sending) return;
    setPatientMessages((current) => [...current, { id: messageId.current++, actor: selectedPatient.patient, text: message, kind: "user" }]);
    setPatientInput("");
    setSending(true);
    onTrace("PATIENT", `${selectedPatient.patient}: ${message}`);
    try {
      const response = await sendPatient({ sessionId: patientSession.current, patientId, message });
      setPatientMessages((current) => [...current, { id: messageId.current++, actor: "Mira", text: response.reply, kind: "agent" }]);
      onTrace("MIRA", response.reply);
      if (response.motionMission) onAtlasMission(response.motionMission, response);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Mira is unavailable.";
      setPatientMessages((current) => [...current, { id: messageId.current++, actor: "SYSTEM", text, kind: "error" }]);
      onTrace("SYSTEM", text, "attention");
    } finally {
      setSending(false);
    }
  };

  const submitRn = async (event: FormEvent) => {
    event.preventDefault();
    const message = rnInput.trim();
    if (!message || sending) return;
    setRnMessages((current) => [...current, { id: messageId.current++, actor: "Jordan Lee, RN", text: message, kind: "user" }]);
    setRnInput("");
    setSending(true);
    onTrace("RN", message);
    try {
      const response = await sendRn({ sessionId: rnSession.current, message });
      setRnMessages((current) => [...current, { id: messageId.current++, actor: "Mira", text: response.reply, kind: "agent" }]);
      onTrace("MIRA", response.reply);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Mira is unavailable.";
      setRnMessages((current) => [...current, { id: messageId.current++, actor: "SYSTEM", text, kind: "error" }]);
      onTrace("SYSTEM", text, "attention");
    } finally {
      setSending(false);
    }
  };

  const messages = active === "patient" ? patientMessages : rnMessages;
  const input = active === "patient" ? patientInput : rnInput;
  return (
    <section className="agent-chat">
      <div className="coordination-note"><strong>MIRA COORDINATION</strong><span>Patients and the RN talk to Mira. Atlas receives bounded A2A work.</span></div>
      <div className="chat-tabs" role="tablist">
        <button className={active === "patient" ? "active" : ""} onClick={() => setActive("patient")}>Patient → Mira</button>
        <button className={active === "rn" ? "active" : ""} onClick={() => setActive("rn")}>RN → Mira</button>
      </div>

      {active === "patient" ? (
        <div className="identity-row">
          <label htmlFor="patient-select">Speaking as</label>
          <select id="patient-select" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
            {floorLayout.chairs.map((chair, index) => <option key={chair.id} value={patientIds[index]}>{chair.patient} · Chair {chair.number}</option>)}
          </select>
        </div>
      ) : <div className="identity-row fixed"><span>Speaking as</span><strong>Jordan Lee, RN</strong></div>}

      <div className="chat-messages" aria-live="polite">
        {messages.map((message) => <article className={`chat-message ${message.kind}`} key={message.id}><span>{message.actor}</span><p>{message.text}</p></article>)}
        {sending && <article className="chat-message agent pending"><span>Mira</span><p>Coordinating context and permitted tools…</p></article>}
      </div>

      <form className="chat-compose" onSubmit={active === "patient" ? submitPatient : submitRn}>
        <label className="sr-only" htmlFor="mira-message">Message Mira</label>
        <textarea
          id="mira-message"
          aria-label="Message Mira"
          placeholder={active === "patient" ? "Ask Mira for support…" : "Ask Mira about the treatment floor…"}
          value={input}
          onChange={(event) => active === "patient" ? setPatientInput(event.target.value) : setRnInput(event.target.value)}
        />
        <button disabled={(active === "patient" && disabled) || sending || !input.trim()} type="submit">Send to Mira</button>
      </form>
    </section>
  );
}
