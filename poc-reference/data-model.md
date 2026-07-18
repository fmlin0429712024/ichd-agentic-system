# POC Data Model

## Selection rule

Keep a field only when it helps answer one of four visible questions:

1. Is the chair normal, watch, or critical?
2. Is fresh chairside information needed?
3. Can an agent close the loop, or must the human RN decide?
4. Can the RN understand why the system took the next step?

## Patient context

| Field | Product role |
|---|---|
| `patientId`, `displayName`, `chairId` | Identifies the subject of each event |
| `age` | Provides compact patient context |
| `primaryCondition` | Makes the fictional profile legible |
| `accessType` | Supports a bounded chairside observation |
| `dryWeightKg` | Connects patient context to the fluid-removal plan |
| `riskFlags[]` | Explains why a signal may receive additional attention |
| `supportPreferences[]` | Enables a pre-approved routine-support scenario |

Risk flags are fictional scenario inputs, not computed diagnoses.

## Treatment context

| Field | Product role |
|---|---|
| `prescribedMinutes` | Supports progress and early-termination routing |
| `prescribedBfrMlMin`, `prescribedDfrMlMin` | Provides treatment targets |
| `ufGoalMl` | Grounds fluid-removal progress in a plan |
| `elapsedMinutes` | Makes treatment progress understandable |
| `bloodPressure`, `heartRateBpm` | Primary simulated physiological signals |
| `bfrMlMin`, `dfrMlMin`, `ufRateMlHr`, `volumeRemovedMl` | Primary simulated machine context |

The chair KPI shows BP, HR, BFR, UF rate, and time remaining. Secondary values
remain available to the detail view and agent world state.

## On-site observation

| Field | Product role |
|---|---|
| `appearance` | Physical context unavailable from the simulated IoT stream |
| `alertness` | Supports ambiguity and escalation |
| `reportedSymptoms[]` | Preserves the fictional patient's statement |
| `accessSite` | Gives the Aide AGV a bounded observation task |
| `manualVitals` | Separates Atlas's scripted recheck from the IoT stream |
| `observedAt`, `observedBy` | Makes evidence fresh and attributable |

## Excluded from the POC

- Labs, vaccinations, and longitudinal clinical history
- Medication administration and dosing
- Full pre- and post-treatment assessments
- State-specific professional-practice rules
- Facility hierarchy and operational administration
- Full free-text clinical notes
- Manufacturer-specific machine rules

## Status authority

`normal`, `watch`, and `critical` are computed by deterministic simulation
rules. The language model may explain a status and request more evidence, but it
cannot set, suppress, or downgrade a hard safety state.
