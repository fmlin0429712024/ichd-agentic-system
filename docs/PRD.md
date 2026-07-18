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

The story takes place at **CareLoop Demo Center**, a fictional eight-chair
clinic with no real-world location, operator, staff, or patients. The product
concept is intended to represent a general in-center hemodialysis environment,
not any specific organization.

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

### Human RN

The user and final decision owner.

- Receives critical, ambiguous, and medical-decision escalations.
- Reviews the evidence package and records the final simulated decision.
- Can request a center-wide status summary.
- Can override or correct Nurse AI.

### Nurse AI

The stationary coordinator and reasoning layer.

- Reads patient context, prescription, treatment data, and recent trends.
- Explains why a signal matters in context.
- Dispatches an Aide AGV when chairside information is missing.
- Handles only clearly bounded routine loops.
- Escalates critical, uncertain, and medical-decision situations.
- Never claims to have directly observed a patient.

### Aide AGV

The mobile observer and bounded execution layer.

- Moves between the nurse station, supply point, and chairs.
- Observes appearance, alertness, patient-reported symptoms, and access site.
- Relays observations and patient requests to Nurse AI.
- Performs predefined non-medical comfort actions.
- Does not interpret clinical data or make treatment decisions.

### Patient

The user may speak as a patient assigned to a selected chair.

- Patient statements are treated as a source of information.
- Routine comfort requests may be handled by the agents.
- Medical requests are relayed and escalated to the RN.

## 4. Product experience

The application presents an eight-chair dialysis center in a top-down browser
view. Each chair displays a compact live treatment summary. A single Aide AGV
moves through the center as directed by structured agent actions.

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

1. Alice Morgan, a fictional patient persona at Chair 3, begins with plausible
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

### 5.2 Routine comfort request

1. The user speaks as the patient in Chair 4 and asks for a blanket.
2. The Aide retrieves and delivers it.
3. Nurse AI records completion without interrupting the RN.

The default routine story uses a blanket rather than water because fluid intake
may carry clinical meaning for a dialysis patient.

### 5.3 Request to end treatment early

1. The user speaks as the patient in Chair 2 and requests early termination.
2. The Aide acknowledges and relays the exact request without acting on it.
3. Nurse AI presents prescribed, elapsed, and remaining treatment time with the
   patient's reason.
4. The RN records the decision before treatment state can change.

### 5.4 Center status summary

The RN asks Nurse AI for a center overview. Nurse AI summarizes all eight chairs,
prioritizes exceptions, and distinguishes clinical status from workflow state.

## 6. Data model

The POC uses fully synthetic data created only for this concept demo.

### Patient context

- Patient ID, display name, chair, and age
- Primary condition
- Dry weight
- Vascular access type
- Scenario-relevant risk flag

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
- Observation time and observing agent

The chair KPI shows BP, HR, BFR, UF rate, and time remaining. Secondary values
remain available in expanded detail and agent context.

Labs, medications, vaccines, longitudinal assessments, state rules, and
facility administration are outside the POC runtime.

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

- Render eight chairs, a central nurse station, and one supply point.
- Use Three.js with a top-down orthographic camera.
- Display compact HTML KPI panels anchored to chairs.
- Move one Aide AGV along predefined waypoints.
- Simulate slow metric drift and deterministic scenario injections.
- Provide controls for Chair 3 hypotension and full reset.

### Conversation and identity

- Show one ordered conversation and event stream.
- Distinguish every actor by label, icon, and color.
- Allow the user to speak as RN or as a selected patient.
- Route patient messages to the Aide and RN messages to Nurse AI.

### Agents

- Use server-side OpenAI API calls for Nurse AI and Aide AGV.
- Keep separate system instructions and permitted action sets for each agent.
- Include bounded world state and relevant history in each call.
- Validate every model action before it changes simulation state.
- Keep API credentials outside browser code.

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
- No authentication or real clinical integrations
- Separate simulator, renderer, agent orchestration, and UI modules
- Stable action contracts between LLM “brains” and simulation “bodies”
- Predefined movement; no physics or pathfinding

## 11. Acceptance criteria

The POC is complete when:

- Eight chairs display plausible changing treatment data.
- Chair 3 hypotension immediately creates a critical RN escalation.
- The Aide moves to Chair 3 and adds labelled chairside evidence to the existing
  incident.
- Nurse AI visibly combines patient context, treatment data, and observation.
- Neither AI agent can execute an RN-owned treatment decision.
- The RN can record a decision and inspect the full incident timeline.
- The blanket request closes without RN escalation.
- The early-termination request cannot change treatment before RN action.
- Nurse AI can summarize the current state of all eight chairs.
- Agent failures do not clear critical status or corrupt simulation state.
- The complete flow is operable through visible controls in desktop Chrome.

## 12. Non-goals

- Clinical validation or real patient use
- EHR, machine, IoT, or scheduling integrations
- Real patient data, authentication, or persistent sessions
- Medication, laboratory, vaccination, or longitudinal clinical workflows
- Multiple AGVs, dynamic pathfinding, physics, voice, or computer vision
- User-configurable clinical rules or a general-purpose agent platform
- Production deployment, observability, or analytics

## 13. Source references

- `poc-reference/data/clinic-seed.json` — synthetic eight-chair dataset
- `poc-reference/data-model.md` — field selection and traceability
- `poc-reference/workflows/realtime-response-chain.md` — product response
  workflow
