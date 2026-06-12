---
name: handoff
description: >-
  Compact context artifact for clean hand-off at the end of each slice.
  Produces the only context the next session needs — no conversation history
  required. Write at the end of every slice before closing the context window.
  The next Engineer Agent picks up the handoff document, not the chat history.
metadata:
  surfaces:
    - agent
---

# Handoff

Compact this slice into a minimal brief for the next session.

## Context Load

Read before starting:

1. `.velocity/artifacts/tasks/{task-id}.md` — current slice task definition
2. Test run output (read from recent terminal history)
3. CONTEXT.md for the relevant bounded context (brief reference)

---

## Purpose

Context accumulation is the root cause of AI slop in multi-slice work.

This skill produces a `.velocity/artifacts/handoffs/{slice-id}.md` that captures exactly what the next session needs to continue — nothing more. The next Engineer Agent reads this document instead of re-reading the full conversation or codebase.

---

## Handoff Document Format

Write to `.velocity/artifacts/handoffs/{slice-id}.md`:

```markdown
# Handoff: {Slice Name}

## Slice ID: {id}

## Date: {date}

## Status: Complete | Partial — {reason if partial}

---

## What Was Built

{3–5 bullet points of what was implemented in this slice. Specific, concrete.}

- {Specific thing built — e.g., "PaymentService.charge() — validates card, calls Stripe, updates balance"}
- {Specific thing built}
- {Specific thing built}

## What Decisions Were Made

{Decisions made during this session that the next session must know.}

- {Decision — e.g., "Payments are immutable after settlement — see ADR-012"}
- {Decision — e.g., "Used optimistic locking on PaymentAccount to handle concurrent charges"}

## ADRs Generated

{List any ADRs created in this session.}

- ADR-{id}: {Title} — {one-line decision}

## Test Status

- Unit tests: {pass | fail | N tests}
- Integration tests: {pass | fail | N tests}
- Coverage: {X%}
- Typecheck: {pass | fail}
- Lint: {pass | fail}

## What Is Out of Scope

{Explicitly list what was NOT done in this slice — prevents the next agent from re-doing it.}

- {Out of scope item}
- {Out of scope item}

## What the Next Slice Should Start With

{The exact starting point for the next session. Specific enough that a fresh agent can start immediately.}

1. Read CONTEXT.md at {path}
2. {First action — e.g., "Implement PaymentHistoryService.getByAccount() — the query side of the payment model"}
3. {Context the next agent needs — e.g., "The PaymentAccount entity is in src/payments/domain/PaymentAccount.ts"}

## Open Issues

{Any known issues, tech debt, or unresolved questions from this slice.}

- {Issue — e.g., "Stripe webhook handling is stubbed — needs real implementation in slice 3"}

---

## Files Modified

{List of files created or significantly modified in this slice.}

- Created: {path}
- Modified: {path}
- Deleted: {path}
```

---

## Completion

After writing the handoff document:

"Handoff written to `.velocity/artifacts/handoffs/{slice-id}.md`."

"To continue: start a fresh context window, read the handoff document, and proceed from 'What the Next Slice Should Start With'."

"Do not carry this conversation history into the next session."
