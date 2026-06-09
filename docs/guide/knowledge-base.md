# Knowledge Base

Velocity's knowledge base is a git-native markdown directory that accumulates institutional knowledge from your project. No vector database, no external service — just structured markdown in your repository.

## Structure

```
.velocity/knowledge-base/
├── index.md              # Knowledge base index
├── adrs/
│   └── index.md          # Architecture Decision Records
├── incidents/
│   └── index.md          # Post-mortems and incident reports
├── runbooks/
│   └── index.md          # Operational runbooks
├── git-digest/
│   └── index.md          # Summarized commit history
└── product/
    └── index.md          # Product decisions and research
```

## Architecture Decision Records (ADRs)

ADRs capture the architectural decisions your team makes and the reasoning behind them. The `/adr-engine` skill creates ADRs with a three-criteria gate:

1. **Reversibility** — Is this decision hard to reverse?
2. **Scope** — Does this affect more than one service/context?
3. **Alternatives** — Were meaningful alternatives considered?

If all three are true, an ADR is created.

### ADR Format

```markdown
# ADR-0023: Use Event Sourcing for Orders Context

## Status

Accepted

## Date

2024-01-15

## Context

Orders require an audit trail for compliance. The current CRUD model
does not preserve history of state changes.

## Decision

Adopt Event Sourcing for the orders bounded context using EventStore.
Other contexts continue to use CRUD.

## Consequences

- Full audit trail for all order state changes
- Added complexity for reads (requires projections)
- Orders context cannot share ORM patterns with other contexts

## Alternatives Considered

- Audit log table: Rejected — does not capture full before/after state
- Temporal tables (PostgreSQL): Rejected — vendor lock-in
```

Every agent reads relevant ADRs at session start. The `/domain-model` and `/architecture-doc` skills cross-reference ADRs before proposing changes.

## Incidents

Post-mortems and incident reports are ingested into the knowledge base so agents learn from production failures.

### Format

```markdown
# INC-0047: Payment Settlement Race Condition

## Date

2024-01-10

## Severity

P1

## Summary

Settlement batch processing triggered duplicate PaymentIntent
state transitions when two consumers processed the same batch event.

## Root Cause

Missing idempotency key on settlement processor. SettlementBatch
ID not used as idempotency key in payment provider API call.

## Resolution

Added `idempotency_key: settlement_batch_id + payment_intent_id`
to all payment processor API calls.

## Lessons

- All external payment API calls must carry idempotency keys
- SettlementBatch processing must be at-least-once with idempotent consumers
```

Agents reference incidents when writing code in affected areas. The Security agent checks incident history when proposing auth/payment changes.

## Runbooks

Operational runbooks document how to handle common production scenarios:

````markdown
# Runbook: Settlement Batch Failure Recovery

## Trigger

PagerDuty alert: `settlement-batch-failed`

## Steps

1. Check batch status:

```sql
SELECT id, status, error_count FROM settlement_batches
WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```
````

2. Identify affected PaymentIntents:

```sql
SELECT pi.id, pi.status FROM payment_intents pi
WHERE pi.settlement_batch_id = '[batch-id]';
```

3. Retry failed batch:

```bash
./scripts/retry-settlement.sh [batch-id]
```

````

The Debugger agent searches runbooks before starting root cause analysis.

## Git Digest

The `/ingest` skill can be run with the `git-digest` option to produce a summarized history of significant commits:

```markdown
# Git Digest — 2024-01-15

## Major Changes

### 2024-01-10: Refund Window Implementation
- Added RefundWindow to PaymentIntent domain model
- POST /refunds endpoint (RFC 7807 errors)
- Stripe refund integration with idempotency

### 2024-01-08: Settlement Batch Idempotency Fix
- Fixed race condition in settlement processor (INC-0047)
- All payment API calls now carry idempotency keys
````

## Ingesting Knowledge

Use the `/ingest` skill to add documents to the knowledge base:

```
/ingest
[paste or reference a document]
```

The skill:

1. Classifies the document (ADR, incident, runbook, product decision)
2. Extracts key facts and lessons
3. Creates a structured markdown entry
4. Updates the index
5. Cross-links with related entries

## Why Git-Native?

- **Version controlled** — Changes to the knowledge base are tracked, reviewable, and reversible
- **No external dependency** — Works offline, no API keys, no cost
- **Standard format** — Any tool can read markdown
- **Portable** — Clone the repo, get the knowledge
- **Searchable** — `grep` works; so does the assistant's context window
