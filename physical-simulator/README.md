# CareLoop Physical Simulator

This is the engineering simulation layer beneath the manager-facing Operations
Canvas. The selected local desktop tool is **Webots R2025b Nightly Build
17/7/2026**, pinned for compatibility with the target Apple Silicon machine.

Current status: the first physical slice is executable. A differential-drive
Atlas visits the supply point, loads a fictional coffee, follows a reviewed
fixed-waypoint route, delivers to Chair 1, and emits validated telemetry through
`completed`.

Planned first slice:

```text
physical-simulator/
├── contracts/       mission command and telemetry schemas
├── adapters/        mock and Webots implementations of one body port
├── controllers/     fixed-waypoint Atlas controller
├── worlds/          synthetic four-chair treatment room
└── tests/           contracts and deterministic mission transitions
```

Run contract and route tests from the repository root:

```bash
python3 -m pip install -r physical-simulator/requirements.txt
python3 -m unittest discover -s physical-simulator/tests -p 'test_*.py'
```

Open `physical-simulator/worlds/careloop_center.wbt` in the pinned Webots
application and start the simulation. Controller output uses the prefix
`CARELOOP_TELEMETRY`; a successful mission ends with `delivered` followed by
`completed`.

The layer does not include ROS, SLAM, autonomous path planning, perception,
real hardware, or medical-device simulation. The current route is explicitly
authored and statically checked against chair collision bounds; it is not an
autonomous planner.

See [ADR-001](../docs/decisions/ADR-001-webots-physical-simulation.md) for the
tool comparison and integration decision.
