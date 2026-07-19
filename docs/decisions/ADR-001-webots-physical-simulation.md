# ADR-001: Use Webots for the lightweight physical simulation layer

**Status:** Accepted for the POC baseline  
**Date:** 2026-07-19

## Context

The browser Operations Canvas is a manager-facing projection of treatment and
work state. It is not a physics simulator. The POC needs a separate engineering
environment to exercise a minimal wheeled Atlas body without requiring NVIDIA
Omniverse, Isaac Sim, a discrete GPU, real hardware, or a ROS deployment.

The first physical slice needs only a four-chair room, fixed service points,
wheel motion, contact, pose telemetry, and one deterministic delivery mission on
an Apple Silicon Mac.

## Decision

Use **Webots** as the physical simulator. Pin **R2025b Nightly Build 17/7/2026
(commit `3aca0d98692be61287edf8ca2c4a7bd5d5b3d319`)** on the target Apple Silicon
machine. Keep it behind a simulator-neutral Body Adapter. Retain the current
browser Motion Emulator as the mock adapter used by fast tests and by the
standalone showcase.

The stable R2025a application was evaluated first but its bundled Qt 6.5
runtime terminates during CPU feature detection on macOS 26.5 with Apple M5.
The pinned R2025b build starts successfully and recognizes the Apple GPU. The
nightly pin is a documented development compatibility choice; it should be
re-evaluated when a compatible stable release is available.

Webots is an engineering view; the browser remains the Operations Canvas. When
Webots is connected, the browser projects Webots telemetry instead of creating
a second independent motion result.

## Options considered

| Option | Strength | Why it is not the first choice |
|---|---|---|
| **Webots** | Complete, beginner-friendly mobile-robot environment; macOS Apple Silicon binary; ready robot/world/controller concepts | Selected |
| **MuJoCo** | Very fast, accurate general physics; easy Python install; excellent for control and learning research | Requires more custom world, wheeled-robot, controller, and integration work for this facility POC |
| **Gazebo** | Strong production-robotics ecosystem, plugins, transport, and differential-drive support | macOS and ARM are best-effort; official documentation warns that the macOS GUI is unstable; dependency surface is much larger |
| **PyBullet** | Lightweight Python robotics physics and easy installation | Less cohesive maintained desktop robotics workflow and weaker fit for a textbook facility-simulation layer |

## Integration boundary

```text
Mira ── A2A task ──► Atlas deterministic worker
                           │
                    semantic body mission
                           ▼
                  Body Adapter interface
                     │             │
              mock adapter    Webots adapter
                     │             │
                     └── mission telemetry ──► Operations Canvas
```

Agent-to-agent and body-control contracts are intentionally different. A2A is
used only between Mira and Atlas. The Body Adapter is a local execution port and
must never be advertised as A2A.

## First-slice exclusions

- ROS and DDS
- SLAM, autonomous path planning, and obstacle avoidance
- camera, lidar, or learned perception
- hardware drivers and production robot safety
- humanoid motion or manipulation
- medical-device or treatment-machine physics

## Consequences

- Atlas remains model-free and does not own simulator code.
- Atlas task completion becomes asynchronous: `completed` is emitted only after
  the body adapter reports a validated terminal mission state.
- The browser can run without Webots through the mock adapter.
- A future real AGV or more advanced simulator can replace Webots without
  changing the Mira-to-Atlas A2A contract.
- Webots runs as a local desktop engineering application. It is not a web
  server and does not share the Operations Canvas's localhost runtime.

## Primary references

- [Webots official repository](https://github.com/cyberbotics/webots)
- [Webots R2025a release](https://github.com/cyberbotics/webots/releases/tag/R2025a)
- [Webots releases](https://github.com/cyberbotics/webots/releases)
- [Webots introduction and controller model](https://cyberbotics.com/doc/guide/introduction-to-webots)
- [MuJoCo official overview](https://mujoco.readthedocs.io/en/stable/overview.html)
- [Gazebo Harmonic supported platforms](https://gazebosim.org/docs/harmonic/install/)
- [Gazebo macOS notes](https://gazebosim.org/docs/harmonic/getstarted/#macos)
