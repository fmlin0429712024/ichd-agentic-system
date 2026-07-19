import math


ARRIVAL_TOLERANCE = 0.12
HEADING_TOLERANCE = 0.18
MAX_WHEEL_SPEED = 5.0
TURN_SPEED = 2.2
ROBOT_CLEARANCE = 0.28

# Static chair bounds in the Webots x/y plane. The controller follows a fixed,
# reviewed route; these bounds are a build-time guard, not autonomous planning.
CHAIR_OBSTACLES = (
    (-3.50, -2.70, 1.55, 2.75),
    (2.70, 3.50, 1.55, 2.75),
    (2.70, 3.50, -2.75, -1.55),
    (-3.50, -2.70, -2.75, -1.55),
)

DESTINATION_ROUTE = (
    (0.0, -2.75),
    (-1.70, -2.75),
    (-1.70, 2.15),
    (-2.15, 2.15),
)


def normalize_angle(angle: float) -> float:
    return (angle + math.pi) % (2 * math.pi) - math.pi


def _segment_intersects_rectangle(start, end, rectangle, clearance):
    """Return whether a line segment enters an inflated axis-aligned box."""
    x_min, x_max, y_min, y_max = rectangle
    x_min -= clearance
    x_max += clearance
    y_min -= clearance
    y_max += clearance

    dx = end[0] - start[0]
    dy = end[1] - start[1]
    t_min = 0.0
    t_max = 1.0

    for origin, delta, lower, upper in (
        (start[0], dx, x_min, x_max),
        (start[1], dy, y_min, y_max),
    ):
        if abs(delta) < 1e-9:
            if origin < lower or origin > upper:
                return False
            continue

        first = (lower - origin) / delta
        second = (upper - origin) / delta
        if first > second:
            first, second = second, first
        t_min = max(t_min, first)
        t_max = min(t_max, second)
        if t_min > t_max:
            return False

    return True


def route_has_clearance(route, obstacles, clearance=ROBOT_CLEARANCE):
    """Validate a predefined route against known static obstacle bounds."""
    return all(
        not _segment_intersects_rectangle(start, end, obstacle, clearance)
        for start, end in zip(route, route[1:])
        for obstacle in obstacles
    )


def compute_wheel_speeds(current, yaw, target):
    dx = target[0] - current[0]
    dy = target[1] - current[1]
    distance = math.hypot(dx, dy)
    if distance <= ARRIVAL_TOLERANCE:
        return 0.0, 0.0, True

    target_heading = math.atan2(dy, dx)
    heading_error = normalize_angle(target_heading - yaw)
    if abs(heading_error) > HEADING_TOLERANCE:
        direction = 1.0 if heading_error > 0 else -1.0
        return -direction * TURN_SPEED, direction * TURN_SPEED, False

    forward_speed = min(MAX_WHEEL_SPEED, max(1.8, distance * 2.2))
    correction = max(-1.0, min(1.0, heading_error * 1.8))
    return forward_speed - correction, forward_speed + correction, False
