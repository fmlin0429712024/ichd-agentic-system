# In-Center Hemodialysis CareLoop POC — Technical Specification

## 1. Purpose

This specification defines a public-safe POC of operational collaboration
between two independent digital employees in a fictional dialysis center:

- **Mira**, a Nurse Operator Agent that coordinates work and escalates decisions.
- **Atlas**, an Aide AGV Agent that performs bounded chairside support tasks.

Both agents are black boxes. The POC demonstrates their external capabilities,
formal A2A communication, business contracts, and human-governed workflow. It
does not implement either agent's physical-AI internals.

## 2. Architectural decisions

| Decision | POC choice |
|---|---|
| Agent topology | One Agents SDK collaborator (Mira) plus one formal A2A worker (Atlas) |
| Agent behavior | Mira owns conversation and orchestration; Atlas owns bounded execution |
| Behavior baseline | One role-specific Codex Skill per agent, mapped into runtime code and tests |
| Inter-agent protocol | Official A2A protocol and SDK |
| Business payloads | Versioned JSON Schema contracts carried by A2A messages |
| Collaboration style | Structured task data plus optional natural-language context |
| Treatment center | Browser-based SVG/CSS simulation |
| Visual approach | Fixed-camera 2.5D scene; renderer-independent domain state |
| Runtime data | Static synthetic JSON; no database |
| Repeatability | Deterministic scenarios and measurements |
| Clinical authority | Human RN owns clinical and treatment decisions |
| Robot internals | Out of scope and hidden behind the Atlas black-box boundary |

OpenAI Agents SDK is Mira's POC conversational runtime. The Mira service keeps
API credentials out of the browser and calls the OpenAI API. Atlas does not use
an LLM for deterministic delivery execution in this slice; it is an independent
A2A worker with an Agent Card, task lifecycle, validated contract, and artifact.
API usage is billed separately from a ChatGPT or Codex subscription. The browser
is the visible simulation and conversation surface; Codex remains the
development and role-evaluation tool, not the demo runtime.

The current visual implementation and staged interaction are defined in
`docs/FRONTEND_DESIGN.md`.

## 3. System boundary

```text
Patient ───────────────┐
                      ▼
Human RN ───────────► Mira ◄──── simulated treatment data
                      │
                      │ official A2A task · status · artifact
                      ▼
                     Atlas ─────► Care-center motion emulator
```

The POC observes only the agents' public capabilities and messages. It does not
model Atlas navigation, actuators, sensors, robot middleware, or safety control.
Future physical implementations may use ROS 2, DDS, or other technologies
without changing the operational A2A contract.

### 3.1 POC AGV motion boundary

The care-center simulator owns a deterministic **AGV Motion Emulator** so Atlas
can be seen executing a task. It accepts only semantic destinations such as the
operations hub or a known chair, follows predefined waypoint routes, and emits
synthetic movement and arrival state to the renderer.

The emulator is not part of the Atlas agent and is not a physical model. It
uses a fixed circulation graph: a ring around the hub, four chair service
spurs, and one hub docking spur. Routine rounds follow a fixed clockwise chair
sequence. Assigned tasks may interrupt at the next safe waypoint and use the
deterministic shortest route. Only supply pickup, charging, or a completed round
requires the hub. The emulator does not calculate autonomous paths,
localization, collision avoidance, wheel dynamics, or safety behavior.

## 4. Role boundaries

### 4.1 Mira — Nurse Operator Agent

Mira owns operational coordination:

- Serve as the primary conversation point for patients and the human RN.
- Receive simulated patient, treatment, and center events.
- Assemble bounded patient and treatment context.
- Request a supported Atlas capability.
- Interpret returned evidence without inventing measurements.
- Present concise evidence and uncertainty to the human RN.
- Escalate clinical, treatment, critical, or uncertain cases.

Mira cannot diagnose, prescribe, change treatment, administer medication, or
claim a chairside observation that Atlas did not report.

### 4.2 Atlas — Aide AGV Agent

Atlas exposes a small capability catalog:

- `deliver_item`
- `collect_vital_sign`
- `observe_patient`
- `ask_patient`
- `report_condition`
- `request_human_assistance`
- `decline_unsupported_task`

Atlas has no general patient or RN chat surface. It accepts state-changing work
only through the formal Mira-to-Atlas A2A route and reports results to Mira. A
task may authorize a bounded chairside acknowledgement or question. Atlas does
not expose movement, sensor, actuator, or internal reasoning interfaces. It
cannot make medical judgments, change treatment, administer medication, draw
blood, manipulate an access site, lift a patient, or handle an emergency
requiring human contact.

### 4.3 Humans and simulator

- **Human RN:** owns clinical and treatment decisions and final authorization.
- **Human PCT:** performs physical assistance outside Atlas's safe capability.
- **Simulator:** owns synthetic measurements, scenario events, time, and the
  visible treatment-floor state.

## 5. A2A communication model

Mira is the coordinating A2A client. Atlas is the bounded A2A server/worker.
Atlas publishes an Agent Card describing its identity, endpoint, supported
content types, authentication mode, and available skills.

The POC pins the official JavaScript SDK `@a2a-js/sdk` at `1.0.0-beta.0`,
implementing A2A Protocol v1.0 over JSON-RPC. The beta is an explicit,
reproducible choice because the stable JavaScript SDK line implements v0.3.
The browser sends a provider-owned simulator event to the independent Mira
process on port `8042`. Mira owns Atlas discovery, capability compatibility,
A2A dispatch, correlation, and consumer-side artifact validation. The
simulator-to-Mira `/poc/events` adapter is not represented as A2A.

Minimum POC operations:

```text
discover Atlas Agent Card
send task message
read task status
answer input-required clarification
cancel task
receive final artifact or failure
```

Minimum lifecycle:

```text
submitted → working → completed
                    → failed
                    → canceled
          → input-required → working
```

Use the A2A `contextId` to correlate a CareLoop interaction. Provider-owned
`incidentId` and `taskId` fields remain distinct inside the structured payload
and artifact; the A2A server also generates its own protocol task ID.

The project must use an official A2A SDK and protocol envelope. A custom HTTP or
file-based JSON exchange must not be represented as A2A.

## 6. Contract model

A2A owns transport, discovery, task lifecycle, messages, and artifacts.
CareLoop contracts own the operational meaning carried inside those messages.

### 6.1 Contract rules

- Provider owns its public input and output contracts.
- Atlas owns Atlas task-request and task-result schemas.
- Mira owns external event and RN-decision-request schemas.
- Every structured payload carries `contractVersion`.
- Validate required fields, enums, identifiers, timestamps, units, and evidence
  provenance before a task can change state.
- Free text may explain context, uncertainty, or failure, but cannot alone
  authorize a physical or clinical action.
- Contract validation fails closed and produces a traceable rejection.

### 6.2 Atlas task request

```ts
type AtlasTaskRequest = {
  contractVersion: "1.0";
  incidentId: string;
  chairId: string;
  capability:
    | "deliver_item"
    | "collect_vital_sign"
    | "observe_patient"
    | "ask_patient";
  priority: "routine" | "urgent";
  parameters: Record<string, unknown>;
  requestedEvidence: string[];
  requestedBy: "mira";
};
```

### 6.3 Atlas result artifact

```ts
type AtlasTaskArtifact = {
  contractVersion: "1.0";
  incidentId: string;
  chairId: string;
  status: "completed" | "unable" | "human_help_required";
  observations: unknown[];
  patientStatements: string[];
  evidenceRefs: string[];
  completedAt: string;
  source: "atlas-simulator";
};
```

Detailed schemas and examples belong to the provider agent's `contracts/`
directory. The types above define scope, not the final schema implementation.

## 7. Agent runtime and Skill model

Mira owns the server-side Agents SDK conversational specialist. Atlas owns an
independent, deterministic A2A worker. An SDK handoff never replaces the formal
A2A seam: Mira interprets conversation and invokes bounded coordination tools;
all Atlas work still crosses A2A.

```text
Mira Skill → instructions + tools + guardrails → Agents SDK collaborator
Atlas Skill → Agent Card + contracts + guardrails → A2A worker
```

Runtime and Skill rules:

- Use `.agents/skills/<skill-name>/SKILL.md`.
- Keep `SKILL.md` concise, imperative, and role-specific.
- Put detailed procedures and domain material in one-level `references/` files.
- Keep SDK runtime, A2A hosting, schemas, simulator state, and UI code outside
  the Skill folder.
- Do not duplicate patient fixtures in either Skill.
- Map every state-changing runtime tool to a deterministic validator or
  provider-owned contract; free text alone never authorizes an action.
- Keep session state in memory for the POC and separate Mira patient sessions
  from Mira RN sessions.
- Validate each Skill with Codex and validate its runtime mapping with tests.

Mira's small `runtime/` module owns conversation and coordination tools. Each
role's `a2a/` adapter owns its side of the formal provider seam.

## 8. Repository layout

```text
nurse-operator-agent/
├── AGENTS.md
├── .agents/
│   └── skills/                   # Mira role Skill
├── runtime/                      # Mira Agents SDK conversation and tools
├── contracts/                    # Mira-owned schemas and examples
└── a2a/                          # thin A2A client adapter

aide-agv-agent/
├── AGENTS.md
├── .agents/
│   └── skills/                   # Atlas role Skill
├── contracts/                    # Agent Card and Atlas-owned schemas/examples
└── a2a/                          # thin A2A server adapter

care-center-simulator/
├── app/                          # browser treatment floor
├── scenarios/                    # deterministic scenario definitions
├── contracts/                    # simulator-owned event/snapshot schemas
└── tests/

poc-reference/                    # synthetic source fixtures and scenario notes
docs/                             # product and engineering specifications
AGENTS.md                         # repository-wide governance
WORKFLOW.md                       # cross-role authority and workflow contract
TASKS.md                          # dependency-ordered implementation queue
```

The repository intentionally has no shared `src/agent` runtime and no robot,
ROS, navigation, hardware, or body-adapter package.

## 9. Runtime and demonstration

The intended POC presentation uses three runtime processes:

1. Atlas worker A2A server launched from `aide-agv-agent/` on port `8043`.
2. Mira Agents SDK conversation, event adapter, and A2A client launched from
   `nurse-operator-agent/` on port `8042`.
3. Browser simulation launched from `care-center-simulator/` on port `5173`.

The browser exposes two identity-specific conversation surfaces: a selected
fictional patient talks to Mira, and the fictional registered nurse talks to
Mira. Atlas activity is visible through the event trace and motion emulator,
not a general human chat. Codex sessions may still be launched independently
for development-time Skill evaluation, but they are not part of the product
demonstration.

The first patient vertical slice is synchronous HTTP: Mira chat dispatches a
validated A2A task and returns the correlated result plus a semantic
`motionMission`. The browser then interrupts the routine round at a safe
waypoint and executes that mission with its deterministic Motion Emulator.
WebSocket, robot telemetry, and continuous digital-twin synchronization remain
out of scope.

The simulator produces deterministic events and measurements. Atlas treats it
as the fictional physical environment but remains a black box to Mira. The A2A
contract must remain unchanged when processes move from localhost to separate
devices.

## 10. Traceability and safety invariants

1. Simulated systolic BP below 90 immediately creates a critical RN alert.
2. Atlas evidence may enrich but never delay that alert.
3. Only a human RN action can record a clinical or treatment decision.
4. Neither agent may invent or directly change a measurement.
5. Atlas reports to Mira and makes no medical judgment.
6. Human PCT assistance is required for physical work outside Atlas capability.
7. Every message, task, clarification, rejection, artifact, escalation, and
   decision is traceable by incident and task identifiers.

## 11. Verification strategy

- Use Red → Green → Refactor for every implementation task. Record at least one
  test that fails for the intended reason before adding production behavior.
- Validate every Agent Card and CareLoop JSON Schema.
- Test A2A discovery, success, clarification, cancellation, rejection, and
  failure flows across two independently running processes.
- Prove malformed or unsupported tasks fail closed.
- Validate both role Skills and their SDK runtime mappings independently.
- Test all four deterministic patient scenarios.
- Run one Chrome smoke test for the complete critical-hypotension story.
- Confirm deterministic contracts and motion work without an API key; run
  conversational browser acceptance when `OPENAI_API_KEY` is present.
- Scan the public repository for client, patient, facility, secret, and local
  source-path leakage.

## 12. Explicit POC exclusions

The POC does not implement real patient data, production authentication,
production persistence, clinical decision support, medication workflows,
device integration, speech, computer vision, robot navigation, robot safety,
ROS 2, DDS, actuators, humanoid behavior, or autonomous physical care.
