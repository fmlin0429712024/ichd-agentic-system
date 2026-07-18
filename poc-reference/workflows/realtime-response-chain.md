# Real-Time Product Response Workflow

This is a fictional product workflow for the concept demo. It is not a clinical
protocol or standard operating procedure.

## Response chain

1. **Detect** — deterministic monitoring identifies a configured abnormal value
   or a patient request requiring professional judgment.
2. **Contextualize** — Nurse AI reads the fictional patient profile,
   prescription, progress, and recent trend.
3. **Observe** — when physical context is missing, Nurse AI dispatches the Aide
   AGV for a bounded chairside observation.
4. **Fuse** — Nurse AI keeps the two evidence streams distinct, then combines:
   - IoT evidence: simulated measurements and machine state.
   - On-site evidence: appearance, alertness, patient report, and access site.
5. **Route** — routine non-medical matters may close autonomously; critical,
   ambiguous, and medical-decision matters go to the human RN.
6. **Record** — the RN's simulated decision becomes an event. The system never
   invents an RN decision.
7. **Re-evaluate** — follow-up readings and observations remain attached to the
   same incident until it is resolved.

## Decision ownership

| Situation | Owner | Demo behavior |
|---|---|---|
| Normal monitoring | Nurse AI | Summarize without RN interruption |
| Non-medical comfort request | Aide AGV | Fulfill and log |
| Missing chairside context | Nurse AI | Dispatch the Aide; do not guess |
| Configured critical trigger | Human RN | Alert immediately; observation may run in parallel |
| Ambiguous or conflicting evidence | Human RN | Escalate with uncertainty stated |
| Request to end treatment early | Human RN | Present treatment progress and patient reason |
| Simulated treatment intervention | Human RN | RN chooses; simulation records the decision |

## Evidence card

The RN escalation card contains:

- What changed and when
- Relevant patient context and treatment progress
- Current IoT evidence
- Fresh on-site evidence with observer and timestamp
- The configured reason for escalation
- The decision requested from the RN

## Trigger vocabulary

- `critical_vital`: configured critical simulated value
- `needs_observation`: missing fresh chairside context
- `medical_request`: request to shorten or end treatment
- `routine_request`: predefined non-medical comfort request
- `rn_override`: RN changes the AI's interpretation or next step

## Incident lifecycle

`detected → gathering_context → awaiting_rn → action_recorded → monitoring → resolved`

Every transition writes one immutable event containing actor, timestamp, chair,
evidence references, action, and reason.
