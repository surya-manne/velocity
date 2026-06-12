---
name: copilot-adapter
description: "Translate .velocity/ assets into native GitHub Copilot assets following progressive disclosure. Generates lean .github/copilot-instructions.md, AGENTS.md, and .github/prompts/ prompt files. Run automatically by /init and /sync. Invoke manually to regenerate Copilot assets after editing .velocity/ configs directly."
---


# GitHub Copilot Adapter

Generate GitHub Copilot-native assets from .velocity/ configuration.

## Context Load

Read before starting:

1. `.velocity/agents/ENTRY.md` — the always-on navigation index
2. `.velocity/agents/*.md` — all configured agent instances
3. `.velocity/skills/*.md` — all configured skill instances
4. `.velocity/guardrails/default.md` — guardrail config and hooks
5. `.velocity/project-context/` — all standards files
6. `.velocity/project-intelligence/stack.md` — stack info for project name/summary
7. `.velocity/workspace-intelligence/graph.md` (if it exists) — workspace graph for multi-repo context injection
8. `.velocity/context-map.md` — bounded context paths (workspace or repo-level)

---

## What This Adapter Generates

```
.github/
  copilot-instructions.md    ← always-on lean context (auto-injected by Copilot)
  prompts/
    grill-with-docs.prompt.md
    domain-model.prompt.md
    to-prd.prompt.md
    to-features.prompt.md
    to-tasks.prompt.md
    tdd.prompt.md
    handoff.prompt.md
    prototype.prompt.md
    improve-codebase-architecture.prompt.md
    velocity-validate.prompt.md
    velocity-sync.prompt.md
    velocity-loop.prompt.md
    ingest.prompt.md
    adr-engine.prompt.md
    context-engine.prompt.md
    context-merge.prompt.md
    roadmap.prompt.md
    design-intelligence.prompt.md
    architecture-doc.prompt.md
    api-design.prompt.md
    security-design.prompt.md
    test-strategy.prompt.md
    [one .prompt.md per configured skill]

AGENTS.md                    ← project-wide agent instructions for Copilot agent mode
```

---

## Step 1 — Generate `.github/copilot-instructions.md`

The always-on instructions file is automatically read by GitHub Copilot at the start of every chat session and injected into every request.

**Rules:**

- Maximum 80 lines
- Caveman syntax: telegraphic, imperative, no preamble
- Navigation only: points to files, never reproduces content inline
- Every word is paid for on every session — minimize ruthlessly

Source content from `.velocity/agents/ENTRY.md`.

Output format:

```markdown
# [Project Name]

[1–2 sentence project summary]

## Domain language

Before feature work: read [CONTEXT.md path]
[For monorepos: "See .velocity/context-map.md for all bounded contexts"]
[If workspace-connected: "Workspace context map: .velocity/context-map.md"]
All names (variables, files, API terms) must match CONTEXT.md glossary.

## Standards

- Engineering: .velocity/project-context/engineering.md
- Testing: .velocity/project-context/testing.md
- Security: .velocity/project-context/security.md
- API: .velocity/project-context/api.md

[If workspace-connected and workspace guardrails differ from defaults:]

- Workspace guardrails: .velocity/guardrails/workspace.md

## ADRs

Before designing: read .velocity/knowledge-base/adrs/index.md

[If workspace-connected:]

## Workspace

[Workspace name] — [N] connected repositories
See .velocity/workspace-intelligence/graph.md for cross-repo context map.

## Prompts

Use #grill-with-docs before feature work; reads CONTEXT.md
Use #domain-model to align plan to CONTEXT.md before PRD
Use #to-prd after grill session
Use #to-features to produce vertical slice board from PRD
Use #to-tasks to decompose features into tasks with blocking relationships
Use #tdd per task, fresh window
Use #improve-codebase-architecture for periodic deepening
Use #handoff at end of each slice
Use #prototype for throwaway spike before committing
Use #velocity-validate before opening any PR
Use #velocity-sync to pull latest workspace intelligence and regenerate assets

## Guardrails

Vertical slices only. No horizontal layers.
Each slice: tests at all layers + acceptance criteria + fresh window.
CONTEXT.md term consistency enforced.
TDD loop required.
```

**Token discipline check:**

- If the generated file exceeds 80 lines: cut from the least-frequently-invoked sections
- Prompts index: one line per prompt, no descriptions
- No bullet points with explanations — just the imperative instruction

---

## Step 2 — Generate `AGENTS.md`

The `AGENTS.md` file provides project-wide agent instructions for GitHub Copilot agent mode and is also compatible with OpenAI Codex CLI. It is read automatically by Copilot when operating in agent mode.

**Rules:**

- Maximum 150 lines
- Covers all agent roles available in this project
- Describes how each agent should behave — activation signal and primary responsibility
- Points to `.velocity/` for detailed context rather than inlining it
- Includes key guardrails that all agents must enforce

Output format:

```markdown
# [Project Name] — Agent Instructions

[1–2 sentence project description]

## Context

Domain language: [CONTEXT.md path]
Standards: .velocity/project-context/
ADRs: .velocity/knowledge-base/adrs/index.md
Guardrails: .velocity/guardrails/default.md

## Guardrails (all agents enforce)

- Vertical slices only. No horizontal layers.
- Tests required at all layers before PR.
- All names must match CONTEXT.md glossary.
- TDD loop: write test → implement → verify feedback loop before moving on.
- No hardcoded secrets. No pipe-to-shell. No force push to main.
- Run #velocity-validate before opening any PR.

## Agent Roles

### Engineer

Primary implementer. Owns task execution, TDD, PR creation.
Activate for: any coding task, debugging, refactoring, PR work.
Use #tdd for each task. One task per context window.
Read .velocity/project-context/engineering.md and .velocity/project-context/testing.md before starting.

### Architect

System design and architecture decisions. Owns ADRs and API design.
Activate for: new service design, cross-cutting technical decisions, API contracts.
Use #architecture-doc, #api-design, #adr-engine.
Record every significant decision in .velocity/knowledge-base/adrs/.

### Planner

Goal decomposition. Owns the feature board and task graph.
Activate for: breaking down any goal into a sequenced plan.
Use #to-prd → #to-features → #to-tasks.
Respect blocking relationships. One task per context window.

### Researcher

Codebase investigation. Reads before writing.
Activate for: any unfamiliar area of the codebase before implementation begins.
Deliver a written investigation report before handing off to Engineer.

### Reviewer

Artifact review. Reviews PRs, ADRs, slice completeness.
Activate for: PR reviews, architecture reviews, slice sign-off.
Use #velocity-validate before approving any PR.

### Security

Security analysis and compliance. Owns threat models.
Activate for: auth, PII, payments, new public endpoints, cloud configuration.
Use #security-design. Flag and block — do not proceed past a security concern.

### QA

Test strategy and coverage. Owns the test pyramid.
Activate for: coverage gaps, test strategy decisions, CI failures.
Use #test-strategy. Enforce coverage thresholds from .velocity/guardrails/default.md.

### Product

Product strategy and discovery. Owns PRDs and roadmap.
Activate for: feature discovery, roadmap sequencing, PRD generation.
Use #grill-with-docs → #to-prd.

### UX

User experience and interaction flows. Owns screen specs and user flow maps.
Activate for: UI design, new user-facing features, flow mapping.
Use #design-intelligence.

### Documentation

Documentation generation and maintenance.
Activate for: README, runbooks, API reference, onboarding docs.
Use #architecture-doc. Source all terminology from CONTEXT.md.

### Debugger

Root cause investigation. Systematic bug analysis.
Activate for: any bug, unexpected behaviour, or test failure.
Deliver a root cause report with evidence before proposing a fix.

### Refactor

Codebase improvement. Owns architecture debt reduction.
Activate for: architecture debt, Deep Modules violations, naming inconsistencies.
Use #improve-codebase-architecture.

## Prompt Reference

| Prompt                         | When to use                                     |
| ------------------------------ | ----------------------------------------------- |
| #grill-with-docs               | Before feature work — populates domain language |
| #domain-model                  | Align plan to CONTEXT.md before PRD             |
| #to-prd                        | Discovery → PRD                                 |
| #to-features                   | PRD → vertical slice board                      |
| #to-tasks                      | Features → tasks with blocking relationships    |
| #tdd                           | Per task, fresh context window                  |
| #handoff                       | End of each slice                               |
| #prototype                     | Throwaway spike before committing               |
| #improve-codebase-architecture | Periodic architecture deepening                 |
| #velocity-validate             | Before every PR                                 |
| #velocity-sync                 | After dependency changes or new services        |
| #velocity-loop                 | Run the full task board autonomously            |
```

**Token discipline check:**

- If generated file exceeds 150 lines: trim agent descriptions to 2-line max each
- Prompt reference table: one row per prompt, no verbose descriptions

---

## Step 3 — Generate `.github/prompts/`

For each skill in `.velocity/skills/*.md` and each native Velocity command, generate a GitHub Copilot prompt file at `.github/prompts/{prompt-name}.prompt.md`.

Prompt files are invoked in VS Code Copilot Chat via `#prompt-name` or by selecting them in the prompt picker.

**Format for each prompt file:**

```markdown
---
mode: agent
description: [One-line description from skill SKILL.md frontmatter]
---

[Content of the source SKILL.md template, with paths substituted to match this repository's actual paths]
```

The `mode: agent` field tells Copilot to run this prompt in agent mode (full tool access). Use `mode: ask` for read-only investigation prompts (Researcher, Reviewer).

**Prompt filename mapping:**

| Velocity skill / command      | Copilot prompt file                                     |
| ----------------------------- | ------------------------------------------------------- |
| init                          | .github/prompts/velocity-init.prompt.md                 |
| sync                          | .github/prompts/velocity-sync.prompt.md                 |
| validate                      | .github/prompts/velocity-validate.prompt.md             |
| loop                          | .github/prompts/velocity-loop.prompt.md                 |
| grill-with-docs               | .github/prompts/grill-with-docs.prompt.md               |
| grill-me                      | .github/prompts/grill-me.prompt.md                      |
| domain-model                  | .github/prompts/domain-model.prompt.md                  |
| to-prd                        | .github/prompts/to-prd.prompt.md                        |
| to-features                   | .github/prompts/to-features.prompt.md                   |
| to-tasks                      | .github/prompts/to-tasks.prompt.md                      |
| tdd                           | .github/prompts/tdd.prompt.md                           |
| handoff                       | .github/prompts/handoff.prompt.md                       |
| prototype                     | .github/prompts/prototype.prompt.md                     |
| improve-codebase-architecture | .github/prompts/improve-codebase-architecture.prompt.md |
| ingest                        | .github/prompts/ingest.prompt.md                        |
| context-engine                | .github/prompts/context-engine.prompt.md                |
| context-merge                 | .github/prompts/context-merge.prompt.md                 |
| adr-engine                    | .github/prompts/adr-engine.prompt.md                    |
| roadmap                       | .github/prompts/roadmap.prompt.md                       |
| design-intelligence           | .github/prompts/design-intelligence.prompt.md           |
| architecture-doc              | .github/prompts/architecture-doc.prompt.md              |
| api-design                    | .github/prompts/api-design.prompt.md                    |
| security-design               | .github/prompts/security-design.prompt.md               |
| test-strategy                 | .github/prompts/test-strategy.prompt.md                 |
| workspace-intelligence        | .github/prompts/workspace-intelligence.prompt.md        |
| [stack-specific skills]       | .github/prompts/[skill-name].prompt.md                  |

**Mode assignment by prompt type:**

| mode  | Prompts                                                                                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| agent | setup, sync, loop, tdd, to-prd, to-features, to-tasks, handoff, prototype, improve-codebase-architecture, domain-model, adr-engine, api-design, security-design, architecture-doc, design-intelligence, ingest, context-engine, context-merge, validate |
| ask   | grill-with-docs, grill-me, roadmap, test-strategy, workspace-intelligence                                                                                                                                                                               |

**Path substitution:**

Before writing each prompt file, substitute all context load paths to match this repository's actual `.velocity/` structure.

Apply any stack-specific variant content from the skill config's `stack_variants_applied` field.

**`velocity-validate` prompt content:**

```markdown
---
mode: agent
description: Run Velocity guardrail checks on the current branch before opening a PR.
---

# Velocity Validate

Run all guardrail checks on the current branch.

## Checks

1. Read .velocity/guardrails/default.md — load all enabled guardrails.
2. Run the feedback loop checks defined in the guardrail config:
   - Type checks (if enabled)
   - Lint (if enabled)
   - Unit tests (if enabled)
   - Integration tests (if enabled)
3. Check that all modified files use CONTEXT.md-consistent naming.
4. Check that no guardrail-blocked patterns are present in staged changes.
5. Report pass/fail per check. Block PR if any check fails.

## Output

PASS — all checks passed. Safe to open PR.
FAIL — list each failing check with the exact error and remediation.
```

**`velocity-sync` prompt content:**

```markdown
---
mode: agent
description: Pull latest workspace intelligence and regenerate Velocity assets.
---

[Content from skills/sync/SKILL.md with paths substituted]
```

**`velocity-loop` prompt content:**

```markdown
---
mode: agent
description: Run the Velocity skill chain autonomously across all pending tasks on the feature board. Picks next unblocked task, implements through TDD, validates with guardrails, opens a PR, and repeats. Pauses for human approval on high-risk tasks.
---

[Content from skills/loop/SKILL.md with paths substituted]
```

---

## Step 4 — Create Directory Scaffold

Ensure these directories exist (create if missing):

```
.github/
.github/prompts/
```

---

## Step 5 — Validation Report

After generation:

```
✅ GitHub Copilot Adapter complete

Generated:
  .github/copilot-instructions.md — [N] lines (max 80)
  AGENTS.md — [N] lines (max 150)
  .github/prompts/ — [N] prompt files

Validation:
  ✅ copilot-instructions.md under 80 lines
  ✅ AGENTS.md under 150 lines
  ✅ All prompt files have context load steps
  ✅ velocity-validate.prompt.md present
  ✅ velocity-sync.prompt.md present
  ✅ velocity-loop.prompt.md present
  ✅ All agent roles present in AGENTS.md
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Compare current `.github/copilot-instructions.md`, `AGENTS.md`, and `.github/prompts/` files with what would be generated from current `.velocity/` state
2. Update only files that have changed
3. Never delete a `.github/prompts/` file that has been manually customized (detect customization by checking if the file differs from its template source by more than 20%)
4. Report what was updated, what was skipped (unchanged), and what was skipped (customized)

---

## Parity with Cursor and Claude Code Adapters

This adapter produces GitHub Copilot equivalents of every Cursor and Claude Code asset:

| Cursor asset                 | Claude Code equivalent    | Copilot equivalent                    |
| ---------------------------- | ------------------------- | ------------------------------------- |
| `.cursor/rules/velocity.mdc` | `CLAUDE.md`               | `.github/copilot-instructions.md`     |
| `.cursor/agents/{agent}.md`  | `subagents/{agent}.md`    | `AGENTS.md` (all agents in one file)  |
| `.cursor/skills/{skill}.md`  | `commands/{command}.md`   | `.github/prompts/{prompt}.prompt.md`  |
| `hooks.json`                 | `hooks/pre-tool-use.json` | Guardrail instructions in `AGENTS.md` |

All capabilities from Slices 1–9 are available through this adapter:

- Grill With Docs + CONTEXT.md → `#grill-with-docs` prompt + domain context in `copilot-instructions.md`
- Product Discovery → `#to-prd`, `#to-features`, `#to-tasks` prompts + Product agent in `AGENTS.md`
- TDD + Deep Modules → `#tdd` prompt + Engineer agent TDD enforcement in `AGENTS.md`
- Architecture Intelligence → `#architecture-doc`, `#api-design`, `#domain-model` prompts + Architect agent
- Workspace Intelligence → `#velocity-sync` prompt + workspace context in `copilot-instructions.md`
- Guardrails → Guardrail rules in `AGENTS.md` + `#velocity-validate` prompt
- Organizational Memory → `#ingest`, `#handoff` prompts + Researcher/Debugger agents in `AGENTS.md`
- External Standards → `#rule-pack-engine` prompt (if configured)
- Autonomous Loop → `#velocity-loop` prompt (Slice 12)
