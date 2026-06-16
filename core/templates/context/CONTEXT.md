# CONTEXT.md — {{CONTEXT_NAME}}

> Ubiquitous language for the {{CONTEXT_NAME}} bounded context.
> Maintained by: developers, domain experts, and AI agents equally.
> Updated during every `grill-with-docs` session.
>
> Rules:
>
> - All variable names, file names, API terms, and schema names must reflect terms defined here.
> - New terms are proposed via `grill-with-docs` and recorded in `.velocity/artifacts/context-proposals/`.
> - Conflicts between CONTEXT.md and code are a guardrail violation.

---

## Domain Summary

{{DOMAIN_SUMMARY}}

---

## Terms

> Add domain terms here. Format: **Term**: Definition. Include usage context.
> Each term should be precise enough that a new engineer can name things correctly without asking.

_(Populate using `/grill-with-docs`)_

---

## Decisions

> Record decisions that constrain how this context is modeled.
> Link to ADRs for decisions that meet the three-criteria threshold (hard-to-reverse, surprising without context, real trade-off).

_(Decisions recorded here during grill-with-docs sessions)_

---

## Bounded Context Relationships

> How this context interacts with adjacent contexts.
> List upstream/downstream relationships and the integration pattern used.

_(Populated as the system grows)_

---

## Out of Scope

> Concepts that explicitly do NOT belong in this context.
> Prevents scope creep and naming confusion.

_(Defined during grill-with-docs)_
