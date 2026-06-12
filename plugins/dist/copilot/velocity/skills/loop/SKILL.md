---
name: loop
description: "Autonomous agent loop. Operates in two modes: pipeline mode (drives features through SDLC pipeline phases, reading state from the velocity-state branch) and task mode (reads the feature board, picks the next unblocked task, implements through TDD). Pauses for human gates. Each phase or task runs in a fresh context window. Use /loop in Cursor, /velocity-loop in Claude Code, velocity-loop.prompt.md in Copilot."
---


# Loop

Run the Velocity skill chain autonomously — either across pipeline phases or across tasks on a feature board.

## Context Load

Read before starting:

1. `velocity-state` branch → `.velocity/sdlc/state/` — scan for in-flight pipeline state files (pipeline mode)
2. `.velocity/artifacts/tasks/{feature-id}-v{N}.md` — the task board to execute (task mode; pass as argument or read from `.velocity/artifacts/loop/state.md`)
3. `.velocity/guardrails/default.md` — guardrail config including `loop` section
4. `.velocity/artifacts/loop/state.md` — loop state file (task mode; create if missing)
5. CONTEXT.md from `.velocity/context-map.md`
6. `.velocity/sdlc/pipeline-config.yaml` — RALPH enabled flag and max_revision_attempts (pipeline mode)

---

## Mode Detection

Before executing, detect which mode to run:

1. Scan the `velocity-state` branch for `.velocity/sdlc/state/*.yaml` files with `status: in_progress` or `status: gate-pending` phases.
2. If pipeline state files are found → **Pipeline Mode** (see §Pipeline Mode below).
3. If no pipeline state files are found → **Task Mode** (original behavior; see §What the Loop Does).
4. If both exist: prefer Pipeline Mode; inform developer and offer to switch to Task Mode.

When invoked with `--pipeline`: force Pipeline Mode.
When invoked with `--tasks [feature-id]`: force Task Mode.

---

## Pipeline Mode

Drive in-flight features through SDLC pipeline phases autonomously, pausing at human gates.

### Pipeline Mode — What the Loop Does

```
Read all in-flight pipeline state files (velocity-state branch)
         ↓
Pick next unblocked phase across all features
         ↓
Run the phase-owning agent in a fresh context window
  → /phase-interview (phase entry)
  → Agent executes phase
  → /phase-gate (automated checks)
         ↓
If automated gate passes:
  Write phase artifacts
  Advance state to gate-pending
         ↓
Pause for human gate
  (loop suspends; developer is notified)
         ↓
On human approval:
  Advance to next phase
  Write RALPH annotation stub (if ralph_enabled)
  Continue loop
         ↓
On gate rejection:
  Agent revises (up to max_revision_attempts)
  Re-presents at human gate
         ↓
Pick next unblocked phase
  (repeat until all pipelines complete or loop pauses)
```

### Pipeline Mode — Phase Selection

From all in-flight state files, collect all phases with `status: in_progress` or `status: gate-pending`.

Selection priority:
1. Phases with `status: gate-pending` first — they are ready for human review, not execution.
2. Among `in_progress` phases: phases whose `work_id` has no unresolved `blocking` dependencies.
3. Among equal-priority: earliest `started_at`.

**Blocking check:** Before executing a phase, verify the `blocking` array on the state file. If any listed `work_id` does not have `current_phase` at `approved` status, skip this pipeline and pick the next one. Print:

```
⏸ [work_id] is blocked by [blocking-work-id] (current status: [status]).
  Skipping until blocker is resolved.
```

### Pipeline Mode — Human Gate Pause

When a phase reaches `gate-pending`:

1. Suspend the loop.
2. Present the phase gate using `/phase-gate` (human gate path).
3. Print:

```
⏸ Loop paused — human gate required
   Work item: [work_id]
   Phase: [phase_name]
   Owning agent: [owning_agent]

   Run /phase-gate to review and approve, or type your approval now.
   After approval, re-run /loop to continue.
```

### Pipeline Mode — RALPH Annotation Stub

After each phase reaches `approved` status, if `ralph_enabled: true` in `pipeline-config.yaml`:

- Invoke `/ralph-consumer-annotate` to write the annotation stub.
- Do **not** wait for the developer to fill in the rating — the loop continues immediately.
- Print: `📋 RALPH stub written for [work_id]/[phase_id]. Fill in rating after review.`

### Pipeline Mode — Loop Complete

When all phases in all state files have `status: approved` or `status: skipped`:

```
✅ Pipeline loop complete

All in-flight pipelines have reached their final approved phase.

| Work Item | Pipeline | Phases | Duration |
|-----------|----------|--------|----------|
| [work_id] | [variant] | [N] approved | [duration] |

Run /pipeline-status for a full summary.
```

---

## What the Loop Does

The loop automates the inner implementation cycle that a developer would otherwise run manually:

```
Read task board
    ↓
Pick next unblocked task
    ↓
[Human approval gate — if task is high-risk]
    ↓
Run /tdd in a fresh context window (up to max_attempts)
    ↓
Run /validate (guardrail check)
    ↓
Run /handoff (generate handoff artifact)
    ↓
Open PR
    ↓
Mark task complete in loop state
    ↓
Pick next task
    ↓
[Repeat until board is complete or loop pauses]
```

The loop does not carry implementation context between tasks. Each task is isolated. The loop carries only the state file (which tasks are done, which are next, how many attempts each has consumed).

---

## Invocation

### Cursor — `/loop`

```
/loop [feature-id]
```

If `[feature-id]` is omitted, read the active task board from `.velocity/artifacts/loop/state.md`. If no state file exists, ask the developer which task board to execute.

### Claude Code — `/velocity-loop`

```
/velocity-loop [feature-id]
```

Same behavior as `/loop`.

### GitHub Copilot — `velocity-loop.prompt.md`

The prompt file at `.github/prompts/velocity-loop.prompt.md` contains the same instructions as this skill. Invoke from Copilot agent mode.

---

## Arguments

| Argument         | Required | Description                                                                   |
| ---------------- | -------- | ----------------------------------------------------------------------------- |
| `feature-id`     | Optional | The feature ID whose task board to execute. Reads from state file if omitted. |
| `--task {id}`    | Optional | Start from a specific task ID instead of the next unblocked one.              |
| `--attempts {N}` | Optional | Override `max_attempts` from guardrails config for this run.                  |
| `--dry-run`      | Optional | Print the execution plan without running any tasks.                           |

---

## Loop State File

The loop writes progress to `.velocity/artifacts/loop/state.md` before and after every task.

If the file does not exist, create it. If the loop is interrupted, it resumes from this file.

Format:

```markdown
# Loop State

## Feature board: .velocity/artifacts/tasks/{feature-id}-v{N}.md

## Started: {ISO date}

## Last updated: {ISO date}

---

## Tasks

| Task ID | Status      | Attempts | PR  | Quality Rating | Notes                      |
| ------- | ----------- | -------- | --- | -------------- | -------------------------- |
| task-1  | complete    | 1        | #42 | 4/5            | —                          |
| task-2  | complete    | 2        | #43 | 3/5            | Attempt 1 failed typecheck |
| task-3  | in_progress | 1        | —   | —              | —                          |
| task-4  | pending     | 0        | —   | —              | Blocked by task-3          |
| task-5  | pending     | 0        | —   | —              | —                          |
| task-6  | paused      | 0        | —   | —              | Awaiting human approval    |

---

## Loop status: running | complete | paused | failed

## Pause reason: {reason if paused}

## Next task: task-4

## Summary: {N} of {total} complete, {N} in progress, {N} pending
```

**Quality Rating:** Required for every task with status `complete`. Scale 1–5:

- **5** — Skill executed perfectly; output required no manual correction.
- **4** — Minor rough edges; usable output with small tweaks.
- **3** — Significant gaps; developer had to intervene substantially.
- **2** — Output was mostly wrong; required major rework.
- **1** — Complete failure; output was discarded entirely.

A task marked `complete` without a quality rating is considered a **partial stub**. `ralph-learn` skips stubs with missing ratings. Fill in the rating after reviewing the merged PR. The loop will warn when it detects `complete` tasks with empty ratings:

```
⚠ RALPH quality rating missing for: task-1, task-2
  Fill in Quality Rating after PR review so /ralph-learn can extract patterns.
```

---

## Step 1 — Load and Validate the Task Board

Read the task board from the path specified in `state.md` or the argument.

Validate:

1. The task board exists and is readable.
2. All tasks have a defined `Blocked by` relationship (including `none`).
3. The dependency graph is acyclic — if cycles exist, halt and report: "Loop cannot start: dependency cycle detected in task board. Fix the dependency map first."

Report the board summary:

```
Loop initialized
Task board: .velocity/artifacts/tasks/{feature-id}-v{N}.md
Total tasks: {N}
Pending: {N}
Blocked: {N}
Already complete: {N}
```

---

## Step 2 — Pick the Next Unblocked Task

From the task board, select the next task where:

1. Status is `pending`
2. All tasks in `Blocked by` have status `complete`

Selection priority:

1. Tasks with no blockers (depth 0 in dependency graph)
2. Among equal-depth tasks: lower estimated complexity first (S before M before L)
3. Among equal-depth, equal-complexity tasks: order as listed in the task board

If no unblocked pending tasks exist:

- If all tasks are complete: proceed to Step 7 (Loop Complete).
- If some tasks are pending but all are blocked: "Loop paused — all remaining tasks are blocked. Complete the blocking tasks manually or reorder the task board."
- If any tasks are `paused` awaiting approval: print the approval prompt (Step 3b).

---

## Step 3 — Human Approval Gate

Before starting any task, evaluate its risk level from the task board entry.

A task is **high-risk** if any of the following are true:

- The task touches authentication, authorization, or session management
- The task touches PII storage or processing
- The task touches payment processing or financial calculations
- The task touches a public API contract (adds, removes, or changes an endpoint)
- The task touches database schema (migrations, schema changes)
- The task touches cryptographic operations or secret handling
- The task is marked `risk: high` in the task board
- `loop.require_approval_for_all: true` in guardrails config

### 3a — Low-risk task

Proceed directly to Step 4. Print:

```
▶ Task {id}: {name}
  Risk: standard
  Proceeding automatically.
```

### 3b — High-risk task

Pause the loop. Update state to `paused`. Print:

```
⏸ Task {id}: {name}
  Risk: HIGH — requires human approval before proceeding.

  Risk signals:
  - {specific signal, e.g., "touches payment processing"}
  - {specific signal}

  Task definition:
  {task behavior, interface, and acceptance signal}

  To approve and continue:
    Type: /loop --task {id}
    Or: confirm "approve task {id}" to proceed

  To skip this task:
    Type: /loop --skip {id}

  Loop is paused. All other unblocked low-risk tasks have been completed first.
```

When the developer confirms approval: update the task's status to `pending` (cleared from paused), write the approval to state, and proceed to Step 4.

---

## Step 4 — Execute the Task (TDD Session)

Run the TDD skill for the selected task in a **fresh context window**.

### Context window inputs

Pass to the TDD session:

1. The specific task definition (copy the task block from the task board)
2. CONTEXT.md path
3. `.velocity/project-context/testing.md` path
4. The handoff artifact from the immediately preceding completed task (if any) — read from `.velocity/artifacts/handoffs/`

**Do not pass the full conversation history, the loop state, or context from other tasks.**

### TDD execution

The TDD session follows `skills/tdd/SKILL.md`:

- Design the interface
- Red-green-refactor loop for each behavior
- Gate 1: Typecheck after each generated file
- Gate 2: Full test suite after each red-green-refactor cycle
- Gate 3: Lint before commit

### Attempt tracking

Update state: set `status: in_progress`, increment `attempts` counter.

If the TDD session fails (gate failure that cannot be auto-resolved after 3 gate retries within the session):

1. Increment the `attempts` counter in state.
2. If `attempts < max_attempts` (from guardrails config, default 3): retry from the beginning of Step 4 with a fully fresh context. Print: "Attempt {N} failed. Retrying with a fresh context window."
3. If `attempts >= max_attempts`: mark task as `paused`, set `pause_reason: max_attempts_reached`. Print:

```
⚠ Task {id}: {name}
  Max attempts reached ({N}/{N}).
  Last failure: {error summary}

  This task requires human review before continuing.
  To review and retry: open a fresh session, read the task definition, and run /tdd manually.
  To mark as skipped and continue the loop: /loop --skip {id}
  To override and retry: /loop --task {id} --attempts {M}
```

---

## Step 5 — Validate (Guardrail Check)

After the TDD session succeeds, run the validate skill against the current branch.

Run all checks from `skills/validate/SKILL.md`:

- Check 1: Slice Completeness
- Check 2: CONTEXT.md Term Consistency
- Check 3: Test Coverage
- Check 4: Feedback Loop State
- Check 5: Security Gate (if applicable)
- Check 7: Handoff Artifact
- Check 8: Breaking Change Detection (if applicable)
- Check 9: Deep Module Guardrail (if applicable)

### On validation pass

Print:

```
✅ Task {id}: {name} — Validation passed
   Tests: {N} passing | Coverage: {X}% | Lint: clean | Typecheck: clean
```

Proceed to Step 6.

### On validation failure (warnings only)

Print all warnings. Proceed to Step 6 — warnings do not block the loop.

### On validation failure (one or more errors)

Print the full validation output.

If `loop.pause_on_validation_failure: true` in guardrails (default: false): pause the loop and require human review.

Otherwise: attempt auto-remediation:

1. Fix CONTEXT.md term drift — replace incorrect terms with correct CONTEXT.md terms in the changed files.
2. Fix missing test files — add a stub test file if the changed source file has none.
3. Re-run validation.

If validation still fails after auto-remediation: increment `attempts`, retry from Step 4 if under `max_attempts`. If at max: mark as paused (same as max-attempts flow in Step 4).

---

## Step 6 — Handoff and PR

### 6a — Write Handoff Artifact

Run the handoff skill for the completed task.

Write to `.velocity/artifacts/handoffs/{task-id}.md`.

The handoff contains:

- What was built
- Decisions made
- Test status
- What the next task should start with

### 6b — Write RALPH Feedback Stub

Write a pre-structured RALPH annotation stub to `.velocity/artifacts/ralph/{task-id}-stub-{date}.md`.

The stub is auto-populated with the run context from this loop execution. The developer **must fill in the quality rating (1–5) after reviewing the merged PR**. `ralph-learn` skips stubs without a rating.

```markdown
# RALPH Annotation — {task-id}-stub-{date}

## Skill: loop → tdd

## Run date: {date}

## Target: {task-id} — {task name}

## Stack: {stack signals from Project Intelligence}

---

### What worked

- [Developer: fill in after reviewing the PR]

### What failed

- [Developer: fill in after reviewing the PR — use [critical], [major], or [minor] severity tags]

### What was missing

- [Developer: fill in if the skill omitted steps or context]

### Suggested fix

[Developer: optional hypothesis on root cause if failures exist]

---

## Auto-captured context

| Field             | Value                                     |
| ----------------- | ----------------------------------------- |
| Task behavior     | {task behavior from task board}           |
| Acceptance signal | {acceptance signal from task board}       |
| TDD attempts      | {N} of {max_attempts}                     |
| Validation result | {pass / warnings / auto-corrected}        |
| Auto-corrections  | {list or "none"}                          |
| PR                | #{pr-number}                              |
| Handoff artifact  | .velocity/artifacts/handoffs/{task-id}.md |

---

## Severity counts

| Severity | Count |
| -------- | ----- |
| Critical | —     |
| Major    | —     |
| Minor    | —     |

## Overall quality signal

[ ] Skip — no actionable feedback
[ ] Useful — at least one actionable finding
[ ] Valuable — multiple findings that improve the skill significantly

## Quality rating (REQUIRED — fill in after PR review)

Rating: — /5 ← Replace with 1, 2, 3, 4, or 5

- 5 = perfect output, no manual correction needed
- 4 = minor rough edges, small tweaks required
- 3 = significant gaps, developer intervened substantially
- 2 = mostly wrong, required major rework
- 1 = complete failure, output discarded

> ⚠ ralph-learn skips this stub until Rating is filled in.
```

Print:

```
📋 RALPH stub written: .velocity/artifacts/ralph/{task-id}-stub-{date}.md
   Fill in Quality Rating (1–5) after reviewing PR #{number}.
   When 5+ rated stubs exist for a skill, run /ralph-learn to extract patterns.
```

### 6c — Commit and Open PR

Commit all changes for this task:

```
git add -A
git commit -m "{task-id}: {task name}"
```

Open a PR:

```
gh pr create \
  --title "{task-id}: {task name}" \
  --body "$(cat <<'EOF'
## Task

{task behavior}

## Acceptance signal

{acceptance signal from task board}

## Test status

{test summary from TDD session}

## Guardrail validation

{validation summary}

## Handoff artifact

.velocity/artifacts/handoffs/{task-id}.md

## RALPH feedback stub

.velocity/artifacts/ralph/{task-id}-stub-{date}.md
EOF
)"
```

Update state: set `status: complete`, record PR number.

Print:

```
✅ Task {id} complete
   PR: #{number} — {title}
   Handoff: .velocity/artifacts/handoffs/{task-id}.md
   RALPH stub: .velocity/artifacts/ralph/{task-id}-stub-{date}.md
```

---

## Step 7 — Repeat or Complete

### Continue loop

After completing a task, return to Step 2 and pick the next unblocked task.

Print a progress bar after each task:

```
Loop progress: ████████░░░░  5 / 8 tasks complete
  ✅ task-1: {name} (PR #42)
  ✅ task-2: {name} (PR #43)
  ✅ task-3: {name} (PR #44)
  ✅ task-4: {name} (PR #45)
  ✅ task-5: {name} (PR #46)
  ▶ task-6: {name} — running (attempt 1)
  ⏳ task-7: {name} — pending (blocked by task-6)
  ⏳ task-8: {name} — pending
```

### Loop complete

When all tasks have status `complete`:

Update state: `Loop status: complete`.

Print:

```
✅ Loop complete

Feature board: .velocity/artifacts/tasks/{feature-id}-v{N}.md

Tasks: {N} / {N} complete

PRs opened:
  - #{N} — task-1: {name}
  - #{N} — task-2: {name}
  ...

Handoff artifacts:
  - .velocity/artifacts/handoffs/task-1.md
  - .velocity/artifacts/handoffs/task-2.md
  ...

Total attempts: {N} (across {N} tasks)
Auto-corrections: {N} (CONTEXT.md term fixes, test stub additions)
Human reviews triggered: {N}

RALPH feedback stubs: {N} stubs written to .velocity/artifacts/ralph/
  → Fill in Quality Rating (1–5) for each stub after reviewing PRs
  → ralph-learn skips stubs without a rating — ratings are required for pattern extraction
  → When 5+ rated stubs exist for a skill, run /ralph-learn to extract patterns

Next step: merge PRs in dependency order, then run /validate on main.
```

---

## Loop Configuration (from guardrails)

The loop reads its configuration from the `loop` section of `.velocity/guardrails/default.md`:

```yaml
loop:
  max_attempts: 3 # attempts before pausing for human review
  require_approval_for_all: false # true = pause before every task
  pause_on_validation_failure: false # true = pause on any validation error (not just max attempts)
  auto_remediate_term_drift: true # auto-fix CONTEXT.md term violations
  auto_remediate_missing_tests: true # auto-add test stubs for missing test files
  pr_per_task: true # open one PR per task (false = one PR per loop run)
  risk_signals: # additional risk signals beyond defaults
    - pattern: ".*payment.*" # task name or behavior regex
      level: high
    - pattern: ".*auth.*"
      level: high
```

If the `loop` section is absent from guardrails, use defaults:

| Setting                        | Default |
| ------------------------------ | ------- |
| `max_attempts`                 | 3       |
| `require_approval_for_all`     | false   |
| `pause_on_validation_failure`  | false   |
| `auto_remediate_term_drift`    | true    |
| `auto_remediate_missing_tests` | true    |
| `pr_per_task`                  | true    |

---

## Streaming Progress Output

At every state transition, print a structured progress line:

```
[loop] {ISO timestamp} | {task-id} | {status} | {detail}
```

Examples:

```
[loop] 2026-06-08T02:47:00Z | task-3 | starting  | attempt 1 of 3
[loop] 2026-06-08T02:47:15Z | task-3 | tdd       | red: it('should charge payment when card is valid')
[loop] 2026-06-08T02:47:45Z | task-3 | tdd       | green: test passing
[loop] 2026-06-08T02:48:10Z | task-3 | tdd       | refactor: collapsed formatAmount into PaymentService
[loop] 2026-06-08T02:48:30Z | task-3 | gate-1    | typecheck pass
[loop] 2026-06-08T02:48:35Z | task-3 | gate-2    | 14 tests passing
[loop] 2026-06-08T02:49:00Z | task-3 | validate  | all checks pass
[loop] 2026-06-08T02:49:05Z | task-3 | pr        | opened PR #47
[loop] 2026-06-08T02:49:06Z | task-3 | complete  | 3 / 8 tasks done
[loop] 2026-06-08T02:49:06Z | task-4 | approval  | HIGH-RISK: touches payment processing — waiting for approval
```

---

## Interruption and Recovery

If the loop is interrupted (session ends, error, manual stop):

The loop state in `.velocity/artifacts/loop/state.md` captures the last known state.

To resume: run `/loop` (no arguments). The loop reads the state file and resumes from the first non-complete task.

Any task with status `in_progress` at recovery time is treated as `pending` with its attempt count preserved. The loop retries from the beginning of Step 4 for that task.

---

## --dry-run Mode

When invoked with `--dry-run`:

Read the task board and state. Print the execution plan without running any tasks:

```
Loop dry-run — .velocity/artifacts/tasks/{feature-id}-v{N}.md

Execution plan:
  1. task-1: {name} — S complexity, no blockers → will run
  2. task-2: {name} — M complexity, blocked by task-1 → will run after task-1
  3. task-3: {name} — M complexity, blocked by task-1 → will run after task-1 (parallel with task-2)
  4. task-5: {name} — HIGH-RISK (touches auth) → will pause for approval
  5. task-4: {name} — L complexity, blocked by task-2, task-3 → will run after task-2 and task-3

Tasks already complete: 0
Tasks requiring approval: 1 (task-5)
Estimated total: 5 tasks

Run /loop to execute.
```
