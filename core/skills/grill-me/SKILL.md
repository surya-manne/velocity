---
name: grill-me
description: >-
  Relentless greenfield interview. No codebase required. Challenges every
  assumption about a plan one question at a time. Walks the full design tree
  until all decisions are resolved. Use for new ideas, early-stage products,
  or when starting from scratch. Use grill-with-docs instead when a codebase
  exists.
metadata:
  surfaces:
    - agent
---

# Grill Me

Challenge every assumption about this idea before building anything.

## Behaviour

- Ask **one sharp question at a time**.
- Provide a **recommended answer** with each question and brief reasoning.
- Walk down each branch of the design tree completely before moving to the next.
- Resolve decision dependencies one by one — never ask a downstream question before its upstream is resolved.
- Do not produce a PRD or any code until the design tree is fully resolved.
- Do not ask for things you can infer from prior answers. Derive what you can; ask only when genuinely ambiguous.

One question. Wait for the answer. Next question.

---

## Session Flow

### Opening

Ask: "What are we building? Give me a one-sentence description."

Then identify which domain variant seeds apply (see below) and queue them into the question flow.

Begin the interrogation with the highest-leverage question for the context.

---

### Core Question Tree

Work through these areas in dependency order. Do not skip areas — flag any area the developer wants to defer as a known open question.

#### 1. Product Fundamentals

- What is the single job the user is trying to do?
- Who is the user? (role, frequency of use, technical sophistication)
- What does the user currently do without this product? Why is that insufficient?
- What is the revenue model? (subscription, usage, transaction, marketplace, freemium)
- What is the minimal viable scope — the smallest version that delivers the core value?
- What does success look like in 90 days? Which metric tells you you're winning?
- Who are the direct competitors? What is the differentiation?
- What is the top business risk if this product is wrong or delayed?

#### 2. Domain and Language

- What are the key domain objects this system manages? (List the things — not technical concepts.)
- For each domain object: define it precisely in one sentence. What is its identity?
- Are there terms that sound similar but mean different things? Disambiguate each.
- What are the status transitions for the primary object? Name each state precisely.
- What is the lifecycle of the primary object — created by whom, consumed by whom, archived or deleted how?
- What events does the system produce? What events does it react to?

#### 3. Architecture and Boundaries

- What are the major system components? (Name them using domain language, not technical layers.)
- What does this system own vs. what does it delegate to external services?
- What is the API style? (REST / GraphQL / gRPC — why this choice?)
- Synchronous or event-driven? What drives the choice?
- What is the data consistency model? (strong consistency, eventual, per-aggregate, per-request)
- What external services does this system depend on? What happens when they are unavailable?
- What is the schema and migration strategy?

#### 4. Scale and Performance

- What is the expected user volume at launch?
- What is the 12-month growth projection?
- What is the required p99 latency for the primary user action?
- What is the expected read/write ratio?
- Where are the likely bottlenecks? (DB, network, compute, external API limits)
- What is the caching strategy?
- What are the peak load characteristics?

#### 5. Security and Compliance

- What PII is stored or processed?
- Are there compliance obligations? (HIPAA, PCI-DSS, SOC2, GDPR, ISO27001)
- What is the authentication and authorization model?
- What is the trust boundary — who can call this API or access this data?
- How are secrets managed?
- What are the audit and logging requirements?
- What is the threat model? What is the most likely attack vector?

#### 6. Vertical Slice Framing

Frame the first deliverable as a tracer bullet before ending.

- What is the single user-facing outcome the first slice must deliver?
- Which layers does slice 1 touch? (DB + API + UI + tests — name each)
- What is the acceptance criterion that proves slice 1 is complete end-to-end?
- What is the minimum lovable version of slice 1?
- What is explicitly deferred to slice 2 or later?

---

## Domain Variant Seeds

Activate additional question banks when specific domain signals are detected in the developer's description. Activate multiple variants if multiple signals apply. Insert activated variant questions at the appropriate position in the core tree.

---

### Grill Me — Product Variant

Activate when: the product involves user acquisition, growth, monetization, retention, or competitive positioning.

Insert after Core Q1 (Product Fundamentals):

- What is the primary acquisition channel? (organic, paid, viral, partnerships)
- What does the user do in their first session? What is the activation moment?
- What keeps the user coming back? What is the retention mechanism?
- What does the pricing model signal to the customer about the product's value?
- What is the cost structure? Where does margin come from?
- Is there a network effect? What triggers it?
- What is the expansion motion? (land and expand, upsell, add-on)

---

### Grill Me — Architecture Variant

Activate when: the description involves distributed systems, service boundaries, event-driven architecture, CQRS, event sourcing, or multi-service integration.

Insert after Core Q3 (Architecture and Boundaries):

- Is this a new bounded context or does it extend an existing one?
- What is the data ownership model? Which service is the system of record for each entity?
- Are commands and queries separated? (CQRS — why or why not?)
- If event sourcing: what are the aggregates? What is the event store?
- What is the SLA? (availability, RTO, RPO)
- Multi-region or single-region? What drives the choice?
- What is the failure isolation strategy between services?
- How are distributed transactions handled? (saga, outbox, two-phase commit)
- What is the API versioning strategy?

---

### Grill Me — Security Variant

Activate when: the description involves user accounts, authentication, authorization, PII, payments, healthcare, government, or regulated industries.

Insert after Core Q5 (Security and Compliance):

- What is the RBAC model? (roles, permissions, resource ownership)
- Is there a multi-tenancy requirement? How is tenant isolation enforced?
- What happens when a user's access is revoked mid-session?
- What is the data encryption strategy? (at rest, in transit, per-field for sensitive data)
- What is the breach notification plan? Who is notified and within what timeframe?
- Are there third-party security review obligations? (SOC2 Type II, pen test, VAPT)
- What is the secrets rotation strategy?

---

### Grill Me — Performance Variant

Activate when: the description involves high-throughput operations, real-time requirements, large data volumes, or latency-sensitive user interactions.

Insert after Core Q4 (Scale and Performance):

- What is the target p50 and p99 latency per operation type?
- What is the maximum acceptable time for the primary user action?
- What is the data retention policy? How much data will accumulate over 12 months?
- What are the indexing requirements? Which fields will be queried at scale?
- Will queries be real-time or batch? What is the acceptable staleness for batch reads?
- What is the connection pool strategy?
- How will you handle thundering herd scenarios (e.g., all users retry simultaneously after a failure)?

---

### Grill Me — Vertical Slice Variant

Activate always, as the final section before End of Session.

Insert before End of Session:

- Is the first slice a genuine end-to-end tracer bullet, or is it a horizontal layer? (DB only, API only, or UI only counts as horizontal — reject it.)
- If you shipped slice 1 tomorrow, what would a user actually do with it?
- What feedback would you expect to get from slice 1 before starting slice 2?
- Is there an assumption baked into slice 1 that, if wrong, would invalidate slice 2 and beyond?
- What does the minimum lovable version of slice 1 look like as a demo?

---

## Domain-Specific Variants

For well-known domains, add domain-seeded questions after Core Q2 (Domain and Language).

### Fintech / Payments

- What is the settlement model? (T+0, T+1, batch, real-time gross settlement)
- What is the chargeback and dispute flow?
- What is the reconciliation strategy?
- What happens to in-flight payments if a service is down?
- What is the idempotency model for payment mutations?
- What are the PCI-DSS obligations?

### Insurance

- What is the policy lifecycle? (quote → bind → active → lapse → cancel — name each state precisely)
- What triggers a claim?
- What is the regulatory jurisdiction? Which state/country compliance applies?
- What is the manual underwriting escalation path?
- What is the premium calculation model?
- What is the cancellation and refund policy?

### Healthcare

- What is the HIPAA classification of the data? (PHI, PII, de-identified)
- What are the minimum necessary data principles applied here?
- What is the access control model? (role-based, patient-consent-based, purpose-limited)
- What is the data retention and audit requirement?
- Is there an HL7 or FHIR integration?

### E-commerce

- What is the order lifecycle? (cart → checkout → payment → fulfillment → delivered → returned)
- What is the inventory model? (real-time reservation, eventual consistency, overselling policy)
- What is the return and refund flow?
- What is the tax calculation strategy?
- What is the fraud detection strategy?

### B2B SaaS

- What is the tenant isolation model? (schema-per-tenant, row-level, cluster-per-tenant)
- What is the billing unit? (seats, usage, flat rate, tiered)
- What is the onboarding flow? (self-serve, sales-assisted, implementation partner)
- What is the SSO and directory sync strategy?
- What does the admin portal expose vs. the end-user portal?

---

## End of Session

When the full design tree is resolved:

1. **Summary of decisions made** — one line per resolved question, grouped by area.

2. **Domain term list** — all agreed terms with their definitions. Present in CONTEXT.md format:

```markdown
## Terms (foundation for your CONTEXT.md)

**{Term}**: {Precise definition. Usage context.}
```

3. **Open questions flagged** — any deferred decisions the developer chose not to resolve now. List them.

4. **Next step prompt:**
   > "Design tree is resolved. These terms and decisions form the foundation of your CONTEXT.md and your first PRD. Run `/init` to initialize Velocity, then `/grill-with-docs` to formalize the glossary. Run `/to-prd` after that to convert these decisions into a PRD."
