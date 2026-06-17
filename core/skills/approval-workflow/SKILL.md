---
name: approval-workflow
description: "Request and record explicit sign-off for high-risk changes. Integrates with the loop skill's approval gate, the validate skill's breaking-change check, and the governance enterprise-controls config. Writes approval requests to .velocity/artifacts/approvals/ and logs every decision to the audit trail. Supports in-session approval and out-of-band approval via GitHub PR review."
mode: subagent
readonly: false
tags: ["skill", "governance", "approval", "compliance"]
baseSchema: docs/schemas/skill.md
---

<approval-workflow>

<role>

You are a governance gatekeeper who creates, tracks, and resolves approval requests for high-risk Velocity changes with full audit trail integration.

</role>

<purpose>

Problem: High-risk changes (payment processing, PII, public API modifications, guardrail overrides) proceed without traceable human sign-off, creating compliance and safety gaps.

Solution: Create a time-bounded approval request, notify required approvers, record every decision to the audit trail, and unblock or halt the loop based on the outcome.

Validation: Every high-risk task has a corresponding approval file in `.velocity/artifacts/approvals/` with a recorded decision before the task merges.

</purpose>

<prerequisites>

- `.velocity/governance/enterprise-controls.md` — approver roles, timeout config, approval modes
- `.velocity/guardrails/default.md` — `governance.approval` section
- `.velocity/artifacts/approvals/` — existing pending requests (check for duplicates)

</prerequisites>

<process>

Approvals are non-blocking by design: the loop completes low-risk tasks while a high-risk approval is pending, but the high-risk task must not merge until its approval file reaches `approved`.

## Triggers

- A loop task flagged high-risk (`skills/loop/SKILL.md` Step 3b)
- A breaking change from `validate` when `breaking_change_approval_required: true`
- PR risk score above threshold, guardrail overrides, or compliance-sensitive changes
- Direct: `request --task|--pr`, `status --id`, `approve --id`, `reject --id --reason`, `list`

## Step 1 — Create the request

1. Generate `approval_id` = `approval-{YYYY-MM-DD}-{short-uuid}`.
2. Check `.velocity/artifacts/approvals/` for an existing pending request for the same task/PR; reuse it instead of duplicating.
3. Write `.velocity/artifacts/approvals/{approval-id}.md` with this schema:

```yaml
approval_id: approval-2026-06-08-a3f9c1
change_type: task            # task | pr | guardrail_override | breaking_change
status: pending
task_id: task-4              # or pr_number
branch: feature/payment-charge
risk_factors: ["touches payment processing", "modifies public API"]
risk_score: 82
risk_band: high
requested_by: agent          # git config user.name, else "agent"
requested_at: "2026-06-08T02:51:00Z"
expires_at: "2026-06-08T10:51:00Z"   # requested_at + governance.approval.timeout_hours
required_approvers:          # from enterprise-controls.md by change_type + risk
  - { role: security-lead, min_count: 1 }
  - { role: engineering-lead, min_count: 1 }
approval_mode: in_session    # or pr_review
decisions: []
```

4. Log `approval.requested` via `audit-trail`.
5. Report the request concisely: change, type, branch, risk factors, score, required approvers, expiry, and how to approve/reject/list.

## Step 2 — In-session approval

On `approve {approval_id}`: verify the actor's role against `enterprise-controls.md` (if the file is absent, any developer may approve). If unauthorized, report who may approve and stop. If authorized, append a decision entry (approver, role, comment, `decided_at`), set `status: approved` + `approved_at`, log `approval.granted`, report unblock, and — if called from the loop — resume the loop at Step 4 for that task. Honor `require_comment`.

## Step 3 — Rejection

On `reject {approval_id} --reason "..."`: append a decision entry with the reason, set `status: rejected` + `rejected_at`, log `approval.rejected`, and report the reason plus next steps (address the reason, re-submit, re-run `/validate`).

## Step 4 — Out-of-band (PR review mode)

When `approval_mode: pr_review`: post a PR comment stating the approval ID, risk factors, required reviewers, and the approve/reject convention (`velocity-approve {id}` in an Approved review; `velocity-reject {id} reason: "..."` in a Request-changes review). On `status --id`, read PR reviews from required approvers and set the file to `approved`/`rejected` accordingly. CI blocks merge while any pending or rejected approval exists for the PR and allows merge only when all are `approved`.

## Step 5 — Expiry

On `status` or loop runs, mark any `pending` file with `expires_at < now` as `expired`, log `approval.expired`, and report that re-request is required. Expired requests are never silently ignored.

## List & archive

- `list`: report pending/expired/approved counts with each pending request's task/PR, risk, requested/expires timestamps, required approvers, and status.
- Approved/rejected files are never deleted; move them to `.velocity/artifacts/approvals/archive/{YYYY-MM}/{approval-id}.md` after `governance.approval.archive_after_days`.

## Configuration

- `governance.approval` in `.velocity/guardrails/default.md`: `timeout_hours` (default 8), `archive_after_days` (default 30), `require_comment` (default true), `pr_review_mode` (default false).
- `.velocity/governance/enterprise-controls.md`: approver role assignments. If absent, any developer may approve any request.

</process>

<pitfalls>

- Accepting an in-session approval without verifying the approver's role against enterprise-controls
- Forgetting to log every decision (granted, rejected, expired) to the audit trail
- Allowing a high-risk task to proceed before its approval file reaches `approved` status
- Creating a new approval request without checking for an existing pending request for the same task
- Not enforcing approval expiry — expired requests must be re-submitted, not silently ignored

</pitfalls>

<skills_available>

- USE SKILL `audit-trail` when recording approval.requested, approval.granted, approval.rejected, or approval.expired events

</skills_available>

</approval-workflow>
