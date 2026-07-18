# Agentic CareLoop POC

## Purpose

Build a public-safe, synthetic browser POC for a fictional in-center
hemodialysis treatment pod. The system demonstrates bounded coordination
between a Nurse AI, an Aide AGV, a human RN, and a human PCT. It is not a
clinical system.

## Read before substantial work

1. `docs/PRD.md` — product source of truth.
2. `docs/TECHNICAL_SPEC.md` — runtime, Skills, contracts, and safety design.
3. `WORKFLOW.md` — cross-role handoff and authority contract.
4. `TASKS.md` — dependency-ordered execution queue.

## Skill boundaries

- `careloop-nurse-ai`: coordinator for context fusion, dispatch, explanation,
  center summary, and human-RN escalation.
- `careloop-aide-agv`: worker for bounded chairside movement, questions,
  scripted measurement, observation, delivery, and reporting.

Repository-local Skills belong under `.agents/skills/<skill-name>/`. Keep
domain behavior and handoff procedure in Skill Markdown. Keep tools, provider
wiring, simulation state, action validation, and UI code in the application.

## Non-negotiable controls

- Use only fictional and synthetic data.
- Never copy a real client, patient, facility, identifier, policy, or local
  source path into the public repository.
- The simulator owns measurements and hard status rules.
- The Aide AGV reports to the Nurse AI and makes no medical judgment.
- The human RN owns clinical and treatment decisions.
- Every proposed agent action must pass schema, role, and state validation.
- Keep API credentials server-side and outside version control.

## Working style

- Implement one vertical slice at a time and update `TASKS.md` only when its
  validation passes.
- Preserve unrelated user changes.
- Run the narrowest relevant tests after each change.
- Keep the deterministic scripted demo operational without network access.
