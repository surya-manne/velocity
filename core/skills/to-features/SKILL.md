---
name: to-features
description: >-
  Decompose a PRD into a feature board of vertical-slice features. Each feature
  has a clear user-facing outcome, layer coverage definition, out-of-scope
  boundary, and tracer bullet scope. Run after to-prd, before to-tasks.
metadata:
  surfaces:
    - agent
---

# To Features

Decompose this PRD into independently deliverable vertical slices.

## Context Load

Read before starting:

1. `.velocity/artifacts/prds/{latest}.md` — the PRD to decompose
2. CONTEXT.md from `.velocity/context-map.md`
3. `.velocity/project-context/engineering.md`

---

## Vertical Slice Discipline

Before decomposing, internalize the vertical slice rule:

> A feature is a thin, complete, end-to-end implementation of a **single user-facing capability**. It spans every layer it touches (UI, API, domain logic, persistence) and delivers demonstrable value when merged.

**Horizontal anti-patterns — reject any decomposition like these:**

❌ Feature 1: Database schema
❌ Feature 2: API endpoints
❌ Feature 3: UI components
❌ Feature 4: Integration and testing

✅ Feature 1: "User can submit a payment" — DB + API + UI + Tests
✅ Feature 2: "User can view payment history" — DB + API + UI + Tests
✅ Feature 3: "User can cancel a pending payment" — DB + API + UI + Tests

**Tracer bullet first:**

The first feature for any capability must be a **tracer** — the minimal end-to-end path. It is not a full feature. It validates the critical path and gets feedback before expansion.

---

## Decomposition Protocol

### Step 1 — Run grill-me-vertical-slice for each proposed feature

For each feature candidate, answer:

1. What is the single user-facing outcome?
2. Can a user do something meaningful when this is merged?
3. Which layers does it touch?
4. What is explicitly out of scope for this feature?
5. What is the acceptance criterion that proves this is complete end-to-end?
6. What is the minimum lovable version?

If you cannot answer all six: the feature is not well-scoped. Narrow it further.

### Step 2 — Detect horizontal anti-patterns

If any proposed feature:

- Touches only one layer (only DB, only API, only UI)
- Has "schema", "migration", "endpoint", or "component" in its name
- Cannot be demonstrated to a user when merged

Reject it and propose a corrected vertical slice.

### Step 3 — Write the feature board

---

## Versioning

### New feature board

When decomposing a PRD for the first time:

- Write to: `.velocity/artifacts/features/{prd-id}-v1.md`
- Set `## Version: 1` in the frontmatter

### Revised feature board

When re-decomposing a PRD (scope changed, features re-scoped):

1. Archive the existing file: rename to `{prd-id}-v{N}-archived-{date}.md`
2. Write the new version to `{prd-id}-v{N+1}.md`
3. Add a `## Change from v{N}:` line at the top describing what changed

Create or update `.velocity/artifacts/features/index.md` with an entry for this feature board:

```
| {prd-id} | v{N} | {date} | {N features} | {source PRD path} |
```

---

## Output Format

Write to `.velocity/artifacts/features/{prd-id}-v{N}.md`:

```markdown
# Feature Board: {PRD Name}

## Version: {N}

## Date: {date}

## Source PRD: .velocity/artifacts/prds/{prd-id}-v{N}.md

## Bounded Context: {context-name}

{If revision: ## Change from v{N-1}: {one sentence describing the change}}

---

## Features

### Feature 1: {Name — user-facing outcome}

**User outcome:** {What the user can do when this is merged}

**Tracer or expansion:** Tracer ← first feature for this capability must always be tracer

**Layers:** UI · API · Persistence · {other layers}

**Out of scope:** {Explicit list of what is NOT in this feature}

**Acceptance criteria:**

- [ ] {Testable criterion using CONTEXT.md terms}
- [ ] {Testable criterion}

**Minimum lovable scope:** {The absolute minimum for this to be useful}

**Blocked by:** _(none — tracer features should be unblocked)_

---

### Feature 2: {Name — user-facing outcome}

**User outcome:** {What the user can do when this is merged}

**Tracer or expansion:** Expansion of Feature 1

**Layers:** UI · API · Persistence

**Out of scope:** {Explicit list}

**Acceptance criteria:**

- [ ] {Testable criterion}

**Minimum lovable scope:** {Minimum useful version}

**Blocked by:** Feature 1 (requires tracer to be merged first)

---

[Repeat for all features]

---

## Dependency Map

{ASCII or list representation of blocking relationships}

Feature 1 (Tracer) → Feature 2, Feature 3
Feature 2 → Feature 4
Feature 3 → Feature 5
Feature 4, Feature 5 → Feature 6

## Parallel execution candidates

Features that can be worked on simultaneously (no blocking dependency):

- Feature 2, Feature 3 (both blocked by Feature 1 only)

---

## Version History

| Version | Date   | Summary of changes |
| ------- | ------ | ------------------ |
| {N}     | {date} | {summary}          |

---

## Next Steps

Run /roadmap to generate a phased delivery plan from this feature board.
Run /to-tasks on each feature to decompose into independently implementable tasks.
```

---

## Quality Checks

Before finalizing the feature board:

1. Every feature must have a testable acceptance criterion.
2. No feature touches only one layer.
3. The first feature for each capability must be labeled "Tracer".
4. Every term in the feature names and acceptance criteria must match CONTEXT.md.
5. Dependency map must be acyclic.
6. At least one parallel execution opportunity must exist (if PRD has 3+ features).
