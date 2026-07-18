# Agentic CareLoop POC — Technical Specification

## 1. Purpose

This specification translates the POC PRD into an executable system contract.
It defines the browser application, simulation engine, two digital employees,
data boundaries, structured actions, and validation rules.

The product remains a fictional, synthetic, non-clinical demonstration.

## 2. Core decisions

| Decision | POC choice |
|---|---|
| User experience | Desktop browser application |
| Front end | React + TypeScript + Vite |
| Treatment floor | Three.js scene with DOM overlays |
| Application state | Typed reducer plus append-only in-memory event store |
| Server boundary | Small Node server for skill loading and optional model calls |
| Runtime data | Static synthetic JSON; no database |
| Digital employees | Nurse AI coordinator + Aide AGV worker |
| Agent behavior | Two Codex-compatible Skills plus validated structured actions |
| Default demo path | Deterministic scripted provider |
| Optional AI path | Server-side OpenAI provider using the same Skill instructions |
| Human authority | Human RN owns all clinical and treatment decisions |

## 3. Skill versus agent

A Skill is not the complete runtime agent.

```text
Skill       = portable instructions + workflow + domain references
Agent       = Skill + model + tools + context + state + execution loop
Digital job = agent role + permitted actions + handoff contract
```

This distinction supports two execution surfaces:

1. **Codex-native surface:** Codex discovers the repository Skills and can act
   as the Nurse AI or Aide AGV for development, rehearsal, and evaluation.
2. **Browser POC surface:** the server loads the same `SKILL.md` instructions
   into two runtime agent profiles. A provider adapter supplies either
   deterministic scripted behavior or optional OpenAI model behavior.

The browser cannot directly spawn independent Codex sessions. Logical
multi-agent behavior is therefore implemented by the application orchestrator,
which invokes each role separately and validates every returned action.

## 4. Multi-agent model

The Nurse AI is the coordinator. The Aide AGV is a bounded worker.

```text
Patient message / simulated IoT event
                    │
                    ▼
          Nurse AI coordinator
           │                │
           │ dispatch       │ RN escalation / summary
           ▼                ▼
       Aide AGV          Human RN
           │                │
           │ report         │ decision
           └──────► Nurse AI ◄──────┘

Aide AGV or Nurse AI ── human physical help required ──► Human PCT
```

The two agent roles are logically separate but do not run concurrently in the
first POC. The orchestrator processes one validated action at a time. Movement
and simulated measurements may animate asynchronously, while state changes
remain serialized through the event reducer.

## 5. Skill structure

The implementation will use repository-local Codex Skills:

```text
.agents/skills/
├── careloop-nurse-ai/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── references/
│       ├── context-contract.md
│       └── action-contract.md
└── careloop-aide-agv/
    ├── SKILL.md
    ├── agents/openai.yaml
    └── references/
        ├── task-contract.md
        └── observation-contract.md
```

Skill rules:

- Use Codex-compatible YAML frontmatter with only `name` and `description`.
- Keep each `SKILL.md` concise, imperative, and role-specific.
- Put detailed schemas in one-level `references/` files.
- Do not duplicate patient data inside Skills; retrieve it from fixtures.
- Do not put provider wiring, API keys, React code, or simulation state inside
  Skill instructions.
- Validate both skills with the Codex skill validation utility.

The Nurse AI Skill owns coordination policy. The Aide AGV Skill owns chairside
task procedure. Neither Skill owns the application state machine or hard safety
rules.

## 6. Repository layout

```text
src/
├── client/
│   ├── app/                 # React shell and layout
│   ├── floor/               # Three.js scene and AGV animation
│   ├── panels/              # Chair cards, timeline, escalation card
│   └── state/               # reducer, selectors, UI actions
├── server/
│   ├── agents/              # role profiles and provider adapters
│   ├── api/                 # narrow HTTP endpoints
│   └── skills/              # server-only Skill loader
├── shared/
│   ├── contracts/           # events, actions, handoffs, context schemas
│   └── validation/          # fixture and action validation
└── simulator/
    ├── clock/               # deterministic treatment clock
    ├── scenarios/           # four scenario controllers
    └── workflow/            # serialized orchestration state machine

.agents/skills/              # Codex-discoverable role Skills
poc-reference/data/          # synthetic JSON fixtures
WORKFLOW.md                   # cross-role handoff and authority contract
```

## 7. Runtime components

### 7.1 Fixture loader

Load and validate:

- `patient-profiles.json`
- `treatment-history.json`
- `clinic-seed.json`
- `mira-context-fixtures.json`

Reject startup when patient IDs, treatment references, chair IDs, or use-case
IDs do not match. Never silently repair fixture data.

### 7.2 Simulation engine

The engine owns the demo clock, current treatment values, scenario injection,
and reset. It emits deterministic events; it does not ask a model to invent a
measurement.

Required controls:

- Start, pause, resume, speed, inject scenario, and reset.
- One known initial state for repeatable interviews.
- A scripted sequence for each of the four use cases.
- Simulated IoT and chairside observations remain separate source streams.

### 7.3 Event store

Use one append-only in-memory event array as the session source of truth.

```ts
type CareLoopEvent = {
  eventId: string;
  timestamp: string;
  actor: "simulator" | "patient" | "nurse_ai" | "aide_agv" | "human_rn" | "human_pct";
  chairId?: string;
  treatmentId?: string;
  incidentId?: string;
  eventType: string;
  message: string;
  payload: unknown;
  sourceStream: "iot" | "chairside" | "agent" | "human" | "system";
};
```

Derived UI state must be reproducible by reducing the event sequence from the
known seed state.

### 7.4 Workflow state

```text
idle
  → detected
  → gathering_context
  → awaiting_worker
  → awaiting_nurse_ai
  → awaiting_rn
  → executing_approved_follow_up
  → resolved
```

Routine support may move from `gathering_context` directly to `resolved` when
the requested action is pre-approved and no RN decision is required.

## 8. Context assembly

The context assembler is deterministic. For a selected use case it returns:

```text
current event
+ current treatment snapshot
+ relevant patient-profile fields
+ 12-week summary
+ up to three relevant historical treatments
+ fresh Aide AGV observation, when available
+ authority constraints
```

The model never receives all 144 historical treatment records in one call.
Medication data is read-only context. The context builder must not turn a
medication record into an executable action.

## 9. Nurse AI contract

### Responsibilities

- Combine current treatment state, relevant patient context, historical
  summary, and fresh chairside evidence.
- Coordinate routine work and request missing evidence.
- Explain why a case is normal, watch, or critical without changing the hard
  status.
- Escalate medical, critical, uncertain, or treatment-change decisions.
- Present a concise center summary to the human RN.

### Allowed structured actions

```text
dispatch_aide_agv(task)
notify_human_rn(escalation)
present_rn_decision_request(request)
close_routine_support(outcome)
request_human_pct_assistance(reason)
summarize_center(summary)
```

### Forbidden actions

- Diagnose or claim clinical certainty.
- Prescribe, administer, hold, or change medication.
- Change treatment settings, end treatment, or clear a critical status.
- Claim a chairside observation it did not receive.

## 10. Aide AGV contract

### Responsibilities

- Execute one dispatched physical-world simulation task at a time.
- Move to a known waypoint.
- Ask a bounded question and relay the patient's exact statement.
- Perform a scripted manual BP/HR recheck from simulator-provided values.
- Record predefined appearance, alertness, symptom, and visible access-site
  observations.
- Deliver a pre-approved support item.
- Report completion or inability to the Nurse AI.

### Allowed structured actions

```text
move_to(waypoint)
ask_patient(question)
record_manual_vitals(values)
record_observation(observation)
deliver_preapproved_item(item)
report_to_nurse_ai(report)
request_human_pct_assistance(reason)
```

### Forbidden actions

- Diagnose, interpret a finding, or recommend treatment.
- Draw blood, administer medication, cannulate, or manipulate access.
- Change machine settings or end treatment.
- Handle a fall, lift a patient, or perform emergency physical assistance.
- Communicate a medical decision directly to the patient.

## 11. Handoff contracts

### Nurse AI to Aide AGV

```ts
type AideTaskRequest = {
  taskId: string;
  incidentId?: string;
  chairId: string;
  taskType: "observe" | "manual_vitals" | "ask_patient" | "deliver_item";
  requestedEvidence: string[];
  patientStatement?: string;
  permittedItem?: string;
};
```

### Aide AGV to Nurse AI

```ts
type AideTaskReport = {
  taskId: string;
  chairId: string;
  status: "completed" | "unable" | "human_help_required";
  observations: unknown[];
  patientStatements: string[];
  evidenceRefs: string[];
  completedAt: string;
};
```

### Nurse AI to human RN

```ts
type RnDecisionRequest = {
  incidentId: string;
  chairId: string;
  priority: "routine" | "urgent" | "critical";
  reasonForAttention: string;
  currentEvidence: string[];
  relevantHistory: string[];
  uncertainty: string[];
  requestedDecision: string;
};
```

The runtime validates every handoff before appending it to the event store.
Invalid output becomes an `agent_action_rejected` event and cannot change state.

## 12. Provider interface

```ts
interface AgentProvider {
  run(request: {
    role: "nurse_ai" | "aide_agv";
    instruction: string;
    context: unknown;
    allowedActions: string[];
  }): Promise<AgentResponse>;
}
```

Implement two providers:

- `ScriptedAgentProvider`: deterministic, keyless, supports the complete demo.
- `OpenAIAgentProvider`: optional server-side provider for natural-language
  explanation and structured action selection.

Both providers must return the same validated action schema. Provider failure
must not remove alerts, clear incidents, or block the human RN interface.

## 13. UI contract

### Main floor

- Four fixed treatment chairs with patient first name and chair number.
- Compact KPI overlay: BP, HR, BFR, UF rate, and remaining time.
- Aide AGV waypoint and movement animation.
- Clear normal, watch, and critical states.

### Operations panel

- Unified event and conversation timeline.
- Actor and source-stream labels on every entry.
- Filter-free first POC; keep all events in one readable sequence.

### Human RN decision card

- Reason for attention.
- Current evidence and relevant history.
- Missing evidence or uncertainty.
- Requested human decision.
- Visible action buttons owned by the RN.

The card presents evidence, not a clinical recommendation.

## 14. Safety invariants

1. Simulated systolic BP below 90 immediately creates a critical RN alert.
2. Aide observation may enrich but never delay that alert.
3. Only a human RN action can record a treatment or clinical decision.
4. No agent may invent or directly change a measurement.
5. The Aide AGV reports only to the Nurse AI in the normal workflow.
6. The human PCT is used only for physical assistance outside the AGV boundary.
7. Every action, rejection, escalation, and decision is traceable by event ID.

## 15. Verification strategy

- Schema tests for every JSON fixture and structured action.
- Reducer tests proving the same event sequence produces the same state.
- Safety tests proving critical status and RN authority cannot be bypassed.
- Skill validation for both repository Skills.
- Scenario tests for all four patient stories.
- One browser smoke test for the complete Emma incident.
- Scripted-provider tests run without network access or API credentials.
- Optional provider contract tests use mocked model responses by default.

## 16. POC boundary

The POC does not implement real patient data, device integration, authentication,
medication workflows, clinical decision support, production persistence,
computer vision, voice, robot navigation, or autonomous physical care.
