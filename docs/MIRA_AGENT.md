# Mira Nurse Operator Agent

## Purpose

Mira coordinates synthetic CareLoop events, Atlas work, and human-RN escalation.
It assembles and routes evidence but makes no clinical or treatment decision.

## Separation of concerns

| Concern | Location |
|---|---|
| Role procedure and authority | `nurse-operator-agent/.agents/skills/mira-care-coordination/` |
| Simulator and RN-facing contracts | `nurse-operator-agent/contracts/` |
| Atlas discovery and A2A dispatch | `nurse-operator-agent/a2a/atlas-client.mjs` |
| Deterministic routine coordination | `nurse-operator-agent/a2a/mira-coordinator.mjs` |
| Simulator event adapter | `nurse-operator-agent/a2a/server.mjs` |

The Codex Skill defines Mira's reasoning and authority. The adapter implements
one deterministic Daniel coffee route so the POC runs without an external model
API. It does not duplicate the Skill as a general agent runtime.

## Current route

```text
Simulator routine event
  → Mira event-contract validation
  → Atlas Agent Card discovery
  → capability compatibility check
  → official A2A JSON-RPC task
  → Atlas provider-artifact validation
  → correlated Mira result
  → simulator visual replay
```

Only Daniel's explicitly pre-approved coffee request closes autonomously. Early
termination, critical values, medication, access concerns, conflicting evidence,
and treatment questions require a human RN decision. Human-contact assistance
outside Atlas capability routes to a human PCT.

## Validation

From `nurse-operator-agent/`:

```bash
npm test
npm run validate:contracts
python3 /path/to/skill-creator/scripts/quick_validate.py \
  .agents/skills/mira-care-coordination
```

The suite validates positive and negative event contracts, RN-decision ownership,
Atlas capability discovery, pre-approval, correlation, and consumer-side Atlas
artifact provenance.
