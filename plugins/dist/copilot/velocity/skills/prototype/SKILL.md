---
name: prototype
description: "Throwaway code to answer product, UI, or state questions before committing to a slice. Time-boxed. Scoped to a single decision. Never merged. Use before to-prd or before complex slice-design when the right approach is genuinely unknown. After prototyping, run grill-with-docs to lock in the validated approach."
---


# Prototype

Build a throwaway spike to answer a specific question — then discard it.

## Rules

1. **One question only.** State the question before writing any code.
2. **Time-boxed.** Agree on a time limit before starting (default: 30 minutes).
3. **Never merged.** Prototype code never goes to `main`. When done, it is deleted.
4. **Answer the question, stop.** No scope creep. If the question is answered, stop.

---

## Protocol

### Step 1 — Define the Question

Before any code: state the specific question this prototype must answer.

Examples:

- "Does React Query's optimistic update pattern work with our current API shape?"
- "Can we use the existing `PaymentAccount` aggregate to support multi-currency balances without a schema change?"
- "Is Kafka streaming latency acceptable for real-time payment notifications at 1000 events/second?"

If the question cannot be stated in one sentence: the scope is too large. Narrow it.

### Step 2 — Agree Time Box

Default: 30 minutes.

For complex technical questions: up to 90 minutes max.

State the time box before starting: "Time box: 30 minutes. We stop when the question is answered, not when the code is clean."

### Step 3 — Build the Minimum Spike

Build only what is required to answer the question. Not production-quality. Not tested. Not clean.

**Explicitly skip:**

- Error handling
- Logging
- Tests
- Documentation
- Code organization

**Focus entirely on:** answering the question.

### Step 4 — Run It

Execute the prototype. Observe the behavior. Answer the question.

Produce a one-paragraph finding: "The answer to the question is [yes/no/it depends], because [specific observation from the prototype]."

### Step 5 — Delete the Prototype

Delete all prototype code or move it to a `spike/` branch that will never be merged.

Do not refactor prototype code into production. Prototype code was written to answer a question — not to be shipped.

### Step 6 — Lock In the Answer

"Run /grill-with-docs to incorporate this finding into your design before writing any production code."

---

## What Happens After

If the prototype answered "yes" (the approach works):

- The validated approach becomes an input to `/grill-with-docs`
- The precise interface discovered in the prototype informs the task design in `/to-tasks`

If the prototype answered "no" (the approach does not work):

- The failing approach is documented as a constraint in `.velocity/artifacts/context-proposals/`
- The developer returns to `/grill-me` to explore alternatives

If the prototype answered "it depends" (more information needed):

- Define a more specific follow-up question
- Run a second, more focused prototype if necessary
