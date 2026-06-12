---
name: ralph-consumer-annotate
description: "RALPH Loop — Annotate step. Captures a quality rating and structured feedback for a completed pipeline phase. Triggered at every human gate when RALPH Loop is enabled in pipeline-config.yaml. Writes annotation to .velocity/artifacts/ralph/<phase-run-id>.md. Developers fill in feedback after reviewing artifacts; stubs are pre-populated with run context."
---


# RALPH Loop — Annotate

Capture quality feedback for a completed pipeline phase to feed the RALPH Loop learning cycle.

> **RALPH Loop** improves this project's local Velocity skill instances.
> It does not touch the Velocity platform templates.
> Annotations stay local in `.velocity/artifacts/ralph/` and are never sent to Velocity cloud.

## Context Load

Read before starting:

1. `.velocity/sdlc/state/<work-id>.yaml` on `velocity-state` branch — completed phase, artifacts, assumptions
2. `.velocity/sdlc/pipeline.yaml` — phase definition (owning agent, key skills)
3. `.velocity/artifacts/ralph/index.md` — annotation index (create if missing)

---

## When to Run

Run automatically at every human gate when `ralph_enabled: true` in `.velocity/sdlc/pipeline-config.yaml`.

The annotation prompt appears **after** the standard phase gate presentation — it is always optional and never blocks gate approval.

---

## Step 1 — Generate Phase Run ID

```
<work-id>-<phase-id>-<YYYYMMDD>-<HHmmss>
```

Example: `feat-create-policy-design-20260608-140000`

---

## Step 2 — Write Annotation Stub

Write a pre-structured annotation file to `.velocity/artifacts/ralph/<phase-run-id>.md`.

Pre-populate all fields that can be auto-captured. Leave developer-facing fields as placeholders.

```markdown
# RALPH Loop Annotation — <phase-run-id>

> Status: stub — quality rating required to activate ralph-learn

## Phase: <phase-name> ([work_id])

## Skill(s): <key_skills from pipeline.yaml>

## Agent: <owning_agent>

## Run date: <ISO date>

---

## Auto-captured context

| Field | Value |
|-------|-------|
| Work item | <work_id> |
| Phase | <phase_id> |
| Pipeline variant | <pipeline_variant> |
| Gate type | <gate_type> |
| Artifacts produced | <count> |
| Assumptions flagged | <count from phases.<phase>.assumptions> |
| Phase duration | <completed_at - started_at> |

### Artifacts

<list from phases.<phase-id>.artifacts>

### Assumptions flagged during phase interview

<list from phases.<phase-id>.assumptions, or "None">

---

## Developer Feedback
### (Fill in after reviewing artifacts — can be brief)

### What worked well
[Developer: describe what the agent got right in this phase]

### What was wrong or missing
[Developer: use severity tags — [critical], [major], [minor]]
[critical] — output was invalid or blocked progress
[major]    — significant gaps requiring substantial rework
[minor]    — small issues, easily corrected

### Suggested improvement
[Developer: optional hypothesis on root cause or fix]

---

## Quality Rating (REQUIRED — activates ralph-learn)

Rating: — /5
- 5 = perfect, no correction needed
- 4 = minor rough edges, small tweaks
- 3 = significant gaps, developer intervened substantially
- 2 = mostly wrong, required major rework
- 1 = complete failure, output discarded

Overall signal:
[ ] Skip — no actionable feedback
[ ] Useful — at least one actionable finding
[ ] Valuable — multiple findings, significant improvement potential

> ⚠ ralph-learn skips this stub until Rating is filled in.
```

---

## Step 3 — Update Annotation Index

Read or create `.velocity/artifacts/ralph/index.md`.

Append a row to the index table:

```markdown
| <phase-run-id> | <phase-name> | <work_id> | <date> | stub | — |
```

Index columns: `Run ID | Phase | Work Item | Date | Status | Rating`

Status progresses: `stub` → `rated` → `included-in-learn` → `hardened`.

---

## Step 4 — Display Inline Prompt

After the standard phase gate output, append the following:

```markdown
---
**Optional: Rate this phase output** (helps RALPH Loop improve future runs)

Quality: [ ] 5-Excellent  [ ] 4-Good  [ ] 3-Needs work  [ ] 2-Poor  [ ] 1-Failed

What could be improved? (optional)

Annotation stub written to:
.velocity/artifacts/ralph/<phase-run-id>.md
Fill in the rating at any time. Run /ralph-consumer-learn after 5+ rated annotations.
```

If the developer provides a rating and/or feedback inline:
- Write their input directly into the stub file under the Developer Feedback section.
- Update the stub `Status` from `stub` to `rated`.
- Update the index row status to `rated`.
- Commit both files: `chore(ralph): annotation <phase-run-id> rated`
