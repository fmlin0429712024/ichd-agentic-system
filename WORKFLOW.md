# CareLoop Multi-Agent Workflow Contract

This is the cross-role contract for the two digital employees in the POC. It is
the source of truth for handoffs, authority, and event sequencing. Role-specific
procedures belong in the Nurse AI and Aide AGV Skills.

## Roles

| Role | Workflow ownership |
|---|---|
| Nurse AI | Owns coordination, context assembly, explanation, and escalation |
| Aide AGV | Executes bounded chairside tasks and reports evidence to Nurse AI |
| Human RN | Owns clinical and treatment decisions |
| Human PCT | Provides physical assistance outside the AGV boundary |
| Simulator | Owns measurements, scenario injections, time, and deterministic status rules |

## Standard loop

```text
1. Simulator or patient creates an event.
2. Runtime applies hard status rules.
3. Nurse AI receives bounded context.
4. Nurse AI closes routine work, dispatches Aide AGV, or escalates to human RN.
5. Aide AGV executes one bounded task and reports structured evidence.
6. Nurse AI updates the same incident and, when required, requests an RN decision.
7. Human RN records the decision.
8. Runtime applies only the approved simulated follow-up and records the outcome.
```

## Communication topology

```text
Patient → Aide AGV → Nurse AI → Human RN
Human RN → Nurse AI → Aide AGV
Aide AGV or Nurse AI → Human PCT when physical help is required
```

The Aide AGV does not make or communicate a medical decision. The Nurse AI does
not claim chairside observation. The human PCT does not replace RN authority.

## Five use-case routes

| Use case | Required route | Terminal condition |
|---|---|---|
| Routine support | Patient → Aide AGV → Nurse AI | Pre-approved task completed and logged |
| Early termination | Patient → Aide AGV → Nurse AI → Human RN | RN decision recorded |
| Critical hypotension | Simulator → Nurse AI + immediate RN alert; Nurse AI → Aide AGV in parallel | RN decision and follow-up recorded |
| Access concern | Patient → Aide AGV → Nurse AI → Human RN | RN review recorded |
| Center summary | Human RN → Nurse AI | Traceable four-chair summary returned |

## Serialization rule

Only the runtime appends state-changing events. Agent output is a proposal until
it passes schema, permission, and current-state validation. Process one accepted
action at a time. A rejected or stale action is logged and has no side effect.

## Critical-event rule

For the fictional Chair 3 scenario, simulated systolic BP below 90 immediately
creates the RN alert. The Aide AGV task runs to enrich the incident, never as a
prerequisite for escalation.

## Required traceability

Keep one `incidentId` across detection, context assembly, dispatch, movement,
observation, escalation, RN decision, follow-up, and resolution. Preserve
evidence references and source-stream labels on every event.
