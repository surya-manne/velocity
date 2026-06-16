---
name: approval-workflow
description: >-
  Request and record explicit sign-off for high-risk changes. Integrates with
  the loop skill's approval gate, the validate skill's breaking-change check,
  and the governance enterprise-controls config. Writes approval requests to
  .velocity/artifacts/approvals/ and logs every decision to the audit trail.
  Supports in-session approval (developer types approve/reject in the assistant)
  and out-of-band approval (GitHub PR review, configurable via enterprise-controls).
metadata:
  surfaces:
    - agent
---

# Approval Workflow

Request and record explicit human sign-off for high-risk Velocity changes.

## Context Load

Read before starting:

1. `.velocity/governance/enterprise-controls.md` — approver roles, timeout config, approval modes
2. `.velocity/guardrails/default.md` — `governance.approval` section
3. `.velocity/artifacts/approvals/` — existing pending requests (check for duplicates)

---

## Purpose

Some changes require more than automated guardrail validation. The approval workflow creates a traceable, time-bounded sign-off record for:

- Tasks flagged as high-risk by the loop skill
- PRs with a risk score above the configured threshold
- Guardrail overrides
- Breaking API or schema changes that require explicit acknowledgment
- Compliance-sensitive changes under active compliance packs

Approvals are non-blocking by design — the loop can complete low-risk tasks while waiting for a high-risk approval. The workflow enforces that the high-risk task does not merge until approval is recorded.

---

## Invocation

### From the loop skill (automatic)

The loop calls this skill when a high-risk task is encountered (Step 3b of `skills/loop/SKILL.md`).

### From the validate skill (automatic)

The validate skill calls this skill when a breaking change is detected and `breaking_change_approval_required: true`.

### Direct invocation

```
/approval-workflow request --task {task-id}
/approval-workflow request --pr {pr-number}
/approval-workflow status --id {approval-id}
/approval-workflow approve --id {approval-id}
/approval-workflow reject --id {approval-id} --reason "{reason}"
/approval-workflow list
```

---

## Step 1 — Create an Approval Request

### 1a — Generate an approval ID

```
approval-{YYYY-MM-DD}-{short-uuid}
```

Example: `approval-2026-06-08-a3f9c1`

### 1b — Collect the approval request fields

| Field                | Source                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| `approval_id`        | Generated in Step 1a                                                        |
| `change_type`        | `task`, `pr`, `guardrail_override`, or `breaking_change`                    |
| `task_id`            | Task ID from the loop (if applicable)                                       |
| `pr_number`          | PR number (if applicable)                                                   |
| `branch`             | Current branch                                                              |
| `risk_factors`       | List of risk signals that triggered the request                             |
| `risk_score`         | Numeric score from `risk-score` skill (if already computed)                 |
| `requested_by`       | `git config user.name` or `"agent"`                                         |
| `requested_at`       | ISO-8601 timestamp                                                          |
| `expires_at`         | `requested_at` + `governance.approval.timeout_hours` from guardrails config |
| `required_approvers` | From `enterprise-controls.md` based on `change_type` and risk level       |
| `approval_mode`      | `in_session` or `pr_review` (from enterprise-controls.md)                 |
| `status`             | `pending`                                                                   |

### 1c — Write the approval request file

Write to `.velocity/artifacts/approvals/{approval-id}.md`:

```yaml
approval_id: approval-2026-06-08-a3f9c1
change_type: task
status: pending

task_id: task-4
task_name: "Implement payment charge endpoint"
branch: feature/payment-charge
pr_number: null

risk_factors:
  - "touches payment processing"
  - "modifies public API contract"
  - "touches PII storage"

risk_score: 82
risk_band: high

requested_by: agent
requested_at: "2026-06-08T02:51:00Z"
expires_at: "2026-06-08T10:51:00Z"

required_approvers:
  - role: security-lead
    min_count: 1
  - role: engineering-lead
    min_count: 1

approval_mode: in_session # or pr_review

decisions: []
```

### 1d — Log to audit trail

Call `skills/audit-trail/SKILL.md` with event type `approval.requested`.

### 1e — Notify the developer

Print the approval request:

```
⏸ Approval Required — {approval_id}

  Change:   {task name or PR title}
  Type:     {change_type}
  Branch:   {branch}

  Risk factors:
  {list each risk factor}

  Risk score: {score} ({band})

  Required approvers:
  {list required_approvers with role and min count}

  Expires: {expires_at} ({N} hours from now)

  ─────────────────────────────────────────────

  To approve in this session:
    Type: approve {approval_id}
    Or: /approval-workflow approve --id {approval_id}

  To reject:
    Type: reject {approval_id} --reason "..."
    Or: /approval-workflow reject --id {approval_id} --reason "..."

  To list all pending approvals:
    /approval-workflow list
```

---

## Step 2 — In-Session Approval

When the developer types `approve {approval_id}` or runs `/approval-workflow approve --id {approval_id}`:

### 2a — Verify the approver's role

Read `enterprise-controls.md`. Check whether the current actor (`git config user.name`) has a role in `required_approvers`.

If enterprise controls are not configured: any developer can approve (default behavior).

If the current actor does not have a required role:

```
⚠ Approval not accepted — {actor} does not have a role in the required approvers list.

  Required approvers: {list}
  Your roles: {list from enterprise-controls.md, or "not configured"}

  Ask one of the required approvers to run:
    /approval-workflow approve --id {approval_id}
```

### 2b — Record the decision

If the approver is authorized:

Update `.velocity/artifacts/approvals/{approval-id}.md`:

```yaml
decisions:
  - approver: alice
    role: engineering-lead
    decision: approved
    comment: "Reviewed payment charge implementation — OWASP Top 10 checked, PCI controls satisfied."
    decided_at: "2026-06-08T03:15:00Z"

status: approved
approved_at: "2026-06-08T03:15:00Z"
```

### 2c — Log to audit trail

Call `skills/audit-trail/SKILL.md` with event type `approval.granted`.

### 2d — Notify and unblock

```
✅ Approval granted — {approval_id}
   Approver: {approver} ({role})
   Comment: {comment}

   {task name or PR} is unblocked. Proceeding.
```

If called from the loop: resume the loop from Step 4 for the approved task.

---

## Step 3 — Rejection

When the developer runs `/approval-workflow reject --id {approval_id} --reason "..."`:

Update the approval file:

```yaml
decisions:
  - rejector: alice
    role: security-lead
    decision: rejected
    reason: "PCI DSS 3.2.1 — card data storage requirements not met in this implementation."
    decided_at: "2026-06-08T03:20:00Z"

status: rejected
rejected_at: "2026-06-08T03:20:00Z"
```

Log to audit trail with event type `approval.rejected`.

Print:

```
❌ Approval rejected — {approval_id}
   Rejector: {rejector} ({role})
   Reason: {reason}

   {task name or PR} cannot proceed without addressing the rejection reason.

   Next steps:
   1. Address the rejection reason
   2. Re-submit the approval request: /approval-workflow request --task {task-id}
   3. Or: resolve the issue and run /validate before retrying the loop
```

---

## Step 4 — Out-of-Band Approval (PR Review Mode)

When `approval_mode: pr_review` in enterprise-controls.md:

Instead of waiting for in-session input, the approval workflow uses GitHub PR reviews as the approval mechanism.

### 4a — Post a required review request

When a PR is opened that requires approval, post a PR comment:

```
🔐 Velocity Approval Required

This PR requires explicit sign-off before merge.

Approval ID: {approval_id}
Risk factors:
{list}

Required reviewers:
{list required_approvers}

To approve: Add a PR review with status "Approved" and comment `velocity-approve {approval_id}`.
To reject: Add a PR review with status "Request changes" and comment `velocity-reject {approval_id} reason: "..."`.
```

### 4b — Poll for PR review decisions

When the loop or the developer runs `/approval-workflow status --id {approval_id}`:

Check the PR for reviews from required approvers.

If sufficient approvals are present: update the approval file to `approved` and unblock.

If rejected: update to `rejected`.

### 4c — Enforce in CI

The CI pipeline (generated by the cursor/claude-code adapter) checks `.velocity/artifacts/approvals/` at PR merge time:

- If any pending approval exists for the current PR: block merge
- If any rejected approval exists: block merge
- If all approvals are `approved`: allow merge

---

## Step 5 — Expiry Check

When the loop or `/approval-workflow status` runs:

Check all `pending` approval files. For any file where `expires_at < now`:

1. Update status to `expired`
2. Log to audit trail with event type `approval.expired`
3. Print:

```
⚠ Approval {approval_id} expired
  Requested at: {requested_at}
  Expired at:   {expires_at}
  No decision recorded.

  To re-request:
    /approval-workflow request --task {task_id}
```

---

## List All Pending Approvals

When invoked with `list`:

```
Velocity Approval Queue

Pending approvals:

  approval-2026-06-08-a3f9c1
    Task: task-4 — "Implement payment charge endpoint"
    Risk: HIGH (score: 82)
    Requested: 2026-06-08T02:51:00Z
    Expires:   2026-06-08T10:51:00Z
    Required:  security-lead (×1), engineering-lead (×1)
    Status:    ⏸ pending

  approval-2026-06-08-b7d2e4
    PR: #47 — "Add customer PII export endpoint"
    Risk: CRITICAL (score: 94)
    Requested: 2026-06-08T01:30:00Z
    Expires:   2026-06-08T09:30:00Z
    Required:  security-lead (×1), compliance-officer (×1)
    Status:    ⏸ pending

Total: 2 pending, 0 expired, 5 approved (all time)
```

---

## Approval Request Archive

Approved and rejected approval files are never deleted. They are moved to:

```
.velocity/artifacts/approvals/archive/{YYYY-MM}/{approval-id}.md
```

Move happens automatically after 30 days (configurable via `governance.approval.archive_after_days`).

---

## Configuration (from guardrails + enterprise-controls)

The approval workflow reads configuration from two places:

### `governance.approval` in `.velocity/guardrails/default.md`

```yaml
governance:
  approval:
    timeout_hours: 8 # how long before a pending request expires
    archive_after_days: 30 # when to move approved/rejected requests to archive
    require_comment: true # require approvers to provide a justification comment
    pr_review_mode: false # true = use GitHub PR reviews instead of in-session approval
```

### `enterprise-controls.md` (role assignments)

Read from `.velocity/governance/enterprise-controls.md`. If the file does not exist, any developer can approve any request.
