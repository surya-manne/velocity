---
name: loop
description: "Autonomous agent loop that drives features through SDLC pipeline phases or task boards end-to-end, pausing only at human gates, with each phase or task in a fresh context window."
mode: subagent
readonly: false
tags: ["skill", "loop", "pipeline", "tdd", "automation"]
baseSchema: docs/schemas/skill.md
---

<loop>

<role>

You are an autonomous agent loop executor that drives features through SDLC pipeline phases or task boards end-to-end.

</role>

<purpose>

Problem: Implementation cycles require repeated manual execution of TDD, validation, handoff, and PR opening for each task, causing inconsistency and dropped steps.

Solution: Automate the inner implementation cycle across pipeline phases or feature tasks, isolating each task in a fresh context window, pausing only at human gates.

Validation: All tasks in the board reach `complete` status with PRs, handoffs, and RALPH stubs written; or all pipeline phases reach `approved` status.

</purpose>

<prerequisites>

- `velocity-state` branch → `.velocity/sdlc/state/` — scan for in-flight pipeline state files (pipeline mode)
- `.velocity/artifacts/tasks/{feature-id}-v{N}.md` — the task board to execute (task mode; pass as argument or read from `.velocity/artifacts/loop/state.md`)
- `.velocity/guardrails/default.md` — guardrail config including `loop` section
- `.velocity/artifacts/loop/state.md` — loop state file (task mode; create if missing)
- CONTEXT.md from `.velocity/context-map.md`
- `.velocity/sdlc/pipeline-config.yaml` — RALPH enabled flag and max_revision_attempts (pipeline mode)

</prerequisites>

<process>

Detect mode, then run the inner cycle autonomously, pausing only at human gates. Each task or phase runs in a fresh context window — never carry implementation context between them; only the state file is carried forward.

**Mode detection.** Scan the `velocity-state` branch for `.velocity/sdlc/state/*.yaml` phases with `status: in_progress` or `gate-pending`. Found → Pipeline Mode. None → Task Mode. Both → prefer Pipeline, inform the developer, offer to switch. `--pipeline` / `--tasks {feature-id}` force a mode.

## Task Mode

1. **Load & validate the board.** Read the task board (argument or `state.md`). Confirm it is readable, every task has a `Blocked by` relation, and the dependency graph is acyclic — halt and report if a cycle exists.
2. **Pick the next task.** Choose a `pending` task whose blockers are all `complete`. Tie-break: no blockers first, then lower complexity (S<M<L), then board order. If all remaining are blocked or paused, pause and report; if all complete, go to step 7.
3. **Human gate (high-risk only).** Pause and require explicit approval when a task touches auth, PII, payments, public API contracts, DB schema, or crypto/secrets, is marked `risk: high`, or when `loop.require_approval_for_all` is set. Low-risk tasks proceed automatically.
4. **Run TDD** — USE SKILL `tdd` in a fresh context window. Pass only the task block, CONTEXT.md path, testing.md path, and the previous task's handoff. Increment `attempts`. On unrecoverable gate failure: retry with fresh context if under `max_attempts`; otherwise pause with `pause_reason: max_attempts_reached`.
5. **Validate** — USE SKILL `validate`. Warnings do not block. On errors: pause if `loop.pause_on_validation_failure`; else auto-remediate term drift and missing test stubs per config, re-validate, and retry from step 4 if still failing.
6. **Handoff & PR.** USE SKILL `handoff` for the handoff artifact, then write the RALPH stub (USE SKILL `ralph-consumer-annotate`) without blocking on its rating. Commit and open one PR per task (or one per run when `pr_per_task: false`). Record the PR number and set `status: complete`.
7. **Repeat or complete.** Return to step 2 until the board is done, then set `Loop status: complete` and report PRs, handoffs, and any unrated RALPH stubs. Next: merge PRs in dependency order, then run /validate on main.

## Pipeline Mode

1. **Select a phase.** From all in-flight state files, prefer `gate-pending` phases (ready for review), then unblocked `in_progress` phases (no `blocking` work_id below `approved`), then earliest `started_at`. Skip and report blocked pipelines.
2. **Run the phase** in a fresh context window: `/phase-interview` (entry) → owning agent executes → USE SKILL `phase-gate` (automated checks). On pass, write artifacts and advance to `gate-pending`.
3. **Human gate.** Suspend and surface the phase via `phase-gate`. On approval, advance to the next phase and, if `ralph_enabled`, write a RALPH stub (USE SKILL `ralph-consumer-annotate`) without blocking. On rejection, the agent revises up to `max_revision_attempts` and re-presents.
4. **Repeat** until every phase is `approved` or `skipped`, then report and direct the developer to `/pipeline-status`.

## State & configuration

- **State file** `.velocity/artifacts/loop/state.md` (create if missing) tracks per-task status, attempts, PR, and a required 1–5 quality rating, plus loop status / pause reason / next task. Write it before and after every task so an interrupted loop resumes from the first non-complete task (`in_progress` → treated as `pending`, attempts preserved). Warn on `complete` tasks with missing ratings, since `ralph-learn` skips unrated stubs.
- **Config** comes from the `loop` section of `.velocity/guardrails/default.md`; defaults when absent: `max_attempts`=3, `require_approval_for_all`=false, `pause_on_validation_failure`=false, `auto_remediate_term_drift`=true, `auto_remediate_missing_tests`=true, `pr_per_task`=true, plus optional `risk_signals` regexes.
- **Flags:** `--dry-run` prints the execution plan (order, blockers, approval pauses) without running tasks; `--task {id}` starts from a specific task; `--attempts {N}` overrides `max_attempts`.

Emit a concise progress line at each state transition; keep output minimal.

</process>

<pitfalls>

- Carrying context between tasks — each task must run in a fully isolated fresh context window
- Proceeding past a high-risk task without human approval
- Marking a task complete without a quality rating in the loop state file
- Leaving `in_progress` task status without updating state on session interruption

</pitfalls>

<skills_available>

- USE SKILL `tdd` for each task execution in task mode
- USE SKILL `validate` after each TDD session completes
- USE SKILL `handoff` after validation passes
- USE SKILL `phase-gate` at each phase completion in pipeline mode
- USE SKILL `ralph-consumer-annotate` after each approved phase when `ralph_enabled: true`

</skills_available>

</loop>
