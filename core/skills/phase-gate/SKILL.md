---
name: phase-gate
description: >-
  Phase exit evaluation. Runs automated checks (feedback-loop, guardrails) or
  presents artifacts to the developer for human approval using the fixed gate
  schema. Advances pipeline state on approval. Records revision requests on
  rejection. Handles phase skips with justification. Invoke when a phase
  completes or when a developer wants to skip a phase.
metadata:
  surfaces:
    - agent
---

# Phase Gate

Evaluate exit criteria and advance (or hold) the pipeline at phase completion.

## Context Load

Read before starting:

1. `.velocity/sdlc/state/<work-id>.yaml` on the `velocity-state` branch — current phase, gate type, existing artifacts
2. `.velocity/sdlc/pipeline.yaml` — phase definition: `gate_type`, `exit_artifact`, next phase
3. `.velocity/guardrails/default.md` — automated gate thresholds (if present)

---

## When to Run

Run this skill when:

- The owning agent signals the current phase is complete.
- A developer explicitly wants to skip a phase.
- The loop skill advances a pipeline to its gate step.

---

## Step 1 — Read Gate Type

From `pipeline.yaml`, read `gate_type` for the current phase:

| gate_type | Path |
|-----------|------|
| `automated` | Go to Step 2 (Automated Gate) |
| `human` | Go to Step 3 (Human Gate) |
| `both` | Run Step 2 first; if automated passes, run Step 3 |

---

## Step 2 — Automated Gate

Run the following checks in order. Stop on first failure.

### 2a. Typecheck

Invoke `/feedback-loop` typecheck gate.  
Read typecheck command from `.velocity/project-context/testing.md`.  
Pass condition: exit code 0.

### 2b. Test Suite

Invoke `/feedback-loop` test gate.  
Run full test suite. Pass condition: exit code 0 and coverage ≥ threshold in `guardrails/default.md`.

### 2c. Guardrail Check

Invoke `/validate`.  
Check: CONTEXT.md term consistency, slice completeness, security gates.  
Pass condition: no blocking violations.

### 2d. Automated Gate Result

**All checks pass:**
- Update state file: `phases.<phase-id>.gate.type: automated`, `gate.automated_checks: {typecheck: pass, tests: pass, guardrails: pass}`, `gate.approved_by: automated`, `gate.approved_at: <now>`
- If `gate_type` is `automated`: advance `current_phase` to the next phase, set new phase `status: in_progress`.
- If `gate_type` is `both`: proceed to Step 3 (Human Gate).
- Commit: `feat(sdlc): automated gate passed for <work-id>/<phase-id>`

**Any check fails:**
- Log failures in state: `phases.<phase-id>.gate.automated_checks: {<check>: fail}`
- Do NOT advance the phase.
- Present specific failures with remediation to the developer.
- Phase status stays `in_progress` until the agent fixes and re-runs.

---

## Step 3 — Human Gate

Present the phase output to the developer using the fixed presentation schema.

### 3a. Collect Artifacts

Read `phases.<phase-id>.artifacts` from the state file.  
Read any flagged assumptions from `phases.<phase-id>.assumptions`.

### 3b. Present Gate

```markdown
## Phase Complete: [Phase Name]

**What was produced:**
- [Artifact 1 — one-line description]
- [Artifact 2 — one-line description]
[... list all artifacts from phases.<phase-id>.artifacts]

**Key decisions made:**
- [Decision 1 with brief rationale]
- [Decision 2 with brief rationale]

⚠ **Assumptions flagged during phase interview:**
[List each flagged assumption, or "None" if clean]

**What I'm asking you to approve:**
[Clear one-sentence statement of what human approval covers for this phase]

**What happens next if you approve:**
Next phase: **[next phase name]**
Owning agent: [owning agent]

**If you want changes:**
Tell me what to revise. I'll update the artifacts and re-present.
Max [N] revision cycles before escalation.
```

### 3c. Handle Developer Response

**Approval** (developer says yes / approves / LGTM):
- Update state file:
  - `phases.<phase-id>.status: approved`
  - `phases.<phase-id>.completed_at: <now>`
  - `phases.<phase-id>.gate.type: human`
  - `phases.<phase-id>.gate.approved_by: human`
  - `phases.<phase-id>.gate.approved_at: <now>`
- Advance `current_phase` to next phase; set new phase `status: in_progress`.
- Commit: `feat(sdlc): human gate approved for <work-id>/<phase-id>`
- Confirm to developer: "Approved. Moving to **[next phase name]**."

**Revision request** (developer provides feedback):
- Record in state: `phases.<phase-id>.revision_request: "<developer feedback>"`
- Phase status stays `requires-revision`.
- Agent revises artifacts and re-runs Step 3b.
- Track revision count. If count ≥ `max_revision_attempts` from `pipeline-config.yaml`: stop and escalate — "We've reached the revision limit. Please review manually and tell me how to proceed."

---

## Step 4 — Phase Skip

When invoked with `--skip "<justification>"`:

1. Confirm `skippable: true` in pipeline.yaml for this phase. If `skippable: false`: reject skip — "This phase cannot be skipped. It is required by the pipeline definition."

2. Update state file:
   - `phases.<phase-id>.status: skipped`
   - `phases.<phase-id>.skip_reason: "<justification>"`
   - `phases.<phase-id>.completed_at: <now>`

3. Advance `current_phase` to next phase.

4. Commit: `feat(sdlc): phase <phase-id> skipped for <work-id> — <justification>`

5. Surface the skip at the next human gate:

```markdown
⚠ **Skipped phase:** [phase name]
**Reason:** [justification]
```

---

## State File Update Pattern

All state mutations follow this pattern:

1. `git fetch origin velocity-state`
2. `git checkout velocity-state`
3. Edit `.velocity/sdlc/state/<work-id>.yaml`
4. `git add` + `git commit` + `git push origin velocity-state`
5. `git checkout -` (return to feature branch)

Do not leave the `velocity-state` branch checked out after update.
