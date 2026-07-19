# In-Center Hemodialysis CareLoop POC

## Purpose

Build a public-safe, synthetic demonstration of operational collaboration
between Mira, an LLM-backed Nurse Operator Agent, and Atlas, a deterministic
Aide AGV worker. A lightweight Webots layer may simulate Atlas's external body
behavior, but the project is not a clinical system or production robot-control
implementation.

## Read before substantial work

1. `docs/PRD.md` — product source of truth.
2. `docs/TECHNICAL_SPEC.md` — architecture, A2A, contracts, and exclusions.
3. `WORKFLOW.md` — cross-role authority and collaboration contract.
4. `docs/IMPLEMENTATION_PLAN.md` — dependency strategy.
5. `TASKS.md` — ordered work queue and validation.

## Ownership

- `nurse-operator-agent/`: Mira Skill, Agents SDK collaborator runtime, Mira-owned contracts,
  and A2A client adapter.
- `aide-agv-agent/`: Atlas Skill, deterministic worker runtime, Agent Card,
  Atlas-owned contracts, and A2A server; no LLM or human chat endpoint.
- `care-center-simulator/`: manager-facing Operations Canvas, synthetic care
  state, scenarios, and projection of Atlas telemetry.
- `physical-simulator/`: Webots engineering world, simulated AGV body,
  controller, and a narrow mission/telemetry adapter.
- `poc-reference/`: public-safe synthetic fixtures and source scenario notes.

Do not create a shared custom agent runtime. Mira owns the server-side OpenAI
Agents SDK conversation surface. Atlas is an independent formal A2A worker with
no human chat endpoint in the POC. Their local `.agents/skills/` remain the
human-readable behavior baseline and Codex evaluation surface; runtime
instructions, tools, guardrails, and tests must stay aligned with those Skills.

## Non-negotiable controls

- Use only fictional and synthetic data.
- Never publish a real client, patient, facility, identifier, policy, secret, or
  local source path.
- Treat Mira and Atlas as operational black boxes. The physical simulator may
  model a minimal synthetic AGV body, but not production robot internals.
- Use official A2A for inter-agent communication; do not label custom JSON
  exchange as A2A.
- Keep provider-owned business schemas separate from the A2A protocol envelope.
- The care-center simulator owns patient measurements and hard alert rules;
  Webots owns only simulated physical pose, motion, and collision state.
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
- Do not add ROS, DDS, real hardware, SLAM, autonomous path planning, or
  production safety-control scope. Keep the Webots adapter outside Atlas.
- Keep OpenAI API credentials server-side and never commit or expose them in
  browser code, fixtures, logs, or documentation examples.
