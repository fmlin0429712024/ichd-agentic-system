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
| `allergies[]`, `comorbidities[]` | Gives Mira bounded patient-domain context |
| `medicationContext` | Read-only background for explanation; never an executable order |

Risk flags are fictional scenario inputs, not computed diagnoses.

## Treatment context

| Field | Product role |
|---|---|
| `treatmentId`, `treatmentDate`, `phase` | Correlates current signals, events, and agent actions |
| `prescribedMinutes` | Supports progress and early-termination routing |
| `prescribedBfrMlMin`, `prescribedDfrMlMin` | Provides treatment targets |
| `ufGoalMl` | Grounds fluid-removal progress in a plan |
| `elapsedMinutes` | Makes treatment progress understandable |
| `bloodPressure`, `heartRateBpm` | Primary simulated physiological signals |
| `bfrMlMin`, `dfrMlMin`, `ufRateMlHr`, `volumeRemovedMl` | Primary simulated machine context |

The chair KPI shows BP, HR, BFR, UF rate, and time remaining. Secondary values
remain available to the detail view and agent world state.

## Longitudinal context

The synthetic data pack includes 12 weeks of compact treatment history: 36
treatments for each patient and 144 treatments in total. Each historical record
keeps only the fields needed to show completion, fluid removal, BP pattern, and
scenario-relevant events.

| Field | Product role |
|---|---|
| `treatmentDate`, `prescribedMinutes`, `actualMinutes` | Supports completion and early-termination context |
| `preWeightKg`, `postWeightKg`, `ufGoalMl`, `ufRemovedMl` | Shows compact fluid-removal history |
| `bloodPressure.pre`, `.minimum`, `.post` | Supports longitudinal BP pattern and prior-event retrieval |
| `meanBfrMlMin` | Supplies a compact machine-performance feature |
| `events[]` | Identifies the few historical treatments relevant to a scenario |
| `summary` | Gives Mira a bounded 12-week view without loading every session |

The POC retrieves the summary and up to three relevant historical treatments.
The full history file remains available for inspection and later analytics or
machine-learning experiments.

## On-site observation

| Field | Product role |
|---|---|
| `appearance` | Physical context unavailable from the simulated IoT stream |
| `alertness` | Supports ambiguity and escalation |
| `reportedSymptoms[]` | Preserves the fictional patient's statement |
| `accessSite` | Gives the Aide AGV a bounded observation task |
| `manualVitals` | Separates Atlas's scripted recheck from the IoT stream |
| `observedAt`, `observedBy` | Makes evidence fresh and attributable |

## Data packaging

- `data/patient-profiles.json` — patient-domain and read-only medication context.
- `data/treatment-history.json` — 12-week compact longitudinal history.
- `data/clinic-seed.json` — current four-chair state and scenario injections.
- `data/mira-context-fixtures.json` — bounded per-use-case agent input.
- `use-case-catalog.md` — traceability from data evidence to visible behavior.

## Excluded from the POC

- Laboratory and vaccination workflows
- Medication administration, prescribing, holding, or dosing decisions
- Full pre- and post-treatment assessments
- State-specific professional-practice rules
- Facility hierarchy and operational administration
- Full free-text clinical notes
- Manufacturer-specific machine rules

## Status authority

`normal`, `watch`, and `critical` are computed by deterministic simulation
rules. The language model may explain a status and request more evidence, but it
cannot set, suppress, or downgrade a hard safety state.
