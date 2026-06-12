---
name: ralph-harden
description: "Apply approved RALPH proposals to skill templates, agent configs, and guardrails. Regenerates affected assets. Logs traceability. Run after ralph-propose proposals have been reviewed and approved by the developer."
---


# RALPH Harden

Apply approved proposals and regenerate affected Velocity assets.

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/propose-{skill-name}-{date}.md` — the proposal bundle with approval decisions

---

## Step 1 — Confirm Approved Proposals

Read the proposal bundle. List the approved proposals:

"Applying {N} approved proposals:

- Proposal 1: {description} → {target file}
- Proposal 2: {description} → {target file}"

Ask: "Confirm to proceed? This will modify the source skill/agent files."

---

## Step 2 — Apply Each Proposal

For each approved proposal, in order:

1. Read the target file
2. Locate the "Before" content (exact match)
3. Replace with "After" content
4. Verify the replacement was applied correctly
5. Note any unexpected differences (if the current file content has diverged from the "Before" snapshot in the proposal)

If a proposal's "Before" content no longer matches the current file: flag it and ask the developer whether to:

- Apply the proposal to the current content manually
- Skip this proposal (file has been updated since the proposal was written)

---

## Step 3 — Regenerate Affected Assets

If skill templates were modified:

- The corresponding `.cursor/skills/` files need regeneration
- Note: run Cursor Adapter delta after this session to propagate changes

If agent configs were modified:

- The corresponding `.cursor/agents/` files need regeneration
- Note: run Cursor Adapter delta after this session

If guardrail configs were modified:

- `hooks.json` needs regeneration
- Note: run Cursor Adapter delta after this session

---

## Step 4 — Write Traceability Log

Append to `.velocity/artifacts/ralph/harden-log.md`:

```markdown
## Harden Run: {date}

### Proposals applied

| Proposal # | Source learn batch | Target file | Change type | Applied at |
| ---------- | ------------------ | ----------- | ----------- | ---------- |
| {N}        | {learn-report}     | {file}      | {type}      | {date}     |

### Run IDs that informed each change

| Proposal # | Annotation run IDs                 |
| ---------- | ---------------------------------- |
| 1          | {run-id-1}, {run-id-2}, {run-id-3} |

### Rejected/skipped proposals

| Proposal # | Reason             |
| ---------- | ------------------ |
| {N}        | {developer's note} |
```

---

## Step 5 — Verification Instructions

"Proposals applied. To verify improvements:"

For each applied proposal, provide the test scenario to re-run:

- "Re-run `{skill-name}` against `{test scenario}` and run `/ralph-annotate` to compare output quality."

"Run Cursor Adapter delta to propagate changes to `.cursor/` assets: invoke `/cursor-adapter` with `--delta`."

---

## Step 6 — Completion

"Harden complete."

"Applied: {N} proposals"
"Files modified: {list}"
"Traceability log updated: .velocity/artifacts/ralph/harden-log.md"

"Next RALPH cycle: after {threshold} new runs of the improved skill, run `/ralph-learn` again to measure improvement."
