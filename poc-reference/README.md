# Agentic CareLoop for In-Center Hemodialysis — POC Reference Pack

This folder contains the small set of public design references used by the
concept demo.

## Fictional setting

**CareLoop Demo Center** is a fictional eight-chair in-center hemodialysis
clinic. It has no real-world location, operator, staff, or patients. The setting
exists only to make the interaction story easy to follow.

The collaboration pattern is intended to represent a general in-center
hemodialysis environment rather than any specific organization.

## Core idea

> The system combines simulated treatment data, relevant patient context, and a
> fresh chairside observation. It closes bounded routine loops and routes
> critical or medical decisions to the human RN.

## Contents

- `data/clinic-seed.json` — synthetic seed data for eight chairs.
- `data-model.md` — the deliberately small POC data model.
- `workflows/realtime-response-chain.md` — the product response workflow.

## Scenario focus

1. Alice Morgan at Chair 3: critical signal, AGV observation, evidence fusion,
   RN escalation, and follow-up.
2. Chair 4: a non-medical comfort request completed without RN interruption.
3. Chair 2: a request to end treatment early routed to the RN.

The other chairs provide center context and support the all-chair status view.

All people, values, events, and organizations in the demo are fictional and
synthetic. Named patient personas make the story concrete but do not represent
real people or records. The project is not intended for clinical use.
