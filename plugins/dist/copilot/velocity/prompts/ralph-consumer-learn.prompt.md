---
mode: agent
description: "RALPH Loop — Learn step. Reads 5+ rated annotations for a skill or phase and extracts recurring failure patterns, consistent gaps, and quality regressions. Scoped to this project's deployed skill instances only. Produces a learn artifact at .velocity/artifacts/ralph/learn-<skill>-<date>.md. Run after 5+ annotations have been rated for the same skill or phase."
---


# RALPH Loop — Learn

Extract recurring patterns from consumer annotations to identify improvement opportunities.

> **Scope:** This skill reads annotations scoped to this project only.
> It never reads or modifies the Velocity platform skill templates.

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/index.md` — annotation index, filter by skill/phase
2. All annotation files with `status: rated` for the target skill — read full content
3. `.velocity/sdlc/pipeline.yaml` — phase and skill context
4. `.velocity/skills/<skill-id>.md` — the currently deployed local skill instance (if present)

---

## When to Run

Run when 5 or more rated annotations exist for the same skill or phase.

Invoke as:
```
/ralph-consumer-learn [skill-id | phase-id]
```

If no argument provided: scan the index for any skill/phase with 5+ rated, unprocessed annotations.

---

## Step 1 — Select Annotation Batch

From the index, collect all annotations where:
- `status: rated` (not `stub`, not `included-in-learn`)
- Skill or phase matches the target
- Maximum 20 per batch (process oldest first)

If fewer than 5 qualifying annotations exist: stop and report:
```
Not enough rated annotations to run ralph-learn for [skill/phase].
Current count: [N]. Threshold: 5.
Run /ralph-consumer-annotate after future phase completions to build up annotations.
```

---

## Step 2 — Extract Patterns

Read all annotations in the batch. Identify:

### Recurring Failures (appear in 3+ annotations)

For each recurring failure:
- **What failed:** description of the agent behavior
- **Severity distribution:** how many critical / major / minor instances
- **Reproduction pattern:** what context or inputs triggered it
- **Frequency:** N of M annotations

### Consistent Gaps (appear in 2+ annotations)

Things the agent consistently omitted or underproduced.

### Quality Trends

Calculate average rating for this batch. Compare to prior batch if a previous learn artifact exists.

```
Average rating (this batch): X.X / 5
Prior batch average: X.X / 5
Trend: improving / stable / degrading
```

### Positive Patterns (appear in 2+ annotations under "What worked")

What the agent reliably gets right — do not accidentally break these in proposals.

---

## Step 3 — Write Learn Artifact

Write to: `.velocity/artifacts/ralph/learn-<skill-or-phase>-<YYYYMMDD>.md`

```markdown
# RALPH Loop Learn — <skill-or-phase> — <date>

## Annotation batch

| Annotations processed | Date range | Average rating | Trend |
|----------------------|------------|---------------|-------|
| <N> | <start> – <end> | <X.X>/5 | improving / stable / degrading |

---

## Recurring Failures

### F1 — <short title>
**Frequency:** N of M annotations
**Severity:** [critical N] [major N] [minor N]
**Description:** <what the agent did wrong>
**Reproduction:** <what input/context triggers this>
**Sample annotation:** <phase-run-id>

### F2 — <short title>
[...]

---

## Consistent Gaps

### G1 — <short title>
**Frequency:** N of M annotations
**Description:** <what was consistently missing>

---

## Positive Patterns (preserve in proposals)

- <P1>: <description>
- <P2>: <description>

---

## Proposed improvement areas

Based on the patterns above, the following areas of the skill definition are candidates for improvement:

1. **<area>** — [F1, G1] — <one-line description of the change needed>
2. **<area>** — [F2] — <one-line description>

> Next step: run /ralph-consumer-propose to draft targeted improvements.
```

---

## Step 4 — Update Index

Mark each processed annotation in the index: update `status` from `rated` to `included-in-learn`.

Record the learn artifact in the index:

```markdown
## Learn Artifacts

| File | Skill/Phase | Date | Annotations | Avg Rating | Proposals generated |
|------|-------------|------|-------------|-----------|---------------------|
| learn-<skill>-<date>.md | <skill> | <date> | <N> | <X.X>/5 | pending |
```

Commit: `chore(ralph): learn artifact for <skill> — <N> annotations processed`
