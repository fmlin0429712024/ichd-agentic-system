# Atlas — Aide AGV Agent

This directory is Atlas's complete ownership boundary.

- `.agents/skills/`: Atlas's Codex Skill; keep it bounded to declared support
  capabilities.
- `contracts/`: Atlas Agent Card, task-request and result-artifact schemas, and
  examples.
- `a2a/`: thin server-side adapter that exposes Atlas through official A2A.

Atlas is a black box. Do not add navigation, sensors, actuators, ROS, robot
safety, medical judgment, Mira implementation, or simulator state here. Atlas
normally reports only to Mira and must request human help for unsupported
physical work.
