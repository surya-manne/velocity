---
name: context-merge
description: >-
  Reconcile pending CONTEXT.md proposals from multiple grill-with-docs sessions.
  Reads current CONTEXT.md and all pending proposals, proposes a reconciled
  version, and archives proposals after approval. Invoke when two or more
  context proposals exist for the same bounded context.
metadata:
  surfaces:
    - agent
---

# Context Merge

Reconcile pending CONTEXT.md proposals for this bounded context.

## Context Load

Read before starting:

1. CONTEXT.md at the path from `.velocity/context-map.md` for the target context
2. All files in `.velocity/artifacts/context-proposals/` for the target bounded context

---

## Purpose

`grill-with-docs` does not overwrite CONTEXT.md directly — it produces proposals.

When two or more developers have run `grill-with-docs` sessions concurrently, their proposals may contain:

- New terms that do not conflict (safe to merge automatically)
- Modified definitions for the same term (requires resolution)
- Contradictory decisions (requires explicit developer review)

This skill merges them safely.

---

## Step 1 — Inventory Proposals

List all pending proposals for this bounded context:

| Proposal file | Date   | Session ID | New terms | Modified terms | Resolved decisions |
| ------------- | ------ | ---------- | --------- | -------------- | ------------------ |
| {path}        | {date} | {id}       | {N}       | {N}            | {N}                |

---

## Step 2 — Classify Each Change

For each proposed change, classify as:

**Auto-merge (safe):**

- New term not present in current CONTEXT.md and not in any other proposal
- Decision resolution not contradicted by any other proposal

**Conflict (requires resolution):**

- Same term modified by two or more proposals with different definitions
- Decision resolutions that contradict each other
- New term in one proposal that overlaps with an existing term in CONTEXT.md

---

## Step 3 — Present Conflicts for Resolution

For each conflict, present:

```
CONFLICT: Term "{term}"

Current definition: {current}

Proposal A ({session-id}, {date}): {proposed definition}

Proposal B ({session-id}, {date}): {proposed definition}

Recommended resolution: {your recommendation with reasoning}

Developer: Accept A / Accept B / Merge as: {your suggestion} / Write custom definition
```

Wait for the developer to resolve each conflict before proceeding.

---

## Step 4 — Produce Reconciled CONTEXT.md

After all conflicts are resolved, produce the reconciled CONTEXT.md:

- Apply all auto-merged changes
- Apply developer-approved conflict resolutions
- Preserve existing terms that are not modified
- Maintain fixed heading structure: `## Terms`, `## Decisions`, `## Bounded Context Relationships`, `## Out of Scope`

Show the full diff for developer review:

```
Changes:
+ Added: {N} new terms
~ Modified: {N} existing terms
+ Added: {N} new decisions
```

---

## Step 5 — Confirmation and Archive

Ask: "Approve this reconciled CONTEXT.md? (yes / modify)"

If approved:

1. Write the reconciled CONTEXT.md to its path
2. Archive all merged proposals to `.velocity/artifacts/context-proposals/archive/`
3. Update `.velocity/knowledge-base/index.md` with the updated CONTEXT.md

Say: "CONTEXT.md updated. {N} proposals merged and archived."

---

## Audit Trail

Each archived proposal retains the original proposal content and the merge session ID, providing a complete history of every term addition and decision resolution.
