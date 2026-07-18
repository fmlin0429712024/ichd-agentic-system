# Agentic CareLoop POC — Implementation Plan

## Delivery principle

Build the POC as vertical slices. Every slice must produce a browser-visible,
testable improvement while preserving the PRD safety and authority boundaries.

## Slice 0 — Engineering foundation

### Outcome

A reproducible TypeScript workspace with fixture validation and test commands.

### Scope

- Initialize React, TypeScript, Vite, Three.js, Node server, and Vitest.
- Add shared schemas for patient, treatment, event, action, and handoff data.
- Load and validate the four public JSON fixtures.
- Add one command that starts client and server together.

### Exit criteria

- Clean install and build succeed.
- Fixture validation reports four patients and 144 historical treatments.
- No browser or server code contains API credentials.

## Slice 1 — Static four-chair center

### Outcome

The browser shows the fictional treatment floor and all four current patients.

### Scope

- Create the page shell and operations-panel layout.
- Render a fixed Three.js floor with four chairs and one AGV home waypoint.
- Render DOM chair cards from `clinic-seed.json`.
- Display the cast and fictional/non-clinical label.

### Exit criteria

- Four chairs match patient and treatment IDs in the fixture.
- The layout remains readable at the target desktop viewport.

## Slice 2 — Deterministic treatment simulation

### Outcome

Treatment values progress, can pause/reset, and remain reproducible.

### Scope

- Implement simulation clock and reducer.
- Update elapsed time, remaining time, UF removed, and display KPIs.
- Add start, pause, speed, inject, and reset development controls.
- Append every simulation change to the event store.

### Exit criteria

- Reset reproduces the exact initial state.
- Hard status rules are deterministic and independently tested.

## Slice 3 — Workflow engine and event timeline

### Outcome

The application can serialize handoffs and display one traceable workflow.

### Scope

- Implement event, incident, task, and decision state models.
- Implement action validation and permission checks.
- Render the unified timeline with actor and source labels.
- Implement routine, awaiting-worker, awaiting-RN, and resolved states.

### Exit criteria

- Replaying an event sequence reproduces the same state.
- Invalid and stale agent actions are rejected and logged.

## Slice 4 — Aide AGV worker

### Outcome

The AGV visibly executes bounded chairside tasks.

### Scope

- Create `careloop-aide-agv` with the standard Codex Skill structure.
- Implement waypoint movement and task queue.
- Implement scripted patient question, manual BP/HR, observation, delivery, and
  report actions.
- Add the deterministic Aide provider behavior for all four use cases.

### Exit criteria

- The AGV moves only after a valid dispatch.
- Every observation is attributed to the chairside stream.
- Unsupported physical or medical actions are rejected.

## Slice 5 — Nurse AI coordinator

### Outcome

The Nurse AI assembles context, dispatches the AGV, and presents RN evidence.

### Scope

- Create `careloop-nurse-ai` with the standard Codex Skill structure.
- Implement bounded context assembly from the synthetic data pack.
- Implement deterministic coordination for five use-case routes.
- Implement the optional OpenAI provider behind the same action contract.

### Exit criteria

- Context never exceeds the summary plus three relevant historical treatments.
- Provider substitution does not change permissions or state invariants.
- Provider failure leaves the human interface and hard alerts operational.

## Slice 6 — Human RN decision loop

### Outcome

The complete Emma incident can be demonstrated from signal to resolution.

### Scope

- Render the RN decision card.
- Implement RN-owned decision actions.
- Link signal, AGV observation, escalation, decision, and outcome under one
  incident ID.
- Keep critical status visible until the RN records a decision.

### Exit criteria

- Critical alert is immediate and cannot be delayed by AGV movement.
- Neither digital employee can execute the RN action.
- The full evidence chain is understandable without reading raw JSON.

## Slice 7 — Four-story completion and showcase polish

### Outcome

All four patients and the center summary form one interview-ready demonstration.

### Scope

- Complete coffee, early termination, hypotension, and access-concern routes.
- Add the all-chair Nurse AI summary.
- Add scripted demo reset and scenario selector.
- Verify accessibility, reduced motion, empty/error states, and README entry
  points.

### Exit criteria

- Every PRD acceptance criterion has an automated or recorded manual check.
- The deterministic demo works without network access.
- No real client, patient, organization, or source-system information is
  present in the public build.
