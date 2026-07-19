import json
import math
import os
from datetime import datetime, timezone

from controller import Robot

from navigation import DESTINATION_ROUTE, compute_wheel_speeds


MISSION_ID = "mission-coffee-chair-01"
TIME_STEP = 32
PICKUP = (0.0, -1.95)
DWELL_STEPS = 32
DEBUG = os.getenv("CARELOOP_PHYSICS_DEBUG") == "1"


robot = Robot()
left_wheel = robot.getDevice("left wheel")
right_wheel = robot.getDevice("right wheel")
gps = robot.getDevice("gps")
inertial_unit = robot.getDevice("inertial unit")

left_wheel.setPosition(float("inf"))
right_wheel.setPosition(float("inf"))
left_wheel.setVelocity(0.0)
right_wheel.setVelocity(0.0)
gps.enable(TIME_STEP)
inertial_unit.enable(TIME_STEP)

sequence = 0
payload_state = "empty"


def current_pose():
    position = gps.getValues()
    yaw = inertial_unit.getRollPitchYaw()[2]
    return position[0], position[1], yaw


def emit(phase, location_id="transit", message=""):
    global sequence
    x, y, yaw = current_pose()
    event = {
        "contractVersion": "1.0",
        "missionId": MISSION_ID,
        "sequence": sequence,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "phase": phase,
        "pose": {"x": round(x, 4), "y": round(y, 4), "yaw": round(yaw, 4)},
        "locationId": location_id,
        "payloadState": payload_state,
        "source": "webots",
    }
    if message:
        event["message"] = message
    print("CARELOOP_TELEMETRY " + json.dumps(event, separators=(",", ":")), flush=True)
    sequence += 1


def stop():
    left_wheel.setVelocity(0.0)
    right_wheel.setVelocity(0.0)


def drive_to(target):
    x, y, yaw = current_pose()
    left, right, arrived = compute_wheel_speeds((x, y), yaw, target)
    left_wheel.setVelocity(left)
    right_wheel.setVelocity(right)
    return arrived


phase = "accepted"
route_index = 0
dwell = 0
emitted_initial_motion = False
step_count = 0

while robot.step(TIME_STEP) != -1:
    step_count += 1
    if DEBUG and step_count % 200 == 0 and phase in {
        "moving_to_pickup",
        "moving_to_destination",
    }:
        x, y, yaw = current_pose()
        target = PICKUP if phase == "moving_to_pickup" else DESTINATION_ROUTE[route_index]
        print(
            "CARELOOP_DEBUG "
            + json.dumps(
                {
                    "phase": phase,
                    "routeIndex": route_index,
                    "pose": {"x": round(x, 4), "y": round(y, 4), "yaw": round(yaw, 4)},
                    "target": {"x": target[0], "y": target[1]},
                },
                separators=(",", ":"),
            ),
            flush=True,
        )
    if phase == "accepted":
        emit("accepted", message="Atlas accepted the validated body mission.")
        phase = "moving_to_pickup"
        continue

    if phase == "moving_to_pickup":
        if not emitted_initial_motion:
            emit("moving_to_pickup")
            emitted_initial_motion = True
        if drive_to(PICKUP):
            stop()
            emit("arrived_at_pickup", "operations-hub")
            phase = "pickup_dwell"
            dwell = 0
        continue

    if phase == "pickup_dwell":
        stop()
        dwell += 1
        if dwell >= DWELL_STEPS:
            payload_state = "loaded"
            emit("payload_loaded", "operations-hub", "Coffee loaded at the supply point.")
            emit("moving_to_destination")
            phase = "moving_to_destination"
        continue

    if phase == "moving_to_destination":
        if drive_to(DESTINATION_ROUTE[route_index]):
            route_index += 1
            if route_index == len(DESTINATION_ROUTE):
                stop()
                emit("arrived_at_destination", "chair-01")
                phase = "delivery_dwell"
                dwell = 0
        continue

    if phase == "delivery_dwell":
        stop()
        dwell += 1
        if dwell >= DWELL_STEPS:
            payload_state = "delivered"
            emit("delivered", "chair-01", "Coffee delivered to Chair 1.")
            emit("completed", "chair-01")
            phase = "completed"
        continue

    if phase == "completed":
        stop()
