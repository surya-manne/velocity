---
mode: agent
description: "Generate an architecture document for a feature or system that is consistent with CONTEXT.md domain language and existing ADRs. Produces a structured document covering system context, component design, data flows, API surface, deployment topology, and architectural trade-offs. Stored under .velocity/artifacts/architecture/. Invoked by the Architecture Agent before implementation begins on any non-trivial feature."
---


# Architecture Doc

Generate a structured architecture document aligned to the existing system.

## Context Load

Read before starting:

1. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
2. `.velocity/knowledge-base/adrs/index.md` — identify active ADRs that constrain this design
3. Full body of every ADR relevant to this feature area
4. `.velocity/project-context/engineering.md` — module structure and code standards
5. `.velocity/project-context/api.md` — API style and versioning rules (if feature exposes an API)
6. `.velocity/artifacts/prds/` — the PRD for this feature (if it exists)

---

## Step 1 — Clarify Scope

Ask the developer (or extract from the PRD):

1. What is the user-facing outcome this architecture supports?
2. What bounded context does this feature belong to?
3. What existing system components does this feature interact with?
4. What are the critical quality attributes: latency, availability, consistency, security?
5. What is explicitly out of scope for this architecture doc?

Do not proceed until scope is clear.

---

## Step 2 — Check for ADR Constraints

Read the ADR index. For each accepted ADR relevant to this feature area, present:

| ADR      | Decision   | Constraint on this design                |
| -------- | ---------- | ---------------------------------------- |
| ADR-{id} | {decision} | {what this means for the current design} |

If this design would contradict an accepted ADR: surface the conflict before proceeding. Do not design around an ADR without the developer's explicit decision to supersede it.

---

## Step 3 — Draft the Architecture Document

Produce the document using the template from `templates/artifacts/architecture-doc.md`.

Apply these rules:

- **Domain language**: All entity names, event names, API terms, and component names must match CONTEXT.md terms.
- **Level of abstraction**: Components and data flows at the right level — not class diagrams, not infrastructure runbooks. Describe what each component does, not how it implements it.
- **Trade-offs are explicit**: Every significant choice names the alternative that was rejected.
- **Diagrams**: Use ASCII or Mermaid-compatible text for system context and component diagrams. No image dependencies.
- **No premature detail**: Avoid specifying library versions, exact field names, or implementation algorithms unless they are the architectural decision.

Present the draft:

> "Here is the architecture draft. Correct anything that is wrong, add missing context, mark any open questions. Say 'approve' when ready."

---

## Step 4 — Resolve Open Questions

For each open question in the draft, apply the three-criteria ADR gate.

If a decision qualifies: invoke the `adr-engine` skill inline to generate an ADR before finalising the document.

Update the architecture doc to reference any ADRs generated.

---

## Step 5 — Write the Document

When the developer approves:

1. Generate the slug from the feature name: lowercase, hyphens.
2. Write to: `.velocity/artifacts/architecture/{slug}.md`
3. Update `.velocity/knowledge-base/index.md`:
   - Add: `| architecture | {title} | .velocity/artifacts/architecture/{slug}.md | {date} |`

Say: "Architecture document written to `.velocity/artifacts/architecture/{slug}.md`."

---

## Step 6 — Identify Follow-On Work

After writing the document, surface:

- **API Design needed**: If the feature exposes new endpoints → suggest invoking `/api-design`
- **Security Design needed**: If the feature touches auth, PII, payments, or trust boundaries → suggest invoking `/security-design`
- **Domain Model updates needed**: If new domain terms were introduced → suggest invoking `/domain-model`
- **ADR needed**: If any open decisions remain → suggest invoking `/adr-engine`

---

## Architecture Document Quality Rules

A document that fails any of these rules should be revised:

- System context diagram shows the feature's boundaries relative to external actors and systems
- Every component has a stated responsibility — no "misc" or "utils" components
- Data flows show direction and describe what data crosses each boundary
- At least one trade-off is named with its rejected alternative
- All terms match CONTEXT.md
- No implementation details that will become stale within a sprint
