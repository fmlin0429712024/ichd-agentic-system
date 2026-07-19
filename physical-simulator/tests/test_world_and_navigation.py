import math
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "controllers" / "atlas_controller"))

from navigation import (  # noqa: E402
    CHAIR_OBSTACLES,
    DESTINATION_ROUTE,
    compute_wheel_speeds,
    normalize_angle,
    route_has_clearance,
)


class WorldStructureTest(unittest.TestCase):
    def test_world_contains_four_chairs_hub_supply_and_atlas(self):
        world = (ROOT / "worlds" / "careloop_center.wbt").read_text()

        for name in (
            "CHAIR_01",
            "CHAIR_02",
            "CHAIR_03",
            "CHAIR_04",
            "OPERATIONS_HUB",
            "SUPPLY_POINT",
            "ATLAS_AGV",
        ):
            self.assertIn(f"DEF {name}", world)
        self.assertIn('controller "atlas_controller"', world)
        self.assertIn("Pioneer3dx", world)


class NavigationTest(unittest.TestCase):
    def test_delivery_route_clears_every_chair(self):
        self.assertTrue(route_has_clearance(DESTINATION_ROUTE, CHAIR_OBSTACLES))

    def test_rejects_route_that_clips_chair_four(self):
        blocked_route = [
            (0.0, -2.75),
            (-2.65, -2.75),
            (-2.65, 2.15),
            (-2.15, 2.15),
        ]

        self.assertFalse(route_has_clearance(blocked_route, CHAIR_OBSTACLES))

    def test_normalizes_heading_error(self):
        self.assertAlmostEqual(normalize_angle(3 * math.pi), -math.pi)

    def test_turns_in_place_before_driving_forward(self):
        left, right, arrived = compute_wheel_speeds(
            current=(0.0, 0.0), yaw=math.pi / 2, target=(1.0, 0.0)
        )

        self.assertFalse(arrived)
        self.assertLess(left * right, 0)

    def test_stops_inside_arrival_tolerance(self):
        left, right, arrived = compute_wheel_speeds(
            current=(0.0, 0.0), yaw=0.0, target=(0.05, 0.05)
        )

        self.assertTrue(arrived)
        self.assertEqual((left, right), (0.0, 0.0))


if __name__ == "__main__":
    unittest.main()
