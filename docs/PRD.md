# Agentic CareLoop for In-Center Hemodialysis — POC Product Requirements Document

**Status:** Product baseline

**Version:** 1.0

**Product type:** Browser-based concept demonstration

## 1. Overview

Agentic CareLoop for In-Center Hemodialysis demonstrates how multiple AI agents
could support an in-center hemodialysis (ICHD) clinic by monitoring treatment
data, collecting missing chairside context, handling bounded routine matters,
and escalating critical or judgment-dependent situations to a human registered
nurse.

The POC makes one idea tangible:

> Machine data becomes more useful when combined with relevant patient context
> and fresh chairside observations, while the human RN retains authority over
> critical and medical decisions.

This is a synthetic simulation, not a clinical product, medical device, or
workflow replacement.

The story takes place at **CareLoop Demo Center**, a fictional, fully occupied
four-chair treatment pod set in Chicago, Illinois. It has no real operator,
staff, patients, or affiliation. The product concept is intended to represent a
general in-center hemodialysis environment, not any specific organization.

The demo uses named fictional patient personas and clinically plausible
synthetic values so the story remains concrete and human without representing
any real person or record.

## 2. Product goals

- Show two clearly labelled evidence streams: simulated IoT treatment data and
  Aide AGV chairside observations.
- Demonstrate distinct AI roles and authority boundaries.
- Make human-in-the-loop escalation the signature product moment.
- Show how patient context and treatment prescription improve interpretation of
  a live signal.
- Keep every action inspectable from initial signal through final outcome.
- Deliver a deterministic, repeatable browser demonstration.

## 3. Participants

### Human RN — Jordan Lee, RN

The user and final decision owner.

- Receives critical, ambiguous, and medical-decision escalations.
- Reviews the evidence package and records the final simulated decision.
- Can request a center-wide status summary.
- Can override or correct Nurse AI.

### Nurse AI — Mira

The stationary coordinator and reasoning layer.

- Reads patient context, prescription, treatment data, and recent trends.
- Explains why a signal matters in context.
- Dispatches an Aide AGV when chairside information is missing.
- Handles only clearly bounded routine loops.
- Escalates critical, uncertain, and medical-decision situations.
- Never claims to have directly observed a patient.

### Aide AGV — Atlas

The mobile observer and bounded execution layer.

- Moves between the nurse station, supply point, and chairs.
- Observes appearance, alertness, patient-reported symptoms, and access site.
- Performs scripted manual BP/HR rechecks as chairside simulation data.
- Relays observations and patient requests to Nurse AI.
- Delivers only pre-approved fictional support items.
- Does not interpret clinical data or make treatment decisions.

Atlas is PCT-like only as a product-story shorthand. Its simulated task list is
not a claim about real PCT scope of practice.

### Human PCT — Casey Torres, PCT

The human safety and physical-assistance backstop.

- Remains present in the fictional center; Atlas does not replace this role.
- Receives a human-assistance request when a task requires physical help or an
  urgent human response.
- Is not a primary chat participant in the first POC.
- Does not receive a dedicated fall or emergency workflow in the first POC.

### Patient

The user may speak as a patient assigned to a selected chair.

- Patient statements are treated as a source of information.
- Routine comfort requests may be handled by the agents.
- Medical requests are relayed and escalated to the RN.

## 4. Product experience

The application presents a fully occupied four-chair treatment pod in a
top-down browser view. Each chair displays a compact live treatment summary. A
single Aide AGV moves through the center as directed by structured agent actions.

A unified event panel shows messages and actions from:

- Human RN
- Patient
- Nurse AI
- Aide AGV
- IoT simulator

The user can switch between RN and Patient identities. The active identity is
always visible.

Critical incidents open a prominent escalation banner and evidence card. The
card separates machine-measured evidence from chairside observations and stays
visible until the RN records a decision.

## 5. Core scenarios

### 5.1 Critical hypotension at Chair 3

1. Emma Morgan, a fictional patient persona at Chair 3, begins with plausible
   normal treatment values.
2. The presenter triggers a simulated BP change to 85/48 with HR 58.
3. A deterministic rule marks the chair critical and immediately alerts the RN.
4. Nurse AI reads the patient's relevant risk, prescription, treatment
   progress, current values, and recent trend.
5. Nurse AI dispatches the Aide AGV for chairside observation.
6. The Aide reports pale/clammy appearance, dizziness, nausea, alertness, and
   access-site appearance.
7. Nurse AI fuses IoT and on-site evidence into a concise RN summary.
8. The RN records a simulated decision.
9. The simulator produces a predefined follow-up reading and the incident moves
   through monitoring to resolution.

The UI must not claim that the RN selection medically caused the scripted
follow-up.

### 5.2 Routine support request

1. Daniel Kim at Chair 1 asks for his fictional pre-approved coffee.
2. Atlas retrieves and delivers the item.
3. Nurse AI records completion without interrupting the RN.

Atlas does not decide whether an item is clinically appropriate; the scenario
preconfigures it as approved fictional support.

### 5.3 Request to end treatment early

1. Noah Carter at Chair 2 says he feels anxious and requests early termination.
2. The Aide acknowledges and relays the exact request without acting on it.
3. Nurse AI presents prescribed, elapsed, and remaining treatment time with the
   patient's reason.
4. The RN records the decision before treatment state can change.

### 5.4 Non-IoT observation with uncertainty

1. Priya Shah at Chair 4 reports that her access site feels sore, while the IoT
   feed remains normal.
2. Mira dispatches Atlas to observe the site and perform a scripted manual
   BP/HR recheck.
3. Atlas reports the observation to Mira without interpreting it.
4. Mira states the uncertainty and escalates the case to Jordan for review.

### 5.5 Center status summary

The RN asks Nurse AI for a center overview. Nurse AI summarizes all four chairs,
prioritizes exceptions, and distinguishes clinical status from workflow state.

## 6. Data model

The POC uses fully synthetic data created only for this concept demo.

### Patient context

- Patient ID, display name, chair, age, and support preferences
- Primary condition
- Bounded comorbidity and allergy context
- Dry weight
- Vascular access type
- Scenario-relevant risk flag
- Read-only current medication context

### Treatment prescription

- Prescribed treatment duration
- Prescribed blood flow rate (BFR)
- Prescribed dialysate flow rate (DFR)
- Ultrafiltration goal

### Live treatment data

- Blood pressure and heart rate
- Current BFR and DFR
- UF rate and volume removed
- Elapsed and remaining treatment time

### Chairside observation

- Appearance and alertness
- Patient-reported symptoms
- Access-site appearance
- Scripted manual BP/HR recheck
- Observation time and observing agent

### Longitudinal treatment context

- Twelve weeks of compact synthetic history
- Thirty-six treatments per patient; 144 treatments in total
- Treatment duration, weights, UF goal and removal, BP pattern, and mean BFR
- Scenario-relevant historical events and a precomputed patient summary

For a use case, Mira receives the current event, current treatment snapshot,
relevant patient fields, the 12-week summary, and no more than three relevant
historical treatments. The full history is not sent in every agent call.

The chair KPI shows BP, HR, BFR, UF rate, and time remaining. Secondary values
remain available in expanded detail and agent context.

Laboratory, blood collection, vaccination, medication-administration,
longitudinal-assessment, state-rule, and facility-administration workflows are
outside the POC runtime. Medication data is read-only context and cannot become
an agent action.

## 7. Authority and safety model

The simulation engine owns hard status rules and workflow invariants. Language
models provide interpretation, conversation, and permitted structured actions.

The LLM cannot:

- Set, clear, hide, or downgrade a deterministic critical condition.
- Invent measurements or chairside observations.
- Execute an RN-owned treatment decision.
- Turn a medical request into an autonomous action.
- Present the simulation as clinical guidance.

The required hard trigger is simulated intradialytic systolic BP below 90 mmHg.
It is a POC scenario rule, not clinical guidance.

A hard critical trigger alerts the RN immediately. AGV observation enriches the
same incident in parallel; it never delays the alert.

The product maintains separate states:

- `clinicalStatus`: `normal | watch | critical`
- `incidentState`: `idle | detected | gathering_context | awaiting_rn |
  action_recorded | monitoring | resolved`

## 8. Functional requirements

### Clinic and simulation

- Render four chairs, a central operation center, and one supply point.
- Use Three.js with a top-down orthographic camera.
- Display compact HTML KPI panels anchored to chairs.
- Move one Aide AGV along predefined waypoints.
- Simulate slow metric drift and deterministic scenario injections.
- Provide controls for the four named scenarios and full reset.

### Conversation and identity

- Show one ordered conversation and event stream.
- Distinguish every actor by label, icon, and color.
- Allow the user to speak as RN or as a selected patient.
- Route patient messages to the Aide and RN messages to Nurse AI.
- Show Casey only when a human-assistance handoff is created.

### Agents

- Use server-side OpenAI API calls for Nurse AI and Aide AGV.
- Keep separate system instructions and permitted action sets for each agent.
- Include bounded world state and relevant history in each call.
- Validate every model action before it changes simulation state.
- Keep API credentials outside browser code.
- Allow Atlas or Mira to create `request_human_pct_assistance(reason)` without
  assigning a clinical decision to Casey.

### Incidents and events

- Use one append-only in-memory event store as the session source of truth.
- Create one incident for the Chair 3 scenario and update it as evidence arrives.
- Keep the critical banner visible until the RN records a decision.
- Record signal, observation, escalation, RN decision, follow-up, and outcome on
  one incident timeline.
- Support reset to the known initial state.

Minimum event fields:

```text
eventId
timestamp
actor
chairId
eventType
message
payload
sourceStream
incidentId
```

## 9. UX requirements

- Main area: top-down clinic floor with chair KPIs and moving AGV.
- Side panel: unified conversation and event timeline.
- Attention layer: escalation banner and evidence card.
- Input area: identity switcher, active identity, message field, and send action.
- Development controls remain visually separate from the product interface.

The visual language should feel calm, precise, and operational:

- Dark-neutral instrument-panel background
- Restrained clinical blue or teal for interaction
- Status colors used only for normal, watch, and critical states
- Tabular numerals for treatment data
- Clear keyboard focus and reduced-motion support

IoT data and on-site observations must always be visibly labelled. The RN must
understand an escalation without reading the entire conversation history.

## 10. Technical constraints

- Local browser-based web application
- Modern desktop Chrome target
- Three.js floor with DOM-based data and conversation panels
- Thin server boundary for OpenAI calls
- In-memory state; no database
- Static synthetic JSON fixtures for patient profiles and treatment history
- No authentication or real clinical integrations
- Separate simulator, renderer, agent orchestration, and UI modules
- Stable action contracts between LLM “brains” and simulation “bodies”
- Predefined movement; no physics or pathfinding

## 11. Acceptance criteria

The POC is complete when:

- Four named patients display plausible changing treatment data.
- Chair 3 hypotension immediately creates a critical RN escalation.
- The Aide moves to Chair 3 and adds labelled chairside evidence to the existing
  incident.
- Nurse AI visibly combines patient context, treatment data, and observation.
- Neither AI agent can execute an RN-owned treatment decision.
- The RN can record a decision and inspect the full incident timeline.
- Daniel's pre-approved coffee request closes without RN escalation.
- The early-termination request cannot change treatment before RN action.
- Priya's access-site concern is collected by Atlas and escalated as an
  uncertainty, despite normal IoT values.
- Nurse AI can summarize the current state of all four chairs.
- Nurse AI can retrieve a bounded 12-week summary and relevant historical
  treatments without loading the complete history into every agent call.
- Agent failures do not clear critical status or corrupt simulation state.
- The complete flow is operable through visible controls in desktop Chrome.

## 12. Non-goals

- Clinical validation or real patient use
- EHR, machine, IoT, or scheduling integrations
- Real patient data, authentication, or persistent sessions
- Medication decision/administration, blood collection, laboratory,
  vaccination, or longitudinal clinical workflows
- Multiple AGVs, dynamic pathfinding, physics, voice, or computer vision
- User-configurable clinical rules or a general-purpose agent platform
- Production deployment, observability, or analytics

## 13. Source references

- `poc-reference/data/clinic-seed.json` — synthetic four-chair dataset
- `poc-reference/data/patient-profiles.json` — synthetic patient-domain context
- `poc-reference/data/treatment-history.json` — compact 12-week history
- `poc-reference/data/mira-context-fixtures.json` — bounded per-use-case agent
  context
- `poc-reference/data-model.md` — field selection and traceability
- `poc-reference/use-case-catalog.md` — data-to-use-case evidence map
- `poc-reference/patient-scenarios.md` — patient and team story map
- `poc-reference/workflows/realtime-response-chain.md` — product response
  workflow

## 14. Project documentation

- **README** is the public showcase: a concise story, cast, four scenarios, and
  future interactive-demo entry point.
- **This PRD** is the detailed product source of truth for scope, authority,
  data, behavior, and acceptance criteria.
- **Four-patient story map** is the scenario-level reference used to keep the
  README, seed data, agent behavior, and future UI aligned.
- **Data-to-use-case map** defines which patient, historical, current, and
  chairside evidence supports each visible scenario.
- **Technical specification** defines the runtime, two role Skills, structured
  handoffs, provider boundary, and deterministic safety controls.
- **Implementation plan and task queue** translate the specification into
  vertical slices and dependency-ordered work.
