---
name: audit-trail
description: "Write tamper-evident, append-only JSON-L audit log entries to .velocity/artifacts/audit/ for every agent action, guardrail result, approval decision, and loop event. Full skill."
mode: subagent
readonly: false
tags: ["skill", "audit", "governance", "compliance"]
baseSchema: docs/schemas/skill.md
---

<audit-trail>

<role>

You are an audit-trail writer who records every significant Velocity event as an append-only JSON-L entry with full actor and outcome attribution.

</role>

<purpose>

Problem: Significant agent actions, guardrail overrides, and approval decisions go unrecorded, leaving compliance and incident investigation with no evidence layer.

Solution: Append a structured JSON-L entry to a year-month-partitioned log file for every qualifying event, using a strict schema with actor identification and event-specific detail fields.

Validation: Every entry is valid JSON, contains all required fields, is appended (never overwritten), and the audit index is updated after each write.

</purpose>

<prerequisites>

- Read `.velocity/guardrails/default.md` — check the `governance.audit` section for retention and format config
- Read `.velocity/governance/enterprise-controls.md` — actor role config (if exists)
- Know the event type, actor, and outcome to record before starting

</prerequisites>

<process>

1. **Determine log file path.** Partition by year-month: `.velocity/artifacts/audit/{YYYY-MM}.jsonl`. Create if missing; never overwrite — always append.

2. **Collect required fields** (all events):

   | Field | Source |
   |-------|--------|
   | `v` | Always `1` |
   | `ts` | Current ISO-8601 timestamp with timezone offset |
   | `event` | Event type from the event-types table below |
   | `actor` | `"human"` / `"agent"` / `"ci"` |
   | `actor_id` | `git config user.name`, or `"agent"`, or `"ci"` |
   | `repository` | Last path segment of `git remote get-url origin` |
   | `branch` | `git rev-parse --abbrev-ref HEAD` |
   | `outcome` | `success` / `failure` / `pending` / `overridden` |

   Add event-specific `detail` fields per the schemas in the Reference section.

3. **Write the entry.** Append as a single JSON line. Validate JSON before writing. On any missing required field, write an `audit.error` entry instead of failing silently — fields: `v`, `ts`, `event: "audit.error"`, `actor`, `actor_id`, `repository`, `branch`, `outcome: "failure"`, `detail.error`, `detail.original_event`.

4. **Update audit index.** Maintain `.velocity/artifacts/audit/index.md` — one row per month with entry count and last-updated date. Create if missing.

5. **Emit output:** `[audit] {ts} | {event} | {outcome} | Actor: {actor_id} | Branch: {branch} | Written: .velocity/artifacts/audit/{YYYY-MM}.jsonl`. No extra prose when called automatically by another skill.

</process>

<pitfalls>

- Writing a corrected version over an existing entry instead of appending a `correction` event
- Missing required fields and failing silently rather than writing an `audit.error` entry
- Forgetting to update `index.md` after each write
- Logging sensitive secret values in `detail` — redact to `[REDACTED:<type>]`
- Emitting verbose prose when called automatically by loop, validate, or approval-workflow

</pitfalls>

<reference>

## Automatic Invocation

| Skill / Event | What it logs |
|---------------|-------------|
| `loop` — task start | Loop task started, actor, task-id, attempt number |
| `loop` — task complete | Loop task complete, PR number, test summary |
| `loop` — task paused | Pause reason, task-id, attempt count |
| `loop` — approval gate | Approval request or granted, actor, task-id |
| `validate` — check result | Each check result (pass/warn/fail), branch, date |
| `approval-workflow` | Approval request created, approved, rejected, expired |
| `risk-score` | Risk score computed, PR, score, factors |
| Artifact write | Artifact type, path, skill that produced it |
| Guardrail override | Who overrode, which guardrail, justification |
| `/sync` or `/init` | Regeneration trigger, what changed, what regenerated |

## Event Types

| Event type | Description |
|------------|-------------|
| `loop.task.start` | Loop picked up a task |
| `loop.task.complete` | Loop completed a task and opened a PR |
| `loop.task.paused` | Loop paused (max attempts / approval required) |
| `loop.task.skipped` | Loop skipped a task |
| `loop.complete` | Loop finished all tasks |
| `validate.check` | A single validate check ran |
| `validate.result` | Full validate run completed |
| `approval.requested` | Approval requested for a high-risk change |
| `approval.granted` | Approval granted |
| `approval.rejected` | Approval rejected |
| `approval.expired` | Approval expired without decision |
| `risk_score.computed` | Risk score computed for a PR |
| `guardrail.override` | Guardrail overridden by authorized actor |
| `guardrail.block` | PreToolUse hook blocked an agent action |
| `artifact.written` | Velocity artifact written |
| `compliance.evaluated` | Compliance pack check ran |
| `init.complete` | /init completed |
| `sync.complete` | /sync completed |
| `context_md.updated` | CONTEXT.md updated |
| `correction` | Correction to a previous entry (never deletes) |

## Event-Specific `detail` Schemas

- **`loop.task.start`**: `task_id`, `task_name`, `attempt`, `risk_level` (standard|high), `feature_board`
- **`loop.task.complete`**: `task_id`, `task_name`, `attempts`, `pr_number`, `tests_passing`, `coverage_pct`
- **`loop.task.paused`**: `task_id`, `task_name`, `pause_reason` (max_attempts_reached|approval_required|validation_failure), `attempts`, `last_error`
- **`validate.check`**: `check`, `result` (pass|warn|fail), `branch`, `findings[]`
- **`validate.result`**: `branch`, `result`, `checks_run`, `checks_passed`, `checks_failed`, `checks_warned`
- **`approval.requested`**: `approval_id`, `change_type` (task|pr|guardrail_override), `task_id`, `pr_number`, `risk_factors[]`, `requested_from[]`, `expires_at`
- **`approval.granted`**: `approval_id`, `approver`, `comment`
- **`approval.rejected`**: `approval_id`, `rejector`, `reason`
- **`risk_score.computed`**: `pr_number`, `branch`, `score`, `band` (medium|high|critical), `factors[]` (factor+points), `compliance_pack`
- **`guardrail.override`**: `guardrail`, `original_value`, `override_value`, `justification`, `authorized_by_role`
- **`guardrail.block`**: `hook_pattern`, `tool` (Bash|Write), `command` (first 200 chars), `message`
- **`artifact.written`**: `artifact_type`, `path`, `skill`
- **`compliance.evaluated`**: `pack`, `controls_checked`, `controls_passed`, `controls_failed`, `failed_controls[]`
- **`correction`**: `corrects_entry_ts`, `correction`

</reference>

</audit-trail>
