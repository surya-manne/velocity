# /to-features — Vertical Slice Board

`/to-features` reads your PRD and breaks it into a vertical slice feature board. Each slice is end-to-end — from UI through API through database — delivering user-visible value.

## What is a Vertical Slice?

A vertical slice cuts through all horizontal layers:

```
✓ VERTICAL SLICE
User action → API endpoint → Business logic → Database → Response → UI

✗ HORIZONTAL LAYER (blocked by Velocity)
"Implement all database models for the feature"
"Build all API endpoints before the frontend"
```

Every slice has a **tracer bullet** — the thinnest possible end-to-end implementation that proves the architecture works. The first tracer bullet is always the priority.

## Usage

```
/to-features
```

Reads the latest PRD from `.velocity/artifacts/prd/`. Or specify:

```
/to-features refund-support
```

## Feature Board Structure

The output is a feature board with slice definitions:

```markdown
# Feature Board: Refund Support for SettlementBatch

## Slice 1: RefundRequest Model + Basic API — TRACER BULLET

**User Story:** US-001 (partial — happy path only)
**Delivers:** Merchant can submit and retrieve a RefundRequest via API

### Stack Layers

| Layer      | Changes                                        |
| ---------- | ---------------------------------------------- |
| Domain     | RefundRequest model, RefundWindow value object |
| Database   | refund_requests table migration                |
| API        | POST /refunds, GET /refunds/{id}               |
| Validation | RefundWindow check, amount validation          |
| Tests      | Domain unit tests, API integration tests       |

**NOT in this slice:** Payment processor integration, notifications, webhooks

### Tracer Bullet Path
```

POST /refunds (HTTP)
→ RefundRequestController.create()
→ RefundRequest.validate(paymentIntent, amount, window)
→ refund_requests INSERT
← 201 Created { refund_id, status: "pending", estimated_completion }

```

### Definition of Done
- [ ] POST /refunds returns 201 on valid request
- [ ] RefundWindow validation returns 422 when expired
- [ ] GET /refunds/{id} returns correct state
- [ ] Unit tests for RefundRequest domain logic
- [ ] Integration test for API endpoint

---

## Slice 2: Payment Processor Integration
**User Story:** US-001 (complete — actual refund processing)
**Delivers:** RefundRequests are actually processed via Stripe

**Blocked by:** Slice 1

### Stack Layers
| Layer | Changes |
|-------|---------|
| Integration | Stripe Refunds API client |
| Domain | RefundRequest state machine (pending → processing → succeeded/failed) |
| Background | Async refund processor (queue consumer) |
| Database | Status update, processor_reference_id column |
| Tests | Stripe API mock, processor unit tests |

---

## Slice 3: Webhook Notifications
**User Story:** US-002
**Delivers:** Merchant receives webhook on RefundRequest status change

**Blocked by:** Slice 2

### Stack Layers
| Layer | Changes |
|-------|---------|
| Events | RefundStatusChanged domain event |
| Integration | Webhook delivery service (existing) |
| Tests | Webhook payload tests, delivery retry tests |
```

## Slice Enforcement

The `/validate` skill checks slice compliance before every PR:

- No PR may contain only horizontal layer changes (e.g., only database models)
- Every PR must contain at least one user-visible capability change
- Exception: explicitly marked "scaffold" tasks (approved by Architect)

## Dependencies

The feature board includes a dependency graph:

```
Slice 1 (tracer bullet)
    └── Slice 2 (payment integration)
            └── Slice 3 (notifications)
```

This feeds directly into `/to-tasks`, which respects the blocking relationships.

## Next Step

```
/to-tasks
```

Breaks each feature slice into implementation tasks with complexity estimates, risk scores, and blocking relationships.
