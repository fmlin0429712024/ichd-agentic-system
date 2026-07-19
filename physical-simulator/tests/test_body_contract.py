import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from adapters.body_contract import (  # noqa: E402
    BodyContractError,
    validate_mission,
    validate_telemetry_sequence,
)


def fixture(name: str):
    return json.loads((ROOT / "contracts" / "examples" / name).read_text())


class BodyContractTest(unittest.TestCase):
    def test_accepts_one_semantic_coffee_delivery_mission(self):
        mission = validate_mission(fixture("valid-coffee-delivery.mission.json"))

        self.assertEqual(mission["missionId"], "mission-coffee-chair-01")
        self.assertEqual(mission["pickup"]["locationId"], "operations-hub")
        self.assertEqual(mission["destination"]["locationId"], "chair-01")

    def test_accepts_ordered_webots_telemetry_through_completion(self):
        telemetry = validate_telemetry_sequence(
            fixture("valid-coffee-delivery.telemetry.json")
        )

        self.assertEqual(telemetry[-1]["phase"], "completed")
        self.assertEqual(telemetry[-1]["source"], "webots")

    def test_rejects_completion_before_delivery(self):
        with self.assertRaisesRegex(BodyContractError, "invalid phase transition"):
            validate_telemetry_sequence(
                fixture("invalid-premature-completion.telemetry.json")
            )


if __name__ == "__main__":
    unittest.main()
