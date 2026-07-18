# Atlas-owned contracts

Atlas owns the public capability and business payloads in this directory:

- `agent-card.json`: A2A 1.0 discovery metadata and declared skills.
- `atlas-task-request.schema.json`: validated work accepted from Mira.
- `atlas-task-artifact.schema.json`: traceable completion, inability, or
  human-help result returned to Mira.
- `examples/`: valid and intentionally invalid contract fixtures.

These files do not redefine the A2A envelope. Run `npm test` and
`npm run validate:contracts` from `aide-agv-agent/` after every change.
