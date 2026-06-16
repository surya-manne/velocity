# /handoff — Context Reset Artifact

`/handoff` produces a compact artifact that carries forward the essential context from a completed task or vertical slice — enabling the next session to start with full context without inheriting noise.

## Why Handoffs Matter

AI sessions have limited context windows. After completing a task, the conversation history contains:

- Dozens of back-and-forth exchanges
- Failed attempts and dead ends
- Debugging tangents
- Irrelevant code excerpts
- Resolved questions

None of this is useful to the next task. The handoff artifact distills just what matters: what was built, what was decided, and what the next task needs to know.

## Usage

```
/handoff
```

Run at the end of any task session. The skill reads the conversation and produces a structured handoff document.

## Handoff Structure

```markdown
# Handoff: TASK-003 — POST /refunds API Endpoint

## Status

Complete ✓

## Timestamp

2024-01-15T14:30:00Z

## What Was Built

### Files Created

- src/payments/api/refunds.controller.ts
- src/payments/api/refunds.schema.ts (Zod validation)
- src/payments/api/**tests**/refunds.integration.test.ts

### Files Modified

- src/payments/api/index.ts (route registration)
- src/payments/domain/refund-request.ts (added toResponse() method)

### Behavior

- POST /refunds: creates RefundRequest, returns 201 with refund_id
- GET /refunds/{id}: returns RefundRequest state
- Error responses follow RFC 7807 (application/problem+json)

## Decisions Made

| Decision                                        | Rationale                                            |
| ----------------------------------------------- | ---------------------------------------------------- |
| Used Zod for request validation                 | Consistent with rest of API layer                    |
| Idempotency key: merchant-provided or generated | Stripe compatibility requirement                     |
| 422 for domain errors, not 400                  | RFC 7807 recommendation for business rule violations |

## Test Coverage

- 12 integration tests, all passing
- Coverage: 91% (statements)
- Notable: Tested all 5 error cases from PRD edge cases table

## Open Questions for Next Task (TASK-004)

1. **Payment processor timeout**: What should the API return while Stripe processes the refund? Currently returns `status: "pending"` — TASK-004 will need to handle async status updates.

2. **Idempotency storage**: Where should the idempotency key → RefundRequest mapping be stored? Suggest: separate `refund_idempotency_keys` table in TASK-004's migration.

## Context Map
```

RefundRequest (domain) ← TASK-001 [done]
refund_requests (DB) ← TASK-002 [done]
POST /refunds (API) ← TASK-003 [done, this task]
Stripe integration ← TASK-004 [next]

```

## CONTEXT.md Updates Made
- Added: RefundIdempotencyKey (new term discovered during implementation)
- Updated: RefundRequest — added idempotency_key field reference
```

## Slice-Level Handoffs

For a completed vertical slice (multiple tasks), run `/handoff` with the slice identifier:

```
/handoff slice-1
```

The skill produces a consolidated handoff covering all tasks in the slice — useful as context for the engineer picking up Slice 2.

## Integration with /loop

The `/loop` skill runs `/handoff` automatically after each task. The generated artifact is stored in `.velocity/artifacts/loop/task-[id]-result.md` and passed as context to the next task's session.

## Handoff Storage

```
.velocity/artifacts/handoffs/
├── index.md                # Index of all handoffs
├── slice-1.md              # Slice-level handoff
├── task-001.md             # Task-level handoff
├── task-002.md
└── ...
```
