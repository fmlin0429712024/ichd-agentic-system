import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "contracts" / "schemas"


def _load_schema(name: str):
    return json.loads((SCHEMA_DIR / name).read_text())


MISSION_VALIDATOR = Draft202012Validator(
    _load_schema("body-mission.schema.json"), format_checker=FormatChecker()
)
TELEMETRY_VALIDATOR = Draft202012Validator(
    _load_schema("body-telemetry.schema.json"), format_checker=FormatChecker()
)

ALLOWED_TRANSITIONS = {
    "accepted": {"moving_to_pickup", "failed"},
    "moving_to_pickup": {"arrived_at_pickup", "failed"},
    "arrived_at_pickup": {"payload_loaded", "failed"},
    "payload_loaded": {"moving_to_destination", "failed"},
    "moving_to_destination": {"arrived_at_destination", "failed"},
    "arrived_at_destination": {"delivered", "failed"},
    "delivered": {"completed", "failed"},
    "completed": set(),
    "failed": set(),
}


class BodyContractError(ValueError):
    pass


def _validate(validator, value, label: str):
    errors = sorted(validator.iter_errors(value), key=lambda error: list(error.path))
    if errors:
        detail = "; ".join(error.message for error in errors)
        raise BodyContractError(f"{label} failed schema validation: {detail}")
    return value


def validate_mission(mission):
    return _validate(MISSION_VALIDATOR, mission, "body mission")


def validate_telemetry_sequence(events):
    if not isinstance(events, list) or not events:
        raise BodyContractError("telemetry sequence must contain at least one event")

    mission_id = None
    previous_phase = None
    for expected_sequence, event in enumerate(events):
        _validate(TELEMETRY_VALIDATOR, event, "body telemetry")
        if event["sequence"] != expected_sequence:
            raise BodyContractError(
                f"telemetry sequence must be contiguous: expected {expected_sequence}"
            )
        if mission_id is None:
            mission_id = event["missionId"]
        elif event["missionId"] != mission_id:
            raise BodyContractError("telemetry sequence mixes mission identifiers")

        phase = event["phase"]
        if previous_phase is None:
            if phase != "accepted":
                raise BodyContractError("telemetry sequence must start with accepted")
        elif phase not in ALLOWED_TRANSITIONS[previous_phase]:
            raise BodyContractError(
                f"invalid phase transition: {previous_phase} -> {phase}"
            )
        previous_phase = phase

    return events

