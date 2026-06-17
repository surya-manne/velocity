---
name: workspace-context-propagation
description: "Propagate workspace changes (CONTEXT.md, guardrails, standards) to all connected repositories immediately. Run from the velocity-workspace repository after updating shared assets. Use when CI webhook propagation is not configured or for immediate sync."
mode: skill
readonly: false
tags: ["skill", "workspace", "propagation", "sync"]
baseSchema: docs/schemas/skill.md
---

<workspace-context-propagation>

<role>

You are a workspace propagation coordinator who pushes updated CONTEXT.md snapshots, guardrails, and standards to all connected repositories by writing sync notices and updating workspace graph timestamps.

</role>

<purpose>

Problem: When workspace-level domain language, guardrails, or standards change, connected repositories remain stale until developers manually run /sync — leading to term drift across the service estate.

Solution: Detect what changed, write updated CONTEXT.md snapshots to the workspace contexts directory, generate per-repository sync notices, and update last-propagated timestamps so /sync in connected repos picks up changes automatically.

Validation: All changed bounded context snapshots are written, every `on_pull` repository has a `WORKSPACE_SYNC_NOTICE.md`, and `last_synced_at` timestamps are updated in workspace.md.

</purpose>

<prerequisites>

- `.velocity/workspace.md` — repository registration and sync config
- `.velocity/workspace-intelligence/graph.md` — workspace graph
- `.velocity/context-map.md` — all bounded contexts

</prerequisites>

<process>

**Step 1 — Detect What Changed**
Check recent changes: CONTEXT.md files under `.velocity/contexts/<id>/`, `guardrails/workspace.md`, `project-context/` files, `workspace.md`. If run manually with no specific change: ask developer what changed and what should be propagated. If `require_approval_before_propagation: true`: pause for developer review.

**Step 2 — Update CONTEXT.md Snapshots**
For each changed bounded context: locate authoritative CONTEXT.md, write snapshot to `.velocity/contexts/<context-id>/CONTEXT.md`, record `snapshot_updated_at` in workspace graph. Snapshots are copies — never overwrite the authoritative source.

**Step 3 — Update Workspace Knowledge Base Index**
Regenerate `.velocity/knowledge-base/workspace-index.md` with updated term counts, new contexts, and snapshot timestamps.

**Step 4 — Determine Repositories to Notify**
From `workspace.md repositories[]`: `on_pull` → write sync notice; `ci_webhook` → log as handled by CI; `on_push` → dispatch sync signal; `manual` → log as manual only.

**Step 5 — Write Per-Repository Sync Notices**
For each `on_pull` repo: create `.velocity/repo-notices/<repo-id>/WORKSPACE_SYNC_NOTICE.md` with what changed, action required (run /sync), and specific review items per changed asset type.

**Step 6 — Update Timestamps**
Update `repositories[].last_synced_at` in `workspace.md` and `generated_at` in `workspace-intelligence/graph.md`.

**Step 7 — Propagation Report**
Output: contexts updated, guardrails/standards propagation status, repositories notified by strategy, and next steps.

**Targeted Mode:** Use `--target <repo-id>` to propagate to a single repository.

**Cross-Repo Term Consistency Check (run before propagating):** Read all `.velocity/contexts/` CONTEXT.md files, check for term conflicts (same word defined differently across contexts) and term dependencies (Context A uses a term from Context B). Resolve conflicts before propagating.

</process>

<pitfalls>

- Propagating without checking cross-repo term consistency — spreading a conflict to all repositories
- Overwriting the authoritative CONTEXT.md with a workspace snapshot — snapshots are copies, not sources of truth
- Skipping the approval gate when `require_approval_before_propagation: true`

</pitfalls>

</workspace-context-propagation>
