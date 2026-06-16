# /audit-trail — Audit Log

`/audit-trail` maintains an append-only JSON-L audit log of all significant actions taken by AI agents in your repository. It records 18 event types across the full development lifecycle.

## Why Audit?

In regulated domains and enterprise environments, you need to know:

- What did the AI agent do, and when?
- Who approved high-risk actions?
- What was the risk score when this code was written?
- Which compliance controls were active?
- What did the agent decide — and what alternatives were considered?

The audit trail provides a tamper-evident record of agent activity, suitable for compliance review and incident investigation.

## Event Types

| Category        | Event Types                                                      |
| --------------- | ---------------------------------------------------------------- |
| **Planning**    | `prd_created`, `features_planned`, `tasks_created`               |
| **Engineering** | `task_started`, `task_completed`, `test_written`, `code_written` |
| **Quality**     | `validate_passed`, `validate_failed`, `guardrail_triggered`      |
| **Governance**  | `approval_requested`, `approval_granted`, `approval_denied`      |
| **Knowledge**   | `adr_created`, `context_updated`, `knowledge_ingested`           |
| **Risk**        | `risk_scored`, `risk_threshold_exceeded`                         |
| **Lifecycle**   | `workspace_initialized`, `sync_completed`                        |

## Log Format

Each entry is a JSON object on its own line (JSON Lines format):

```json
{
  "timestamp": "2024-01-15T14:32:01Z",
  "event": "task_completed",
  "task_id": "TASK-003",
  "feature": "refund-support",
  "agent": "engineer",
  "risk_score": 42,
  "tests_added": 12,
  "coverage_after": 91,
  "files_changed": [
    "src/payments/api/refunds.controller.ts",
    "src/payments/api/refunds.schema.ts"
  ],
  "guardrails_active": ["git-safety", "sql-safety", "secret-detection"],
  "session_id": "sess_abc123"
}
```

Pretty-printed:

```json
{
  "timestamp": "2024-01-15T14:32:01Z",
  "event": "task_completed",
  "task_id": "TASK-003",
  "feature": "refund-support",
  "agent": "engineer",
  "risk_score": 42,
  "tests_added": 12,
  "coverage_after": 91,
  "files_changed": [
    "src/payments/api/refunds.controller.ts",
    "src/payments/api/refunds.schema.ts"
  ],
  "guardrails_active": ["git-safety", "sql-safety", "secret-detection"],
  "session_id": "sess_abc123"
}
```

## Approval Events

When `/approval-workflow` runs, the approval is recorded in the audit log:

```json
{
  "timestamp": "2024-01-15T15:00:00Z",
  "event": "approval_granted",
  "task_id": "TASK-005",
  "feature": "refund-support",
  "risk_score": 74,
  "risk_factors": [
    "external_integration",
    "payment_api",
    "production_credentials"
  ],
  "approved_by": "@engineering-lead",
  "approval_type": "in_session",
  "notes": "Reviewed Stripe integration code. Idempotency handling is correct."
}
```

## Querying the Audit Log

The audit log is stored at `.velocity/artifacts/audit/audit.jsonl`. Query it with standard tools:

```bash
# All task completions
grep '"event":"task_completed"' .velocity/artifacts/audit/audit.jsonl | jq .

# All guardrail triggers
grep '"event":"guardrail_triggered"' .velocity/artifacts/audit/audit.jsonl

# High-risk events
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.risk_score > 70)'

# All approvals for a feature
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.feature == "refund-support" and .event == "approval_granted")'
```

## Compliance Reports

Run `/audit-trail report` to generate a compliance summary:

```markdown
# Audit Report — 2024-01-01 to 2024-01-31

## Summary

- Tasks completed: 47
- PRs generated: 12
- Guardrail triggers: 8 (all resolved)
- High-risk events: 3
- Approvals required: 3 (3 granted, 0 denied)
- ADRs created: 5
- Coverage trend: 82% → 89%

## High-Risk Events

1. TASK-005 (risk: 74) — Stripe integration — Approved by @engineering-lead
2. TASK-012 (risk: 71) — DB migration — Approved by @db-admin
3. TASK-031 (risk: 78) — Auth refactor — Approved by @security-lead

## Guardrail Activity

- secret-detection: 3 triggers (all resolved before commit)
- sql-safety: 2 triggers (WHERE clause required)
- git-safety: 3 triggers (force push blocked)
```

## Retention and Integrity

The audit log is append-only by design. Skills never delete or modify existing entries. The log file should be committed to the repository and is included in all backup policies.

For regulated environments, consider configuring the audit log path to write to an immutable storage backend.
