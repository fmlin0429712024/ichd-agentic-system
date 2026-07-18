# Atlas Aide AGV Agent

## Purpose

Atlas is the first independently defined digital employee in the CareLoop POC.
It executes bounded routine support and collects limited chairside evidence. It
reports to Mira and makes no medical judgment.

## Three separate concerns

| Concern | Owner | Location |
|---|---|---|
| Role procedure and guardrails | Codex Skill | `aide-agv-agent/.agents/skills/atlas-chairside-support/` |
| A2A discovery and declared capability | Atlas Agent Card | `aide-agv-agent/contracts/agent-card.json` |
| Executable business payloads | Atlas JSON Schemas | `aide-agv-agent/contracts/` |

The thin A2A server hosts the Agent Card and invokes a deterministic POC
capability adapter after contract validation. It does not contain a second copy
of Atlas role policy or any robot internals.

## Declared A2A skills

### Routine Item Delivery

Deliver a pre-approved `water`, `coffee`, or `blanket` item to one of four known
chair service points.

### Chairside Evidence Collection

Ask a bounded question, collect simulator-provided vital signs, or record a
predefined visible observation. Atlas preserves statements and evidence source
without clinical interpretation.

## Daniel coffee contract example

```text
Mira request
  taskId: task-deliver-coffee-001
  incidentId: incident-daniel-coffee-001
  chairId: chair-01
  capability: deliver_item
  item: coffee
  preApproved: true

Atlas artifact
  status: completed
  evidenceRef: sim-event-task-deliver-coffee-001
  provenance: atlas-simulator / simulated
```

The JSON examples are executable fixtures rather than copied documentation.
See `aide-agv-agent/contracts/examples/` for the complete payloads.

## Authority boundary

Atlas cannot diagnose, recommend treatment, change a prescription or machine,
administer medication, draw blood, manipulate vascular access, lift a patient,
or handle a fall. It returns `unable` for unsupported work and
`human_help_required` for legitimate work requiring safe human contact.

## Validation

From `aide-agv-agent/`:

```bash
npm test
npm run validate:contracts
python3 /path/to/skill-creator/scripts/quick_validate.py \
  .agents/skills/atlas-chairside-support
```

Current scope validates one accepted coffee-delivery request, rejection of a
clinical action, a discoverable A2A server, one valid completion artifact,
missing-provenance rejection, Agent Card role boundaries, and Codex Skill
structure.

## Standards basis

The Agent Card uses the official A2A 1.0 `supportedInterfaces` model with a
`JSONRPC` binding. The server pins `@a2a-js/sdk@1.0.0-beta.0` and publishes its
localhost endpoint at `http://127.0.0.1:8043`. See the
[official A2A specification](https://a2a-protocol.org/latest/specification/).
