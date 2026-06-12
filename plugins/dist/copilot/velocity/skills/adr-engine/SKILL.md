---
name: adr-engine
description: "Create, version, and index Architecture Decision Records. Applies the three-criteria gate (hard-to-reverse, surprising without context, real trade-off) before drafting. Assigns sequential IDs. Writes ADRs to .velocity/artifacts/adrs/ and updates the knowledge-base index. Invoked by grill-with-docs and domain-model when a qualifying decision is made. Can also be invoked directly to record a decision retroactively."
---


# ADR Engine

Create an Architecture Decision Record for a qualifying decision.

## Context Load

Read before starting:

1. `.velocity/knowledge-base/adrs/index.md` — determine the next available ADR ID; understand existing decisions
2. `.velocity/context-map.md` — identify the relevant bounded context
3. CONTEXT.md for the relevant context — ensure the ADR uses the established domain language

---

## Three-Criteria Gate

Before drafting any ADR, apply the gate. A decision qualifies for an ADR only when **all three criteria** are met:

**Criterion 1 — Hard to reverse**
Would undoing this decision require significant rework? (schema migration, API redesign, service split, data re-migration) If the decision is easily changed with no downstream consequences, it does not qualify.

**Criterion 2 — Surprising without context**
Would a new developer or AI agent reading the code make a different choice without an explanation? Would the decision look wrong without the reasoning? If the choice is obvious given the stack, it does not qualify.

**Criterion 3 — Real trade-off**
Did the decision involve weighing options with real consequences on each side? If there was only one reasonable option, it does not qualify.

### Gate Examples

| Decision                                      | All 3 criteria? | Verdict                                        |
| --------------------------------------------- | --------------- | ---------------------------------------------- |
| Payments immutable after settlement           | Yes             | Generate ADR                                   |
| `ON DELETE RESTRICT` on policy deletion       | Yes             | Generate ADR — surprising, forces workflow     |
| Kafka over RabbitMQ                           | Yes             | Generate ADR — hard to reverse                 |
| Idempotency key required on payment mutations | Yes             | Generate ADR — non-obvious requirement         |
| Using REST instead of GraphQL (standard team) | No              | Skip — obvious choice for this team            |
| Naming a field `paymentId` vs `payment_id`    | No              | Skip — no trade-off, just convention           |
| PostgreSQL for primary persistence            | Maybe           | Only if the team considered NoSQL and rejected |

If the decision does not meet all three criteria, say: "This decision does not meet the ADR threshold. It will be recorded as a resolved decision in the CONTEXT.md proposal instead."

---

## Step 1 — Gather Decision Context

Ask the developer (or extract from the invoking skill's session context):

1. What was decided? (One sentence, active voice)
2. What was the alternative that was rejected?
3. What forced this decision — what problem or constraint led here?
4. What are the consequences? What becomes easier? What becomes harder?
5. Which bounded context does this decision apply to?
6. Is there an existing ADR this supersedes?

---

## Step 2 — Assign ADR ID

Read `.velocity/knowledge-base/adrs/index.md`.

Find the highest existing ADR ID. Assign the next sequential ID.

If the index does not exist or is empty: assign ADR-001.

Confirm: "I will assign ID ADR-{id}. Does this look right?"

---

## Step 3 — Draft the ADR

Produce the ADR using the template from `templates/adrs/adr.md`.

Apply the following rules:

- **Title**: Short, imperative, specific. "Use idempotency keys on all payment mutations." Not "ADR about idempotency."
- **Context**: What forced the decision — the problem, the constraint, the pressure. Not the decision itself.
- **Decision**: What was decided. Active voice. One or two sentences.
- **Alternatives considered**: What was rejected and why. Be honest about trade-offs.
- **Consequences**: What becomes easier. What becomes harder. What is now constrained.
- **Domain language**: All entity names, event names, and field names must match CONTEXT.md terms for the relevant bounded context.

Present the draft to the developer:

> "Here is the draft ADR. Review it — correct anything that is wrong, add any nuance. Say 'approve' to write it to disk."

---

## Step 4 — Write the ADR

When the developer approves the draft:

1. Generate the slug from the title: lowercase, hyphens, no punctuation.
   - "Use idempotency keys on all payment mutations" → `use-idempotency-keys-on-payment-mutations`

2. Write the ADR file:
   - Path: `.velocity/artifacts/adrs/ADR-{id}-{slug}.md`

3. Update `.velocity/knowledge-base/adrs/index.md`:
   - Add a new row: `| ADR-{id} | {Title} | {date} | {bounded-context} | Accepted |`

4. If this ADR supersedes an existing ADR:
   - Update the superseded ADR's status line to: `## Status: Superseded by ADR-{new-id}`
   - Update the index row for the superseded ADR

Say: "ADR-{id} written to `.velocity/artifacts/adrs/ADR-{id}-{slug}.md` and indexed."

---

## Step 5 — CONTEXT.md Decision Entry

After writing the ADR, add a reference to the CONTEXT.md proposal for this session:

```markdown
### Decisions resolved

- {Decision statement} → ADR-{id}
```

This links the CONTEXT.md Decisions section to the full ADR.

---

## Retroactive ADR Mode

Invoked when the developer wants to record a decision that was made in the past (during code review, architecture review, or a previous grill-with-docs session that did not produce an ADR).

Behave identically to the standard flow, but:

- Set `## Date:` to the date the decision was actually made (ask the developer if unsure)
- Set `## Status: Accepted` (retroactive ADRs are always already accepted)
- Add a note: `> Note: This ADR was written retroactively on {today}. The decision was made on {original-date}.`

---

## ADR Status Lifecycle

| Status       | Meaning                                                              |
| ------------ | -------------------------------------------------------------------- |
| `Accepted`   | Active decision; all new work should comply                          |
| `Deprecated` | Still in effect but may be removed; new work should not depend on it |
| `Superseded` | Replaced by a newer ADR; add a reference to the superseding ADR      |
| `Proposed`   | Under discussion; not yet accepted                                   |

To change an ADR's status: invoke this skill with the ADR ID and the new status. The skill will update the file and the index.

---

## ADR Quality Rules

An ADR that fails any of these rules should be revised before writing:

- Title is imperative and specific (not vague like "database decision")
- Context explains the **problem**, not the solution
- Decision is one or two sentences, active voice
- Alternatives section lists at least one rejected option with its trade-off
- Consequences section lists at least one thing that becomes harder
- All domain terms match CONTEXT.md
- No implementation details that will become stale (no code snippets, no library versions unless the version is the decision)
