# Feature Board: {{PRD_NAME}}

## Version: 1

## Date: {{DATE}}

## Source PRD: .velocity/artifacts/prds/{{PRD_ID}}.md

## Bounded Context: {{CONTEXT_NAME}}

---

## Features

### Feature 1: {{Name — user-facing outcome}}

**User outcome:** {{What the user can do when this is merged}}

**Tracer or expansion:** Tracer ← first feature for this capability must always be tracer

**Layers:** UI · API · Persistence · {{other layers}}

**Out of scope:** {{Explicit list of what is NOT in this feature}}

**Acceptance criteria:**

- [ ] {{Testable criterion using CONTEXT.md terms}}
- [ ] {{Testable criterion}}

**Minimum lovable scope:** {{The absolute minimum for this to be useful}}

**Priority score:** {{score from roadmap skill, if run}}

**Blocked by:** _(none — tracer features should be unblocked)_

---

### Feature 2: {{Name — user-facing outcome}}

**User outcome:** {{What the user can do when this is merged}}

**Tracer or expansion:** Expansion of Feature 1

**Layers:** UI · API · Persistence

**Out of scope:** {{Explicit list}}

**Acceptance criteria:**

- [ ] {{Testable criterion}}

**Minimum lovable scope:** {{Minimum useful version}}

**Priority score:** {{score}}

**Blocked by:** Feature 1 (requires tracer to be merged first)

---

{{Repeat for all features}}

---

## Dependency Map

{{ASCII or list representation of blocking relationships}}

Feature 1 (Tracer) → Feature 2, Feature 3
Feature 2 → Feature 4
Feature 3 → Feature 5
Feature 4, Feature 5 → Feature 6

## Parallel execution candidates

Features that can be worked on simultaneously (no blocking dependency):

- Feature 2, Feature 3 (both blocked by Feature 1 only)

---

## Version History

| Version | Date     | Author  | Summary of changes    |
| ------- | -------- | ------- | --------------------- |
| 1       | {{DATE}} | {{who}} | Initial decomposition |

---

## Next Step

Run /roadmap to generate a phased delivery plan.
Run /to-tasks on each feature to decompose into independently implementable tasks.
