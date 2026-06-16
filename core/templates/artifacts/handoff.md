# Handoff: {Slice Name}

## Slice ID: {slice-id}

## Date: {YYYY-MM-DD}

## Status: {Complete | Partial — reason if partial}

---

## What Was Built

{3–5 bullet points. Specific, concrete. Name the modules, functions, endpoints, or components that were implemented.}

- {e.g., "PaymentService.charge() — validates card, calls Stripe, updates balance"}
- {e.g., "POST /api/payments endpoint — request validation, service delegation, error mapping"}
- {e.g., "payment_transactions table migration — adds idempotency_key column with unique index"}

## What Decisions Were Made

{Decisions made during this session that the next session must know. Link to ADRs if generated.}

- {e.g., "Payments are immutable after settlement — see ADR-012"}
- {e.g., "Used optimistic locking on PaymentAccount to handle concurrent charges"}

## ADRs Generated

{List any ADRs created in this session. Use 'None' if no ADRs were generated.}

- ADR-{id}: {Title} — {one-line decision}

## Test Status

- Unit tests: {pass | fail | {N} tests}
- Integration tests: {pass | fail | {N} tests | not applicable}
- Coverage: {X%}
- Typecheck: {pass | fail}
- Lint: {pass | fail}

## What Is Out of Scope

{Explicitly list what was NOT built in this slice. Prevents the next agent from re-doing or second-guessing.}

- {e.g., "Stripe webhook handling — stubbed, intentionally deferred to slice 3"}
- {e.g., "Admin UI for payment history — not part of this slice"}

## What the Next Slice Should Start With

{The exact starting point. Specific enough that a fresh agent can start immediately without reading conversation history.}

1. Read CONTEXT.md at {path}
2. Read ADR-{id} for context on {topic}
3. {First action — e.g., "Implement PaymentHistoryService.getByAccount() — the query side of the payment model"}
4. {Context the next agent needs — e.g., "PaymentAccount entity is at src/payments/domain/PaymentAccount.ts"}

## Open Issues

{Known issues, tech debt, or unresolved questions from this slice. Empty if none.}

- {e.g., "Stripe webhook handling is stubbed — needs real implementation in slice 3"}
- {e.g., "Error messages are not yet localised"}

---

## Files Modified

{All files created or significantly modified in this slice.}

- Created: {path}
- Created: {path}
- Modified: {path}
- Deleted: {path}
