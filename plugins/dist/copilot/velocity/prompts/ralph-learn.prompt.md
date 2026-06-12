---
mode: agent
description: "Extract recurring failure patterns from accumulated RALPH annotations. Process N annotations for a skill and surface the highest-priority improvement opportunities. Run when 5+ annotations exist for a skill. Produces a pattern summary that feeds ralph-propose."
---


# RALPH Learn

Extract patterns from accumulated annotations and surface improvement opportunities.

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/` — all annotation files for the target skill
2. `.velocity/knowledge-base/index.md` — to identify which annotations are available

---

## Step 1 — Select Annotations to Process

Ask: "Which skill are we analyzing? Or process all skills?"

For the target skill, list all unprocessed annotations from `.velocity/artifacts/ralph/` with their quality signal and severity counts.

Confirm the batch:

- Minimum 5 annotations for a reliable pattern (warn if fewer)
- Maximum 20 annotations per batch (mark processed after batch)

---

## Step 2 — Extract Failure Patterns

Read all selected annotations. For each failure item, extract:

- The skill step or section involved
- The type of failure: missing context load, wrong instruction, ambiguous output, incorrect step order, missing step, wrong output format
- The stack signals that were active when it failed (to detect stack-specific issues)
- Severity

Cluster failures into patterns:

```
Pattern: {Short descriptive name}
  Occurrences: {N} out of {total} runs
  Steps affected: {skill section(s)}
  Stacks where failure occurred: {list}
  Example: Run {run-id} — {failure description}
  Root cause hypothesis: {what caused it}
  Severity distribution: critical={N}, major={N}, minor={N}
```

---

## Step 3 — Rank Patterns

Rank patterns by:

1. **Critical failures first** — skill produces actively wrong output
2. **High frequency** — pattern appears in 3+ runs
3. **Cross-stack patterns** — failures that occur regardless of stack (systemic issue)
4. **Stack-specific patterns** — failures only with certain stacks (targeted fix)
5. **Minor/rare patterns** — low-effort fixes that affect few runs

---

## Step 4 — Write Learn Report

Write to `.velocity/artifacts/ralph/learn-{skill-name}-{date}.md`:

```markdown
# RALPH Learn Report — {skill-name}

## Date: {date}

## Annotations processed: {N} ({run-id list})

---

## Pattern Summary

### Pattern 1: {Name} — Priority: High | Medium | Low

**Type:** {missing-context | wrong-instruction | ambiguous-output | wrong-order | missing-step | wrong-format}

**Frequency:** {N}/{total} runs ({%})

**Stacks affected:** {list, or "all stacks"}

**Description:** {What goes wrong, specifically}

**Evidence:**

- Run {run-id}: {specific failure instance}
- Run {run-id}: {specific failure instance}

**Root cause hypothesis:** {What in the current skill template causes this}

**Proposed fix type:** {context-load-addition | instruction-clarification | output-format-change | step-addition | step-removal | reorder}

---

[Repeat for each pattern]

---

## Patterns to Skip

{Patterns that are edge cases, duplicate, or not actionable — briefly explain why}

---

## Recommendation

Run `/ralph-propose` to draft targeted improvements for the {N} high/medium priority patterns.
```

---

## Step 5 — Mark Processed Annotations

Add a `processed: true` and `learn_batch: {date}` header to each processed annotation file. This prevents double-counting in future batches.
