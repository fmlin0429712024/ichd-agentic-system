# In-Center Hemodialysis CareLoop POC

## Purpose

Build a public-safe, synthetic demonstration of operational collaboration
between two independent digital employees: Mira, the Nurse Operator Agent, and
Atlas, the Aide AGV Agent. The project is not a clinical system or robot-control
implementation.

## Read before substantial work

1. `docs/PRD.md` — product source of truth.
2. `docs/TECHNICAL_SPEC.md` — architecture, A2A, contracts, and exclusions.
3. `WORKFLOW.md` — cross-role authority and collaboration contract.
4. `docs/IMPLEMENTATION_PLAN.md` — dependency strategy.
5. `TASKS.md` — ordered work queue and validation.

## Ownership

- `nurse-operator-agent/`: Mira Skill, Mira-owned contracts, A2A client adapter.
- `aide-agv-agent/`: Atlas Skill, Agent Card, Atlas-owned contracts, A2A server.
- `care-center-simulator/`: synthetic environment, browser UI, scenarios, state.
- `poc-reference/`: public-safe synthetic fixtures and source scenario notes.

Do not create a shared custom agent runtime. Launch each Codex role from its own
top-level agent directory so it discovers only its local `.agents/skills/`.

## Non-negotiable controls

- Use only fictional and synthetic data.
- Never publish a real client, patient, facility, identifier, policy, secret, or
  local source path.
- Treat Mira and Atlas as black boxes; do not implement robot internals.
- Use official A2A for inter-agent communication; do not label custom JSON
  exchange as A2A.
- Keep provider-owned business schemas separate from the A2A protocol envelope.
- The simulator owns measurements and hard alert rules.
- Atlas reports to Mira and makes no medical judgment.
- The human RN owns all clinical and treatment decisions.
- Validate every structured task and artifact before it changes state.

## Working style

- Use test-driven development for every implementation task: first add a test
  that fails for the intended reason, then implement the minimum behavior,
  refactor with tests green, and run the relevant suite before completion.
- Follow `TASKS.md` dependency order and validate before marking work complete.
- Preserve unrelated user changes.
- Keep Skills concise; put details in one-level `references/` resources.
- Keep protocol adapters and schemas outside Skill folders.
- Do not add ROS, DDS, navigation, hardware, body-adapter, or external model API
  scope to the POC without revising the Technical Spec first.
