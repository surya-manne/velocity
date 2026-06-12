---
name: grill-with-docs
description: "Context-aware interview for brownfield work. Reads CONTEXT.md, explores the codebase, challenges assumptions one question at a time, refines domain language, and generates ADRs for qualifying decisions. Use before any feature work on an existing codebase. Default over grill-me when code exists."
---


# Grill With Docs

Challenge every assumption about this feature before writing any code.

## Context Load

Read before starting:

1. `.velocity/context-map.md` — find the CONTEXT.md path(s) for the relevant bounded context
2. CONTEXT.md at the resolved path — read all terms and decisions
3. `.velocity/knowledge-base/adrs/index.md` — scan titles; read full body for any ADR relevant to the feature area
4. `.velocity/project-context/engineering.md` — engineering standards

If CONTEXT.md is not found: say "No CONTEXT.md found for this context. Run /init first to initialize the glossary scaffold, then return here."

If `.velocity/knowledge-base/adrs/index.md` does not exist: continue without ADR context and note it in the opening.

---

## Behaviour

- Ask **one sharp question at a time**.
- Provide a **recommended answer** with each question and brief reasoning.
- Explore the codebase to answer questions that already have answers in code — do not ask the developer to explain what already exists.
- Challenge imprecise or inconsistent language against the CONTEXT.md glossary immediately.
- Propose definitions for any new terms the developer introduces.
- If a developer's answer contradicts an existing ADR: surface the ADR number and decision. Ask for resolution before continuing.
- Resolve the full design tree before any PRD or code is produced.

One question. Wait for the answer. Next question.

---

## Session Flow

### Opening

State what you found:

1. Name the bounded context and how many terms are in its CONTEXT.md.
2. Name any ADRs relevant to the feature area (titles only).
3. Describe what you found in the codebase relevant to the feature (existing patterns, related code, obvious entry points).

Example:

> "I found the `payments` bounded context with 12 defined terms including `Payment`, `Settlement`, and `Chargeback`. There are 3 relevant ADRs: ADR-004 (Payments immutable after settlement), ADR-007 (Stripe as payment processor), ADR-011 (Idempotency key required on all payment mutations). I can see an existing Stripe integration at `src/payments/stripe.ts` and a `PaymentRepository` at `src/payments/repository.ts`. Let's challenge the assumptions for this feature."

Then ask: "What feature are we building?"

---

### Question Protocol

For each question:

1. State the question precisely.
2. Provide a recommended answer with brief reasoning.
3. Wait for the developer's response.
4. If the answer introduces a term not in CONTEXT.md: flag it immediately.
   > "You used the term '{term}' — this is not in CONTEXT.md. Can you define it precisely so we can add it?"
5. If the answer contradicts an existing ADR: surface it.
   > "This conflicts with ADR-{id}: {decision}. Do you want to modify your plan to comply, or are you superseding this decision? If superseding, we'll generate a new ADR."
6. Record the resolved answer internally. Continue to the next question.

---

### Core Question Tree

Walk through these areas in dependency order. Adapt to the detected domain signals (see Domain Variants below).

#### 1. Feature Scope and User Outcome

- What is the single user-facing outcome this feature delivers?
- Who is the user? What job are they doing?
- What does the user currently have to do without this feature?
- What is the minimal lovable version — the smallest thing that delivers real value?
- What is explicitly out of scope for this feature?

#### 2. Domain Language

- What are the key domain objects this feature creates, reads, updates, or deletes?
- For each object: is the name in CONTEXT.md? If not — propose a definition now.
- Are there any status transitions? What are the exact state names?
- Are there existing terms in CONTEXT.md that apply here? Are you using them consistently?
- What events does this feature produce or consume?

#### 3. System Boundaries

- Which bounded context owns this feature?
- Does this feature cross bounded context boundaries? If so — where is the integration point?
- What does this feature own end-to-end vs. what does it delegate to external services or other contexts?
- What APIs or integrations does this feature depend on?

#### 4. Data Model

- What data does this feature read and write?
- Are the proposed field names consistent with CONTEXT.md terms?
- What is the persistence strategy for the new data?
- What is the data lifecycle — when is data created, modified, archived, deleted?

#### 5. Failure Modes

- What happens if a downstream dependency is unavailable?
- What is the retry strategy?
- What does the user see when the feature fails?
- What is the rollback strategy if this fails in production?
- What data consistency guarantees are required?

#### 6. Acceptance Criterion

- What is the single acceptance criterion that proves this feature is complete end-to-end?
- At what layer will you verify it? (UI, API, integration test, E2E test)
- Is there a performance criterion? A security criterion?

#### 7. Slice Framing (always last)

- Can a user do something meaningful when this slice is merged?
- What layers does the tracer bullet touch? (DB, API, UI, test)
- What is explicitly deferred to a later slice?
- What is the first and smallest tracer bullet for this feature?

---

### CONTEXT.md Updates

When a new term emerges or an existing term requires refinement during the session:

**Do not overwrite CONTEXT.md directly.**

Accumulate all proposed changes and write a single proposal at the end of the session to:

`.velocity/artifacts/context-proposals/{session-id}.md`

Use the proposal template from `templates/context-proposals/proposal.md`.

```markdown
# CONTEXT.md Proposal — {session-id}

## Bounded Context: {context-name}

## Session date: {YYYY-MM-DD}

### New terms proposed

**{Term}**: {Precise definition. Usage context. Edge cases if relevant.}

### Modified terms

**{ExistingTerm}** (existing): {Updated definition with rationale for the change}

### Decisions resolved

- {Decision statement} → logged as ADR-{next-id}
```

At the end of the session: show the developer the full proposal. Ask them to approve or modify before it is submitted for merge via `/context-merge`.

---

### ADR Generation

Generate an ADR when a decision made during this session meets **all three criteria**:

1. **Hard to reverse** — significant rework cost if the decision turns out to be wrong
2. **Surprising without context** — a new developer or agent would make a different choice without an explanation
3. **Real trade-off** — the decision involved weighing options with real consequences

**Threshold examples:**

| Decision                              | ADR?  | Reason                                           |
| ------------------------------------- | ----- | ------------------------------------------------ |
| Using REST instead of GraphQL         | Maybe | Only if non-obvious for this context             |
| `ON DELETE RESTRICT` on an entity     | Yes   | Surprising; forces conscious detachment workflow |
| Choosing Kafka over direct HTTP calls | Yes   | Hard to reverse; major architectural trade-off   |
| Naming a field `paymentId`            | No    | Purely linguistic, no trade-off                  |
| Payments immutable after settlement   | Yes   | Hard to reverse; surprising to new developers    |
| Using idempotency keys on mutations   | Yes   | Non-obvious requirement; prevents double-spend   |

When a decision qualifies, draft the ADR inline and present it to the developer for review before writing it to disk.

Use the ADR template from `templates/adrs/adr.md`.

Assign the next available ADR ID by reading the current count from `.velocity/knowledge-base/adrs/index.md`.

Write the approved ADR to: `.velocity/artifacts/adrs/ADR-{id}-{slug}.md`

Update `.velocity/knowledge-base/adrs/index.md` with the new entry.

---

### End of Session

When the design tree is fully resolved (all questions answered, no unresolved conflicts):

1. **Summary table** — what was decided:

| Decision area            | Resolution                   | ADR?     |
| ------------------------ | ---------------------------- | -------- |
| Feature scope            | {outcome}                    | No       |
| {domain term}            | Added to CONTEXT.md proposal | No       |
| {architectural decision} | {decision}                   | ADR-{id} |

2. **Show the CONTEXT.md proposal** — full text of the proposal file for developer review and approval.

3. **List ADRs generated** — title and file path for each ADR produced in this session.

4. **Next step prompt:**
   > "Design tree is resolved. Run `/to-prd` to produce the PRD from these decisions."

---

## Domain Variant Seeds

When specific signals are detected in the feature description or codebase, add domain-appropriate questions to the core tree. Activate multiple variants if multiple signals apply.

---

### Product Variant

Activate when: the feature involves user acquisition, pricing, revenue, onboarding, or retention.

Additional questions (add after Feature Scope):

- What is the revenue impact of this feature? Is there a monetization dependency?
- What does success look like in 90 days — what metric moves?
- Who are the competitors doing this? What does the developer need to differentiate?
- What is the top business risk if this feature is wrong or delayed?
- What is the minimal viable version that generates learning, not just revenue?

---

### Architecture Variant

Activate when: the feature introduces a new system boundary, crosses service boundaries, adopts a new pattern, or requires an ADR.

Additional questions (add after System Boundaries):

- Does this feature require a new ADR? What decision is being made?
- What is the consistency model? (strong consistency, eventual consistency, per-aggregate)
- Is this synchronous or event-driven? What drives the choice?
- What is the expected call volume at peak? Are there SLA requirements?
- Multi-region or single-region? Any data residency constraints?
- How does failure in a downstream service affect this feature?
- What is the schema migration strategy if the data model changes after launch?

---

### Security Variant

Activate when: the feature touches authentication, authorization, PII, payments, or has compliance implications.

Additional questions (add after System Boundaries):

- What PII is stored or processed by this feature?
- Are there HIPAA, PCI-DSS, SOC2, or GDPR obligations on this data?
- What is the trust boundary — who can call this API or access this data?
- What is the authentication and authorization model?
- What are the audit and logging requirements? What events must be logged?
- How are secrets managed for any new integrations?
- What is the threat model? What is the most likely attack vector?

---

### Performance Variant

Activate when: the feature is on a hot path, involves high-volume data, or has latency requirements.

Additional questions (add after Data Model):

- What is the expected call volume per second at peak?
- What is the required p99 latency for the primary operation?
- What is the expected read/write ratio?
- Where are the likely bottlenecks? (DB query, network call, lock contention)
- What is the caching strategy?
- What are the 12-month growth projections for this data?

---

### Vertical Slice Variant

Activate always before any feature decomposition into tasks.

Additional questions (add after Acceptance Criterion, before End of Session):

- What is the single user-facing outcome this slice delivers?
- Can a user do something meaningful when this slice is merged?
- Which layers does this slice touch? (DB, API, UI, tests — list each)
- Where are the vertical boundaries? What is explicitly out of scope for this slice?
- Are there any shared-layer dependencies that would force horizontal work? How will you avoid them?
- What is the acceptance criterion that proves this slice is complete end-to-end?
- What is the minimum lovable version of this slice?
- Does this slice have its own tests at every layer it touches?

---

## Signals That Trigger Variants

| Signal detected                                      | Variants activated    |
| ---------------------------------------------------- | --------------------- |
| Feature description mentions pricing, revenue, users | Product               |
| New service boundary, cross-context integration      | Architecture          |
| Auth, login, PII, payments, compliance keywords      | Security              |
| Hot path, p99 latency, high volume, cache            | Performance           |
| Any feature decomposition step (always last)         | Vertical Slice        |
| Multiple signals present                             | All matching variants |
