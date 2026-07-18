# Mira — Nurse Operator Agent

This directory is Mira's complete ownership boundary.

- `.agents/skills/`: Mira's Codex Skill; keep it role-specific and concise.
- `contracts/`: schemas Mira provides to external callers, including event input
  and human-RN decision-request payloads.
- `a2a/`: thin client-side adapter for discovering and calling Atlas.

Mira coordinates operations and presents evidence. Mira cannot make clinical or
treatment decisions, invent measurements, or claim an observation it did not
receive. Do not add Atlas implementation, simulator state, or shared agent
runtime code here.
