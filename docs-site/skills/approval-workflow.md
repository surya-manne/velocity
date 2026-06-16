# /approval-workflow — Human Sign-Off

`/approval-workflow` implements structured human-in-the-loop approval for high-risk actions. It supports in-session approval (synchronous) and PR-review approval (asynchronous).

## When Approval is Required

Approval is automatically triggered when:

1. **Risk score exceeds threshold** — Default: >70 on the 0–100 scale
2. **Action category requires approval** — Configured categories always require sign-off regardless of score:
   - Infrastructure changes (Kubernetes, Terraform, Helm)
   - Database schema migrations
   - API contract changes (breaking or additive)
   - Production data access
   - Cross-service dependency changes

3. **Guardrail elevated action** — A guardrail detects a high-risk pattern and escalates

## In-Session Approval

For actions within the current session, the agent presents an approval request and pauses:

```
⚠ APPROVAL REQUIRED

Action: Stripe Refunds API integration
Task: TASK-005 — Payment processor integration
Risk Score: 74 / 100

Risk Factors:
  • External payment API (Stripe) — production credentials required
  • Idempotency handling — incorrect implementation causes double charges
  • Error handling — insufficient retry logic causes data inconsistency

Code to Review:
  src/payments/integration/stripe-refunds.ts (proposed changes shown)

Approve to proceed? [y/N]
Provide notes (optional):
```

The agent waits for explicit `y` confirmation before proceeding. The approval is logged in the audit trail.

## PR-Review Approval

For longer-running actions or when the approver is not in the current session, the workflow creates a PR review request:

```markdown
## ⚠ Approval Required Before Merge

**Requested by:** Velocity (automated)  
**Approver needed:** @security-lead  
**Risk score:** 74

### What Needs Review

The Stripe refunds integration requires security review:

1. **Credential handling** — Ensure `STRIPE_SECRET_KEY` is loaded from secrets manager, not env vars
2. **Idempotency** — Verify idempotency key format prevents duplicate refunds
3. **Error classification** — Confirm Stripe error codes are correctly mapped to domain errors

### Risk Factors

| Factor         | Detail                                              |
| -------------- | --------------------------------------------------- |
| External API   | Stripe production environment                       |
| Financial risk | Incorrect implementation causes real money movement |
| Idempotency    | Duplicate call risk without correct key handling    |

### Checklist for Reviewer

- [ ] Stripe client initialized with secrets manager (not env var)
- [ ] Idempotency key = `refund_request_id` (correct format)
- [ ] Network timeout set to 30s with retry on 5xx
- [ ] All Stripe error codes handled (including card_error, rate_limit_error)
- [ ] Unit tests mock Stripe API (no real API calls in tests)
```

## Approval Configuration

```yaml
# .velocity/guardrails/default.md

approval:
  risk_threshold: 70

  always_require:
    - category: infrastructure_change
      approvers: [engineering-lead, devops-lead]
    - category: schema_migration
      approvers: [db-admin, engineering-lead]
    - category: api_contract_change
      approvers: [api-owner, engineering-lead]
    - category: production_data_access
      approvers: [data-owner, security-lead]

  high_risk_approvers:
    - engineering-lead

  pr_review_mode: true # Create PR comment vs blocking session
```

## Approval Records

All approvals are stored in `.velocity/artifacts/approvals/index.md`:

```markdown
# Approvals Index

## 2024-01-15

### APR-0023 — TASK-005 Stripe Integration

- **Status:** Approved
- **Approver:** @engineering-lead
- **Risk Score:** 74
- **Type:** In-session
- **Notes:** "Idempotency key format confirmed. Reviewed error handling. Approve."
- **Timestamp:** 2024-01-15T15:03:22Z
```

And in the append-only audit log.

## Audit Trail Integration

Every approval event is recorded:

```json
{
  "event": "approval_granted",
  "approval_id": "APR-0023",
  "task_id": "TASK-005",
  "approved_by": "@engineering-lead",
  "risk_score": 74,
  "approval_type": "in_session",
  "timestamp": "2024-01-15T15:03:22Z"
}
```

Denied approvals are also recorded:

```json
{
  "event": "approval_denied",
  "approval_id": "APR-0024",
  "task_id": "TASK-009",
  "denied_by": "@security-lead",
  "risk_score": 82,
  "reason": "Direct production DB access not permitted. Use read replica.",
  "timestamp": "2024-01-15T16:22:00Z"
}
```
