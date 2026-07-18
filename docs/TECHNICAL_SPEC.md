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
| Agent topology | Two independently launchable Codex agents |
| Agent behavior | One role-specific Codex Skill per agent |
| Inter-agent protocol | Official A2A protocol and SDK |
| Business payloads | Versioned JSON Schema contracts carried by A2A messages |
| Collaboration style | Structured task data plus optional natural-language context |
| Treatment center | Browser-based SVG/CSS simulation |
| Visual approach | Fixed-camera 2.5D scene; renderer-independent domain state |
| Runtime data | Static synthetic JSON; no database |
| Repeatability | Deterministic scenarios and measurements |
| Clinical authority | Human RN owns clinical and treatment decisions |
| Robot internals | Out of scope and hidden behind the Atlas black-box boundary |

No OpenAI API integration is assumed by this specification. Codex is the POC
agent runtime and the browser is the visible simulation surface.

The current visual implementation and staged interaction are defined in
`docs/FRONTEND_DESIGN.md`.

## 3. System boundary

```text
┌──────────────────────────┐       official A2A       ┌──────────────────────────┐
│ Mira                     │◄────────────────────────►│ Atlas                    │
│ Nurse Operator Agent     │ Task · Status · Artifact │ Aide AGV Agent           │
│ independent black box    │ structured data + text   │ independent black box    │
└─────────────┬────────────┘                           └─────────────┬────────────┘
              │                                                      │
              │ coordination, escalation                            │ capabilities
              ▼                                                      ▼
        Human RN interface                              Care-center simulator
```

The POC observes only the agents' public capabilities and messages. It does not
model Atlas navigation, actuators, sensors, robot middleware, or safety control.
Future physical implementations may use ROS 2, DDS, or other technologies
without changing the operational A2A contract.

## 4. Role boundaries

### 4.1 Mira — Nurse Operator Agent

Mira owns operational coordination:

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

Atlas reports only to Mira in the normal workflow. It does not expose movement,
sensor, actuator, or internal reasoning interfaces. It cannot make medical
judgments, change treatment, administer medication, draw blood, manipulate an
access site, lift a patient, or handle an emergency requiring human contact.

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
The initial browser journey uses a simulated Mira client; the independent Mira
Skill and client adapter remain separate follow-on work.

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

## 7. Codex Skill model

Each top-level agent is independently launchable from its own directory. Codex
discovers only that agent's local `.agents/skills/` tree, preserving role
isolation.

```text
Codex session + local AGENTS.md + local Skill + tools/context = POC agent
```

Skill rules:

- Use `.agents/skills/<skill-name>/SKILL.md`.
- Keep `SKILL.md` concise, imperative, and role-specific.
- Put detailed procedures and domain material in one-level `references/` files.
- Keep A2A hosting, schemas, simulator state, and UI code outside the Skill.
- Do not duplicate patient fixtures in either Skill.
- Validate each Skill with the Codex skill validation utility.

A small `a2a/` adapter is permitted for each role. It hosts or consumes the
formal protocol; it is not a second custom agent runtime.

## 8. Repository layout

```text
nurse-operator-agent/
├── AGENTS.md
├── .agents/
│   └── skills/                   # Mira role Skill
├── contracts/                    # Mira-owned schemas and examples
└── a2a/                          # thin A2A client adapter

aide-agv-agent/
├── AGENTS.md
├── .agents/
│   └── skills/                   # Atlas role Skill
├── contracts/                    # Agent Card and Atlas-owned schemas/examples
└── a2a/                          # thin A2A server adapter

care-center-simulator/
├── app/                          # browser and Three.js treatment floor
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

The intended POC presentation uses three visible surfaces:

1. Mira Codex session launched from `nurse-operator-agent/`.
2. Atlas Codex session launched from `aide-agv-agent/`.
3. Browser simulation launched from `care-center-simulator/`.

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
- Validate both role Skills independently from their own working directories.
- Test all four deterministic patient scenarios.
- Run one Chrome smoke test for the complete critical-hypotension story.
- Confirm the demo works with synthetic data and no external model API.
- Scan the public repository for client, patient, facility, secret, and local
  source-path leakage.

## 12. Explicit POC exclusions

The POC does not implement real patient data, production authentication,
production persistence, clinical decision support, medication workflows,
device integration, speech, computer vision, robot navigation, robot safety,
ROS 2, DDS, actuators, humanoid behavior, or autonomous physical care.
