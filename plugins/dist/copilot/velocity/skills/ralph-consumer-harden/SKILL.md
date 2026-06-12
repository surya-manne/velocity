---
name: ralph-consumer-harden
description: "RALPH Loop — Harden step. Applies developer-approved proposals from a propose artifact to this project's local .velocity/skills/, .velocity/agents/, and .velocity/guardrails/ files. Logs all changes for traceability. Never modifies Velocity platform templates. Run after developer has reviewed and approved proposals in the propose artifact."
---


# RALPH Loop — Harden

Apply approved RALPH Loop proposals to this project's local Velocity skill instances.

> **Scope:** Only `.velocity/skills/`, `.velocity/agents/`, and `.velocity/guardrails/`
> are modified. Velocity platform templates are never touched.
> All changes are logged and reversible via git.

## Context Load

Read before starting:

1. The target proposal artifact — `.velocity/artifacts/ralph/propose-<skill>-<date>.md`
2. Each target file referenced in approved proposals (read current content before patching)
3. `.velocity/artifacts/ralph/index.md` — to update status after harden

---

## When to Run

Run after developer has reviewed proposals and marked at least one `[x] Approved` or `[x] Modified`:

```
/ralph-consumer-harden [proposal-artifact-path]
```

If no argument: read the most recent proposal artifact from the index with `status: awaiting-review`.

---

## Step 1 — Read and Validate Proposals

Parse the proposal artifact. For each proposal:

- `[x] Approved` → apply the "After" block as-is
- `[x] Modified` → apply the developer-edited "After" block
- `[x] Rejected` → skip; log as rejected
- `[ ]` (unreviewed) → stop and ask: "Proposal <N> has not been reviewed. Review all proposals before running harden, or mark unreviewed proposals as Rejected to skip them."

Do not proceed with any `[ ]` (unreviewed) proposals.

---

## Step 2 — Apply Changes

For each approved or modified proposal:

1. Read the current content of the target file.
2. Locate the section specified in the proposal (`**Section:**` field).
3. Replace the "Before" block with the "After" block (exact string match).
4. If the "Before" text cannot be found in the target file: skip this proposal, flag it — "Proposal <N>: target text not found in [file]. Skill may have been updated since this proposal was drafted. Manual review required."
5. Write the updated file.

---

## Step 3 — Write Harden Log

Append to `.velocity/artifacts/ralph/harden-log.md` (create if missing):

```markdown
# RALPH Loop Harden Log

---

## Harden run: <ISO timestamp>

| # | Proposal | Target file | Section | Status |
|---|----------|-------------|---------|--------|
| 1 | <title> | .velocity/skills/<skill>.md | <section> | applied |
| 2 | <title> | .velocity/agents/<agent>.md | <section> | applied |
| 3 | <title> | .velocity/guardrails/default.md | <section> | rejected by developer |
| 4 | <title> | .velocity/skills/<skill>.md | <section> | skipped — target text not found |

**Source proposal artifact:** propose-<skill>-<date>.md
**Source learn artifact:** learn-<skill>-<date>.md
**Approved:** N | **Modified:** N | **Rejected:** N | **Skipped:** N
```

---

## Step 4 — Commit Changes

Commit all modified files plus the harden log in a single commit:

```
git add .velocity/skills/ .velocity/agents/ .velocity/guardrails/ .velocity/artifacts/ralph/harden-log.md
git commit -m "chore(ralph): harden run for <skill> — <N> proposals applied"
```

---

## Step 5 — Update Index

In `.velocity/artifacts/ralph/index.md`:

- Update the proposal artifact entry: `status: hardened`
- Record the harden run with its commit hash

---

## Step 6 — Summary Report

```markdown
## RALPH Loop Harden Complete

**Run:** <ISO timestamp>
**Skill improved:** .velocity/skills/<skill-id>.md

**Changes applied:**
- <Proposal 1 title> → <target file> — applied
- <Proposal 2 title> → <target file> — applied

**Skipped (developer rejected):**
- <Proposal 3 title>

**Skipped (target text not found):**
- <Proposal 4 title> — manual review needed

**Harden log:** .velocity/artifacts/ralph/harden-log.md
**Commit:** <short hash>

---
These improvements are now active for this project's AI runs.
Agents using `.velocity/skills/<skill-id>.md` will benefit from the next session.

To propagate to adapter-generated skill wrappers, run /sync.
```

---

## Safety Rules

1. Never modify files outside `.velocity/` — application code is out of scope.
2. Never modify the Velocity repo's `skills/**/SKILL.md` files.
3. If a file has uncommitted changes: stop and ask the developer to commit or stash before harden runs.
4. Harden is always reversible with `git revert <commit>`.
