# Agentic CareLoop POC — Task Queue

Tasks are ordered by dependency. A task is complete only when its stated
validation passes. Keep changes small and preserve the PRD, Technical Spec, and
`WORKFLOW.md` contracts.

## Foundation

- [ ] `FOUND-01` Initialize React + TypeScript + Vite and a small Node server.  
  **Output:** runnable client/server shell. **Validate:** local start and production build.
- [ ] `FOUND-02` Add Three.js, Vitest, and shared TypeScript configuration.  
  **Depends on:** `FOUND-01`. **Validate:** imports compile and one smoke test passes.
- [ ] `DATA-01` Define schemas for profiles, history, current treatment, and Mira contexts.  
  **Depends on:** `FOUND-01`. **Validate:** all four JSON files parse without coercion.
- [ ] `DATA-02` Add cross-file ID and count validation.  
  **Depends on:** `DATA-01`. **Validate:** four patients, four chairs, 144 treatments, four use cases.
- [ ] `DATA-03` Expose a server-only bounded-context loader.  
  **Depends on:** `DATA-02`. **Validate:** returns summary plus at most three relevant treatments.

## Shared workflow contracts

- [ ] `STATE-01` Implement the append-only event type and event ID generator.  
  **Depends on:** `FOUND-01`. **Validate:** events preserve actor, source, chair, treatment, and incident references.
- [ ] `STATE-02` Implement the deterministic application reducer.  
  **Depends on:** `STATE-01`. **Validate:** replay produces identical state.
- [ ] `STATE-03` Implement incident and task state transitions.  
  **Depends on:** `STATE-02`. **Validate:** invalid transitions fail closed.
- [ ] `SAFE-01` Implement action-schema and role-permission validation.  
  **Depends on:** `STATE-01`. **Validate:** forbidden Nurse AI and Aide AGV actions are rejected.
- [ ] `SAFE-02` Implement the hard simulated SBP-below-90 trigger.  
  **Depends on:** `STATE-02`. **Validate:** RN alert is emitted before any worker result.
- [ ] `SAFE-03` Enforce RN-only treatment and clinical decisions.  
  **Depends on:** `SAFE-01`, `STATE-03`. **Validate:** digital-employee decision attempts have no side effect.

## Browser shell and simulation

- [ ] `UI-01` Build the desktop application shell and operations panel.  
  **Depends on:** `FOUND-01`. **Validate:** responsive target layout with no overflow.
- [ ] `FLOOR-01` Render four chairs and AGV home waypoint in Three.js.  
  **Depends on:** `FOUND-02`, `UI-01`. **Validate:** chair IDs match fixture IDs.
- [ ] `UI-02` Render patient/chair KPI cards from current treatment data.  
  **Depends on:** `DATA-01`, `UI-01`. **Validate:** BP, HR, BFR, UF, and time are visible.
- [ ] `SIM-01` Implement deterministic clock, pause, speed, and reset.  
  **Depends on:** `STATE-02`. **Validate:** reset reproduces seed values.
- [ ] `SIM-02` Implement four scenario injection controllers.  
  **Depends on:** `SIM-01`, `SAFE-02`. **Validate:** each injection emits the expected event sequence.
- [ ] `UI-03` Render the unified conversation/event timeline.  
  **Depends on:** `STATE-01`, `UI-01`. **Validate:** actor and source stream are visible.

## Aide AGV Skill and worker

- [ ] `SKILL-A01` Initialize `.agents/skills/careloop-aide-agv` with the Codex skill utility.  
  **Validate:** standard folder and `agents/openai.yaml` exist.
- [ ] `SKILL-A02` Write the concise Aide AGV `SKILL.md` and reference contracts.  
  **Depends on:** `SKILL-A01`. **Validate:** Codex skill validation passes.
- [ ] `AGV-01` Implement the Aide task request/report schemas.  
  **Depends on:** `SAFE-01`. **Validate:** valid fixtures pass and malformed reports fail.
- [ ] `AGV-02` Implement waypoint movement and one-task queue.  
  **Depends on:** `FLOOR-01`, `AGV-01`. **Validate:** AGV cannot move without a valid dispatch.
- [ ] `AGV-03` Implement scripted question, manual-vitals, observation, and delivery actions.  
  **Depends on:** `AGV-02`. **Validate:** output comes only from simulator fixtures.
- [ ] `AGV-04` Implement human-PCT assistance handoff.  
  **Depends on:** `AGV-03`. **Validate:** physical-assistance cases do not become AGV actions.

## Nurse AI Skill and coordinator

- [ ] `SKILL-N01` Initialize `.agents/skills/careloop-nurse-ai` with the Codex skill utility.  
  **Validate:** standard folder and `agents/openai.yaml` exist.
- [ ] `SKILL-N02` Write the concise Nurse AI `SKILL.md` and reference contracts.  
  **Depends on:** `SKILL-N01`. **Validate:** Codex skill validation passes.
- [ ] `NURSE-01` Implement Nurse AI action and RN-decision-request schemas.  
  **Depends on:** `SAFE-01`. **Validate:** only permitted coordinator actions pass.
- [ ] `NURSE-02` Implement bounded context assembly.  
  **Depends on:** `DATA-03`, `NURSE-01`. **Validate:** output matches four context fixtures.
- [ ] `NURSE-03` Implement scripted provider for five routes.  
  **Depends on:** `NURSE-02`, `AGV-01`. **Validate:** all routes complete without network access.
- [ ] `NURSE-04` Implement optional server-side OpenAI provider.  
  **Depends on:** `NURSE-03`. **Validate:** mocked response passes the same schemas and permissions.
- [ ] `NURSE-05` Implement provider failure and invalid-action fallback.  
  **Depends on:** `NURSE-04`. **Validate:** hard alert and RN controls remain available.

## Human decision loop and scenarios

- [ ] `RN-01` Render the RN evidence and decision card.  
  **Depends on:** `NURSE-01`, `UI-01`. **Validate:** reason, evidence, history, uncertainty, and requested decision are visible.
- [ ] `RN-02` Implement RN-owned decision events and follow-up state.  
  **Depends on:** `RN-01`, `SAFE-03`. **Validate:** one named human action resolves the simulated decision gate.
- [ ] `UC-01` Complete Daniel's pre-approved support route.  
  **Depends on:** `AGV-03`, `NURSE-03`. **Validate:** closes without RN interruption.
- [ ] `UC-02` Complete Noah's early-termination route.  
  **Depends on:** `RN-02`. **Validate:** treatment cannot change before RN action.
- [ ] `UC-03` Complete Emma's critical hypotension route.  
  **Depends on:** `SAFE-02`, `RN-02`, `AGV-03`. **Validate:** immediate alert plus parallel evidence gathering.
- [ ] `UC-04` Complete Priya's access-concern route.  
  **Depends on:** `RN-02`, `AGV-03`. **Validate:** normal IoT does not suppress uncertainty escalation.
- [ ] `UC-05` Complete the four-chair status summary.  
  **Depends on:** `NURSE-03`. **Validate:** prioritizes exceptions with evidence references.

## Verification and showcase

- [ ] `TEST-01` Add reducer, safety, action-contract, and fixture unit tests.  
  **Depends on:** all shared contracts. **Validate:** full unit suite passes.
- [ ] `TEST-02` Add four deterministic scenario integration tests.  
  **Depends on:** `UC-01`–`UC-04`. **Validate:** expected event trajectories pass.
- [ ] `TEST-03` Add one browser smoke test for Emma's incident.  
  **Depends on:** `UC-03`. **Validate:** signal-to-RN-decision path works in Chrome.
- [ ] `EVAL-01` Forward-test both Skills with fresh role-specific prompts.  
  **Depends on:** `SKILL-A02`, `SKILL-N02`. **Validate:** outputs obey handoff and authority contracts.
- [ ] `DOC-01` Update README with the runnable demo path and screenshot.  
  **Depends on:** `TEST-03`. **Validate:** a new reader can launch and understand the demo.
- [ ] `SAFE-04` Run final public-data and source-trace scan.  
  **Depends on:** all implementation tasks. **Validate:** no real client, patient, facility, secret, or local path is present.
