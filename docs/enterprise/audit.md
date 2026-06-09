# Audit Trail

The Velocity audit trail is an append-only JSON Lines log that records all significant agent actions. It provides a tamper-evident history suitable for compliance review, incident investigation, and sprint retrospectives.

## Storage

```
.velocity/artifacts/audit/audit.jsonl
```

The file is committed to the repository. Every entry is a JSON object on its own line. Nothing is ever deleted or modified.

## Recorded Events

18 event types across the full development lifecycle:

### Planning Events

| Event              | Recorded When                           |
| ------------------ | --------------------------------------- |
| `prd_created`      | `/to-prd` produces a PRD                |
| `features_planned` | `/to-features` produces a feature board |
| `tasks_created`    | `/to-tasks` produces a task queue       |

### Engineering Events

| Event            | Recorded When                             |
| ---------------- | ----------------------------------------- |
| `task_started`   | `/tdd` begins a task                      |
| `task_completed` | `/tdd` completes a task                   |
| `test_written`   | Tests are written in TDD loop             |
| `code_written`   | Implementation files are created/modified |

### Quality Events

| Event                 | Recorded When                  |
| --------------------- | ------------------------------ |
| `validate_passed`     | All 12 `/validate` checks pass |
| `validate_failed`     | One or more checks fail        |
| `guardrail_triggered` | A hook blocks an action        |

### Governance Events

| Event                | Recorded When                                        |
| -------------------- | ---------------------------------------------------- |
| `approval_requested` | Risk threshold exceeded or approval category matched |
| `approval_granted`   | Human approves the action                            |
| `approval_denied`    | Human denies the action                              |

### Knowledge Events

| Event                | Recorded When                    |
| -------------------- | -------------------------------- |
| `adr_created`        | `/adr-engine` creates a new ADR  |
| `context_updated`    | CONTEXT.md is modified           |
| `knowledge_ingested` | `/ingest` adds to knowledge base |

### Risk Events

| Event                     | Recorded When                          |
| ------------------------- | -------------------------------------- |
| `risk_scored`             | `/risk-score` produces a score         |
| `risk_threshold_exceeded` | Score exceeds the configured threshold |

### Lifecycle Events

| Event                   | Recorded When     |
| ----------------------- | ----------------- |
| `workspace_initialized` | `/init` completes |
| `sync_completed`        | `/sync` completes |

## Example Entries

```json
{"timestamp":"2024-01-15T09:00:00Z","event":"workspace_initialized","session_id":"sess_init_001","stack":"TypeScript/Next.js/Fastify/PostgreSQL","contexts_detected":["orders","payments","notifications"],"adapters_generated":["cursor","claude-code","copilot","gemini"]}

{"timestamp":"2024-01-15T10:30:00Z","event":"prd_created","feature":"refund-support","prd_path":".velocity/artifacts/prd/refund-support.md","session_id":"sess_prd_001"}

{"timestamp":"2024-01-15T11:00:00Z","event":"task_started","task_id":"TASK-001","feature":"refund-support","risk_score":20,"agent":"engineer","session_id":"sess_tdd_001"}

{"timestamp":"2024-01-15T11:45:00Z","event":"task_completed","task_id":"TASK-001","feature":"refund-support","risk_score":20,"tests_written":8,"tests_passing":8,"coverage_after":94,"files_created":["src/payments/domain/refund-request.ts","src/payments/domain/refund-window.ts"],"session_id":"sess_tdd_001"}

{"timestamp":"2024-01-15T14:55:00Z","event":"guardrail_triggered","guardrail":"secret-detection","action":"write_file","file":"src/config/stripe.ts","pattern":"STRIPE_SECRET_KEY=sk_live_","resolution":"blocked","session_id":"sess_tdd_005"}

{"timestamp":"2024-01-15T15:00:00Z","event":"approval_requested","task_id":"TASK-005","risk_score":74,"risk_factors":["external_payment_api","production_credentials","idempotency_risk"],"required_approver":"engineering-lead","session_id":"sess_tdd_005"}

{"timestamp":"2024-01-15T15:03:22Z","event":"approval_granted","approval_id":"APR-0023","task_id":"TASK-005","approved_by":"@engineering-lead","notes":"Idempotency handling correct. Approve.","session_id":"sess_tdd_005"}

{"timestamp":"2024-01-15T16:30:00Z","event":"validate_passed","feature":"refund-support","pr_branch":"feature/refund-support","checks_passed":12,"checks_failed":0,"risk_score":52,"coverage":91,"session_id":"sess_validate_001"}
```

## Querying

```bash
# All events for a feature
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.feature == "refund-support")'

# All approvals
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.event | startswith("approval_"))'

# Guardrail triggers this month
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.event == "guardrail_triggered" and .timestamp > "2024-01-01")'

# High-risk tasks
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.event == "task_completed" and .risk_score > 60)'

# Coverage trend
cat .velocity/artifacts/audit/audit.jsonl | \
  jq 'select(.event == "task_completed") | {task: .task_id, coverage: .coverage_after}'
```

## Compliance Reports

```
/audit-trail report --period last-30-days
/audit-trail report --from 2024-01-01 --to 2024-03-31 --format markdown
```

The report skill produces a structured compliance summary covering activity, risk events, approvals, and quality trends.
