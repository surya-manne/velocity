# /to-prd — Product Requirement Document

`/to-prd` transforms a feature brief into a structured Product Requirement Document (PRD). It uses your CONTEXT.md and existing architecture as grounding — producing specs that AI agents can execute without ambiguity.

## Usage

```
/to-prd
Add refund support for SettlementBatch items within 30 days
```

Or with more context:

```
/to-prd
[paste a Slack message, email, or rough description]
```

The skill expands whatever you provide into a complete PRD. Vague input is fine — the skill asks clarifying questions before generating.

## What It Reads First

Before generating the PRD, the skill loads:

- `CONTEXT.md` for the relevant bounded context
- Recent ADRs that might affect the feature
- `stack.md` for technology constraints
- Existing API contracts if the feature touches APIs

## PRD Structure

The output follows a standard structure, using CONTEXT.md vocabulary throughout:

```markdown
# PRD: Refund Support for SettlementBatch

## Status

Draft

## Problem Statement

Merchants need to issue refunds for individual PaymentIntents within a
SettlementBatch up to 30 days after settlement. Currently there is no
mechanism to do this without manual intervention.

## Success Criteria

- [ ] Merchants can initiate RefundRequests via API within the RefundWindow
- [ ] RefundRequests are processed within 2 business days
- [ ] Merchant is notified on RefundRequest state change
- [ ] Full audit trail of all RefundRequests

## User Stories

### US-001: Initiate Refund

As a Merchant, I want to submit a RefundRequest for a PaymentIntent so that
I can return funds to a Cardholder.

**Acceptance Criteria:**

- PaymentIntent must be in `succeeded` state
- Request must be within RefundWindow (30 days of PaymentIntent.succeeded_at)
- Amount must be ≤ original PaymentIntent amount
- Partial refunds allowed (minimum: $0.50)
- Response: RefundRequest ID, estimated processing date

### US-002: Track Refund Status

As a Merchant, I want to see the status of my RefundRequests so that
I can respond to Cardholder inquiries.

**Acceptance Criteria:**

- GET /refunds endpoint returns all RefundRequests
- Each RefundRequest shows: status, amount, original PaymentIntent, timeline
- Webhook fired on status change

## Edge Cases

| Case                             | Behavior                                      |
| -------------------------------- | --------------------------------------------- |
| RefundRequest after RefundWindow | 422 Unprocessable, RefundWindowExpired error  |
| Refund amount > original         | 422 Unprocessable, RefundAmountExceeded error |
| Duplicate refund request         | 409 Conflict with existing RefundRequest ID   |
| PaymentIntent still processing   | 409 Conflict, PaymentIntentNotSettled error   |
| Partial refund + full refund     | 422, TotalRefundAmountExceeded error          |

## Out of Scope

- Automated refund approval workflows
- Bulk refund operations
- Refund fee structures

## Vertical Slices

1. **Slice 1:** RefundRequest domain model + POST /refunds endpoint
2. **Slice 2:** Refund processing integration with payment provider
3. **Slice 3:** Webhook notifications on status change

## CONTEXT.md Updates Needed

- Add: `RefundRequest`, `RefundWindow`, `RefundAmountExceeded`
- Clarify: `Cardholder` — confirm this is the correct term vs `Customer`

## Dependencies

- Payment provider: Stripe Refunds API
- Notification service: existing webhook infrastructure
```

## Clarifying Questions

If the input is ambiguous, the skill asks focused questions before generating:

- "What is the maximum refund window? (You mentioned 30 days — is this calendar days or business days?)"
- "Should partial refunds be supported?"
- "Is merchant notification via webhook or email?"

It asks the minimum necessary to produce an accurate PRD — not an exhaustive intake form.

## Integration with CONTEXT.md

The PRD generation step flags any terms it uses that are not in CONTEXT.md:

```
⚠ Term used in PRD but not in CONTEXT.md:
- "RefundRequest" — proposed as new concept
- "RefundWindow" — proposed as new concept

Run /domain-model to align these before proceeding to /to-features.
```

## Next Step

After `/to-prd`:

```
/to-features
```

The features skill reads the PRD and breaks it into vertical slices with defined tracer bullets.
