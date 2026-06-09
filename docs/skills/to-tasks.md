# /to-tasks — Task Decomposition

`/to-tasks` breaks each feature slice into implementation tasks with complexity estimates, risk scores, blocking relationships, and required skills. The output is the task queue consumed by `/tdd` and `/loop`.

## Usage

```
/to-tasks
```

Reads the latest feature board from `.velocity/artifacts/features/`. Or specify:

```
/to-tasks refund-support
```

## Task Structure

Each task in the queue has a standardized structure:

```markdown
### TASK-001: RefundRequest domain model

**Slice:** Slice 1 — RefundRequest Model + Basic API
**Complexity:** M  
**Risk:** 20
**Blocks:** TASK-002, TASK-003
**Required skills:** tdd, domain-model
**Required subagents:** backend-engineer
**Context:** payments bounded context

**What to build:**

- `RefundRequest` value object with validation
- `RefundWindow` value object (30-day window from PaymentIntent.succeeded_at)
- `RefundStatus` enum: pending | processing | succeeded | failed | cancelled
- Validation: amount ≤ original, within window, PaymentIntent in succeeded state

**Tests to write first:**

- RefundRequest creation: valid case
- RefundRequest validation: amount exceeds original
- RefundRequest validation: outside RefundWindow
- RefundWindow.isExpired(): boundary cases

**Files to create/modify:**

- src/payments/domain/refund-request.ts (new)
- src/payments/domain/refund-window.ts (new)
- src/payments/domain/**tests**/refund-request.test.ts (new)
```

## Complexity Estimation

Tasks are sized with T-shirt sizes based on scope:

| Size   | Criterion                            | Typical Duration |
| ------ | ------------------------------------ | ---------------- |
| **XS** | Single function or config change     | < 30 min         |
| **S**  | One class with tests                 | 30–90 min        |
| **M**  | Module with 3–5 classes and tests    | 2–4 hours        |
| **L**  | Full slice layer with integration    | 4–8 hours        |
| **XL** | Complex integration or cross-context | > 1 day          |

XL tasks are flagged for splitting before `/loop` runs.

## Risk Scoring

Each task receives a 0–100 risk score based on:

| Factor                    | Weight  | Examples                             |
| ------------------------- | ------- | ------------------------------------ |
| **External integration**  | High    | Payment API, third-party webhook     |
| **Shared infrastructure** | High    | Kafka topic, shared database table   |
| **Cross-context data**    | Medium  | Reading from another bounded context |
| **Database migration**    | Medium  | Schema change, index addition        |
| **Auth/security path**    | Medium  | Permission checks, token validation  |
| **New domain concept**    | Low     | First implementation of new model    |
| **Pure domain logic**     | Minimal | Value objects, calculations          |

Tasks with risk > 70 trigger a `/approval-workflow` pause in `/loop`.

## Blocking Graph

The task queue respects the slice dependencies from `/to-features` and infers additional fine-grained dependencies:

```
TASK-001: RefundRequest domain model
    ↓ blocks
TASK-002: refund_requests DB migration
    ↓ blocks
TASK-003: POST /refunds endpoint
    ↓ blocks
TASK-004: GET /refunds/{id} endpoint ← parallel with TASK-003 (both need TASK-002)
    ↓ blocks
TASK-005: Stripe refunds client
    ↓ blocks
TASK-006: Async refund processor
    ↓ blocks
TASK-007: RefundStatusChanged event
    ↓ blocks
TASK-008: Webhook delivery integration
```

## Output File

Saved to `.velocity/artifacts/tasks/[feature].md`:

```markdown
# Task Queue: Refund Support

## Status

Ready for execution

## Critical Path

TASK-001 → TASK-002 → TASK-003 → TASK-005 → TASK-006 → TASK-007 → TASK-008

## Parallel Opportunities

- TASK-003 and TASK-004 can run in parallel (both need TASK-002)
- TASK-007 and webhook setup can overlap

## Total Estimated Effort

22 points (S=1, M=2, L=3, XL=5)
Estimated: 2–3 days for a single engineer

## Tasks

[task definitions...]
```

## Next Step

```
/tdd TASK-001
```

Or run the full queue autonomously:

```
/loop
```
