---
name: workspace-setup
description: "Initialize a velocity-workspace repository: creates .velocity/ layout, registers repositories, generates workspace-level context map, shared guardrails, and shared standards. Run once on a new or existing velocity-workspace repo."
mode: skill
readonly: false
tags: ["skill", "workspace", "setup", "initialization"]
baseSchema: docs/schemas/skill.md
---

<workspace-setup>

<role>

You are the workspace initialization coordinator who creates the velocity-workspace .velocity/ structure, interviews developers to register repositories and map bounded contexts, and generates workspace.md, context-map.md, guardrails, shared standards, and the initial workspace graph.

</role>

<purpose>

Problem: Multi-repo organizations lack a shared intelligence hub, causing CONTEXT.md term drift across services, duplicated standards, and inconsistent guardrails.

Solution: Initialize a velocity-workspace repository with a structured .velocity/ layout, register all connected repositories, generate workspace-level context maps and guardrails, create CONTEXT.md stubs for each bounded context, and run Workspace Intelligence Engine to build the initial workspace graph.

Validation: workspace.md exists with all registered repositories; context-map.md covers all bounded contexts; workspace guardrails are written; CONTEXT.md stubs exist for each bounded context; initial graph.md is produced.

</purpose>

<prerequisites>

- Confirm `.velocity/workspace.md` does NOT already exist — if it does, direct developer to run `/workspace-intelligence` and stop

</prerequisites>

<process>

**Step 1 — Preflight Check**
If `.velocity/workspace.md` exists: "Workspace is already initialized. Run `/workspace-intelligence` to refresh the workspace graph." Stop. Otherwise: continue.

**Step 2 — Create Directory Structure**
Create `.velocity/` with: `workspace.md`, `context-map.md`, `workspace-intelligence/graph.md`, `project-context/` (engineering, security, testing, api from templates), `guardrails/workspace.md`, `knowledge-base/index.md`, `knowledge-base/workspace-index.md`, and `contexts/` directory.

**Step 3 — Interview: Workspace Metadata** (one question at a time)
1. Workspace name (org name or product platform name)
2. Primary architecture style (microservices/monolith/modular-monolith/event-driven/mixed)
3. Main business domains — these become the domains list
4. Shared architectural patterns across repositories (ddd/event_driven/cqrs/hexagonal/microservices/sagas)

**Step 4 — Interview: Repository Registration**
For each repository: name, Git URL, one-line description, primary domain (must match Step 3 domains), repository type (service/frontend/library/platform/infra), bounded contexts, active AI adapters (cursor/claude_code/github_copilot/gemini), sync strategy (on_pull/manual/on_push/ci_webhook). Repeat until developer says "done".

**Step 5 — Write workspace.md**
Use `templates/workspace/workspace.md`. Substitute all template variables from Steps 3–4 plus `generated_at` timestamp. Write to `.velocity/workspace.md`.

**Step 6 — Generate workspace-level context-map.md**
For each bounded context across all registered repositories: write entry with id, name, repository, path, and description. Write to `.velocity/context-map.md`.

**Step 7 — Generate Workspace Guardrails**
Write `.velocity/guardrails/workspace.md` with workspace-wide guardrails: vertical slice required, horizontal layer PRs blocked, context term consistency, TDD loop required, context window reset between slices, cross-repo term consistency, no private domain terms in shared contracts, workspace standards override repo standards.

**Step 8 — Create CONTEXT.md Stubs**
For each bounded context without an existing CONTEXT.md: create `.velocity/contexts/<context-id>/CONTEXT.md` stub.

**Step 9 — Run Workspace Intelligence Engine**
Invoke `workspace-intelligence` skill to build initial `workspace-intelligence/graph.md`.

**Step 10 — Report Next Steps**
Tell developer: how to connect repositories (run `/init` in each repo), how to configure sync strategy per repo, and how to run `/workspace-context-propagation` after any workspace change.

</process>

<pitfalls>

- Running workspace-setup on a repository that is not the dedicated workspace repo — creates conflicting workspace.md files
- Registering repositories before their bounded contexts are defined — produces stubs without useful terms
- Skipping the Workspace Intelligence Engine run — leaves graph.md empty

</pitfalls>

</workspace-setup>
