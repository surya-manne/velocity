---
name: ralph-annotate
description: >-
  Capture structured feedback after a Velocity skill run. Records what worked,
  what failed, and what was missing. Used internally to build the Velocity
  platform. Not shipped to consumer repositories. Run immediately after
  evaluating a skill's output on the Velocity codebase or a test scenario.
metadata:
  surfaces:
    - agent
---

# RALPH Annotate

Capture structured feedback from this Velocity skill run.

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/` — existing annotations (for context on prior runs of the same skill)

---

## Purpose

RALPH Annotate is the first step of the RALPH loop.

Run this skill after evaluating any Velocity skill output — whether in a test scenario or during platform development. The annotation captures the signal that makes Velocity better over time.

One annotation per run. Honest, specific, actionable.

---

## Protocol

Ask the developer:

1. "Which skill was just run?"
2. "What was the test scenario or target repository?"
3. "Walk me through what worked, what failed, and what was missing."

Interview with specific follow-ups for each failure:

- "What exactly failed? What did the output do vs. what you expected?"
- "Is this a wording issue, a missing step, a wrong context load, or a logic gap in the skill?"
- "How severe is this? Would it block a developer from using this skill, or is it a rough edge?"

---

## Annotation Format

Write to `.velocity/artifacts/ralph/{run-id}.md`:

Generate `{run-id}` as: `{skill-name}-{YYYY-MM-DD}-{N}` (where N is the run count for that skill on that date).

```markdown
# RALPH Annotation — {run-id}

## Skill: {skill-name}

## Run date: {date}

## Target: {test repo / scenario description}

## Stack: {stack signals from the test scenario}

---

### What worked

- {Specific thing that produced good output}
- {Specific thing that worked}

### What failed

- **[critical]** {Specific failure description}
  - Expected: {what should have happened}
  - Actual: {what happened instead}
  - Hypothesis: {suspected root cause}

- **[major]** {Failure description}
  - Expected: ...
  - Actual: ...

- **[minor]** {Minor issue}

### What was missing

- {Thing the skill should have done but did not}
- {Context the skill needed but did not load}

### Suggested fix

{Developer's hypothesis on how to improve the skill template or agent config that caused this}

---

## Severity counts

| Severity | Count |
| -------- | ----- |
| Critical | {N}   |
| Major    | {N}   |
| Minor    | {N}   |

## Overall quality signal

[ ] Skip — no actionable feedback
[ ] Useful — at least one actionable finding
[ ] Valuable — multiple findings that improve the skill significantly

## Quality rating (REQUIRED)

Rating: {1–5}

- 5 = perfect output, no manual correction needed
- 4 = minor rough edges, small tweaks required
- 3 = significant gaps, developer intervened substantially
- 2 = mostly wrong, required major rework
- 1 = complete failure, output discarded

> This field is required. ralph-learn skips annotations without a rating.
```

---

## After Annotation

"Annotation written to `.velocity/artifacts/ralph/{run-id}.md`."

"When 5+ annotations exist for this skill, run `/ralph-learn` to extract patterns and propose improvements."

Update `.velocity/knowledge-base/index.md` with this annotation entry.
