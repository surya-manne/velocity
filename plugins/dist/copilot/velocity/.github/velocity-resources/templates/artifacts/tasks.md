# Task Board: {{FEATURE_NAME}}

## Version: 1

## Date: {{DATE}}

## Source feature: .velocity/artifacts/features/{{FEATURE_ID}}.md

## Bounded Context: {{CONTEXT_NAME}}

---

## Tasks

### Task 1: {{Short behavior description}}

**Behavior:** {{What the system does after this task is complete}}

**Interface:**

```
{{Function signature, API endpoint, or component interface}}
```

**First failing test:**

```
{{Test name and what it asserts — in the detected test framework's style}}
```

**Layer:** {{UI | API | Domain | Persistence | Messaging | Infrastructure}}

**Estimated complexity:** {{S | M | L}} (S = under 30 min, M = 30–90 min, L = 90+ min)

**Blocked by:** _(none)_

**Acceptance signal:** {{How you know this task is done}}

---

### Task 2: {{Short behavior description}}

**Behavior:** {{What the system does after this task is complete}}

**Interface:**

```
{{Interface definition}}
```

**First failing test:**

```
{{Test}}
```

**Layer:** {{Layer}}

**Estimated complexity:** {{S | M | L}}

**Blocked by:** Task 1

**Acceptance signal:** {{Signal}}

---

{{Repeat for all tasks}}

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

1. Task 1 — {{behavior}}
2. Task 2 — {{behavior}}
   OR Task 3 — {{behavior}} (can run in parallel with Task 2)
3. Task 4 — {{behavior}}
4. Task 5 — {{behavior}}

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

| Version | Date     | Author  | Summary of changes    |
| ------- | -------- | ------- | --------------------- |
| 1       | {{DATE}} | {{who}} | Initial decomposition |

---

## Next Step

For each task: run /tdd in a fresh context window, providing this task definition as input.
