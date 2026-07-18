# In-Center Hemodialysis CareLoop POC — Implementation Plan

## Delivery principle

Build the simulator playground first as an independently testable visual stage.
Build Skills, provider-owned contracts, and the formal A2A seam next, then
replace playground commands with validated agent tasks. Each slice must remain
demonstrable and preserve human authority.

Every implementation task follows Red → Green → Refactor. Domain behavior must
be tested independently from Three.js rendering; Chrome tests validate the
integrated user experience.

## Slice 0 — Governance baseline

### Outcome

The repository structure itself prevents the implementation from collapsing
back into one application pretending to be multiple agents.

### Scope

- Establish the two self-contained agent directories and simulator directory.
- Define black-box boundaries and contract ownership.
- Align Technical Spec, `WORKFLOW.md`, root and role-level `AGENTS.md`, and tasks.
- Keep Skill and A2A implementation directories as explicit placeholders.

### Exit criteria

- Every future file has one unambiguous owner.
- No shared custom agent runtime, robot internals, or OpenAI API dependency is
  part of the baseline.

## Slice 1 — Simulator playground

### Outcome

The browser presents a fixed-camera 2.5D four-chair center where Atlas can move,
carry an item, patrol deterministically, stop, reset, and produce an event trace.

### Scope

- Establish the test harness before production behavior.
- Implement renderer-independent floor layout and Atlas movement state.
- Render four chairs, operations center, Atlas, controls, and timeline.
- Validate movement and delivery in Chrome without either agent runtime.

### Exit criteria

- Unit tests and production build pass.
- A user can complete one manual delivery and deterministic patrol.
- No agent, A2A, or robot-internal logic is embedded in Three.js.

## Slice 2 — Contracts and independent Skills

### Outcome

Mira and Atlas can be launched independently in Codex with different authority,
and Atlas's external capability is machine-readable.

### Scope

- Create and validate the Mira and Atlas Codex Skills.
- Define Atlas Agent Card.
- Define Atlas task-request and result-artifact JSON Schemas with examples.
- Define Mira event and RN-decision-request schemas with examples.
- Add deterministic schema validation.

### Exit criteria

- Each Codex session discovers only its local role Skill.
- Valid examples pass; malformed, stale, and unsupported payloads fail closed.
- Neither Skill contains runtime wiring or copied patient records.

## Slice 3 — Minimal formal A2A seam

### Outcome

Two independent local processes complete one Atlas task through official A2A.

### Scope

- Use an official A2A SDK.
- Serve Atlas Agent Card and bounded task capability.
- Implement Mira discovery and client dispatch.
- Support success, input-required, cancellation, failure, and rejection.
- Preserve incident/context ID and task ID through the full exchange.

### Exit criteria

- The protocol exchange is inspectable and schema-valid.
- Moving the two processes to different hosts requires configuration changes,
  not contract changes.
- No custom JSON transport is labeled A2A.

## Slice 4 — Treatment data and scenario state

### Outcome

The browser shows a deterministic four-chair treatment center and event stream.

### Scope

- Initialize React, TypeScript, Vite, Three.js, and tests under the simulator.
- Load and validate the synthetic data pack.
- Render four chairs, current treatment cards, and Atlas presence.
- Implement deterministic clock, scenario injection, reset, and event timeline.

### Exit criteria

- Four patients, four chairs, and 144 historical treatments validate.
- Reset reproduces the same initial state.
- The simulator is the sole source of synthetic measurements.

## Slice 5 — Atlas capability integration

### Outcome

Atlas visibly completes bounded operational tasks without exposing robot
internals.

### Scope

- Connect Atlas A2A task handling to deterministic simulator capabilities.
- Demonstrate item delivery, question, observation, and vital-sign collection.
- Return structured artifacts with evidence provenance.
- Reject clinical, unsupported, and human-contact tasks.

### Exit criteria

- Atlas acts only after a validated task.
- Every result is attributable to simulator evidence.
- Human-assistance cases are routed to the PCT instead of Atlas.

## Slice 6 — Mira coordination and human RN loop

### Outcome

Mira assembles bounded context, coordinates Atlas, and presents evidence to the
human RN without making the RN's decision.

### Scope

- Assemble current event, treatment snapshot, profile summary, selected history,
  Atlas artifact, and authority constraints.
- Implement routine closure and RN escalation routes.
- Render the RN evidence and decision interface.
- Preserve one incident trace across both agents and the human decision.

### Exit criteria

- Critical alerts do not wait for Atlas.
- Only the RN can record clinical or treatment decisions.
- The complete evidence chain is understandable without reading raw JSON.

## Slice 7 — Four stories and showcase

### Outcome

The POC tells one cohesive, interview-ready story across all four patients.

### Scope

- Complete routine support, early termination, hypotension, and access-concern
  routes.
- Add the all-chair operational summary.
- Add scripted reset and scenario selection.
- Complete Chrome smoke testing, public-data scan, and README entry points.

### Exit criteria

- Every PRD acceptance criterion has an automated or recorded manual check.
- The complete deterministic demo runs without external model APIs.
- The public build contains no real client, patient, organization, or source
  system information.
