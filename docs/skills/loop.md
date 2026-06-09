# /loop — Autonomous Task Execution

`/loop` executes a task queue autonomously — running `/tdd`, `/validate`, and `/handoff` for each task in the correct order, pausing at high-risk decision points, and generating a PR description when complete.

## Usage

```
/loop
```

Reads the pending task queue from `.velocity/artifacts/tasks/` and executes all pending tasks.

Or target a specific feature:

```
/loop refund-support
```

## What the Loop Does

For each task in the queue (in blocking order):

1. **Open fresh context** — loads handoff from previous task + stack.md + CONTEXT.md
2. **Run `/tdd`** — red → green → refactor → feedback gates
3. **Run `/validate`** — 12-point check
4. **Run `/handoff`** — produce context reset artifact
5. **Write state** — persist progress to disk
6. **Check risk** — pause if risk > threshold, or if approval is required
7. **Advance** — move to next unblocked task

After all tasks:

8. **Generate PR description** — summarizes all changes, decisions, tests
9. **Final `/validate`** — full PR validation
10. **Report** — summary of what was built

## Pause Conditions

The loop pauses and waits for human input when:

| Condition                            | Action                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| Risk score > configured threshold    | Displays risk breakdown, asks to proceed                   |
| Task in `approval_required` category | Displays approval request, waits for explicit confirmation |
| Guardrail blocked action             | Reports block, asks how to proceed                         |
| `/validate` fails (not warns)        | Stops, shows failures, waits for resolution                |
| XL task encountered                  | Asks whether to split before proceeding                    |

When paused, the loop state is persisted. Resume:

```
/loop --resume
```

## State Persistence

The loop writes state after every task:

```
.velocity/artifacts/loop/
├── state.md              # Queue status, completed/pending/failed
├── task-001-result.md    # TDD result + handoff
├── task-002-result.md
├── ...
└── pr-description.md     # Generated after completion
```

If the assistant session crashes mid-loop, run `/loop --resume` to continue from the last completed task. The loop reads `state.md` to determine where it left off.

## Context Isolation Between Tasks

Each task runs in a simulated fresh context:

- The loop passes only the most recent handoff artifact to the next task
- It does not carry forward the full conversation history of all previous tasks
- Stack.md and CONTEXT.md are re-read for each task

This prevents context contamination and keeps each task's session lean and focused.

## Loop Configuration

```yaml
# .velocity/guardrails/default.md

loop:
  risk_threshold: 70
  max_tasks_per_run: 10
  fresh_window_per_task: true
  pr_on_completion: true
  auto_commit: false # Never auto-commits; always leaves for review
  pause_after_each_task: false # Set to true to review each task before continuing
  approval_categories:
    - infrastructure_change
    - schema_migration
    - api_contract_change
    - production_data_access
```

## Working with the Loop

### Starting the Loop

The loop is most effective when the task queue is:

- Well-specified (each task has a clear definition of done)
- Properly sized (no XL tasks — split them first)
- Dependency-ordered (blocking relationships correct)

Run `/to-tasks` before `/loop` to ensure the queue is ready.

### Reviewing Progress

During a long loop run, check progress:

```
# Check what the loop has done
/loop --status
```

Or read `.velocity/artifacts/loop/state.md` directly.

### Interrupting the Loop

If you need to interrupt a running loop, the state is already persisted from the last completed task. Just stop the session. Next time, run:

```
/loop --resume
```

The loop picks up from where it left off.

## When Not to Use the Loop

- **Exploratory work** — When you're not sure what to build yet (use `/grill-with-docs` first)
- **Architectural decisions** — When significant design decisions are still open (use `/architecture-doc` first)
- **High-risk queues** — If most tasks score >70, address the underlying risk factors before automating
- **First feature in a new codebase** — Do the first task manually to validate the setup works
