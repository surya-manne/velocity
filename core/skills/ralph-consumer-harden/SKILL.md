---
name: ralph-consumer-harden
description: "RALPH Loop Harden step: applies developer-approved proposals from a propose artifact to this project's local .velocity/skills/, .velocity/agents/, and .velocity/guardrails/ files with full change logging and a single reversible git commit."
mode: subagent
readonly: false
tags: ["skill", "ralph", "harden", "apply", "improvement"]
baseSchema: docs/schemas/skill.md
---

<ralph-consumer-harden>

<role>

You are a RALPH Loop harden executor that applies developer-approved proposals to this project's local Velocity skill instances.

</role>

<purpose>

Problem: Improvement proposals from ralph-consumer-propose are never applied to local skill instances because there is no structured mechanism to validate, apply, and log each change safely.

Solution: Parse approved proposals, apply exact before/after replacements to local `.velocity/` files, log all changes, and commit in a single reversible git commit.

Validation: All approved proposals are applied, a harden log is written to `.velocity/artifacts/ralph/harden-log.md`, the index is updated, and the commit is verifiable with `git log`.

</purpose>

<prerequisites>

- The target proposal artifact — `.velocity/artifacts/ralph/propose-<skill>-<date>.md`
- Each target file referenced in approved proposals (read current content before patching)
- `.velocity/artifacts/ralph/index.md` — to update status after harden

</prerequisites>

<process>

> **Scope:** Only `.velocity/skills/`, `.velocity/agents/`, and `.velocity/guardrails/` are modified. Velocity platform templates are never touched. All changes are logged and reversible via git.

1. **Invoke.** `/ralph-consumer-harden [proposal-artifact-path]`. If no argument: read the most recent proposal artifact from the index with `status: awaiting-review`.

2. **Validate proposals.** For each proposal: `[x] Approved` -> apply After block as-is; `[x] Modified` -> apply developer-edited After block; `[x] Rejected` -> skip, log as rejected; `[ ]` (unreviewed) -> **stop** and require developer to review or explicitly reject before proceeding. Do not proceed with any unreviewed proposal.

3. **Pre-flight safety check.** For each target file with approved/modified proposals: if uncommitted local changes exist, stop and ask developer to commit or stash first.

4. **Apply changes.** For each approved/modified proposal: read current file content; locate the **Before** block by exact string match within the named section; replace with **After** block; write file. If Before text is not found: skip the proposal and flag it for manual review.

5. **Write harden log.** Append a run entry to `.velocity/artifacts/ralph/harden-log.md` (create if missing). Log each proposal with title, target file, section, and outcome (applied / rejected by developer / skipped — target text not found). Include source proposal artifact path, source learn artifact path, and counts (Approved / Modified / Rejected / Skipped).

6. **Commit.** Stage `.velocity/skills/`, `.velocity/agents/`, `.velocity/guardrails/`, and `harden-log.md`, then commit: `chore(ralph): harden run for <skill> -- <N> proposals applied`. Reversible with `git revert <commit>`.

7. **Update index.** Set proposal artifact status to `hardened`; record commit hash.

8. **Report.** Print summary to developer: changes applied (proposal title -> file), rejections, skipped items needing manual review, harden log path, and commit hash. Close with: "To propagate to adapter-generated skill wrappers, run /sync."

</process>

<pitfalls>

- Proceeding with unreviewed (`[ ]`) proposals — stop and require all proposals to be reviewed first
- Modifying files outside `.velocity/` — application code is always out of scope
- Applying changes to a file with uncommitted local changes — stop and require stash or commit first
- Modifying the Velocity platform templates in `skills/**/SKILL.md`

</pitfalls>

</ralph-consumer-harden>
