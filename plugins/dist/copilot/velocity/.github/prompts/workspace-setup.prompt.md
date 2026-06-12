---
mode: agent
description: "Initialize a velocity-workspace repository. Creates the workspace .velocity/ layout, registers repositories, generates the workspace-level context map, shared guardrails, and shared standards. Run once on a new or existing velocity-workspace repo."
---


# Workspace Setup

Initialize the Velocity workspace repository — the shared intelligence hub for all connected repositories.

## What this skill does

1. Creates the `velocity-workspace/.velocity/` directory structure
2. Interviews the developer to register repositories and map bounded contexts
3. Generates `workspace.md` — the workspace registration manifest
4. Generates the workspace-level `context-map.md`
5. Copies shared standards templates (engineering, security, testing, api)
6. Generates shared guardrails
7. Runs Workspace Intelligence Engine to build the initial workspace graph
8. Reports next steps for connecting repositories

---

## Step 1 — Preflight Check

Check whether `.velocity/workspace.md` already exists.

- If it exists: tell the developer "Workspace is already initialized. Run `/workspace-intelligence` to refresh the workspace graph." Then stop.
- If it does not exist: continue.

---

## Step 2 — Create Workspace Directory Structure

Create:

```
.velocity/
├── workspace.md              ← written in Step 4
├── context-map.md            ← workspace-level context map
├── workspace-intelligence/     ← workspace graph (written by /workspace-intelligence)
│   └── graph.md
├── project-context/            ← shared standards (override repo-level)
│   ├── engineering.md
│   ├── security.md
│   ├── testing.md
│   └── api.md
├── guardrails/
│   └── workspace.md          ← workspace-wide guardrails
├── knowledge-base/
│   ├── index.md
│   └── workspace-index.md
└── contexts/                   ← CONTEXT.md files per bounded context
    └── <context-id>/
        └── CONTEXT.md
```

Copy standard project-context templates:

- `templates/velocity/project-context/engineering.md` → `.velocity/project-context/engineering.md`
- `templates/velocity/project-context/testing.md` → `.velocity/project-context/testing.md`
- `templates/velocity/project-context/security.md` → `.velocity/project-context/security.md`
- `templates/velocity/project-context/api.md` → `.velocity/project-context/api.md`

Copy default guardrails:

- `templates/velocity/guardrails/default.md` → `.velocity/guardrails/workspace.md`

---

## Step 3 — Interview: Workspace Metadata

Ask the developer these questions (one at a time, each with a recommended answer):

**Q1:** What is the name of this workspace?

> Recommended: Use the organisation name or product platform name (e.g. "Acme Platform", "InsureTech Core")

**Q2:** What is the primary architecture style?

> Options: microservices | monolith | modular-monolith | event-driven | mixed
> Recommended: If multiple services exist → microservices or event-driven

**Q3:** What are the main business domains in this workspace?

> Recommended: Identify top-level domain names (e.g. payments, customer, insurance, orders, identity). These become the `domains` list in workspace.md.

**Q4:** What shared architectural patterns are used across multiple repositories?

> Options: ddd | event_driven | cqrs | hexagonal | microservices | sagas | cqrs+es
> Recommended: Select all that apply across your service estate.

---

## Step 4 — Interview: Repository Registration

For each repository the developer wants to register, ask:

**For each repository:**

- Repository name and Git URL
- One-line description of its responsibility
- Primary business domain (must match domains from Step 3)
- Repository type (service | frontend | library | platform | infra)
- Which bounded contexts live in this repository
- Which AI assistant adapters are active (cursor | claude_code | github_copilot | gemini)
- Sync strategy (on_pull | manual | on_push | ci_webhook)

Stop asking about new repositories when the developer says "done" or indicates all repos have been registered.

---

## Step 5 — Write workspace.md

Use the template at `templates/workspace/workspace.md`.

Substitute:

- `{{WORKSPACE_NAME}}` → workspace name from Step 3
- `{{WORKSPACE_DESCRIPTION}}` → one-paragraph description (generate from answers)
- `{{ARCHITECTURE_STYLE}}` → architecture style from Step 3
- `{{PATTERN_N}}` → shared patterns from Step 3
- `{{DOMAIN_N}}` → domains from Step 3
- `{{REPO_N_*}}` → repository fields from Step 4
- `{{GENERATED_AT}}` → current ISO 8601 timestamp

Write to: `.velocity/workspace.md`

---

## Step 6 — Generate Workspace-Level context-map.md

For each bounded context across all registered repositories, generate `.velocity/context-map.md`:

```yaml
version: "2.0"

workspace:
  name: <workspace name>
  architecture_style: <style>
  shared_patterns: [<list>]

contexts:
  - id: <context-id>
    name: <name>
    repository: <repo-id>
    path: CONTEXT.md
    description: <description>
    # owner_team: ""
    # dependencies: []
```

Write to: `.velocity/context-map.md`

---

## Step 7 — Generate Workspace Guardrails

Write `.velocity/guardrails/workspace.md` — workspace-wide guardrails that apply to all connected repositories.

These extend (not replace) per-repo guardrails. Connected repositories merge workspace guardrails with their own.

Include:

```yaml
version: "2.0"
scope: workspace
description: "Workspace-wide guardrails — apply to all connected repositories"

# These override matching keys in connected repository guardrails
guardrails:
  vertical_slice_required: true
  horizontal_layer_pr_blocked: true
  slice_has_tests_at_all_layers: true
  context_md_term_consistency: true
  tdd_loop_required: true
  context_window_reset_between_slices: true

# Workspace-specific guardrails
workspace_guardrails:
  context_md_cross_repo_consistency: true # terms in shared bounded contexts must be consistent
  no_private_domain_terms_in_shared_contracts: true # API contracts must not leak internal terms
  shared_standards_override_repo_standards: true # workspace project-context/ files take precedence
```

---

## Step 8 — Create CONTEXT.md Stubs for Workspace Contexts

For each bounded context registered in Step 4:

If the developer confirms a CONTEXT.md does not yet exist in the target repository, create a stub in the workspace contexts directory:

`.velocity/contexts/<context-id>/CONTEXT.md`

Use the template at `templates/context/CONTEXT.md`. Substitute:

- `{{CONTEXT_NAME}}` → context name
- `{{DOMAIN_SUMMARY}}` → brief description from repository registration

Note: this stub is a workspace-owned copy. The authoritative CONTEXT.md lives in the owning repository. The workspace copy is a snapshot for cross-repo context injection.

---

## Step 9 — Run Workspace Intelligence Engine

Invoke the `workspace-intelligence` skill to:

- Build the initial workspace graph
- Write `.velocity/workspace-intelligence/graph.md`
- Generate `.velocity/knowledge-base/workspace-index.md`

---

## Step 10 — Summary Report

```
✅ Velocity Workspace initialized

Workspace: {name}
Architecture: {style}
Domains: {list}

Repositories registered: {N}
  {list of repos with types}

Bounded contexts mapped: {N}
  {list of contexts with CONTEXT.md status}

Generated:
  .velocity/workspace.md
  .velocity/context-map.md
  .velocity/guardrails/workspace.md
  .velocity/project-context/ — shared standards
  .velocity/workspace-intelligence/graph.md
  .velocity/knowledge-base/workspace-index.md

Next steps:
  1. Commit this workspace repository and push to {url}
  2. In each connected repository, add to .velocity/project-intelligence/stack.md:
       workspace:
         source: {workspace-git-url}
         sync: on_pull
  3. Run /sync in each connected repository to pull workspace intelligence
  4. Add the CI webhook (templates/ci/github-actions/workspace-sync.yml) to this workspace repo
     to auto-propagate changes to connected repositories

Tips:
  - /workspace-intelligence — refresh the workspace graph after adding repositories
  - /workspace-context-propagation — push workspace changes to all connected repos immediately
  - /sync (in a connected repo) — pull latest workspace intelligence into that repo
```
