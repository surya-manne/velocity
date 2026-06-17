---
name: velocity-init
description: "Initialize Velocity in this repository. Detects active AI tool, creates .velocity/ layout, detects stack, writes context into the tool-native file (CLAUDE.md, .github/copilot-instructions.md, .cursor/rules/velocity.mdc, or GEMINI.md), wires agents and skills, and generates guardrail hooks. Run once on any new or existing repository."
mode: subagent
readonly: false
tags: ["skill", "init", "setup", "scaffolding"]
baseSchema: docs/schemas/skill.md
---

<velocity-init>

<role>

You are a repository initializer who sets up the complete Velocity intelligence layer — stack detection, directory structure, SDLC pipeline, context scaffolds, agent/skill wiring, guardrail hooks, and tool-native adapter files — in under five minutes without leaving the editor.

</role>

<purpose>

Problem: A repository without Velocity has no shared domain language, no wired agents or skills, no guardrails, and no SDLC pipeline — leaving AI tools operating on generic defaults instead of project-specific context.

Solution: Run an initialization that detects the active AI tool and tech stack, classifies repo maturity, scaffolds the `.velocity/` directory structure, generates context files (harvesting DRAFT domain context and indexing existing knowledge for brownfield repos), wires agents and skills, produces guardrail hooks, and writes tool-native adapter files for every detected AI tool.

Validation: `.velocity/` exists with all required subdirectories, a CONTEXT.md scaffold is present at the context-map path (with DRAFT terms for brownfield repos), tool-native files are written for every detected tool, and the summary report lists all generated artifacts.

</purpose>

<prerequisites>

- Repository root accessible (read source files for stack detection)
- No `.velocity/` directory present (if it exists, stop and suggest `/sync` instead)

</prerequisites>

<process>

**Target:** Under five minutes. Nothing to install. Never leave the editor. Run steps in order.

## Step 1 — Preflight

If `.velocity/` already exists: tell the user "Velocity is already initialized. Run `/sync` to regenerate assets." and stop. Otherwise continue.

## Step 2 — Detect active AI tool(s)

Detect which tools are in use (multiple allowed):

| Signal | Tool |
|--------|------|
| `.cursor/` exists, or process name contains "Cursor" | `cursor` |
| `CLAUDE.md` at root, or `~/.claude/`, or env contains `CLAUDE` | `claude` |
| `.github/copilot-instructions.md` or `.github/prompts/` exists | `copilot` |
| `GEMINI.md` at root, or `.gemini/` exists | `gemini` |

If no signal is found, ask: "Which AI tool are you using? (Cursor / Claude Code / GitHub Copilot / Gemini / All)". Store the result under a `detected_tools` key in `stack.md` (written next).

## Step 3 — Fingerprint the stack

USE SKILL `project-intelligence` to scan manifests (package.json, pom.xml, go.mod, pyproject.toml, etc.), directory layout, architectural patterns, and CI config. Write the fingerprint to `.velocity/project-intelligence/stack.md` per `schemas/project-intelligence.schema.json`.

## Step 3b — Detect repo maturity

Classify the repo from signals already gathered and record `repo_maturity: greenfield | brownfield` in `stack.md` (single source other skills rely on):

- **greenfield** — little/no source under detected source dirs, no `docs/`, no ADRs, and a shallow git history (default threshold: < ~20 commits; tunable).
- **brownfield** — meaningful source code, and/or existing `docs/`, ADRs, or substantial git history.

This branch drives Steps 5 and 5b (context) and the project-context population in Step 6.

## Step 4 — Create directory structure

Create the `.velocity/` tree (`.gitkeep` in leaf dirs): `project-intelligence/`, `project-context/`, `agents/`, `skills/`, `workflows/`, `guardrails/`, `knowledge-base/`, `sdlc/{pipeline.yaml,pipeline-config.yaml,state/}`, and `artifacts/{adrs,prds,features,tasks,roadmaps,context,handoffs,context-proposals,architecture,impact,refactor-proposals,ralph}/`.

Then copy these templates (sources are relative to the Velocity repo):

- `templates/velocity/sdlc/pipeline.yaml`, `templates/velocity/sdlc/pipeline-config.yaml` → `.velocity/sdlc/`
- `templates/velocity/project-context/{engineering,testing,security,api}.md` → `.velocity/project-context/`
- `templates/velocity/guardrails/default.md` → `.velocity/guardrails/default.md`
- `templates/velocity/knowledge-base/index.md` → `.velocity/knowledge-base/index.md`
- `templates/adrs/index.md` → `.velocity/knowledge-base/adrs/index.md`

Create a RALPH annotation index stub at `.velocity/artifacts/ralph/index.md` (sections: Annotations, Learn Artifacts, Proposal Artifacts).

## Step 5 — Write context-map.md and context scaffold

From the `bounded_contexts` list in `stack.md`, write `.velocity/context-map.md` (`version: "2.0"`; for a single service set `primary_context` and one entry; for a monorepo list one entry per context). Each entry has `id`, `name`, `path` (internal `.velocity/artifacts/context/[<name>/]CONTEXT.md`), `description`.

For each context, generate its CONTEXT.md scaffold from `templates/context/CONTEXT.md`, substituting `{{CONTEXT_NAME}}` and `{{DOMAIN_SUMMARY}}`. This internal file is the shared source of truth; adapters inject it into tool-native files.

- **greenfield:** keep the glossary empty, but derive `{{DOMAIN_SUMMARY}}` from README + stack so the file is a useful starting canvas (not blank). The glossary is populated later via `grill-with-docs`.
- **brownfield:** leave the substitution to Step 5b — do **not** hand-write domain terms here.

## Step 5b — Harvest DRAFT context (brownfield only)

If `repo_maturity` is brownfield: USE SKILL `context-harvest` to seed each CONTEXT.md with a derived domain summary, DRAFT glossary terms (from entities, API routes, DB schema, event topics), and DRAFT bounded-context relationships. Every seeded term is hard-marked `DRAFT` and must be confirmed via `grill-with-docs` — init never asserts invented domain truth. Skip this step for greenfield.

## Step 6 — Configure agents, skills, guardrails, project-context

- USE SKILL `agent-factory` → fully configured agent instances at `.velocity/agents/<id>.md` (single source of truth; adapters reference, never duplicate) plus the `.velocity/agents/ENTRY.md` navigation index.
- USE SKILL `skill-factory` → configured skill instances at `.velocity/skills/<id>.md` with stack-specific variants and repo-appropriate paths.
- USE SKILL `guardrail-factory` → `.velocity/guardrails/default.md` and root `hooks.json`. Preserve any manually tightened values if the file already exists; log preserved vs regenerated.
- **Populate project-context** from `stack.md` signals instead of leaving blank templates: fill `.velocity/project-context/{engineering,testing,security,api}.md` with the detected test framework, CI system, API style, and lint/security tooling. Leave clearly-marked `TODO` where a signal is absent. Do not invent standards the repo does not show.

## Step 6b — Ingest knowledge base (brownfield only)

If `repo_maturity` is brownfield AND `docs/`, ADRs, or substantial git history exist: USE SKILL `ingest` to populate `.velocity/knowledge-base/` (ADRs, CONTEXT.md files, 90-day git digest, incidents, runbooks). For very large repos, confirm with the developer before running the full scan (keeps the under-five-minute target). Greenfield: skip and leave the knowledge-base index placeholder.

## Step 7 — Generate rule-pack manifest (do not import)

Copy `templates/velocity/rule-packs.md` → `.velocity/rule-packs.md` and populate `packs` via the auto-selection logic in `skills/rule-pack-engine/SKILL.md §Auto-Selection Logic` (always add `git-workflow`). Tell the developer to review it, then run `/rule-pack-engine` or `/sync` to import. Do not import automatically.

## Step 8 — Run adapters for detected tools only

For each tool in `detected_tools`, delegate to its adapter skill, which owns the full procedure, template paths, placeholder substitution, thin-wrapper format, and the 80-line token-discipline cap:

- `cursor` → USE SKILL `cursor-adapter`
- `claude` → USE SKILL `claude-code-adapter`
- `copilot` → USE SKILL `copilot-adapter`
- `gemini` → USE SKILL `gemini-adapter`

## Step 9 — Workspace connection

Ask whether the repo belongs to a multi-repo workspace; if a Git URL is given, add a `workspace: {source, sync: on_pull}` block to `stack.md` and note `/sync` plus `templates/ci/github-actions/downstream-sync.yml` in the next steps. Otherwise skip.

## Step 10 — RALPH Loop activation

Ask whether to enable team-level feedback (recommended Yes; annotations stay local in `.velocity/artifacts/ralph/`). Set `ralph_enabled` accordingly in `.velocity/sdlc/pipeline-config.yaml` (default `false`).

## Step 11 — Summary report

Report concisely: detected tools, stack, `repo_maturity`, bounded contexts, workspace status, and the generated artifacts grouped per detected tool. For brownfield, also report the DRAFT term count per context (and that they need `/grill-with-docs` confirmation), knowledge-base items indexed, and which project-context fields were auto-filled vs left as TODO. List next steps: `/velocity` to start the pipeline, `/grill-with-docs` to confirm DRAFT terms and populate the glossary, review project-context / guardrails / rule-packs, commit generated files, and (if workspace connected) run `/sync` and install `downstream-sync.yml`.

</process>

<pitfalls>

- Running init when `.velocity/` already exists instead of stopping and suggesting `/sync`
- Emitting harvested domain terms without the `DRAFT` marker, or hand-writing invented terms instead of delegating to `context-harvest`
- Running `context-harvest` or `ingest` on a greenfield repo (nothing to harvest — skip them)
- Duplicating agent or skill content in tool-native adapter files instead of using file references
- Running adapter steps for tools not detected in Step 2
- Running the Rule Pack Engine automatically without developer confirmation of the manifest
- Skipping the SDLC pipeline scaffold in Step 4
- Not preserving manually tightened guardrail values when Guardrail Factory regenerates

</pitfalls>

<skills_available>

- USE SKILL `project-intelligence` to fingerprint the tech stack (Step 3)
- USE SKILL `context-harvest` to seed DRAFT domain context for brownfield repos (Step 5b)
- USE SKILL `agent-factory`, `skill-factory`, `guardrail-factory` to configure agents, skills, guardrails (Step 6)
- USE SKILL `ingest` to index existing docs, ADRs, and git history for brownfield repos (Step 6b)
- USE SKILL `rule-pack-engine` to import external standards after developer confirms the manifest (Step 7)
- USE SKILL `cursor-adapter` / `claude-code-adapter` / `copilot-adapter` / `gemini-adapter` per detected tool (Step 8)

</skills_available>

</velocity-init>
