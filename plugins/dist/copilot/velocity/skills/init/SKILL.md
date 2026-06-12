---
name: init
description: "Initialize Velocity in this repository. Detects active AI tool, creates .velocity/ layout, detects stack, writes context into the tool-native file (CLAUDE.md, .github/copilot-instructions.md, .cursor/rules/velocity.mdc, or GEMINI.md), wires agents and skills, and generates guardrail hooks. Run once on any new or existing repository."
---


<!-- velocity-plugin: resource resolution -->
> **Plugin resources.** This skill references files under `templates/...` and
> `schemas/...`. These are bundled with the Velocity plugin at .github/velocity-resources.
> When this skill says to read or copy a `templates/...` or `schemas/...` file,
> resolve it from there. If a file cannot be found locally, fetch it from the
> Velocity repository: https://github.com/surya-manne/velocity.

---

# Velocity Init

Initialize the Velocity intelligence layer in this repository.

## What this skill does

1. Detects the active AI tool (Cursor, Claude Code, GitHub Copilot, Gemini, or all)
2. Detects the technology stack from source files
3. Creates the `.velocity/` directory structure
4. Writes project context into the **tool-native context file** for each detected tool
   - Cursor → `.cursor/rules/velocity.mdc`
   - Claude Code → `CLAUDE.md`
   - GitHub Copilot → `.github/copilot-instructions.md`
   - Gemini → `GEMINI.md`
5. Stores the shared source-of-truth context at `.velocity/artifacts/context/CONTEXT.md` (internal, not a root file)
6. Writes `context-map.md`
7. Runs Agent Factory to configure agents for this stack
8. Runs Skill Factory to wire the canonical skill chain
9. Runs Guardrail Factory to generate guardrails and hooks
10. Runs the Rule Pack Engine to import external standards and community rules
11. Runs adapter steps only for the detected tool(s)

**Target:** Under five minutes. Nothing to install. Never leave your editor.

---

## Step 1 — Preflight Check

Check whether `.velocity/` already exists.

- If it exists: tell the user "Velocity is already initialized. Run `/sync` to regenerate assets." Then stop.
- If it does not exist: continue to Step 1.5.

---

## Step 1.5 — Detect Active AI Tool

Inspect the repository and environment to determine which AI tools are in use. Check in this order:

| Signal to check | Detected tool |
|----------------|---------------|
| `.cursor/` directory exists, or process name contains "Cursor" | Cursor |
| `CLAUDE.md` exists at root, or `~/.claude/` exists, or env contains `CLAUDE` | Claude Code |
| `.github/copilot-instructions.md` exists, or `.github/prompts/` exists | GitHub Copilot |
| `GEMINI.md` exists at root, or `.gemini/` exists | Gemini Code Assist |

**Rules:**
- Multiple tools may be detected simultaneously — run all matching adapter steps.
- If no signals are found, ask the developer: "Which AI tool are you using? (Cursor / Claude Code / GitHub Copilot / Gemini / All)"
- Store the result in `.velocity/project-intelligence/stack.md` under a `detected_tools` key.

Proceed to Step 2.

---

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
├── sdlc/                  ← NEW: SDLC Pipeline Engine (written in Step 3a)
│   ├── pipeline.yaml
│   ├── pipeline-config.yaml
│   └── state/
└── artifacts/
    ├── adrs/
    ├── prds/
    ├── features/
    ├── tasks/
    ├── roadmaps/
    ├── context/
    ├── handoffs/
    ├── context-proposals/
    ├── architecture/       ← NEW: Design phase artifacts
    ├── impact/             ← NEW: Impact Analysis artifacts (Extend pipeline)
    ├── refactor-proposals/ ← NEW: Proposal artifacts (Refactor pipeline)
    └── ralph/              ← NEW: RALPH Loop annotations
```

### Step 3a — Scaffold SDLC Pipeline Engine

Copy the SDLC pipeline templates into the new `.velocity/sdlc/` directory:

- Copy `templates/velocity/sdlc/pipeline.yaml` → `.velocity/sdlc/pipeline.yaml`
- Copy `templates/velocity/sdlc/pipeline-config.yaml` → `.velocity/sdlc/pipeline-config.yaml`
- Create `.velocity/sdlc/state/` directory (empty, with `.gitkeep`)

Create the RALPH annotation index stub:

```markdown
# RALPH Loop — Annotation Index

> Auto-generated by velocity-init. Populated by /ralph-consumer-annotate.

## Annotations

| Run ID | Phase | Work Item | Date | Status | Rating |
|--------|-------|-----------|------|--------|--------|

## Learn Artifacts

| File | Skill/Phase | Date | Annotations | Avg Rating | Proposals generated |
|------|-------------|------|-------------|-----------|---------------------|

## Proposal Artifacts

| File | Skill | Date | Proposals | Status |
|------|-------|------|-----------|--------|
```

Write to `.velocity/artifacts/ralph/index.md`.

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
    path: .velocity/artifacts/context/CONTEXT.md
    description: <one-line description from stack signals>
```

If multiple bounded contexts are detected (monorepo or multi-service):

```yaml
version: "2.0"
contexts:
  - id: <id>
    name: <Name>
    path: .velocity/artifacts/context/<name>/CONTEXT.md
    description: <one-line description>
  - id: <id>
    name: <Name>
    path: .velocity/artifacts/context/<name>/CONTEXT.md
    description: <one-line description>
```

---

## Step 5 — Generate Internal Context Scaffold

For each bounded context in `context-map.md`, generate a CONTEXT.md scaffold at the internal path specified in `context-map.md` (`.velocity/artifacts/context/CONTEXT.md` or `.velocity/artifacts/context/<name>/CONTEXT.md` for monorepos).

This file is the **shared source of truth** — it is not exposed at the repo root. Each tool adapter (Steps 10–13) reads this file and injects its content into the tool-native context file.

Use the template from `templates/context/CONTEXT.md`. Substitute:

- `{{CONTEXT_NAME}}` → detected context name
- `{{DOMAIN_SUMMARY}}` → brief summary inferred from directory names and package/module names

**Do not invent domain terms.** The glossary starts empty. The developer will populate it using `grill-with-docs`.

---

## Step 6 — Run Agent Factory

Read `.velocity/project-intelligence/stack.md`.

Read all agent definitions from `agents/` in the Velocity repository.

For each agent role, produce a **fully configured** instance at `.velocity/agents/<agent-id>.md`. This is the **single source of truth** for that agent — tool adapters (Steps 10–13) reference this file; they do not duplicate its content.

Each instance includes:
- Role statement and responsibilities
- Full system prompt with stack-specific standards injected
- Full CONTEXT.md content injected (from `.velocity/artifacts/context/CONTEXT.md`)
- Relevant ADR summaries at the configured tier
- Wired skills list
- Activated subagents list
- Guardrails this agent enforces

Write Agent Context Protocol entry document: `.velocity/agents/ENTRY.md`

This document is the always-on navigation index. It lists all available agents and their activation signals — it does not duplicate their content.

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

**Run only if `cursor` is in `detected_tools` (from Step 1.5).**

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Cursor assets:

### `.cursor/rules/velocity.mdc`

Lean, caveman-syntax always-on context. Use the template at `templates/cursor/rules/velocity.mdc`.

Substitute all `{{PLACEHOLDER}}` values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_CONTENT}}` → use Cursor's native `@file` reference: add the line `@file .velocity/artifacts/context/CONTEXT.md` so Cursor loads context directly from the source-of-truth file without duplicating it here
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)
- `{{STACK_SUMMARY}}` → detected stack (language, framework, persistence — 2–3 lines max)

**Token discipline:** Every word in this file is paid for on every session. Maximum 80 lines. No verbose explanations. No justification. Imperative only.

### `.cursor/agents/`

For each agent in `.velocity/agents/*.md`, generate a **thin wrapper** at `.cursor/agents/{agent-id}.md`. Do not copy system prompt content. Use Cursor's `@file` reference to load from the source of truth:

```markdown
---
name: [Role Name from agent.md]
description: [One-line purpose from agent.md]
---

@file .velocity/agents/{agent-id}.md
```

This keeps `.cursor/agents/` as an entry point only. All content lives in `.velocity/agents/`. When the agent definition changes, there is nothing to sync.

**How developers invoke agents in Cursor:**
In Cursor Composer (`⌘I` / `Ctrl+I`), open the agent selector dropdown at the top of the chat panel. Each file in `.cursor/agents/` appears by its `name` frontmatter field. Select an agent to load its system prompt and constraints for that session.

Example: select **Engineer** for implementation tasks, **Architect** for design decisions, **Reviewer** for PR review.

### `.cursor/skills/`

For each skill in `.velocity/skills/*.md`, generate a **thin wrapper** at `.cursor/skills/{skill-id}.md`. Do not copy skill content:

```markdown
---
description: [One-line description from skill.md]
---

@file .velocity/skills/{skill-id}.md
```

### `hooks.json`

`hooks.json` is generated by the Guardrail Factory (Step 8), not by the Cursor Adapter directly.

The Cursor Adapter verifies that `hooks.json` exists after Step 8 and copies it to the repository root if it is not already there. If `hooks.json` is missing (e.g., Guardrail Factory was skipped), fall back to copying the base template from `templates/hooks/hooks.json`.

---

## Step 11 — Run Claude Code Adapter

**Run only if `claude` is in `detected_tools` (from Step 1.5).**

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Claude Code assets following the full procedure in `skills/claude-code-adapter/SKILL.md`:

### `CLAUDE.md`

Lean, caveman-syntax always-on entry document. Use the template at `templates/claude-code/CLAUDE.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_CONTENT}}` → add `Read .velocity/artifacts/context/CONTEXT.md before starting.` — Claude Code will load the file on demand; do not paste content inline into CLAUDE.md
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `subagents/`

For each agent in `.velocity/agents/*.md`, generate a **thin wrapper** at `subagents/{agent-id}.md`. Do not copy system prompt content:

```markdown
---
description: [One-line purpose from agent.md]
---

Read .velocity/agents/{agent-id}.md and act according to its full definition.
```

All agent content stays in `.velocity/agents/`. Claude resolves the file reference at invocation time.

### `commands/`

For each skill in `.velocity/skills/*.md`, generate a **thin wrapper** command file. Do not copy skill content:

```markdown
Read .velocity/skills/{skill-id}.md and execute it.
```

Always include `/velocity-init`, `/velocity-sync`, `/velocity-validate`, `/velocity-loop`.

### `hooks/`

Generate `hooks/pre-tool-use.json` and `hooks/post-tool-use.json` from guardrail config. Start from `templates/claude-code/hooks/` templates. Append stack-specific hooks from `.velocity/guardrails/default.md`.

---

## Step 12 — Run GitHub Copilot Adapter

**Run only if `copilot` is in `detected_tools` (from Step 1.5).**

Read `.velocity/agents/` and `.velocity/skills/`.

Generate GitHub Copilot assets following the full procedure in `skills/copilot-adapter/SKILL.md`:

### `.github/copilot-instructions.md`

Lean, caveman-syntax always-on instructions file. Use the template at `templates/copilot/copilot-instructions.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_CONTENT}}` → use Copilot's native file reference: add `#file:.velocity/artifacts/context/CONTEXT.md` so Copilot loads context from the source-of-truth file without duplicating it
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `AGENTS.md`

Project-wide agent instructions for Copilot agent mode and Codex CLI. Use the template at `templates/copilot/AGENTS.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_MD_PATH}}` → primary CONTEXT.md path from `context-map.md`

### `.github/agents/`

For each agent in `.velocity/agents/*.md`, generate a **thin wrapper** prompt file at `.github/agents/{agent-id}.md`. Do not copy system prompt content:

```markdown
---
mode: agent
description: [One-line role description]
tools: [list of relevant tools for this agent]
---

#file:.velocity/agents/{agent-id}.md
```

Copilot resolves the `#file:` reference at invocation time. All agent content stays in `.velocity/agents/`.

**How developers invoke agents in GitHub Copilot:**
In Copilot Chat, type `#` to open the prompt picker and select the agent by name. Or use the attach / paperclip icon → "Prompt..." and select the agent prompt file.

Example: attach `#engineer` before describing a task to load the Engineer agent context.

### `.github/prompts/`

For each skill in `.velocity/skills/*.md`, generate a **thin wrapper** prompt file. Do not copy skill content:

```markdown
---
mode: agent
description: [One-line description from skill.md]
---

#file:.velocity/skills/{skill-id}.md
```

Always include `velocity-init`, `velocity-sync`, `velocity-validate`, `grill-with-docs`.

---

## Step 13 — Run Gemini Code Assist Adapter

**Run only if `gemini` is in `detected_tools` (from Step 1.5).**

Read `.velocity/agents/` and `.velocity/skills/`.

Generate Gemini Code Assist assets following the full procedure in `skills/gemini-adapter/SKILL.md`:

### `GEMINI.md`

Lean, caveman-syntax always-on entry document. Use the template at `templates/gemini/GEMINI.md`.

Substitute project-specific values:

- `{{PROJECT_NAME}}` → project name from `stack.md`
- `{{PROJECT_SUMMARY}}` → 1–2 sentence summary from stack signals
- `{{CONTEXT_CONTENT}}` → add `Read .velocity/artifacts/context/CONTEXT.md before starting.` — do not paste context content inline into GEMINI.md
- `{{CONTEXT_MAP_LINE}}` → "See .velocity/context-map.md for all bounded contexts" (monorepos only; omit for single-context repos)

**Token discipline:** Maximum 80 lines. Imperative only. No verbose explanations.

### `.gemini/agents/`

For each agent in `.velocity/agents/*.md`, generate a **thin wrapper** at `.gemini/agents/{agent-id}.md`. Do not copy system prompt content:

```markdown
---
description: [One-line purpose from agent.md]
---

Read .velocity/agents/{agent-id}.md and act according to its full definition.
```

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

## Step 14a — RALPH Loop Activation

Ask the developer whether to enable RALPH Loop for this repository.

```
Q: Would you like to enable team-level AI improvement feedback?

   When enabled, your team can rate agent output after each pipeline phase.
   Velocity learns from your ratings and improves its local skill instances
   for this project over time.

   Annotations stay in .velocity/artifacts/ralph/ — they are never sent
   to Velocity cloud or the Velocity platform.

   Recommended: Yes

→ Yes  — enable RALPH Loop
→ No   — disable for now (can be enabled later by setting ralph_enabled: true
          in .velocity/sdlc/pipeline-config.yaml)
```

Based on developer response:

- **Yes:** Set `ralph_enabled: true` in `.velocity/sdlc/pipeline-config.yaml`.
  Add a note to the summary under Next Steps: "RALPH Loop is enabled. After each pipeline phase, rate the output to help improve your local Velocity skills. Run /ralph-consumer-learn after 5+ ratings."

- **No:** Leave `ralph_enabled: false` (the default in the template). No further action.

---

## Step 15 — Summary Report

Print a summary:

```
✅ Velocity initialized

Detected tools: [list from Step 1.5]

Stack detected:
  [list detected stack components]

Bounded contexts:
  [list contexts with internal .velocity/artifacts/context/ paths]

Workspace connection:
  [Connected: {workspace-url} | Not connected]

Generated:
  .velocity/ — project intelligence, standards, guardrails
  .velocity/artifacts/context/CONTEXT.md — shared context source of truth (internal)
  .velocity/rule-packs.md — starter rule pack manifest (review before importing)

  Tool-native context files written:
  [Only list entries for detected tools]

  Cursor:
    .cursor/rules/velocity.mdc — always-on context (project intelligence + domain context injected)
    .cursor/agents/ — [N] agents (select in Composer agent dropdown: ⌘I → agent picker)
    .cursor/skills/ — [N] skills wired
    hooks.json — [N] guardrail hooks

  Claude Code:
    CLAUDE.md — always-on entry document (project intelligence + domain context injected)
    subagents/ — [N] subagents configured
    commands/ — [N] commands wired
    hooks/pre-tool-use.json — [N] hooks
    hooks/post-tool-use.json — [N] hooks

  GitHub Copilot:
    .github/copilot-instructions.md — always-on instructions (project intelligence + domain context injected)
    AGENTS.md — agent mode instructions for all roles
    .github/agents/ — [N] agent files (invoke via # in Copilot Chat or attach icon → Prompt)
    .github/prompts/ — [N] skill prompt files

  Gemini Code Assist:
    GEMINI.md — always-on entry document (project intelligence + domain context injected)
    .gemini/agents/ — [N] agent configs
    .gemini/tools/velocity-tools.json — [N] tool definitions
    .gemini/styleguide.md — coding style reference

Next steps:
  1. Run /velocity to start your first SDLC pipeline — three questions, then the right phase begins automatically
  2. Run /grill-with-docs to populate the domain glossary in .velocity/artifacts/context/CONTEXT.md — changes sync automatically to your tool-native context file on the next /sync
  3. Review .velocity/project-context/ standards files — customize for your team
  4. Review .velocity/guardrails/default.md — adjust thresholds if needed
  5. Review .velocity/rule-packs.md — confirm which external packs to import, then run /rule-pack-engine
  6. Commit all generated files to version control
  [If workspace connected:]
  7. Run /sync to pull workspace intelligence and shared context
  8. Add templates/ci/github-actions/downstream-sync.yml to .github/workflows/ to receive workspace sync signals

Tips:
  - /velocity — smart router: detect work type, select pipeline, start first phase
  - /pipeline-status — view all in-flight pipelines and their current phase
  - /velocity-sync — re-run after stack changes to regenerate all tool-native context files
  - /context-engine — validate that code names match your domain glossary
  - /adr-engine — record any architectural decisions made outside a grill session
  - /context-merge — reconcile context proposals when multiple sessions have run
  - /roadmap — sequence your feature board into a phased delivery plan
  - /workspace-setup — initialize a velocity-workspace repository for multi-repo teams
  - /rule-pack-engine — import external standards and community rule packs into Velocity
```

---

## Error Handling

- If no source files are found: create minimal `.velocity/` structure, generate empty context scaffold at `.velocity/artifacts/context/CONTEXT.md`, note that stack could not be auto-detected, and prompt developer to fill in `.velocity/project-intelligence/stack.md` manually.
- If the active AI tool cannot be detected: ask the developer before running any adapter step.
- If bounded contexts cannot be detected: create a single default context named after the repo directory.
- If any file already exists: skip it (do not overwrite) and log which files were skipped.
