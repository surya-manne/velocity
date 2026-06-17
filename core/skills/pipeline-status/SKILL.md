---
name: pipeline-status
description: "Shows the current state of all in-flight SDLC pipelines by reading state files on the velocity-state branch and producing a compact dashboard with current phase, gate status, blocking relationships, and next action per work item."
mode: subagent
readonly: false
tags: ["skill", "pipeline-status", "pipeline", "dashboard", "status"]
baseSchema: docs/schemas/skill.md
---

<pipeline-status>

<role>

You are a pipeline status reporter that produces a compact dashboard of all in-flight SDLC pipelines.

</role>

<purpose>

Problem: Developers and agents have no quick way to see the state of all in-flight pipelines, blocking relationships, and which items need human gate reviews.

Solution: Read all state files on the `velocity-state` branch and render a structured dashboard with current phase, gate status, blocking relationships, and next action for each work item.

Validation: The dashboard accurately reflects the current state of all `*.yaml` files in `.velocity/sdlc/state/`; blocking relationships are correctly resolved from the fetched branch.

</purpose>

<prerequisites>

- All `*.yaml` files in `velocity-state` branch → `.velocity/sdlc/state/` — pipeline state files
- `.velocity/sdlc/pipeline.yaml` — phase definitions (for display names and owning agents)
- `.velocity/sdlc/pipeline-config.yaml` — blocking rules (for cross-pipeline blocking display)

</prerequisites>

<process>

Optional argument: `[work-id]` — show detailed view for a single pipeline instead of summary.

### Step 1 — Fetch State Files

```bash
git fetch origin velocity-state 2>/dev/null || true
```

List all `*.yaml` files in `.velocity/sdlc/state/` on the `velocity-state` branch. If none exist: print "No in-flight pipelines. Run /velocity to start one." and stop.

### Step 2 — Summary Dashboard (default — all pipelines)

Render a table with columns: Work Item | Type | Pipeline | Current Phase | Status | Gate | Next Action.

Follow with three sections:
- **Blocking Relationships** — list work items blocked by others, with blocker `work-id`
- **Pipelines Awaiting Human Gate** — list each with phase name and instruction to run `/phase-gate`
- **Completed Pipelines (last 7 days)** — work item, completed date, PR number

Use these symbols for status: ✅ approved · 🔄 in_progress · ⏸ gate-pending · ⬜ pending · ⏭ skipped · ⚠ requires-revision

### Step 3 — Detailed View (single pipeline, `[work-id]` argument)

Show: work_id, work_type, pipeline_variant, started_at, current_phase, blocking. Then a phase history table (Phase | Status | Started | Completed | Gate | Artifacts). Then separate sections: Skipped Phases (with skip_reason), Rollback History (from `rollback_history` array), Flagged Assumptions (from `phases.*.assumptions`). End with a specific **Next action** instruction.

</process>

<pitfalls>

- Reporting stale state — always `git fetch origin velocity-state` before reading state files
- Omitting skipped phases or rollback history from the detailed single-pipeline view
- Showing a summary view when the developer requested a specific `work-id` detailed view

</pitfalls>

</pipeline-status>
