---
name: workspace-context-propagation
description: "Propagate workspace changes (CONTEXT.md, guardrails, standards) to all connected repositories immediately. Run from the velocity-workspace repository after updating shared assets. Notifies connected repos, writes workspace snapshot copies of CONTEXT.md files, and triggers downstream sync signals. Use when CI webhook propagation is not configured or for immediate sync."
---


# Workspace Context Propagation

Push workspace changes to all connected repositories.

## Context Load

Read before starting:

- `.velocity/workspace.md` — repository registration and sync config
- `.velocity/workspace-intelligence/graph.md` — workspace graph
- `.velocity/context-map.md` — all bounded contexts

---

## Purpose

When workspace-level assets change — CONTEXT.md updates, new guardrails, revised standards — connected repositories need to know. This skill handles that propagation in three ways:

1. **Snapshot** — write updated CONTEXT.md files to the workspace contexts directory so `/sync` in connected repos can pull them
2. **Notify** — write per-repo sync notices that developers see on next session start
3. **Record** — log what propagated, when, and to which repositories

This skill is the manual alternative to the CI webhook (`workspace-sync.yml`). Run it when:

- CI webhook is not configured
- An urgent domain language change must propagate immediately
- A specific repository needs a targeted context update

---

## Step 1 — Detect What Has Changed

Check recent changes in the workspace repository:

```
What to look for:
  - CONTEXT.md files modified under .velocity/contexts/<id>/
  - .velocity/guardrails/workspace.md modified
  - .velocity/project-context/ files modified
  - .velocity/workspace.md modified (new repos added)
```

If run manually with no specific change: ask the developer what changed and what should be propagated.

Report:

```
Changed assets detected:
  CONTEXT.md: <list of changed context IDs, or "none">
  Guardrails: <changed/unchanged>
  Standards: <changed/unchanged>
  workspace.md: <changed/unchanged>
```

---

## Step 2 — Update Workspace CONTEXT.md Snapshots

For each bounded context in `context_map.contexts` that has changed:

1. Locate the authoritative CONTEXT.md (from the owning repository if accessible, or from the developer's recent edit)
2. Write a snapshot to `.velocity/contexts/<context-id>/CONTEXT.md`
3. Record `snapshot_updated_at` in the workspace graph

The snapshot is what connected repositories pull during `/sync`. It is not the authoritative source — it is a workspace-maintained copy that allows cross-repo context injection without requiring direct access to the owning repository.

---

## Step 3 — Update Workspace Knowledge Base Index

Re-generate `.velocity/knowledge-base/workspace-index.md` to reflect:

- Updated CONTEXT.md term counts
- New contexts if any were added
- Snapshot timestamps

---

## Step 4 — Determine Which Repositories to Notify

From `workspace.md repositories[]`, build the propagation list:

| Sync strategy | Action                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| `on_pull`     | Write WORKSPACE_SYNC_NOTICE to `.velocity/` — developer pulls on /sync |
| `ci_webhook`  | Already handled by CI — log as "notified by CI webhook"                |
| `on_push`     | Dispatch sync signal immediately (see Step 5)                          |
| `manual`      | Log as "manual sync only — no automatic notification"                  |

If `sync_config.auto_propagate_contexts: false` in workspace.md: ask the developer to confirm before proceeding.

If `sync_config.require_approval_before_propagation: true`: pause and ask developer to review changes before propagating.

---

## Step 5 — Write Per-Repository Sync Notices

For each `on_pull` repository:

Create a notice at `.velocity/repo-notices/<repo-id>/WORKSPACE_SYNC_NOTICE.md`:

```markdown
# Velocity Workspace Sync Notice

**Workspace:** [workspace name]
**Generated:** [ISO 8601 timestamp]

## What Changed

[List of changed assets]

## Action Required

Pull the latest workspace intelligence by running `/sync` in your AI coding assistant.

Specifically:
[If CONTEXT.md changed:] Domain language updated. Review updated terms in [context-id] CONTEXT.md.
[If guardrails changed:] Workspace guardrails updated. Review .velocity/guardrails/workspace.md.
[If standards changed:] Shared engineering standards updated. Review .velocity/project-context/.
```

---

## Step 6 — Update Last-Propagated Timestamp

In workspace.md, update `repositories[].last_synced_at` for each repository that received a propagation signal.

Also update `generated_at` in `.velocity/workspace-intelligence/graph.md`.

---

## Step 7 — Propagation Report

```
✅ Workspace Context Propagation complete

Changes propagated:
  CONTEXT.md snapshots updated: [N contexts] — [list]
  Guardrails: [propagated/unchanged]
  Standards: [propagated/unchanged]

Repositories notified:

  on_pull (sync notice written):
    - [repo-id]: notice written to .velocity/repo-notices/[repo-id]/
    ...

  ci_webhook (handled by CI):
    - [repo-id]: already dispatched by workspace-sync.yml
    ...

  manual (no auto-notification):
    - [repo-id]: developer must run /sync manually
    ...

Next steps:
  1. Commit workspace changes and push to trigger CI webhook (if configured)
  2. Inform connected repository developers: "Workspace context updated. Run /sync."
  3. For on_pull repos: changes will be picked up on next /sync in each repo
  4. For urgent propagation: share the specific changed CONTEXT.md directly
```

---

## Targeted Propagation

To propagate to a single repository only, run:

```
/workspace-context-propagation --target <repo-id>
```

This limits Step 4-5 to the specified repository. Useful when:

- Only one team is affected by the domain language change
- Testing propagation before rolling out to all repositories
- A specific repository has an urgent dependency on the updated context

---

## Cross-Repo Term Consistency Check

Before propagating CONTEXT.md changes, run a consistency check:

1. Read all CONTEXT.md files in `.velocity/contexts/`
2. Check for term conflicts: the same word defined differently across contexts
3. Check for term dependencies: if Context A uses a term from Context B, verify they are consistent

Report any conflicts before propagating:

```
⚠ Term conflict detected:
  "Payment" defined in [payments] as: "A transfer of funds..."
  "Payment" referenced in [orders] as: "A completed transaction..."

  These definitions are inconsistent. Resolve before propagating to avoid confusion.
  Recommendation: Align definitions in grill-with-docs session with both teams.
```

Block propagation for contexts with unresolved term conflicts unless the developer explicitly overrides.
