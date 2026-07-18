# In-Center Hemodialysis CareLoop POC — Task Queue

Dependencies inside each track are ordered. The simulator playground is built
first as the visual test stage; role Skills, contracts, and A2A follow before
agent-controlled scenarios. Completing a task requires its validation to pass.

For every implementation task: add a failing test first, implement the minimum
behavior, refactor while green, and run the relevant suite before completion.

## Governance baseline

- [x] `GOV-01` Establish independent Mira, Atlas, and simulator ownership
  directories. **Validate:** each directory has a local governance file.
- [x] `GOV-02` Define agents as black boxes and exclude robot internals from the
  POC. **Validate:** Technical Spec contains no robot implementation package.
- [x] `GOV-03` Assign provider-owned contracts and formal A2A boundaries.
  **Validate:** layout and workflow documents agree on ownership.

## Role Skills

- [ ] `SKILL-M01` Initialize the Mira Skill under
  `nurse-operator-agent/.agents/skills/`. **Validate:** standard Skill structure
  and `agents/openai.yaml` exist.
- [ ] `SKILL-M02` Implement concise Mira instructions and references.
  **Depends on:** `SKILL-M01`. **Validate:** Codex Skill validation passes and a
  fresh role test respects RN authority.
- [x] `SKILL-A01` Initialize the Atlas Skill under
  `aide-agv-agent/.agents/skills/`. **Validate:** standard Skill structure and
  `agents/openai.yaml` exist.
- [x] `SKILL-A02` Implement concise Atlas instructions and references.
  **Depends on:** `SKILL-A01`. **Validate:** Codex Skill validation passes and a
  fresh role test rejects medical judgment and unsupported physical work.
- [ ] `SKILL-ISO1` Verify role discovery from each agent working directory.
  **Depends on:** `SKILL-M02`, `SKILL-A02`. **Validate:** neither terminal
  discovers the other role's local Skill.

## Provider-owned contracts

- [x] `CONTRACT-A01` Define and validate the Atlas Agent Card.
  **Depends on:** `SKILL-A02`. **Validate:** declared skills match Atlas's actual
  accepted capability set.
- [x] `CONTRACT-A02` Define Atlas task-request and result-artifact JSON Schemas
  with valid and invalid examples. **Validate:** required fields, enums, IDs,
  timestamps, units, version, and provenance fail closed.
- [ ] `CONTRACT-M01` Define Mira event-input and RN-decision-request JSON Schemas
  with examples. **Validate:** only evidence presentation and human-owned
  decisions are expressible.
- [ ] `CONTRACT-X01` Add deterministic validation commands for both contract
  owners. **Depends on:** `CONTRACT-A02`, `CONTRACT-M01`. **Validate:** all valid
  examples pass and all invalid examples fail.

## Formal A2A seam

- [x] `A2A-01` Select and pin an official A2A SDK and protocol binding.
  **Validate:** decision and version are recorded in the Technical Spec.
- [x] `A2A-A01` Implement the thin Atlas A2A server and publish its Agent Card.
  **Depends on:** `A2A-01`, `CONTRACT-A01`, `CONTRACT-A02`.
  **Validate:** discovery works from a separate process.
- [ ] `A2A-M01` Implement the thin Mira A2A client and capability discovery.
  **Depends on:** `A2A-A01`. **Validate:** Mira rejects an unavailable or
  incompatible capability before dispatch.
- [ ] `A2A-02` Complete one schema-valid task through two independent processes.
  **Depends on:** `A2A-M01`. **Validate:** context/incident ID, task ID, status,
  and artifact remain correlated.
- [ ] `A2A-03` Test input-required, cancellation, failure, malformed payload,
  unsupported capability, and duplicate request behavior. **Depends on:**
  `A2A-02`. **Validate:** every case is traceable and fails safely.
- [x] `A2A-VS01` Demonstrate a schema-valid Daniel coffee task from a simulated
  Mira browser client through official A2A and replay the verified artifact as
  Atlas movement. **Validate:** discovery, completed task, provenance, route,
  and event trace are visible; this does not complete the Mira role tasks.

## Simulator foundation

- [x] `SIM-TEST-01` Establish simulator unit and component test harness.
  **Validate:** an intentional missing-behavior test fails before production
  implementation begins.
- [x] `SIM-FOUND-01` Initialize React, TypeScript, Vite, Three.js, and tests in
  `care-center-simulator/`. **Depends on:** `SIM-TEST-01`. **Validate:** local
  start, test, and production build.
- [x] `SIM-PLAY-01` Build the central-hub four-chair playground, deterministic
  route overlay, patient request flow, and stable Atlas movement layer.
  **Depends on:** `SIM-FOUND-01`. **Validate:** route unit tests and the Daniel
  coffee browser journey pass without clearing the static Three.js scene.
- [ ] `SIM-DATA-01` Define and validate simulator-owned profile, history,
  treatment-snapshot, and event contracts. **Depends on:** `SIM-FOUND-01`.
  **Validate:** four patients, four chairs, 144 treatments, four use cases.
- [ ] `SIM-STATE-01` Implement deterministic clock, append-only event state,
  replay, pause, speed, and reset. **Depends on:** `SIM-DATA-01`.
  **Validate:** replay and reset reproduce identical state.
- [ ] `SIM-UI-01` Render four chairs, patient KPIs, Atlas presence, and unified
  event timeline. **Depends on:** `SIM-STATE-01`. **Validate:** actor, source,
  chair, incident, and status are visible.
- [ ] `SIM-SAFE-01` Implement the hard simulated SBP-below-90 RN alert.
  **Depends on:** `SIM-STATE-01`. **Validate:** alert precedes any Atlas result.

## Atlas capability integration

- [ ] `ATLAS-01` Connect validated Atlas task requests to deterministic simulator
  capabilities. **Depends on:** `A2A-03`, `SIM-STATE-01`. **Validate:** Atlas
  never acts without an accepted A2A task.
- [ ] `ATLAS-02` Implement item delivery, bounded patient question, observation,
  and vital-sign collection. **Depends on:** `ATLAS-01`. **Validate:** all result
  values and statements retain evidence provenance.
- [ ] `ATLAS-03` Implement unsupported-task rejection and human-PCT assistance
  routing. **Depends on:** `ATLAS-01`. **Validate:** clinical and human-contact
  work produces no Atlas execution.

## Mira and human RN integration

- [ ] `MIRA-01` Implement bounded context assembly from current event, treatment,
  profile summary, selected history, and Atlas artifact. **Depends on:**
  `CONTRACT-M01`, `SIM-DATA-01`. **Validate:** full raw history is never injected.
- [ ] `MIRA-02` Implement routine coordination and Atlas dispatch routes.
  **Depends on:** `MIRA-01`, `ATLAS-02`. **Validate:** every dispatch names a
  declared Atlas capability and valid contract.
- [ ] `RN-01` Render the human RN evidence and decision interface.
  **Depends on:** `MIRA-01`, `SIM-UI-01`. **Validate:** evidence, history,
  uncertainty, and requested human decision are visible.
- [ ] `RN-02` Enforce RN-only clinical and treatment decisions.
  **Depends on:** `RN-01`, `SIM-SAFE-01`. **Validate:** both digital employees'
  decision attempts have no state-changing effect.

## Patient stories and showcase

- [ ] `UC-01` Complete Daniel's routine support route.
- [ ] `UC-02` Complete Noah's early-termination route through the human RN.
- [ ] `UC-03` Complete Emma's critical-hypotension route with immediate alert
  and parallel evidence gathering.
- [ ] `UC-04` Complete Priya's access-concern route without suppressing
  uncertainty when machine data appears normal.
- [ ] `UC-05` Complete the traceable four-chair operational summary.
- [ ] `TEST-01` Add contract, A2A, state, safety, and four-scenario tests.
  **Depends on:** `UC-01`–`UC-05`. **Validate:** complete suite passes.
- [ ] `TEST-02` Add one Chrome smoke test for Emma's story.
  **Depends on:** `UC-03`. **Validate:** event-to-human-decision path works.
- [ ] `EVAL-01` Forward-test both Skills with fresh role-specific prompts.
  **Depends on:** all Skill and contract tasks. **Validate:** role and authority
  boundaries hold under unseen phrasing.
- [ ] `DOC-01` Update README with the runnable demo path and screenshot.
  **Depends on:** `TEST-02`. **Validate:** a new reader can launch and understand
  the demonstration.
- [ ] `SAFE-01` Run final public-data and source-trace scan.
  **Validate:** no real client, patient, facility, secret, or local source path
  is present.
