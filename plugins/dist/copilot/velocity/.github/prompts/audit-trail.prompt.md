---
mode: agent
description: "Write a structured audit log entry to .velocity/artifacts/audit/ for any agent action, guardrail result, artifact change, approval decision, or loop event. Invoked automatically by loop, validate, and approval-workflow skills. Can also be called directly to record a manual decision. Produces tamper-evident, append-only JSON-L entries with ISO timestamps and actor identification."
---


# Audit Trail

Write a structured audit log entry for a Velocity event.

## Context Load

Read before starting:

1. `.velocity/guardrails/default.md` — check `governance.audit` section for retention and format config
2. `.velocity/governance/enterprise-controls.md` — actor role config (if exists)

---

## Purpose

Every significant action in a Velocity-governed repository is logged. The audit trail is the evidence layer for compliance, approvals, and incident investigation.

Audit entries are written to `.velocity/artifacts/audit/` as append-only JSON-L files (one JSON object per line), partitioned by year-month.

No audit entry is ever deleted or modified. If a correction is needed, a new `correction` entry is written.

---

## Invocation

The audit-trail skill is called by other skills. It can also be invoked directly to record a manual decision.

### Automatic invocation (called by other skills)

| Skill / Event             | What it logs                                             |
| ------------------------- | -------------------------------------------------------- |
| `loop` — task start       | Loop task started, actor, task-id, attempt number        |
| `loop` — task complete    | Loop task complete, PR number, test summary              |
| `loop` — task paused      | Pause reason, task-id, attempt count                     |
| `loop` — approval gate    | Approval request or approval granted, actor, task-id     |
| `validate` — check result | Each check result (pass/warn/fail), branch, date         |
| `approval-workflow`       | Approval request created, approved, rejected, expired    |
| `risk-score`              | Risk score computed, PR, score, factors                  |
| Artifact write            | Artifact type, path, skill that produced it              |
| Guardrail override        | Who overrode, which guardrail, justification             |
| `/sync` or `/init`        | Regeneration trigger, what changed, what was regenerated |

### Direct invocation

```
/audit-trail log --event "{event-type}" --detail "{description}"
```

---

## Event Schema

Every audit entry is a single JSON object on one line.

```json
{
  "v": 1,
  "ts": "<ISO-8601 timestamp>",
  "event": "<event-type>",
  "actor": "<human|agent|ci>",
  "actor_id": "<username, agent name, or 'ci'>",
  "session_id": "<session-id if available, else null>",
  "repository": "<repo name>",
  "branch": "<current branch>",
  "detail": {
    "<event-specific fields>"
  },
  "outcome": "<success|failure|pending|overridden>"
}
```

### Event Types

| Event type             | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `loop.task.start`      | Loop picked up a task                                   |
| `loop.task.complete`   | Loop completed a task and opened a PR                   |
| `loop.task.paused`     | Loop paused a task (max attempts / approval required)   |
| `loop.task.skipped`    | Loop skipped a task (developer skip)                    |
| `loop.complete`        | Loop finished all tasks on the board                    |
| `validate.check`       | A single validate check ran                             |
| `validate.result`      | Full validate run completed (aggregate result)          |
| `approval.requested`   | Approval requested for a high-risk change               |
| `approval.granted`     | Approval granted by an authorized approver              |
| `approval.rejected`    | Approval rejected                                       |
| `approval.expired`     | Approval request expired without decision               |
| `risk_score.computed`  | Risk score computed for a PR or change                  |
| `guardrail.override`   | A guardrail check was overridden by an authorized actor |
| `guardrail.block`      | A PreToolUse hook blocked an agent action               |
| `artifact.written`     | A Velocity artifact was written to .velocity/artifacts/ |
| `compliance.evaluated` | A compliance pack check ran                             |
| `init.complete`        | /init completed for a repository                        |
| `sync.complete`        | /sync completed                                         |
| `context_md.updated`   | CONTEXT.md was updated (proposal merged)                |
| `correction`           | Correction to a previous audit entry (never deletes it) |

---

## Step 1 — Determine the Log File Path

Audit entries are partitioned by year-month:

```
.velocity/artifacts/audit/{YYYY-MM}.jsonl
```

Example: `.velocity/artifacts/audit/2026-06.jsonl`

If the file does not exist, create it. Never overwrite it — always append.

---

## Step 2 — Collect Entry Fields

### Required fields (all events)

| Field        | Source                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| `v`          | Always `1`                                                               |
| `ts`         | Current ISO-8601 timestamp with timezone offset                          |
| `event`      | The event type from the table above                                      |
| `actor`      | `"human"` if a developer triggered it, `"agent"` if an AI ran it, `"ci"` |
| `actor_id`   | Git user name from `git config user.name`, or `"agent"`, or `"ci"`       |
| `repository` | Repository name from `git remote get-url origin` (last path segment)     |
| `branch`     | Current branch from `git rev-parse --abbrev-ref HEAD`                    |
| `outcome`    | Result: `success`, `failure`, `pending`, `overridden`                    |

### Event-specific `detail` fields

#### `loop.task.start`

```json
"detail": {
  "task_id": "<task-id>",
  "task_name": "<task name>",
  "attempt": 1,
  "risk_level": "standard|high",
  "feature_board": "<path>"
}
```

#### `loop.task.complete`

```json
"detail": {
  "task_id": "<task-id>",
  "task_name": "<task name>",
  "attempts": 1,
  "pr_number": 42,
  "tests_passing": 14,
  "coverage_pct": 87
}
```

#### `loop.task.paused`

```json
"detail": {
  "task_id": "<task-id>",
  "task_name": "<task name>",
  "pause_reason": "max_attempts_reached|approval_required|validation_failure",
  "attempts": 3,
  "last_error": "<error summary>"
}
```

#### `validate.check`

```json
"detail": {
  "check": "slice_completeness|term_consistency|test_coverage|...",
  "result": "pass|warn|fail",
  "branch": "<branch>",
  "findings": ["<finding 1>", "<finding 2>"]
}
```

#### `validate.result`

```json
"detail": {
  "branch": "<branch>",
  "result": "pass|fail",
  "checks_run": 9,
  "checks_passed": 8,
  "checks_failed": 1,
  "checks_warned": 0
}
```

#### `approval.requested`

```json
"detail": {
  "approval_id": "<uuid>",
  "change_type": "task|pr|guardrail_override",
  "task_id": "<task-id or null>",
  "pr_number": "<number or null>",
  "risk_factors": ["touches payment processing", "schema migration"],
  "requested_from": ["@alice", "@bob"],
  "expires_at": "<ISO-8601>"
}
```

#### `approval.granted`

```json
"detail": {
  "approval_id": "<uuid>",
  "approver": "<username>",
  "comment": "<optional justification>"
}
```

#### `approval.rejected`

```json
"detail": {
  "approval_id": "<uuid>",
  "rejector": "<username>",
  "reason": "<reason>"
}
```

#### `risk_score.computed`

```json
"detail": {
  "pr_number": "<number or null>",
  "branch": "<branch>",
  "score": 72,
  "band": "medium|high|critical",
  "factors": [
    {"factor": "touches_auth", "points": 25},
    {"factor": "schema_migration", "points": 20},
    {"factor": "no_tests", "points": 27}
  ],
  "compliance_pack": "soc2|hipaa|pci-dss|iso27001|none"
}
```

#### `guardrail.override`

```json
"detail": {
  "guardrail": "<guardrail name, e.g., horizontal_layer_pr_blocked>",
  "original_value": true,
  "override_value": false,
  "justification": "<required override justification>",
  "authorized_by_role": "<role name from enterprise-controls.md>"
}
```

#### `guardrail.block`

```json
"detail": {
  "hook_pattern": "<regex that matched>",
  "tool": "Bash|Write",
  "command": "<first 200 chars of the blocked command>",
  "message": "<hook message shown to agent>"
}
```

#### `artifact.written`

```json
"detail": {
  "artifact_type": "prd|feature|task|adr|handoff|context_proposal|audit",
  "path": "<relative path>",
  "skill": "<skill that produced it>"
}
```

#### `compliance.evaluated`

```json
"detail": {
  "pack": "soc2|hipaa|pci-dss|iso27001",
  "controls_checked": 12,
  "controls_passed": 11,
  "controls_failed": 1,
  "failed_controls": ["CC6.1 — access control logging missing"]
}
```

#### `guardrail.override` (correction variant)

For the `correction` event type:

```json
"detail": {
  "corrects_entry_ts": "<ISO-8601 ts of the entry being corrected>",
  "correction": "<description of what was wrong and what the correct value is>"
}
```

---

## Step 3 — Write the Entry

Append the JSON object as a single line to the log file:

```
echo '{...json...}' >> .velocity/artifacts/audit/YYYY-MM.jsonl
```

The entry must be valid JSON. Validate before writing: if any required field is missing, write an `error` entry instead of failing silently:

```json
{
  "v": 1,
  "ts": "<timestamp>",
  "event": "audit.error",
  "actor": "agent",
  "actor_id": "agent",
  "repository": "<repo>",
  "branch": "<branch>",
  "outcome": "failure",
  "detail": {
    "error": "Missing required field: <field>",
    "original_event": "<event-type that failed to log>"
  }
}
```

---

## Step 4 — Update the Audit Index

Maintain `.velocity/artifacts/audit/index.md` — one line per month, with entry count and last-updated date.

Format:

```markdown
# Audit Index

| Month   | File                                    | Entries | Last entry        |
| ------- | --------------------------------------- | ------- | ----------------- |
| 2026-06 | .velocity/artifacts/audit/2026-06.jsonl | 147     | 2026-06-08T02:51Z |
| 2026-05 | .velocity/artifacts/audit/2026-05.jsonl | 284     | 2026-05-31T23:59Z |
```

Update after every write. If `index.md` does not exist, create it.

---

## Output

```
[audit] {ts} | {event} | {outcome}
  Actor:  {actor_id}
  Branch: {branch}
  {event-specific one-line summary}
  Written: .velocity/artifacts/audit/{YYYY-MM}.jsonl
```

No output on success when called automatically by another skill — only emit the log line, no extra prose.
