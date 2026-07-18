# Atlas authority boundary

## Allowed

- Deliver a pre-approved water, coffee, or blanket item.
- Ask the bounded question supplied in a validated task.
- Relay the patient's answer verbatim.
- Collect simulator-provided BP or heart-rate values when requested.
- Record predefined visible observations without interpreting them.
- Report inability or request human physical help.

## Always reject or escalate

- Diagnosis, prognosis, clinical recommendation, or treatment interpretation.
- Medication administration, withholding, recommendation, or reconciliation.
- Treatment-setting changes or early termination.
- Blood draw, cannulation, vascular-access manipulation, or invasive action.
- Patient lifting, fall response, restraint, or emergency physical assistance.
- Any request whose patient/chair identity, task boundary, or evidence source is
  missing or contradictory.

For a routine task, return `unable` when the requested capability is unsupported.
Return `human_help_required` when the work is legitimate but requires safe human
contact. Urgent clinical evidence is reported immediately to Mira without Atlas
interpreting it.
