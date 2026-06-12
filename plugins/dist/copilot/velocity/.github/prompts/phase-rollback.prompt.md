---
mode: agent
description: "Revert pipeline state to a prior phase when a later phase reveals a problem in earlier work. Marks the target phase as requires-revision, resets current_phase, and pre-loads rollback context for the agent that re-runs the phase. Only the target phase and downstream phases that depended on it are affected — unrelated phases are preserved. Invoke when an agent detects that an earlier phase artifact is incorrect."
---


# Phase Rollback

Revert an in-progress pipeline to an earlier phase for revision.

## Context Load

Read before starting:

1. `.velocity/sdlc/state/<work-id>.yaml` on the `velocity-state` branch — full phase history, artifacts, gate records
2. `.velocity/sdlc/pipeline.yaml` — phase sequence for this pipeline variant

---

## When to Use

Use this skill when:

- An agent executing a later phase detects that an earlier phase artifact is wrong (e.g., a CONTEXT.md term used throughout is incorrect, a root cause diagnosis was incomplete, an architectural decision in Design is invalidated by Build findings).
- A developer explicitly asks to re-open an earlier phase.

Do **not** use this skill to:

- Skip a phase (use `phase-gate --skip` instead).
- Discard all progress and restart (create a new work item instead).

---

## Step 1 — Identify Rollback Target

Determine the `target_phase_id` — the earliest phase that needs revision.

If invoked by an agent: the agent states which phase needs revision and why.

If invoked manually: ask the developer:

```
Which phase needs to be revised?
[List all phases with status=approved from the state file]

What is wrong? (brief description)
```

Validate: `target_phase_id` must have `status: approved` or `status: gate-pending`. You cannot roll back a `pending` phase (it hasn't run yet) or a `skipped` phase.

---

## Step 2 — Assess Downstream Impact

From the pipeline variant's phase sequence, identify all phases that come **after** `target_phase_id`.

Classify each downstream phase:

| Phase status | Rollback action |
|-------------|----------------|
| `approved` | Mark `requires-revision` if its artifacts depend on the target phase |
| `gate-pending` | Mark `requires-revision` |
| `in_progress` | Mark `requires-revision`; halt current execution |
| `pending` | Leave unchanged — it hasn't run yet |
| `skipped` | Leave unchanged |

**Dependency rule:** A downstream phase depends on the target phase if it lists artifacts from the target phase in its own `artifacts` array, or if it is the immediately following phase. When in doubt, mark it `requires-revision`.

Present the impact assessment to the developer before making any changes:

```markdown
## Rollback Impact Assessment

**Rolling back:** [target phase name]
**Reason:** [reason provided]

**Phases affected:**
- [target phase] → requires-revision
- [downstream phase 1] → requires-revision (depends on target artifacts)
- [downstream phase 2] → untouched (no dependency on target)

**What will be preserved:**
- [unaffected phases] remain approved

Confirm rollback? (yes / cancel)
```

Wait for explicit confirmation before proceeding.

---

## Step 3 — Apply Rollback

After developer confirms:

1. Update `phases.<target-phase>.status: requires-revision`
2. Update `phases.<target-phase>.revision_context: "<reason for rollback>"`
3. For each dependent downstream phase: update `status: requires-revision`
4. Set `current_phase: <target-phase-id>`
5. Record rollback in a `rollback_history` array on the state file (append, do not overwrite):
   ```yaml
   rollback_history:
     - rolled_back_at: <ISO timestamp>
       target_phase: <target-phase-id>
       reason: <reason>
       triggered_by: <agent-name or human>
       phases_reset: [<list of phase ids marked requires-revision>]
   ```

6. Commit to `velocity-state` branch:
   `feat(sdlc): rollback to <target-phase-id> for <work-id> — <reason>`

---

## Step 4 — Hand Off for Re-Execution

After state is updated, brief the owning agent for the target phase:

```markdown
## Rollback Complete — [target phase name] requires revision

**Work id:** [work_id]
**Phase to re-run:** [target phase name]
**Owning agent:** [owning agent]

**Rollback reason:**
[reason provided]

**Prior phase artifacts (may need updating):**
[list artifacts from phases.<target-phase>.artifacts]

**What downstream phases were reset:**
[list phases marked requires-revision]

---
To start the revised phase: run /phase-interview for [target phase name].
Prior approved phases will be used as context. The agent should focus revision
on the specific problem identified above.
```

---

## State Consistency Rules

- `rollback_history` is append-only. Never delete rollback records.
- A phase with `status: requires-revision` cannot be gated as `approved` without re-running and re-presenting at the human gate.
- The loop skill reads `requires-revision` status and routes accordingly.
- Do not mark a phase `skipped` as `requires-revision` — skipped phases were intentionally excluded.
