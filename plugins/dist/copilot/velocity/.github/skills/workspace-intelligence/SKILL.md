---
name: workspace-intelligence
description: >-
  Discover and build the multi-repo workspace graph. Reads all registered
  repositories, maps bounded contexts across repos, validates CONTEXT.md
  consistency, and writes workspace.md with the complete workspace graph.
  Run automatically by /workspace-setup and /sync. Invoke manually when
  repositories are added or removed from the workspace.
metadata:
  surfaces:
    - agent
---

# Workspace Intelligence Engine

Build the workspace graph from all registered repositories.

## Context Load

Read before starting:

- `.velocity/workspace.md` (if it exists) — current workspace registration
- `schemas/workspace.schema.json` — workspace.md schema
- `.velocity/context-map.md` (if it exists) — current workspace context map

---

## Purpose

The Workspace Intelligence Engine does three things:

1. **Multi-repo discovery** — scan all registered repositories for stack signals and bounded contexts
2. **Workspace graph** — build a coherent picture of how repositories relate to each other
3. **Context map consolidation** — collect all CONTEXT.md files across all repos into a single workspace-level context map

---

## Step 1 — Load Workspace Registration

Read `.velocity/workspace.md`.

Extract:

- `workspace` metadata (name, architecture style, shared patterns, domains)
- `repositories[]` — list of all registered repos

If no `workspace.md` exists: halt and output:

```
No workspace.md found. Run /workspace-setup to initialise this workspace repository.
```

---

## Step 2 — Discover Repository Intelligence

For each repository in `repositories[]`:

### 2a — Determine Access Method

Repositories in a workspace are read in one of two ways:

| Scenario                            | Method                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| Workspace is a monorepo             | Read sub-directories directly (e.g. `services/<repo-id>/`)         |
| Workspace is a multi-repo workspace | Read from locally cloned copies under `.velocity/repo-cache/<id>/` |
| Repository is remote and not cached | Log as "not accessible" — skip stack scan, preserve existing entry |

If repositories are accessible: scan each one using the same fingerprinting protocol as Project Intelligence (stack.md signals).

Record for each repository:

```yaml
id: <repo-id>
accessible: true | false
stack_summary: "<1-line description: language, framework, main patterns>"
bounded_contexts_detected: [<list of context IDs detected from source>]
last_scanned_at: <ISO 8601>
```

### 2b — Read Existing CONTEXT.md Files

For each bounded context in `context_map.contexts`:

1. Resolve the path: `<repo-root>/<context.path>`
2. If the file exists: record `context_exists: true`, extract the term count from `## Terms` section
3. If the file does not exist: record `context_exists: false`

---

## Step 3 — Validate Workspace Consistency

Check for these issues and report them:

### 3a — Missing CONTEXT.md Files

```
⚠ context_map entry [{id}] in repository [{repo}] points to {path} which does not exist.
  Action: Run /grill-with-docs in {repo} to populate the glossary.
```

### 3b — Context ID Conflicts

If two repositories declare the same context ID:

```
⚠ Duplicate context ID [{id}] declared in [{repo-1}] and [{repo-2}].
  Action: Rename one context ID in workspace.md to resolve the conflict.
```

### 3c — Undeclared Repository References

If a `context_map` entry references a `repository` ID that is not in `repositories[]`:

```
⚠ context_map entry [{id}] references repository [{repo-id}] which is not registered.
  Action: Add [{repo-id}] to repositories[] in workspace.md or correct the reference.
```

### 3d — Stale Repository Entries

If `last_synced_at` on a repository entry is over 30 days old:

```
ℹ Repository [{repo}] has not synced with workspace intelligence in {N} days.
  Recommend: run /sync in [{repo}] to refresh.
```

---

## Step 4 — Build Workspace Graph

Produce a workspace graph in `.velocity/workspace-intelligence/graph.md`:

```yaml
version: "2.0"
generated_at: <ISO 8601>

workspace:
  name: <workspace name>
  architecture_style: <style>
  shared_patterns: [<list>]
  domains: [<list>]

repositories:
  - id: <id>
    name: <name>
    accessible: true | false
    stack_summary: <summary>
    bounded_contexts: [<list of context IDs>]
    last_scanned_at: <timestamp>

context_graph:
  - context_id: <id>
    context_name: <name>
    repository: <repo-id>
    path: <path>
    context_exists: true | false
    term_count: <N>
    depends_on: [<list of context IDs>]

cross_repo_dependencies:
  - from_context: <id>
    to_context: <id>
    relationship: "uses_terms | extends | integrates_with"
    description: <one-line description>
```

Cross-repo dependencies are inferred from:

- `dependencies` declared in `context_map.contexts[]`
- Shared domain names between repositories
- Explicit integration patterns (e.g., a payment-service consumer for an orders event)

---

## Step 5 — Update workspace.md

Update the `generated_at` field in `.velocity/workspace.md` to the current timestamp.

Update `repositories[].last_synced_at` for any repository that was successfully scanned.

Do not change any other fields in `workspace.md` — this is the developer-managed registration file.

---

## Step 6 — Generate Workspace Knowledge Base Index

Write `.velocity/knowledge-base/workspace-index.md`:

```markdown
# Workspace Knowledge Index

Generated: <date>

## Repositories

| Repository | Domain   | Stack     | Contexts       |
| ---------- | -------- | --------- | -------------- |
| <name>     | <domain> | <summary> | <context list> |

## Bounded Contexts

| Context | Repository | CONTEXT.md exists | Terms |
| ------- | ---------- | ----------------- | ----- |
| <name>  | <repo>     | ✅ / ⚠ missing    | <N>   |

## Cross-Repo Context Dependencies

<list from graph.md cross_repo_dependencies>

## Shared Standards

- Engineering: .velocity/project-context/engineering.md
- Security: .velocity/project-context/security.md
- Testing: .velocity/project-context/testing.md
- API: .velocity/project-context/api.md
```

---

## Step 7 — Report

```
✅ Workspace Intelligence complete

Workspace: {name}
Architecture: {style}
Domains: {list}

Repositories scanned: {N}
  ✅ Accessible: {N}
  ⚠ Not accessible (no local cache): {N}

Bounded contexts: {N}
  ✅ CONTEXT.md present: {N}
  ⚠ CONTEXT.md missing: {N}

Issues:
  {list of validation issues, or "None"}

Written:
  .velocity/workspace-intelligence/graph.md
  .velocity/knowledge-base/workspace-index.md

Next steps:
  {context-specific: e.g. "Create CONTEXT.md in payments-service by running /grill-with-docs there"}
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Read existing `.velocity/workspace-intelligence/graph.md`
2. Re-scan only repositories whose `last_scanned_at` is older than 7 days or whose `workspace.md` entry has changed since the last scan
3. Check for new CONTEXT.md files created since last scan
4. Update graph.md with changed entries only
5. Regenerate `workspace-index.md`
6. Report: what changed, what was skipped (current)
