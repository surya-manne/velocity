# /grill-me — Greenfield Discovery

`/grill-me` is Velocity's greenfield discovery skill. It interviews you with one sharp question at a time to establish domain language, architecture decisions, and the first vertical slice — before any code is written.

::: tip Greenfield Only
Use `/grill-me` when starting from scratch. For existing codebases, use [`/grill-with-docs`](/skills/grill-with-docs) instead — it reads your code before asking questions.
:::

## Why One Question at a Time

Long intake forms produce shallow answers. `/grill-me` asks one focused question, waits for your answer, then adapts the next question based on what you said. Each answer shapes the rest of the discovery session.

Every question includes a **recommended answer** — a default response based on common patterns — so you can move quickly without getting stuck.

## The Question Tree

The session covers six areas, always in this order:

### Area 1: Product Fundamentals

- Who is the primary user?
- What is the core job-to-be-done?
- What does success look like at 6 months?
- What must be true for the first version to ship?

### Area 2: Domain and Language

- What are the main "things" in your domain?
- What do you call them? (Not what they might be called — what you call them)
- What events happen in your domain?
- Where are the natural boundaries between concepts?

### Area 3: Architecture and Boundaries

- Monolith, modular monolith, or services?
- Which teams or domains need to be isolated from each other?
- Are there existing systems this must integrate with?
- What deployment constraints exist?

### Area 4: Scale and Performance

- What are the expected load characteristics?
- What are the SLA requirements?
- Are there real-time requirements?
- Where are the performance-sensitive paths?

### Area 5: Security and Compliance

- Who can access what?
- Is there sensitive data (PII, PCI, PHI)?
- What compliance requirements apply?
- What are the authentication requirements?

### Area 6: Vertical Slice Framing (Always Last)

- If you had to ship ONE thing in the next two weeks, what would it be?
- What is the thinnest slice that delivers user value?
- What is the critical path through the system for that slice?

## Domain Variant Seeds

For known domain types, `/grill-me` activates specialized question banks:

| Domain         | Additional Questions                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| **FinTech**    | Regulatory jurisdiction, payment rails, idempotency requirements, settlement frequency |
| **Insurance**  | Policy types, claims lifecycle, actuarial data requirements, broker vs direct          |
| **Healthcare** | PHI handling, HIPAA requirements, EHR integration, clinical workflow                   |
| **E-commerce** | Catalog complexity, order lifecycle, returns policy, inventory management              |
| **B2B SaaS**   | Tenant isolation, billing model, SSO requirements, API-first vs UI-first               |

## End-of-Session Output

After all questions are answered, the session produces:

### 1. Decision Summary

A structured record of all decisions made during the session:

```markdown
## Session Decisions

**Product:** Subscription analytics platform for SaaS businesses
**Primary User:** Growth analysts and product managers
**Core Job:** Track MRR, churn, and cohort behavior without SQL

**Domain Boundary Decision:** Separate contexts for subscriptions, billing, analytics
**Architecture Decision:** Modular monolith to start, service boundaries pre-cut
**Scale Decision:** 1,000 tenants at launch, 100k events/day peak
**Compliance Decision:** SOC2 Type 2 in 12 months
```

### 2. CONTEXT.md-Format Term List

Ready to paste into CONTEXT.md:

```markdown
## Core Domain Terms

### Subscription

A customer's recurring agreement to pay for access.
Code: `Subscription`, `subscription_id`
NOT: `Plan`, `License`, `Account`

### ChurnEvent

The cancellation of an active Subscription.
Code: `ChurnEvent`, `churned_at`
NOT: `Cancellation`, `Termination`
```

### 3. Open Questions

Issues that need answers before `/to-prd` can run:

```markdown
## Open Questions

- [ ] Are trials considered Subscriptions? Or a separate concept?
- [ ] What is the definition of "active" for MRR calculation?
- [ ] Does the system need to handle currency conversion?
```

### 4. Recommended Next Step

```
/init → /to-prd
```

## Usage

```
/grill-me
```

Then just answer the questions. The session takes 15–45 minutes depending on domain complexity.
