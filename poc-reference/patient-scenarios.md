# Four-Patient POC Story Map

CareLoop Demo Center is a fictional, fully occupied four-chair treatment pod in
Chicago, Illinois. The city is a demo setting only; the center has no real
operator, staff, patients, or affiliation.

## Naming convention

Patients and human staff use formal first-and-last names in records. The two
digital employees use short fixed nicknames: Mira and Atlas. The main interface
uses `first name + chair or role` (for example, `Emma · Chair 3` or `Jordan ·
RN`) so the cast remains easy to scan.

| Chair | Fictional patient | Patient context | Story state | Atlas task | Mira route | Human RN outcome |
|---|---|---|---|---|---|---|
| 1 | Daniel Kim | Stable treatment; AVF; prefers coffee during treatment | Normal | Deliver a fictional pre-approved coffee request | Close as routine support and log delivery | No interruption |
| 2 | Noah Carter | Stable treatment; prefers clear explanations | Requests early termination because he feels anxious | Relay the exact request; do not change treatment | Read treatment progress and escalate the medical decision | Jordan decides and records the simulated outcome |
| 3 | Emma Morgan | Diabetic kidney disease; simulated history of intradialytic hypotension | IoT BP drops to 85/48 with HR 58 | Move to chair, manually recheck BP/HR, observe symptoms and appearance, report to Mira | Fuse IoT and chairside evidence; immediately escalate critical incident | Jordan records the simulated response and follow-up plan |
| 4 | Priya Shah | AVG; simulated intermittent access-site discomfort | IoT values remain normal, but patient reports soreness | Observe access site and manually recheck vitals; report findings | State uncertainty and escalate for RN review | Jordan reviews the observation and records next step |

## Team and communication model

| Participant | Name | Responsibility |
|---|---|---|
| Human RN | Jordan Lee, RN | Final clinical decision and accountability |
| Nurse AI | Mira | Central data fusion, operational coordination, and escalation |
| Aide AGV | Atlas | Routine rounds, bounded chairside tasks, and structured results returned to Mira |
| Human PCT | Casey Torres, PCT | Human safety and physical-assistance backstop |

```text
Patient → Mira → Atlas (when physical work is required) → Mira
Jordan Lee, RN ↔ Mira → Atlas
Atlas or Mira → Casey Torres, PCT (human assistance required)
```

Patients and Jordan collaborate with Mira. Atlas has no general human chat
surface; it speaks chairside only when a validated task requires a bounded
question, acknowledgement, or delivery. Atlas reports to Mira and does not make
medical decisions. Casey is not a primary chat participant; Casey appears only
when the system requests human physical assistance. The complete chain remains
visible in the event log.

## Atlas task boundary

Atlas may perform only the following simulated tasks in the first POC:

- Move between operation center, supply point, and chairs.
- Ask a patient a brief clarifying question.
- Perform a scripted manual BP/HR recheck.
- Record predefined appearance, alertness, symptom, and external access-site
  observations.
- Deliver a pre-approved fictional support item, such as Daniel's coffee.
- Relay observations and patient statements to Mira.

Atlas does not diagnose, change treatment, administer medication, draw blood,
interpret a clinical finding, or decide whether a patient may end treatment.
Blood collection and medication workflows are intentionally deferred because
they require a separate chain of custody, order, and safety story.

## Why this is enough for the POC

The four chairs show all essential states without crowding the screen:

- Normal autonomous support
- Patient request requiring human judgment
- Critical IoT-driven event
- Non-IoT observation with uncertainty

Each scenario uses the same event store, structured actions, AGV movement, and
human escalation model. This keeps the product story rich while keeping the
implementation small.
