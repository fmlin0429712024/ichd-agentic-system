# POC Data-to-Use-Case Map

This catalog connects each visible story to the smallest data slice needed to
explain it. The application does not send an entire patient record to an agent;
Mira receives the current event plus only the relevant profile and history
context.

## Data layers

| Layer | File | Purpose |
|---|---|---|
| Patient domain | [`data/patient-profiles.json`](data/patient-profiles.json) | Four fictional profiles: conditions, access, prescription, read-only medication context, preferences, and risk signals |
| Longitudinal treatment | [`data/treatment-history.json`](data/treatment-history.json) | Twelve weeks of compact history: 36 treatments per patient, 144 total |
| Current treatment | [`data/clinic-seed.json`](data/clinic-seed.json) | The four-chair live starting state and scenario injections |
| Mira context fixtures | [`data/mira-context-fixtures.json`](data/mira-context-fixtures.json) | The bounded machine-readable context assembled for each of the four scenarios |

## Use cases

| ID | Patient / scope | Visible trigger | Relevant context retrieved by Mira | Agent flow | Human authority / visible outcome |
|---|---|---|---|---|---|
| `UC-01` | Daniel · Chair 1 | Patient requests coffee | Support preference and current stable treatment status | Atlas relays and completes a pre-approved support task; Mira logs closure | No RN interruption; delivery remains visible in the event log |
| `UC-02` | Noah · Chair 2 | Patient reports anxiety and asks to end treatment early | Prescription, elapsed time, communication preference, and one prior shortened treatment | Atlas relays the exact request; Mira assembles a concise decision card | Jordan decides; treatment state cannot change before the RN action |
| `UC-03` | Emma · Chair 3 | Simulated IoT BP falls to 85/48 | Current prescription, hypotension risk flag, three historical low-BP events, current medication context, and fresh Atlas observation | Mira immediately alerts Jordan while Atlas performs a scripted manual BP/HR recheck and symptom observation | Jordan owns the clinical response; all evidence stays on one incident timeline |
| `UC-04` | Priya · Chair 4 | Patient reports access-site soreness while IoT values remain normal | Access type/site, two historical discomfort reports, current stable signals, and fresh Atlas observation | Atlas records bounded external observations; Mira states uncertainty and escalates | Jordan reviews and records the next step |
| `UC-05` | All four chairs | RN requests a center status summary | Current chair states plus only scenario-relevant patient and history summaries | Mira prioritizes exceptions and separates clinical status from workflow state | Jordan receives a concise, traceable center view |

## POC retrieval rule

For each use case, construct a bounded context package:

```text
current event
+ current treatment snapshot
+ relevant patient-profile fields
+ 12-week summary
+ up to three relevant historical treatments
+ fresh Atlas observation, when requested
```

The full 144-treatment dataset remains available for inspection and future
trend or machine-learning experiments, but it is not placed into every model
prompt. Medication fields are context only; medication decisions and
administration remain outside the POC.

Jordan sees the same evidence through a human-readable decision card rather
than the raw JSON context: current status, reason for attention, supporting
evidence, uncertainty, requested decision, and event trace.
