# CLAUDE.md — Claude Code guidance for ICHD Agentic CareLoop

This project was originally developed with Codex. The authoritative project
rules live in `AGENTS.md` (shared with Codex). This file adds Claude-specific
context and preferences on top of those rules.

## Read first

See `AGENTS.md` for the full project purpose, ownership map, and
non-negotiable controls. Everything there applies here too.

Quick orientation:
- `docs/PRD.md` — product source of truth
- `docs/TECHNICAL_SPEC.md` — architecture, A2A, contracts
- `WORKFLOW.md` — cross-role authority contract
- `TASKS.md` — ordered work queue

## Three-layer architecture (always keep this in mind)

```
Layer 3 — Operations Canvas     care-center-simulator/   (web UI, no logic)
Layer 2 — Agentic Systems       nurse-operator-agent/    Mira coordinator
                                aide-agv-agent/          Atlas worker
Layer 1 — Simulation / Physical physical-simulator/      Webots AGV
                                care-center-simulator/   motion emulator
```

The A2A contract between Layer 2 and Layer 1 is the **only coupling**.
Never leak business logic into Layer 3, and never couple Layer 1 to Layer 2
outside of the `CARELOOP_TELEMETRY` / waypoint-command boundary.

## Claude-specific preferences

- **Always reply to the user in Chinese**, even when writing English
  documentation or code.
- Prefer editing existing files over creating new ones.
- Do not add comments that explain what code does — only add comments when
  the *why* is non-obvious.
- Do not create markdown docs unless explicitly requested.
- Keep responses short and concise.

## What Codex handles vs what Claude handles

Codex (via Codex CLI) drives implementation tasks tracked in `TASKS.md`.
Claude Code is used for documentation, architecture review, and ad-hoc
engineering support. Both tools must stay aligned with the Skills in each
agent's `.agents/skills/` directory.
