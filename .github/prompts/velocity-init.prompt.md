---
name: velocity-init
description: >-
  Initialize Velocity in this repository. Creates .velocity/ layout, detects
  stack, generates CONTEXT.md scaffold, wires agents and skills, and produces
  all Cursor assets. Run once on any new or existing repository.
metadata:
  surfaces:
    - agent
---

# Velocity Init

Initialize the Velocity intelligence layer in this repository.

## What this skill does

1. Detects the technology stack from source files
2. Creates the `.velocity/` directory structure
3. Generates a `CONTEXT.md` scaffold for detected bounded contexts
4. Writes `context-map.md`
5. Runs Agent Factory to configure agents for this stack
6. Runs Skill Factory to wire the canonical skill chain
7. Runs Guardrail Factory to generate guardrails and hooks
8. Runs the Rule Pack Engine to import external standards and community rules
9. Runs the Cursor Adapter to generate `.cursor/` assets and `hooks.json`

**Target:** Under five minutes. Nothing to install. Never leave your editor.

---

## Step 1 — Preflight Check

Check whether `.velocity/` already exists.

- If it exists: tell the user "Velocity is already initialized. Run `/sync` to regenerate assets." Then stop.
- If it does not exist: continue to Step 2.

---

## Step 2 — Run Project Intelligence

Read the following files if they exist in the repository root or common locations:

```
package.json          pom.xml             go.mod
requirements.txt      Gemfile             build.gradle
pyproject.toml        Cargo.toml          composer.json
tsconfig.json         .nvmrc              .node-version
docker-compose.yml    Dockerfile          kubernetes/
.github/workflows/    .gitlab-ci.yml      .circleci/
src/                  app/                lib/
services/             packages/           apps/
```

Scan for:

| Signal                                | What to detect                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `package.json` dependencies           | React, Next.js, Vue, Angular, Express, NestJS, Jest, Vitest, Prisma, Drizzle                                 |
| `pom.xml` or `build.gradle`           | Spring Boot, Kafka, JUnit, Hibernate, Quarkus                                                                |
| `go.mod`                              | Go version, common frameworks (gin, echo, fiber), GORM                                                       |
| `requirements.txt` / `pyproject.toml` | Django, FastAPI, SQLAlchemy, pytest, Celery                                                                  |
| Directory structure                   | monorepo indicators (`apps/`, `packages/`, `services/`), bounded context names                               |
| Architectural patterns                | Event sourcing (Aggregate, EventStore), CQRS (Command/Query separation), DDD (domain/, bounded context dirs) |
| CI/CD config                          | GitHub Actions, GitLab CI, CircleCI, Buildkite                                                               |

Produce a `stack.md` using the schema at `schemas/project-intelligence.schema.json`.

Write the fingerprint to: `.velocity/project-intelligence/stack.md`

---

## Step 3 — Create Directory Structure

Create the following directories (empty, with `.gitkeep` in leaf dirs):

```
.velocity/
├── project-intelligence/    ← stack.md already written in Step 2
├── project-context/
├── context-map.md         ← written in Step 4
├── agents/
├── skills/
├── workflows/
├── guardrails/
├── knowledge-base/
└── artifacts/
    ├── adrs/
    ├── prds/
    ├── features/
    ├── tasks/
    ├── roadmaps/
    ├── context/
    ├── handoffs/
    └── context-proposals/
```

Copy standard project-context templates:

- Copy `templates/velocity/project-context/engineering.md` → `.velocity/project-context/engineering.md`
- Copy `templates/velocity/project-context/testing.md` → `.velocity/project-context/testing.md`
- Copy `templates/velocity/project-context/security.md` → `.velocity/project-context/security.md`
- Copy `templates/velocity/project-context/api.md` → `.velocity/project-context/api.md`

Copy default guardrails:

- Copy `templates/velocity/guardrails/default.md` → `.velocity/guardrails/default.md`

Initialize knowledge base index:

- Copy `templates/velocity/knowledge-base/index.md` → `.velocity/knowledge-base/index.md`
- Copy `templates/adrs/index.md` → `.velocity/knowledge-base/adrs/index.md`

---

## Step 4 — Detect Bounded Contexts and Write context-map.md

Using the bounded_contexts list from `stack.md`, generate `.velocity/context-map.md`.

If only one bounded context is detected (or the repo is a single-service app):

```yaml
version: "2.0"
primary_context: <detected-id>
contexts:
  - id: <detected-id>
    name: <Name>
    path: CONTEXT.md
    description: <one-line description from stack signals>
```

If multiple bounded contexts are detected (monorepo or multi-service):

```yaml
version: "2.0"
contexts:
  - id: <id>
    name: <Name>
    path: services/<name>/CONTEXT.md
    description: <one-line description>
  - id: <id>
    name: <Name>
    path: services/<name>/CONTEXT.md
    description: <one-line description>
```

---

## Step 5 — Generate CONTEXT.md Scaffold

For each bounded context in `context-map.md`, generate an empty CONTEXT.md scaffold at the specified path.

Use the template from `templates/context/CONTEXT.md`. Substitute:

- `{{CONTEXT_NAME}}` → detected context name
- `{{DOMAIN_SUMMARY}}` → brief summary inferred from directory names and package/module names

**Do not invent domain terms.** The glossary starts empty. The developer will populate it using `grill-with-docs`.

---

## Step 6 — Run Agent Factory

Read `.velocity/project-intelligence/stack.md`.

Read all agent definitions from `agents/` in the Velocity repository.

For each agent role, produce a configured instance at `.velocity/agents/<agent-id>.md`:

- Wire stack-appropriate skills from `stack_conditional_skills` mappings
- Activate stack-appropriate subagents from `stack_conditional_subagents` mappings
- Inject context: CONTEXT.md path, standards file paths, ADR injection tier

Write Agent Context Protocol entry document: `.velocity/agents/ENTRY.md`

This document is the always-on navigation index injected into every session.

---

## Step 7 — Run Skill Factory

Read `.velocity/project-intelligence/stack.md`.

Read skill templates from `skills/` in the Velocity repository.

For each canonical skill, produce a configured instance at `.velocity/skills/<skill-id>.md`:

- Apply stack-specific variants (e.g., configure `tdd` with JUnit for Spring Boot, Jest for React)
- Set context load paths appropriate for this repo's structure
- Set output paths

---

## Step 8 — Run Guardrail Factory

Read `.velocity/project-intelligence/stack.md`.

Run the Guardrail Factory skill (`skills/guardrail-factory/SKILL.md`) to generate:

1. `.velocity/guardrails/default.md` — guardrail config adapted to the detected stack and risk profile
2. `hooks.json` — PreToolUse enforcement hooks (base safety hooks + stack-specific hooks)

The Guardrail Factory determines:

- Coverage thresholds based on test framework and project risk profile
- Which feedback loop gates to enable based on detected typecheck tooling
- Whether security review is required (triggered by cloud, PII, or payment signals)
- Which stack-specific hooks to generate (SQL, Kafka, AWS, Node, Java, Python, Docker)

If `.velocity/guardrails/default.md` already exists (e.g., from a previous setup or manual authoring): preserve any manually tightened values. Log which values were preserved vs. regenerated.

---

## Step 9 — Run Rule Pack Engine

Generate a starter `.velocity/rule-packs.md` manifest based on the detected stack:

1. Copy `templates/velocity/rule-packs.md` → `.velocity/rule-packs.md`
2. Populate the `packs` list using the auto-selection logic from `skills/rule-pack-engine/SKILL.md §Auto-Selection Logic`:
   - For each detected stack signal, add the corresponding pack entries
   - Always add the `git-workflow` pack
3. Inform the developer: "Generated .velocity/rule-packs.md with packs matching your stack. Rule Pack Engine will import these on your next /sync, or run /rule-pack-engine now to import immediately."

Do not run the Rule Pack Engine automatically at setup time. The developer confirms the manifest first.

---

## Step 10 — Run Cursor Adapter

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Cursor assets:

### `.cursor/rules/velocity.mdc`

Lean, caveman-syntax always-on context. Use the template at `templates/cursor/rules/velocity.mdc`.

Substitute all `{{PLACEHOLDER}}` values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)
- `{{STACK_SUMMARY}}` → detected stack (language, framework, persistence — 2–3 lines max)

**Token discipline:** Every word in this file is paid for on every session. Maximum 80 lines. No verbose explanations. No justification. Imperative only.

### `.cursor/agents/`

For each agent in `.velocity/agents/*.md`, generate a Cursor agent config file.

Use system prompt template from `agents/<id>.md`'s `system_prompt_template` field, substituting:

- Stack-specific standards
- CONTEXT.md content (summary injection)
- Relevant ADR summaries
- Wired skill list

### `.cursor/skills/`

For each skill in `.velocity/skills/*.md`, copy and configure the corresponding `SKILL.md` template:

- Apply stack-specific variants
- Set correct context load paths for this repo

### `hooks.json`

`hooks.json` is generated by the Guardrail Factory (Step 8), not by the Cursor Adapter directly.

The Cursor Adapter verifies that `hooks.json` exists after Step 8 and copies it to the repository root if it is not already there. If `hooks.json` is missing (e.g., Guardrail Factory was skipped), fall back to copying the base template from `templates/hooks/hooks.json`.

---

## Step 11 — Run Claude Code Adapter

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Claude Code assets following the full procedure in `skills/claude-code-adapter/SKILL.md`:

### `CLAUDE.md`

Lean, caveman-syntax always-on entry document. Use the template at `templates/claude-code/CLAUDE.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `subagents/`

For each agent in `.velocity/agents/*.md`, generate a Claude Code subagent file with system prompt and correct `description` frontmatter for activation matching.

### `commands/`

For each skill in `.velocity/skills/*.md`, generate a Claude Code command file with path-substituted content. Always include `/velocity-init`, `/velocity-sync`, `/velocity-validate`, `/velocity-loop`.

### `hooks/`

Generate `hooks/pre-tool-use.json` and `hooks/post-tool-use.json` from guardrail config. Start from `templates/claude-code/hooks/` templates. Append stack-specific hooks from `.velocity/guardrails/default.md`.

---

## Step 12 — Run GitHub Copilot Adapter

Read `.velocity/agents/` and `.velocity/skills/`.

Generate GitHub Copilot assets following the full procedure in `skills/copilot-adapter/SKILL.md`:

### `.github/copilot-instructions.md`

Lean, caveman-syntax always-on instructions file. Use the template at `templates/copilot/copilot-instructions.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `AGENTS.md`

Project-wide agent instructions for Copilot agent mode and Codex CLI. Use the template at `templates/copilot/AGENTS.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`

### `.github/prompts/`

For each skill in `.velocity/skills/*.md`, generate a GitHub Copilot prompt file with path-substituted content. Always include `velocity-init`, `velocity-sync`, `velocity-validate`, `grill-with-docs`.

---

## Step 13 — Run Gemini Code Assist Adapter

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Gemini Code Assist assets following the full procedure in `skills/gemini-adapter/SKILL.md`:

### `GEMINI.md`

Lean, caveman-syntax always-on entry document. Use the template at `templates/gemini/GEMINI.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `.gemini/agents/`

For each agent in `.velocity/agents/*.md`, generate a Gemini agent configuration file with system prompt and correct `description` frontmatter for activation matching.

### `.gemini/tools/velocity-tools.json`

Generate Gemini tool definitions for all configured Velocity skills.

### `.gemini/styleguide.md`

Generate a concise coding style reference sourced from `.velocity/project-context/engineering.md`.

---

## Step 14 — Check Workspace Connection

Check whether the developer wants to connect this repository to a workspace (velocity-workspace).

Ask: "Is this repository part of a multi-repo workspace? If so, provide the workspace Git URL (or press Enter to skip)."

If a workspace URL is provided:

1. Add `workspace` block to `.velocity/project-intelligence/stack.md`:

```yaml
workspace:
  source: <workspace-git-url>
  sync: on_pull
```

2. Add a note to the summary (Step 13) about running `/sync` to pull workspace intelligence.

3. Add `downstream-sync.yml` installation reminder to the next steps list.

If no workspace URL provided: skip this step.

---

## Step 15 — Summary Report

Print a summary:

```
✅ Velocity initialized

Stack detected:
  [list detected stack components]

Bounded contexts:
  [list contexts with CONTEXT.md paths]

Workspace connection:
  [Connected: {workspace-url} | Not connected]

Generated:
  .velocity/ — project intelligence, standards, guardrails
  .velocity/rule-packs.md — starter rule pack manifest (review before importing)

  Cursor:
    .cursor/rules/velocity.mdc — always-on context
    .cursor/agents/ — [N] agents configured
    .cursor/skills/ — [N] skills wired
    hooks.json — [N] guardrail hooks

  Claude Code:
    CLAUDE.md — lean always-on entry document
    subagents/ — [N] subagents configured
    commands/ — [N] commands wired
    hooks/pre-tool-use.json — [N] hooks
    hooks/post-tool-use.json — [N] hooks

  GitHub Copilot:
    .github/copilot-instructions.md — always-on instructions
    AGENTS.md — agent mode instructions for all roles
    .github/prompts/ — [N] prompt files

  Gemini Code Assist:
    GEMINI.md — lean always-on entry document
    .gemini/agents/ — [N] agent configs
    .gemini/tools/velocity-tools.json — [N] tool definitions
    .gemini/styleguide.md — coding style reference

Next steps:
  1. Run /grill-with-docs to populate your CONTEXT.md glossary and generate ADRs for key decisions
  2. Review .velocity/project-context/ standards files — customize for your team
  3. Review .velocity/guardrails/default.md — adjust thresholds if needed
  4. Review .velocity/rule-packs.md — confirm which external packs to import, then run /rule-pack-engine
  5. Commit .velocity/, .cursor/, CLAUDE.md, subagents/, commands/, hooks/, AGENTS.md, .github/, GEMINI.md, and .gemini/ to version control
  [If workspace connected:]
  6. Run /sync to pull workspace intelligence and shared context
  7. Add templates/ci/github-actions/downstream-sync.yml to .github/workflows/ to receive workspace sync signals

Tips:
  - /context-engine — validate that code names match your CONTEXT.md glossary
  - /adr-engine — record any architectural decisions made outside a grill session
  - /context-merge — reconcile CONTEXT.md proposals when multiple sessions have run
  - /roadmap — sequence your feature board into a phased delivery plan
  - /workspace-setup — initialize a velocity-workspace repository for multi-repo teams
  - /rule-pack-engine — import external standards and community rule packs into Velocity
```

---

## Error Handling

- If no source files are found: create minimal `.velocity/` structure, generate empty CONTEXT.md scaffold, note that stack could not be auto-detected, and prompt developer to fill in `.velocity/project-intelligence/stack.md` manually.
- If bounded contexts cannot be detected: create a single default context named after the repo directory.
- If any file already exists: skip it (do not overwrite) and log which files were skipped.
