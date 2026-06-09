# Incident: {Title}

## ID: INC-{N}

## Date: {YYYY-MM-DD}

## Severity: {P0 | P1 | P2 | P3}

## Status: {Resolved | Ongoing | Under Investigation}

## Affected Systems

- {system name}
- {system name}

---

## Summary

{1–2 sentence description of what happened, when, and the impact on users or systems.}

---

## Timeline

| Time (UTC) | Event                                                  |
| ---------- | ------------------------------------------------------ |
| {HH:MM}    | {First detection — alert fired / user report received} |
| {HH:MM}    | {On-call acknowledged}                                 |
| {HH:MM}    | {Root cause identified}                                |
| {HH:MM}    | {Fix deployed / mitigation applied}                    |
| {HH:MM}    | {Incident resolved — all systems normal}               |

---

## Root Cause

{2–4 sentences describing the technical root cause. Be specific — which system, which component, which condition triggered the failure. Distinguish contributing factors from the proximate cause.}

---

## Resolution

{2–4 sentences describing how the incident was resolved. What was the fix? Was it a hotfix, a rollback, a configuration change? What confirmed that the incident was resolved?}

---

## Impact

- **Duration:** {X hours Y minutes}
- **Users affected:** {N users / all users / {region/cohort}}
- **Data loss:** {None | {description}}
- **SLA breach:** {Yes | No}

---

## Contributing Factors

- {Factor — e.g., "No alerting on the specific error code that triggered the failure"}
- {Factor — e.g., "Manual deployment step was skipped in the runbook"}

---

## Actions Taken

Follow-up actions to prevent recurrence:

| Action               | Owner   | Due date | Status   | ADR / Runbook |
| -------------------- | ------- | -------- | -------- | ------------- |
| {action description} | {owner} | {date}   | {status} | ADR-{id}      |
| {action description} | {owner} | {date}   | {status} | RB-{id}       |

---

## Lessons Learned

- {What worked well during the response}
- {What should be done differently next time}
- {What assumption was wrong}
