# CareLoop Agent Collaboration Contract

This document governs authority, cross-role sequencing, and communication. The
two digital employees are independent black boxes. Role procedures belong in
their local Skills; provider-owned payload schemas belong in their local
`contracts/` directories.

## Roles and ownership

| Role | Owns | Does not own |
|---|---|---|
| Mira | Operational coordination, Atlas dispatch, context summary, RN escalation | Clinical decisions or chairside facts not received |
| Atlas | Declared chairside capabilities and evidence artifacts | Medical judgment or human-contact assistance |
| Human RN | Clinical and treatment decisions | Atlas implementation |
| Human PCT | Physical assistance outside Atlas capability | RN decisions |
| Operations Canvas | Synthetic patient measurements, time, scenarios, and manager-facing projection | Robot physics or agent judgment |
| Webots simulator | Synthetic AGV body, pose, motion, contact, and mission telemetry | Operational or clinical judgment |

## Communication topology

```text
Patient / Human RN / simulator event → Mira
Mira ── official A2A task ──► Atlas
Mira ◄── A2A status/artifact ─ Atlas
Atlas ── semantic mission ───► Body Adapter ──► Webots
Atlas ◄── mission telemetry ── Body Adapter ◄── Webots
Operations Canvas ◄─────────── mission telemetry
Mira ── evidence/request ────► Human RN
Mira or Atlas ───────────────► Human PCT when physical help is required
```

Atlas normally reports to Mira, not directly to the human RN. Mira does not
impersonate Atlas or claim direct observation.

## Standard loop

1. The simulator or patient produces an event.
2. Deterministic hard-alert rules run immediately.
3. Mira receives bounded context and determines whether evidence is missing.
4. Mira may close routine work, send a schema-valid A2A task to Atlas, or
   present evidence to the human RN.
5. Atlas accepts, requests clarification, rejects, or sends one declared
   capability to the selected body adapter.
6. The body adapter reports mission state; Atlas returns a terminal A2A artifact
   only after execution reaches a validated terminal state.
7. Mira correlates the artifact to the same incident and updates the RN view.
8. The human RN records any clinical or treatment decision.
9. The simulator applies only the authorized fictional follow-up and records
   the outcome.

## Message rule

A2A supplies the formal envelope and lifecycle. CareLoop JSON Schemas supply the
business contract. Structured data determines who, what, where, status, units,
and evidence provenance. Natural language may explain context, uncertainty, or
failure but cannot independently authorize an action.

Use A2A `contextId` as `incidentId`; assign one A2A `taskId` per unit of Atlas
work. Validate every structured payload before it changes state.

## Five routes

| Use case | Required route | Terminal condition |
|---|---|---|
| Routine support | Event → Mira → Atlas → Mira | Pre-approved task completed and logged |
| Early termination | Patient → Mira → Human RN | RN decision recorded |
| Critical hypotension | Simulator → immediate RN alert + Mira; Mira → Atlas in parallel | RN decision and follow-up recorded |
| Access concern | Patient → Mira → Atlas → Mira → Human RN | RN review recorded |
| Center summary | Human RN → Mira | Traceable four-chair summary returned |

## Critical-event rule

For the fictional Chair 3 scenario, simulated systolic BP below 90 immediately
creates the RN alert. Atlas evidence enriches the incident and is never a
prerequisite for escalation.

## Black-box rule

The POC does not inspect or implement production physical-AI internals. Webots
models only a minimal synthetic body and fixed-waypoint execution behind a
simulator-neutral adapter. Production navigation, middleware, hardware drivers,
and safety control remain outside the project and may later replace this adapter
without changing the operational A2A contract.
