# Agentic CareLoop for In-Center Hemodialysis — POC Reference Pack

This folder contains the small set of public design references used by the
concept demo.

## Fictional setting

**CareLoop Demo Center** is a fictional, fully occupied four-chair in-center
hemodialysis treatment pod set in Chicago, Illinois. It has no real operator,
staff, patients, or affiliation. The setting exists only to make the interaction
story easy to follow.

The collaboration pattern is intended to represent a general in-center
hemodialysis environment rather than any specific organization.

## Core idea

> The system combines simulated treatment data, relevant patient context, and a
> fresh chairside observation. It closes bounded routine loops and routes
> critical or medical decisions to the human RN.

## Contents

- `data/clinic-seed.json` — synthetic seed data for four chairs.
- `data-model.md` — the deliberately small POC data model.
- `patient-scenarios.md` — the four-patient story map and team roles.
- `workflows/realtime-response-chain.md` — the product response workflow.

## Scenario focus

1. Emma Morgan at Chair 3: critical signal, AGV observation, evidence fusion,
   RN escalation, and follow-up.
2. Daniel Kim at Chair 1: a pre-approved coffee request completed by Atlas.
3. Noah Carter at Chair 2: a request to end treatment early routed to the RN.
4. Priya Shah at Chair 4: normal IoT data with a chairside access-site concern.

The four chairs are fully occupied and support the all-chair status view.

All people, values, events, and organizations in the demo are fictional and
synthetic. Named patient personas make the story concrete but do not represent
real people or records. The project is not intended for clinical use.
