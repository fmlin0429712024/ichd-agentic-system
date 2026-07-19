# CareLoop Physical Simulator

This directory owns the developer-facing Webots simulation boundary.

- Model only a minimal synthetic room and wheeled Atlas body.
- Keep mission commands and telemetry simulator-neutral and schema-validated.
- Keep Webots controllers and adapters outside `aide-agv-agent/`.
- Do not call OpenAI models or participate in patient/RN conversation.
- Do not advertise body-control messages as A2A.
- Do not add ROS, DDS, SLAM, autonomous path planning, real hardware, or
  production robot-safety behavior in the first POC slice.
- Use test-driven development for adapters, contracts, and state transitions.
- Treat the browser Motion Emulator as a mock implementation of the same body
  port, not as a second source of physical truth when Webots is active.

