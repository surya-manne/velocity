---
mode: agent
description: "Align a plan to CONTEXT.md and existing ADRs before writing a PRD. Reads the existing domain model, checks the proposed work against established terms and decisions, surfaces conflicts, and updates CONTEXT.md before any PRD is written. Use when a PRD exists elsewhere and needs domain alignment, or when starting planning in a brownfield context."
---


# Domain Model

Align this plan to the established domain language before writing any requirements.

## Context Load

Read before starting:

1. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
2. `.velocity/knowledge-base/adrs/` — full ADR bodies for ADRs relevant to this domain area
3. `.velocity/project-context/engineering.md`

---

## Purpose

`domain-model` is the lighter, more focused alternative to `grill-with-docs`.

Use `grill-with-docs` when you need to explore unknowns and challenge assumptions.
Use `domain-model` when the plan is already defined and you need to align it to the domain model before proceeding to a PRD.

---

## Step 1 — Review Proposed Plan Against CONTEXT.md

Ask the developer to describe the proposed work in 1–3 sentences.

Then:

1. Read CONTEXT.md for the relevant bounded context.
2. Identify every domain term in the developer's description.
3. For each term: check whether it exists in CONTEXT.md with the same meaning.

Report:

| Term          | Status                       | Action                             |
| ------------- | ---------------------------- | ---------------------------------- |
| `Payment`     | ✅ Matches CONTEXT.md        | None                               |
| `Transaction` | ⚠️ Not in CONTEXT.md         | Define or align with existing term |
| `Invoice`     | ❌ Conflicts with CONTEXT.md | Resolve before proceeding          |

---

## Step 2 — Review Against Existing ADRs

Read the ADR index. Identify any ADRs that constrain the proposed work.

For each relevant ADR, present:

- The decision made
- How it constrains the proposed plan
- Whether the plan is consistent with the decision

If the plan contradicts an existing ADR: surface the conflict and ask the developer how to resolve it. Do not proceed until resolved. Resolution options:

1. Modify the plan to comply with the ADR
2. Supersede the ADR with a new decision (generates a new ADR)

---

## Step 3 — Propose CONTEXT.md Updates

For any terms that need to be added or modified, write a proposal to `.velocity/artifacts/context-proposals/{session-id}.md`.

Show the developer the proposal for approval before merging.

---

## Step 4 — Confirm Alignment

When CONTEXT.md is aligned and no ADR conflicts remain:

"Domain model aligned. Terms are precise. No ADR conflicts. Run /to-prd to produce the PRD from this aligned model."

If new ADRs need to be created (decisions made during this session meet the three-criteria threshold): generate them as part of this step.
