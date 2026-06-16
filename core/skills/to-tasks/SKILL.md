---
name: to-tasks
description: >-
  Decompose a feature into independently implementable tasks with explicit
  blocking relationships. Each task is small enough to be completed in one
  tdd session (one fresh context window). Run after to-features, before
  starting tdd on each task.
metadata:
  surfaces:
    - agent
---

# To Tasks

Decompose this feature into tasks the Engineer can implement one at a time, each in a fresh context window.

## Context Load

Read before starting:

1. `.velocity/artifacts/features/{feature-id}.md` — the feature to decompose
2. CONTEXT.md from `.velocity/context-map.md`

---

## Task Sizing Principle

A task is right-sized when:

- It can be implemented in **one tdd session** (one context window, under 2 hours of work)
- It has a **single clear behavior** to test
- It **does not block itself** — all its dependencies can be resolved before it starts
- When complete, **something is testable** — a unit test passes, an integration test passes, or an acceptance criterion is partially satisfied

Too large: "Implement payment processing" → break it down
Right-sized: "Implement PaymentService.charge() — deduct from balance, return PaymentResult"

---

## Task Decomposition Protocol

For each task:

1. State the **behavior** (not implementation): what does this task make the system do?
2. State the **interface**: what is the function/endpoint/component signature?
3. State the **test first**: what is the first failing test that this task satisfies?
4. State the **blocking dependencies**: which other tasks must be complete first?
5. State the **acceptance signal**: how do you know this task is done?

---

## Versioning

### New task board

When decomposing a feature for the first time:

- Write to: `.velocity/artifacts/tasks/{feature-id}-v1.md`
- Set `## Version: 1` in the frontmatter

### Revised task board

When re-decomposing a feature (scope changed, tasks re-scoped):

1. Archive the existing file: rename to `{feature-id}-v{N}-archived-{date}.md`
2. Write the new version to `{feature-id}-v{N+1}.md`
3. Add a `## Change from v{N}:` line at the top describing what changed

Create or update `.velocity/artifacts/tasks/index.md` with an entry for this task board:

```
| {feature-id} | v{N} | {date} | {N tasks} | {source feature path} |
```

---

## Output Format

Write to `.velocity/artifacts/tasks/{feature-id}-v{N}.md`:

```markdown
# Task Board: {Feature Name}

## Version: {N}

## Date: {date}

## Source feature: .velocity/artifacts/features/{feature-id}-v{N}.md

## Bounded Context: {context-name}

{If revision: ## Change from v{N-1}: {one sentence describing the change}}

---

## Tasks

### Task 1: {Short behavior description}

**Behavior:** {What the system does after this task is complete}

**Interface:**
\`\`\`
{Function signature, API endpoint, or component interface}
\`\`\`

**First failing test:**
\`\`\`
{Test name and what it asserts — in the detected test framework's style}
\`\`\`

**Layer:** {UI | API | Domain | Persistence | Messaging | Infrastructure}

**Estimated complexity:** {S | M | L} (S = under 30 min, M = 30–90 min, L = 90+ min — L tasks should be split)

**Blocked by:** _(none)_

**Acceptance signal:** {How you know this task is done — test passes, endpoint responds, component renders}

---

### Task 2: {Short behavior description}

**Behavior:** {What the system does after this task is complete}

**Interface:**
\`\`\`
{Interface definition}
\`\`\`

**First failing test:**
\`\`\`
{Test}
\`\`\`

**Layer:** {Layer}

**Estimated complexity:** {S | M | L}

**Blocked by:** Task 1

**Acceptance signal:** {Signal}

---

[Repeat for all tasks]

---

## Dependency Map

Task 1 → Task 2, Task 3
Task 2 → Task 4
Task 3 → Task 4
Task 4 → Task 5

## Parallel execution candidates

Tasks 2 and 3 (both blocked by Task 1 only)

---

## Implementation order (sequential recommendation)

1. Task 1 — {behavior}
2. Task 2 — {behavior}
   OR Task 3 — {behavior} (can run in parallel with Task 2)
3. Task 4 — {behavior}
4. Task 5 — {behavior}

---

## Context window plan

Each task runs in a **fresh context window** with these inputs:

- This task definition
- CONTEXT.md
- .velocity/project-context/testing.md
- The handoff artifact from the previous task (if any)

No task carries context from previous tasks beyond what is in the handoff artifact.

---

## Version History

| Version | Date   | Summary of changes |
| ------- | ------ | ------------------ |
| {N}     | {date} | {summary}          |

---

## Next Step

For each task: run /tdd in a fresh context window, providing this task definition as input.
```

---

## Quality Checks

1. No task is labeled "L" (Large) without a comment explaining why it cannot be split.
2. Every task has a first failing test defined — not "write tests" but the specific first test.
3. Every term uses CONTEXT.md terminology.
4. The dependency map is acyclic.
5. No task creates a foundation with nothing to test until two tasks later.
