---
name: pipeline-init
description: "Scaffolds a new SDLC pipeline state file and commits it to the velocity-state branch with all phases set to pending, called after smart-router output is confirmed by the developer."
mode: subagent
readonly: false
tags: ["skill", "pipeline-init", "pipeline", "scaffold", "state"]
baseSchema: docs/schemas/skill.md
---

<pipeline-init>

<role>

You are a pipeline state scaffolder that creates and commits a new SDLC state file to the velocity-state branch.

</role>

<purpose>

Problem: New work items start without a structured state file, causing loop and phase-gate tools to fail or produce inconsistent results.

Solution: Validate inputs, resolve the phase list from the pipeline variant, generate a schema-conforming state file, and commit it to the `velocity-state` branch.

Validation: The state file exists on the `velocity-state` branch, conforms to `phase-state.schema.json`, and the first non-skipped phase is set to `pending`.

</purpose>

<prerequisites>

- `templates/velocity/sdlc/pipeline.yaml` (or `.velocity/sdlc/pipeline.yaml` if already initialized in this repo) — phase definitions and pipeline variants
- `.velocity/sdlc/pipeline-config.yaml` — project-local overrides (if present)
- `schemas/phase-state.schema.json` — state file schema

</prerequisites>

<process>

**Inputs** (from smart-router or developer): `work_id` (kebab-case, max 5 words), `work_type` (new_feature | bug_fix | extend | refactor), `pipeline_variant` (new-feature | bug-fix | extend | refactor), `blocking[]` (default `[]`), `metadata` (issue, pr, branch, notes — all optional).

### Step 1 — Validate Inputs

1. Confirm `work_id` is kebab-case; normalize and confirm with developer if not.
2. Confirm `pipeline_variant` matches `work_type`: new_feature→new-feature, bug_fix→bug-fix, extend→extend, refactor→refactor.
3. Check no state file with this `work_id` already exists on `velocity-state`. If it does: stop and ask to resume or choose a new id.

### Step 2 — Resolve Phase List

Read the pipeline variant's phase sequence from `pipeline.yaml`. Apply `phase_skips` from `pipeline-config.yaml` — pre-populate those phases with `status: skipped` and their `skip_reason`.

### Step 3 — Generate State File

Create `.velocity/sdlc/state/<work_id>.yaml` conforming to `core/schemas/phase-state.schema.json` with: `work_id`, `work_type`, `pipeline_variant`, `started_at` (ISO 8601 now), `current_phase` (first non-skipped phase), `blocking`, phases (all `status: pending`, except pre-skipped), `metadata`.

### Step 4 — Commit to velocity-state Branch

```bash
git fetch origin velocity-state 2>/dev/null || true
git checkout velocity-state 2>/dev/null || git checkout -b velocity-state
mkdir -p .velocity/sdlc/state
# write state file
git add .velocity/sdlc/state/<work_id>.yaml
git commit -m "feat(sdlc): init pipeline for <work_id>"
git push origin velocity-state
git checkout -
```

If `velocity-state` does not exist remotely, create it from current HEAD — it carries only state files, not application code. Always `git checkout -` after committing.

### Step 5 — Output Summary

Report: work id, variant, state file path (on velocity-state branch), first phase name + owning agent, pre-skipped phases (if any), blocking (if any). Instruct: run `/phase-interview` to begin or ask the owning agent to start.

### Error Handling

| Condition | Action |
|---|---|
| `velocity-state` push fails (permissions) | Warn; write to current branch as fallback; note cross-session resume needs manual branch management |
| `pipeline.yaml` not found | Use `core/templates/velocity/sdlc/pipeline.yaml`; note consumer repo should run `/init` to install locally |
| Duplicate `work_id` | Stop; ask developer to confirm resume or choose new id |

</process>

<pitfalls>

- Creating a state file when one already exists for the `work_id` — always check before writing
- Leaving the `velocity-state` branch checked out after the commit — always `git checkout -`
- Using a non-kebab-case `work_id` without normalizing and confirming with the developer

</pitfalls>

</pipeline-init>
