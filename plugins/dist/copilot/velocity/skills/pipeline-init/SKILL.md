---
name: pipeline-init
description: "Scaffold a new SDLC pipeline state file and commit it to the velocity-state branch. Called after smart-router output is confirmed by the developer. Creates <work-id>.yaml in .velocity/sdlc/state/ with all phases set to pending. Does not modify the feature branch."
---


# Pipeline Init

Scaffold the pipeline state file for a new work item and persist it to the `velocity-state` branch.

## Context Load

Read before starting:

1. `templates/velocity/sdlc/pipeline.yaml` (or `.velocity/sdlc/pipeline.yaml` if already initialized in this repo) — phase definitions and pipeline variants
2. `.velocity/sdlc/pipeline-config.yaml` — project-local overrides (if present)
3. `schemas/phase-state.schema.json` — state file schema

---

## Inputs

Receive from the caller (smart-router or developer directly):

| Input | Type | Description |
|-------|------|-------------|
| `work_id` | string | Kebab-case identifier. Max 5 words. Examples: `feat-create-policy`, `fix-payment-timeout` |
| `work_type` | enum | `new_feature` \| `bug_fix` \| `extend` \| `refactor` |
| `pipeline_variant` | enum | `new-feature` \| `bug-fix` \| `extend` \| `refactor` |
| `blocking` | string[] | Optional. Work ids that must complete before this one can advance. Default: `[]` |
| `metadata` | object | Optional. `issue`, `pr`, `branch`, `notes` |

---

## Step 1 — Validate Inputs

1. Confirm `work_id` is kebab-case. If not, normalize it and confirm with developer.
2. Confirm `pipeline_variant` matches `work_type`:

| work_type | expected pipeline_variant |
|-----------|--------------------------|
| new_feature | new-feature |
| bug_fix | bug-fix |
| extend | extend |
| refactor | refactor |

3. Check that no state file with this `work_id` already exists on the `velocity-state` branch.
   If it does: stop and ask — "A state file for `[work_id]` already exists. Resume it with `/velocity`, or use a different work id?"

---

## Step 2 — Resolve Phase List

Read the pipeline variant's phase sequence from `pipeline.yaml`.

Apply any `phase_skips` from `pipeline-config.yaml` — pre-populate those phases with `status: skipped` and their `skip_reason`.

---

## Step 3 — Generate State File

Create the state file content conforming to `schemas/phase-state.schema.json`.

```yaml
work_id: <work_id>
work_type: <work_type>
pipeline_variant: <pipeline_variant>
started_at: <ISO 8601 now>
current_phase: <first non-skipped phase id>
blocking: <blocking array or []>
phases:
  <phase_id>:
    status: pending
    artifacts: []
  # ... one entry per phase in the variant
metadata:
  branch: <current git branch>
  # ... any provided metadata fields
```

For pre-skipped phases (from `pipeline-config.yaml`):

```yaml
  <phase_id>:
    status: skipped
    skip_reason: "<justification from pipeline-config.yaml>"
    artifacts: []
```

---

## Step 4 — Commit to velocity-state Branch

```bash
# Fetch or create the velocity-state branch
git fetch origin velocity-state 2>/dev/null || true
git checkout velocity-state 2>/dev/null || git checkout -b velocity-state

# Write the state file
mkdir -p .velocity/sdlc/state
# Write content to .velocity/sdlc/state/<work_id>.yaml

git add .velocity/sdlc/state/<work_id>.yaml
git commit -m "feat(sdlc): init pipeline for <work_id>"
git push origin velocity-state

# Return to original branch
git checkout -
```

If the `velocity-state` branch does not exist remotely, create it from the current HEAD detached — it carries only state files, not application code.

---

## Step 5 — Output Summary

After successful commit:

```markdown
## Pipeline Initialized

**Work id:** [work_id]
**Variant:** [pipeline_variant]
**State file:** .velocity/sdlc/state/[work_id].yaml (on velocity-state branch)
**First phase:** [first phase name] — owned by [owning agent]

**Pre-skipped phases:** [list if any, with justifications]
**Blocking:** [list if any, or "none"]

---
Ready to start the **[first phase name]** phase.
Run `/phase-interview` to begin, or ask the [owning agent] to start.
```

---

## Error Handling

| Condition | Action |
|-----------|--------|
| `velocity-state` branch push fails (permissions) | Warn developer; write state file to current branch at same path as fallback; note that cross-session resume will require manual branch management |
| `pipeline.yaml` not found | Use the `templates/velocity/sdlc/pipeline.yaml` from the Velocity repo as default; note that the consumer repo should run `/init` to install it locally |
| Duplicate `work_id` | Stop; ask developer to confirm resume or choose a new id |
