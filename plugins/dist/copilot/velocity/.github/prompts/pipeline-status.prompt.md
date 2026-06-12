---
mode: agent
description: "Show the current state of all in-flight SDLC pipelines for this repository. Reads all state files on the velocity-state branch and produces a compact dashboard: current phase, gate status, blocking relationships, and next action for each work item. Use /pipeline-status or /velocity-status."
---


# Pipeline Status

Report the current state of all in-flight SDLC pipelines.

## Context Load

Read before starting:

1. All `*.yaml` files in `velocity-state` branch → `.velocity/sdlc/state/` — pipeline state files
2. `.velocity/sdlc/pipeline.yaml` — phase definitions (for display names and owning agents)
3. `.velocity/sdlc/pipeline-config.yaml` — blocking rules (for cross-pipeline blocking display)

---

## Invocation

### Cursor / Claude Code

```
/pipeline-status
```

Optional argument: `/pipeline-status [work-id]` — show detailed view for a single pipeline.

### GitHub Copilot

```
velocity-status.prompt.md
```

---

## Step 1 — Fetch State Files

```bash
git fetch origin velocity-state 2>/dev/null || true
git show origin/velocity-state:.velocity/sdlc/state/ 2>/dev/null
```

List all `*.yaml` files in `.velocity/sdlc/state/` on the `velocity-state` branch.

If no files exist: print "No in-flight pipelines. Run /velocity to start one." and stop.

---

## Step 2 — Produce Dashboard

For each state file, extract the summary fields and render the dashboard.

### Summary View (default — all pipelines)

```markdown
## Velocity — Pipeline Status

Updated: [ISO timestamp]

| Work Item | Type | Pipeline | Current Phase | Status | Gate | Next Action |
|-----------|------|----------|--------------|--------|------|-------------|
| feat-create-policy | new feature | new-feature | build | in_progress | automated | Run /tdd |
| fix-payment-timeout | bug fix | bug-fix | validate | gate-pending | human | Awaiting your approval |
| refactor-policy-module | refactor | refactor | analysis | in_progress | — | Architect running |

---

### Blocking Relationships

- `feat-create-policy` is blocked by: `feat-domain-model-v2` (not yet approved)

---

### Pipelines Awaiting Human Gate

⏸ **fix-payment-timeout** — Validate phase
   Artifacts ready for review. Run `/phase-gate` to present the gate.

---

### Completed Pipelines (last 7 days)

| Work Item | Completed | PR |
|-----------|-----------|-----|
| feat-auth-refresh | 2026-06-07 | #88 |
```

---

## Step 3 — Detailed View (single pipeline)

When invoked with a `work-id` argument, show the full phase history for that pipeline.

```markdown
## Pipeline: [work_id]

Type: [work_type] | Variant: [pipeline_variant]
Started: [started_at] | Current phase: [current_phase]
Blocking: [blocking array or "none"]

### Phase History

| Phase | Status | Started | Completed | Gate | Artifacts |
|-------|--------|---------|-----------|------|-----------|
| discovery | approved | 2026-06-08T09:00Z | 2026-06-08T10:30Z | human | CONTEXT.md, ADR-042.md |
| design | approved | 2026-06-08T10:35Z | 2026-06-08T14:00Z | human | feat-create-policy-arch.md |
| planning | approved | 2026-06-08T14:05Z | 2026-06-08T15:30Z | human | feat-create-policy-tasks.md |
| build | in_progress | 2026-06-08T16:00Z | — | automated | — |
| validate | pending | — | — | — | — |
| review | pending | — | — | — | — |
| release | pending | — | — | — | — |

### Skipped Phases
[List any skipped phases with their skip_reason, or "None"]

### Rollback History
[List any rollback events from rollback_history array, or "None"]

### Flagged Assumptions
[List all assumptions from phases.*.assumptions across all phases, or "None"]

---

**Next action:** [specific instruction — e.g., "Run /tdd for the next task in the build phase" or "Run /phase-gate to present the validate phase artifacts"]
```

---

## Phase Status Symbols

Use these symbols in table output for compact readability:

| Symbol | Status |
|--------|--------|
| ✅ | approved |
| 🔄 | in_progress |
| ⏸ | gate-pending |
| ⬜ | pending |
| ⏭ | skipped |
| ⚠ | requires-revision |
| ❌ | — (not reached) |
