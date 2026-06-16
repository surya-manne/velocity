---
name: ralph
description: >-
  RALPH Loop navigation. Run → Annotate → Learn → Propose → Harden.
  Velocity's internal self-improvement cycle. Used exclusively to build and
  improve the Velocity platform. Not shipped to consumer repositories.
  Entry point for the four RALPH sub-skills.
metadata:
  surfaces:
    - agent
  internal: true
---

# RALPH Loop

> **Internal to the Velocity project. Not shipped to consumer repositories.**

RALPH = **R**un → **A**nnotate → **L**earn → **P**ropose → **H**arden

The RALPH Loop is Velocity's feedback mechanism for improving its own skills, agent configs, and guardrails. Every time a Velocity skill is evaluated on a test scenario, the output is annotated. Annotations accumulate. Patterns are extracted. Improvements are proposed and applied. Velocity becomes measurably better with every development cycle.

---

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/index.md` — current annotation index, cadence status, skill coverage table

---

## The Four Skills

| Command           | When to Run                                                                            | Output                                                             |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/ralph-annotate` | After evaluating any Velocity skill output on a test scenario or the Velocity codebase | `.velocity/artifacts/ralph/{run-id}.md`                            |
| `/ralph-learn`    | When 5+ annotations exist for a skill                                                  | `.velocity/artifacts/ralph/learn-{skill}-{date}.md`                |
| `/ralph-propose`  | After ralph-learn produces a pattern summary                                           | `.velocity/artifacts/ralph/propose-{skill}-{date}.md`              |
| `/ralph-harden`   | After ralph-propose proposals are reviewed and approved                                | Files modified + `.velocity/artifacts/ralph/harden-log.md` updated |

---

## The Loop

```text
R — Run
    Engineer Agent runs a skill on the Velocity codebase or a test scenario
    (e.g. /init generates a Cursor adapter for a test repo)
        ↓
A — Annotate
    /ralph-annotate — structured feedback capture
    Written to .velocity/artifacts/ralph/{run-id}.md
    Captures: what worked, what failed, what was missing, severity
        ↓
L — Learn (when 5+ annotations for the same skill)
    /ralph-learn — extract recurring failure patterns across N annotated runs
    Written to .velocity/artifacts/ralph/learn-{skill-name}-{date}.md
        ↓
P — Propose
    /ralph-propose — draft targeted improvements with before/after diffs
    Written to .velocity/artifacts/ralph/propose-{skill-name}-{date}.md
    Developer reviews: approve / modify / reject each proposal
        ↓
H — Harden
    /ralph-harden — apply approved proposals, regenerate affected assets
    Updates .velocity/artifacts/ralph/harden-log.md
    Note: run Cursor Adapter delta to propagate changes to .cursor/ assets
```

---

## Cycle Cadence

### Batch thresholds

| Setting                                                            | Value  |
| ------------------------------------------------------------------ | ------ |
| Minimum annotations before ralph-learn                             | **5**  |
| Maximum annotations per learn batch                                | **20** |
| Annotations marked Skip are excluded from learn batches            |        |
| **Annotations without a Quality Rating are excluded from batches** |        |

### Recommended cadence for the Velocity team

```text
Daily / per-session:
  Run /ralph-annotate after evaluating any skill output on a test repo.
  Loop auto-generates stubs — fill in quality signal after reviewing PRs.

Weekly (or when 5+ annotations exist for a skill):
  Run /ralph-learn for the target skill.
  Review patterns; identify the top 1–3 priority improvements.

Per sprint (or when 3+ high-priority patterns identified):
  Run /ralph-propose → review proposals → run /ralph-harden.
  Run Cursor Adapter delta to propagate changes.
  Re-run the skill against the original test scenario to verify improvement.

Quarterly:
  Review harden-log.md for cumulative quality trends.
  Update the Skill Coverage table in .velocity/artifacts/ralph/index.md.
```

---

## What RALPH Improves

| Artifact                   | How it improves                                           |
| -------------------------- | --------------------------------------------------------- |
| Skill templates            | Recurring output failures → targeted prompt refinements   |
| Agent system prompts       | Missing context patterns → additional context load steps  |
| Guardrail definitions      | False positives / false negatives → threshold adjustments |
| Adapter generators         | Edge case failures → explicit handling added              |
| Project Intelligence rules | Mis-detected stack signals → fingerprinting tightened     |
| Grill Me question banks    | Vague questions → sharpened or replaced                   |

---

## Integration with the Autonomous Loop

When `/loop` completes a task, it automatically generates a RALPH feedback stub at `.velocity/artifacts/ralph/{task-id}-stub-{date}.md`.

The stub is pre-populated with run context (task, stack, TDD attempts, validation result, PR number). The developer **must fill in the `Quality Rating` field (1–5) after reviewing the PR** — this is the primary quality signal for pattern extraction.

**`ralph-learn` skips stubs where `Quality rating:` is still `— /5` (unfilled).** A stub with an empty rating is a partial annotation that provides no signal for learning.

When 5+ rated stubs exist for the `loop → tdd` skill chain, run `/ralph-learn` to extract patterns from the automated development runs.

---

## Scope Constraint

RALPH annotations, learn reports, proposal bundles, and the harden log live exclusively in `.velocity/artifacts/ralph/` in the Velocity development repository.

Nothing in the RALPH directory is included in consumer repository templates.

The Velocity `/init` skill and `/sync` command do not copy `.velocity/artifacts/ralph/` to consumer repositories.
