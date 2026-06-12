---
mode: agent
description: "Detect shallow module anti-patterns and surface deepening opportunities. Finds places where understanding one concept requires bouncing between many small files, where pure functions were extracted just for testability, and where the codebase diverges from CONTEXT.md terminology. Produces a prioritized list of refactoring candidates for developer approval. Run periodically or after any significant surge of agent-driven development."
---


# Improve Codebase Architecture

Analyze this codebase for shallow module patterns and produce a prioritized improvement plan.

## Context Load

Read before starting:

1. `.velocity/project-intelligence/stack.md` — stack fingerprint (module structure, architecture patterns)
2. `.velocity/knowledge-base/adrs/` — index, then relevant ADRs
3. CONTEXT.md from `.velocity/context-map.md` (all contexts — for term alignment check)

---

## What This Skill Does

If you have a garbage codebase, the AI will produce garbage within it.

This skill finds **deepening opportunities** — places where shallow modules can be deepened to improve navigability, reduce cognitive load, and make the codebase more AI-agent-friendly.

This skill produces a **menu of candidates**, not a prescription. The developer approves before anything is changed.

---

## Analysis Protocol

### 1 — Shallow Module Detection

A module is shallow when its interface is as complex as its implementation.

Scan for:

**Many-small-files patterns:**

- Directories with 10+ files where each file exports 1–3 functions
- Module trees where understanding a single concept requires reading 5+ files
- "Utils" or "helpers" directories (catch-all shallow modules)
- Pure functions extracted from a class purely for testability

**Leaking complexity:**

- Modules that require callers to know implementation details to use them
- Internal data structures exposed in public interfaces
- Configuration options that reflect implementation choices rather than behavior choices
- Exception types that expose internal implementation

**Integration risk patterns:**

- Two modules that must always be updated together (tight coupling disguised as separation)
- Function sequences that callers must always call in a specific order
- State that lives outside the module but is required for the module to work

**Agent-hostile patterns:**

- Inconsistent naming that diverges from CONTEXT.md terms
- Domain logic spread across 4+ files with no single entry point
- Context that must be accumulated from multiple files to understand one behavior

---

### 2 — CONTEXT.md Term Alignment

For each bounded context, scan the codebase for:

- Variable names, class names, function names that differ from CONTEXT.md terms
- Synonym drift: same concept with multiple names in different files
- Missing terms: concepts that exist in code but are not in CONTEXT.md

Report term drift with specific file/line references.

---

### 3 — Architecture Pattern Consistency

Check whether the detected architecture patterns are consistently applied:

**DDD (if detected):**

- Are aggregates correctly enforcing invariants, or is business logic leaking into services?
- Are domain events being published at the aggregate boundary?
- Are repositories returning aggregates, not raw entities?

**Event Sourcing (if detected):**

- Are aggregates rehydrated from events?
- Are projections separated from the command model?
- Is the event store append-only?

**Hexagonal (if detected):**

- Is the domain model free of framework and infrastructure dependencies?
- Are all external integrations behind ports (interfaces)?
- Is the adapter layer thin?

---

### 4 — Test Architecture

Identify tests that give false confidence:

- Tests that mock everything and test nothing real
- Integration tests that use in-memory fakes where the real behavior differs materially
- Tests that test implementation details (private methods, internal state) rather than behavior
- Missing tests at critical layer boundaries

---

## Output Format

Write to `.velocity/artifacts/architecture-reviews/{date}.md`:

```markdown
# Architecture Review: {date}

## Summary

{2–3 sentence executive summary of the main finding.}

---

## Findings

### Finding 1: {Title} — Priority: High | Medium | Low

**Pattern:** {Shallow module | Leaking complexity | Term drift | Architecture inconsistency | Test gap}

**Location:** {File/directory paths}

**What's wrong:**
{Explanation of why this is a problem for maintainability or agent output quality}

**Deepening opportunity:**
{Concrete proposal for how to deepen this module or fix the pattern}
{Show before/after interface comparison if applicable}

**Estimated effort:** {Hours}

**Risk if addressed:** {Low | Medium | High} — {brief risk note}

---

[Repeat for each finding, ordered by priority]

---

## CONTEXT.md Term Drift

| Code term | CONTEXT.md term | Occurrences | Action |
| --------- | --------------- | ----------- | ------ | ----------------- |
| {term}    | {correct term}  | {N}         | Rename | Add to CONTEXT.md |

---

## Approval Request

Review the findings above and approve which ones to address:

- Reply "approve all" to proceed with all findings
- Reply "approve 1, 3, 5" to address specific findings
- Reply "skip" to defer all findings to the next review cycle

After approval, the Refactor Agent will implement the approved changes.
```

---

## Running Cadence

Run this skill:

- After every 3–5 implementation sprints
- After any large surge of agent-driven development
- Before starting a major new feature that touches the same modules
- When agent output quality is noticeably degrading

Do not run after every task — the overhead is not worth it for small changes.
