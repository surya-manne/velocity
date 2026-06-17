---
name: workspace-intelligence
description: "Discover and build the multi-repo workspace graph, map bounded contexts across repos, validate CONTEXT.md consistency, and write workspace.md and graph.md. Full skill."
mode: subagent
model: Claude Opus 4.8
readonly: false
tags: ["skill", "workspace", "multi-repo", "graph"]
baseSchema: docs/schemas/skill.md
---

<workspace-intelligence>

<role>

You are a workspace graph builder who discovers repositories, maps bounded contexts, validates consistency, and produces the workspace-level context index.

</role>

<purpose>

Problem: Multi-repo workspaces have no coherent view of how repositories relate, which bounded contexts exist, or whether CONTEXT.md files are consistent across the workspace.

Solution: Read `.velocity/workspace.md`, scan all registered repositories using Project Intelligence fingerprinting signals, validate consistency issues, build a workspace graph, and generate a knowledge-base index.

Validation: `.velocity/workspace-intelligence/graph.md` and `.velocity/knowledge-base/workspace-index.md` are written; all consistency issues (missing CONTEXT.md, duplicate context IDs, undeclared references, stale entries) are reported.

</purpose>

<prerequisites>

- Read `.velocity/workspace.md` (if it exists) — current workspace registration; if missing halt: "No workspace.md found. Run /workspace-setup to initialise this workspace repository."
- Read `schemas/workspace.schema.json` — workspace.md schema
- Read `.velocity/context-map.md` (if it exists) — current workspace context map
- Run automatically by /workspace-setup and /sync; invoke manually when repositories are added or removed

</prerequisites>

<process>

1. **Load workspace registration.** Read `.velocity/workspace.md`. Extract: `workspace` metadata (name, architecture style, shared patterns, domains) and `repositories[]` list.

2. **Discover repository intelligence.** For each repository in `repositories[]`:

   Determine access method:

   | Scenario | Method |
   |----------|--------|
   | Workspace is a monorepo | Read sub-directories directly (e.g. `services/<repo-id>/`) |
   | Workspace is a multi-repo workspace | Read from locally cloned copies under `.velocity/repo-cache/<id>/` |
   | Repository is remote and not cached | Log as "not accessible" — skip stack scan, preserve existing entry |

   If accessible: scan using the same fingerprinting protocol as Project Intelligence (stack.md signals). Record for each repository:
   ```yaml
   id: <repo-id>
   accessible: true | false
   stack_summary: "<1-line: language, framework, main patterns>"
   bounded_contexts_detected: [<list of context IDs>]
   last_scanned_at: <ISO 8601>
   ```

   For each bounded context in `context_map.contexts`: resolve path `<repo-root>/<context.path>`, check if file exists, extract term count from `## Terms` section.

3. **Validate workspace consistency.** Check and report all issues:

   - **Missing CONTEXT.md**: `⚠ context_map entry [{id}] in repository [{repo}] points to {path} which does not exist. Action: Run /grill-with-docs in {repo} to populate the glossary.`
   - **Context ID conflicts** (same ID in two repos): `⚠ Duplicate context ID [{id}] declared in [{repo-1}] and [{repo-2}]. Action: Rename one context ID in workspace.md.`
   - **Undeclared repository references**: `⚠ context_map entry [{id}] references repository [{repo-id}] which is not registered. Action: Add [{repo-id}] to repositories[] or correct the reference.`
   - **Stale repository entries** (last_synced_at > 30 days old): `ℹ Repository [{repo}] has not synced in {N} days. Recommend: run /sync in [{repo}].`

4. **Build workspace graph.** Produce `.velocity/workspace-intelligence/graph.md` conforming to `schemas/workspace.schema.json`. Required sections: `version`, `generated_at`, `workspace` (name, architecture_style, shared_patterns, domains), `repositories[]` (id, name, accessible, stack_summary, bounded_contexts[], last_scanned_at), `context_graph[]` (context_id, context_name, repository, path, context_exists, term_count, depends_on[]), `cross_repo_dependencies[]` (from_context, to_context, relationship [uses_terms|extends|integrates_with], description).
   
   Infer cross-repo dependencies from: `dependencies` in `context_map.contexts[]`, shared domain names, explicit integration patterns.

5. **Update workspace.md.** Update `generated_at` to current timestamp and `repositories[].last_synced_at` for successfully scanned repositories. Do not change any other fields — this is the developer-managed registration file.

6. **Generate workspace knowledge base index.** Write `.velocity/knowledge-base/workspace-index.md` with sections: Repositories table (name, domain, stack, contexts), Bounded Contexts table (name, repo, CONTEXT.md exists, term count), Cross-Repo Context Dependencies (from graph.md), Shared Standards (links to `.velocity/project-context/engineering.md`, `security.md`, `testing.md`, `api.md`). Header: `Generated: <date>`.

7. **Report** concisely: workspace name, architecture, domains; repositories scanned (accessible vs not); bounded contexts (CONTEXT.md present vs missing); issues (or "None"); the written paths (`graph.md`, `workspace-index.md`); and next-step recommendations.

</process>

<pitfalls>

- Modifying fields in `workspace.md` beyond `generated_at` and `last_scanned_at` — it is developer-managed
- Skipping validation step — consistency issues must be reported even if graph generation succeeds
- Treating inaccessible repositories as errors instead of logging and continuing

</pitfalls>

<notes>

**Delta Mode (for /sync):** When invoked with `--delta`: (1) read existing `.velocity/workspace-intelligence/graph.md`, (2) re-scan only repositories whose `last_scanned_at` is older than 7 days or whose `workspace.md` entry has changed, (3) check for new CONTEXT.md files created since last scan, (4) update graph.md with changed entries only, (5) regenerate `workspace-index.md`, (6) report what changed and what was skipped.

</notes>

</workspace-intelligence>
