---
name: claude-code-adapter
description: "Translate .velocity/ assets into native Claude Code assets following progressive disclosure. Generates lean CLAUDE.md, subagents/, commands/, and hooks/. Run automatically by /velocity-init and /velocity-sync. Invoke manually to regenerate Claude Code assets after editing .velocity/ configs directly."
---


# Claude Code Adapter

Generate Claude Code-native assets from .velocity/ configuration.

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
CLAUDE.md                   ← lean always-on context (project root)
subagents/
  engineer.md               ← Engineer Agent system prompt
  architect.md              ← Architecture Agent system prompt
  security.md               ← Security Agent system prompt
  qa.md                     ← QA Agent system prompt
  product.md                ← Product Agent system prompt
  ux.md                     ← UX Agent system prompt
  planner.md                ← Planner Agent system prompt
  researcher.md             ← Researcher Agent system prompt
  reviewer.md               ← Reviewer Agent system prompt
  documentation.md          ← Documentation Agent system prompt
  debugger.md               ← Debugger Agent system prompt
  refactor.md               ← Refactor Agent system prompt
commands/
  velocity-init.md          ← /velocity-init command
  velocity-sync.md          ← /velocity-sync command
  velocity-validate.md      ← /velocity-validate command
  velocity-loop.md          ← /velocity-loop command
  grill-with-docs.md        ← /grill-with-docs command
  domain-model.md           ← /domain-model command
  to-prd.md                 ← /to-prd command
  to-features.md            ← /to-features command
  to-tasks.md               ← /to-tasks command
  tdd.md                    ← /tdd command
  handoff.md                ← /handoff command
  prototype.md              ← /prototype command
  improve-codebase-architecture.md
  grill-me.md
  validate.md
  sync.md
  [one .md per configured skill]
hooks/
  pre-tool-use.json         ← PreToolUse guardrail hooks
  post-tool-use.json        ← PostToolUse guardrail hooks
```

---

## Step 1 — Generate `CLAUDE.md`

The always-on entry document is read by Claude Code at the start of every session.

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

## Commands

/grill-with-docs — before feature work; reads CONTEXT.md
/domain-model — align plan to CONTEXT.md before PRD
/to-prd — after grill session
/to-features — PRD → vertical slice board
/to-tasks — features → tasks with blocking relationships
/tdd — per task, fresh window
/improve-codebase-architecture — periodic deepening
/handoff — end of each slice
/prototype — throwaway spike before committing
/velocity-sync — pull latest workspace intelligence; regenerate assets
/velocity-validate — run guardrail checks before PR

## Agents

Engineer — implement tasks, run tdd, create PRs
Planner — decompose goals into slices and tasks
Researcher — investigate before implementation
Reviewer — review PRs, ADRs, slices
Architect — system design, ADRs, API design
Security — threat model, compliance
QA — test strategy, coverage

## Guardrails

Vertical slices only. No horizontal layers.
Each slice: tests at all layers + acceptance criteria + fresh window.
CONTEXT.md term consistency enforced.
TDD loop required.
```

**Token discipline check:**

- If the generated file exceeds 80 lines: cut from the least-frequently-invoked sections
- Commands index: one line per command, no descriptions
- Agents index: one line per agent, no descriptions
- No bullet points with explanations — just the imperative instruction

---

## Step 2 — Generate `subagents/`

For each agent in `.velocity/agents/*.md`, generate a Claude Code subagent file at `subagents/{agent-id}.md`.

Claude Code subagent files contain a frontmatter block and the agent's system prompt.

Format:

```markdown
---
name: [Role Name]
description:
  [
    One-line purpose from agent.md — used by Claude to decide when to activate this subagent,
  ]
---

[System prompt content built from the agent's configuration]
```

**System prompt construction:**

Build each agent's system prompt from:

1. Role statement (1 paragraph from the agent's `description`)
2. CONTEXT.md injection (if `context_injection.context_md: true`):
   ```
   ## Domain Language
   [Full CONTEXT.md content for the relevant bounded context]
   ```
3. Workspace context injection (if `.velocity/workspace-intelligence/graph.md` exists):
   ```
   ## Workspace Context
   Workspace: [workspace name] ([N] repositories)
   Architecture: [style]
   Related bounded contexts:
   - [context-id] in [repo-name]: [description]
   See .velocity/workspace-intelligence/graph.md for cross-repo dependencies.
   ```
   Inject workspace context at `title-only` tier — never inject full workspace graph inline.
4. Standards injection (one section per standards file in `context_injection.standards`):
   ```
   ## [Standard name]
   [Full content of the standards file]
   ```
   If workspace standards exist and differ from repo-level: use workspace standards (they take precedence).
5. ADR injection at the configured tier:
   - `title-only`: `## Architecture Decisions\n[ADR title list]`
   - `summary`: `## Architecture Decisions\n[ADR title + decision + consequences for each]`
   - `full`: `## Architecture Decisions\n[Full ADR bodies]`
6. Wired commands list:
   ```
   ## Your Commands
   /[command-name]: [one-line description]
   ```
7. Activated subagents (rendered as a guidance note, since Claude Code subagents are invoked via description matching):
   ```
   ## Subagent Guidance
   Delegate to subagents when their expertise is needed:
   [subagent-name]: [one-line description] — delegate when [signal]
   ```
8. Guardrails:
   ```
   ## Guardrails You Enforce
   [guardrail list — merged workspace + repo guardrails; workspace takes precedence on conflicts]
   ```

**Token budget per subagent system prompt:** aim for under 1500 tokens (≈1125 words). Check and trim if exceeded. Priority order for trimming:

1. ADRs (reduce tier if over budget)
2. Standards (keep — they are already concise)
3. Commands/subagent descriptions (trim to one-line-only)
4. CONTEXT.md (never trim — this is the domain language)

**Special subagents for Claude Code:**

Claude Code uses the `description` frontmatter field to determine when to activate a subagent. Write descriptions that match the activation signal clearly:

| Agent         | description value                                                                        |
| ------------- | ---------------------------------------------------------------------------------------- |
| Engineer      | "Primary implementation agent. Activate for any coding task, PR creation, or TDD work."  |
| Architect     | "System design and ADR authoring. Activate for architecture decisions, API design."      |
| Security      | "Security review. Activate when touching auth, PII, payments, or new public endpoints."  |
| QA            | "Test strategy and coverage. Activate when test coverage is low or strategy is unclear." |
| Product       | "Product strategy and PRDs. Activate for discovery, roadmap, or PRD generation."         |
| UX            | "User experience and flows. Activate for UI design, user flow mapping, screen specs."    |
| Planner       | "Goal decomposition. Activate to break down any goal into a sequenced plan."             |
| Researcher    | "Codebase investigation. Activate before starting work on unfamiliar code."              |
| Reviewer      | "Review any artifact. Activate for PR reviews, ADR reviews, slice completeness checks."  |
| Documentation | "Generate and maintain docs. Activate for README, runbook, or API reference generation." |
| Debugger      | "Root cause investigation. Activate for any bug or unexpected behavior."                 |
| Refactor      | "Codebase improvement. Activate when architecture debt is detected."                     |

---

## Step 3 — Generate `commands/`

For each skill in `.velocity/skills/*.md` and each native Velocity command, generate a Claude Code command file at `commands/{command-name}.md`.

Claude Code command files are markdown files whose content is injected as a prompt when the slash command is invoked.

**Format for each command file:**

```markdown
[Content of the source SKILL.md template, with paths substituted to match this repository's actual paths]
```

No frontmatter is required for Claude Code commands. The filename determines the command name.

**Command filename mapping:**

| Velocity skill / command                   | Claude Code command file                  |
| ------------------------------------------ | ----------------------------------------- |
| init                                       | commands/velocity-init.md                 |
| sync                                       | commands/velocity-sync.md                 |
| validate                                   | commands/velocity-validate.md             |
| loop (autonomous)                          | commands/velocity-loop.md                 |
| grill-with-docs                            | commands/grill-with-docs.md               |
| grill-me                                   | commands/grill-me.md                      |
| domain-model                               | commands/domain-model.md                  |
| to-prd                                     | commands/to-prd.md                        |
| to-features                                | commands/to-features.md                   |
| to-tasks                                   | commands/to-tasks.md                      |
| tdd                                        | commands/tdd.md                           |
| handoff                                    | commands/handoff.md                       |
| prototype                                  | commands/prototype.md                     |
| improve-codebase-architecture              | commands/improve-codebase-architecture.md |
| sync                                       | commands/velocity-sync.md                 |
| ingest                                     | commands/ingest.md                        |
| context-engine                             | commands/context-engine.md                |
| context-merge                              | commands/context-merge.md                 |
| adr-engine                                 | commands/adr-engine.md                    |
| roadmap                                    | commands/roadmap.md                       |
| design-intelligence                        | commands/design-intelligence.md           |
| workspace-intelligence                     | commands/workspace-intelligence.md        |
| architecture-doc                           | commands/architecture-doc.md              |
| api-design                                 | commands/api-design.md                    |
| security-design                            | commands/security-design.md               |
| test-strategy                              | commands/test-strategy.md                 |
| improve-codebase-architecture              | commands/improve-codebase-architecture.md |
| [stack-specific skills from Skill Factory] | commands/[skill-name].md                  |

**Path substitution:**

Before writing each command file, substitute all context load paths to match this repository's actual `.velocity/` structure.

Apply any stack-specific variant content from the skill config's `stack_variants_applied` field.

**`/velocity-loop` command content:**

```markdown
[Content from skills/loop/SKILL.md with paths substituted for this repository's actual .velocity/ structure]
```

---

## Step 4 — Generate `hooks/`

Generate the Claude Code hooks configuration from `.velocity/guardrails/default.md`.

### `hooks/pre-tool-use.json`

Contains PreToolUse hooks — evaluated before any tool call executes.

Format:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "tool": "Bash",
      "matcher": {
        "pattern": "{regex pattern}"
      },
      "action": "block | warn",
      "message": "{human-readable message with remediation}"
    }
  ]
}
```

**Always include the default safety hooks (even if not in guardrails config):**

- Block `git push --force` (non-lease)
- Block `git reset --hard`
- Warn on direct commits to `main`/`master`
- Warn on `rm -rf` outside of build artifacts
- Block DROP TABLE / DROP DATABASE / DROP SCHEMA
- Warn on DELETE without WHERE clause
- Block pipe-to-shell (curl | sh)
- Warn on package publish without confirmation

Source these from `templates/claude-code/hooks/pre-tool-use.json`.

Append any additional hooks from `.velocity/guardrails/default.md` `pre_tool_use_hooks` field.

### `hooks/post-tool-use.json`

Contains PostToolUse hooks — evaluated after a tool call completes.

Format mirrors `pre-tool-use.json` with `"event": "PostToolUse"`.

Default PostToolUse hooks:

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "tool": "Bash",
      "matcher": {
        "pattern": "npm install|yarn add|pnpm add|pip install|go get|cargo add"
      },
      "action": "notify",
      "message": "Dependency added. Run /velocity-sync to update Project Intelligence and regenerate skill configs."
    },
    {
      "event": "PostToolUse",
      "tool": "Write",
      "matcher": {
        "pattern": "CONTEXT\\.md"
      },
      "action": "notify",
      "message": "CONTEXT.md modified directly. Consider using /grill-with-docs to produce a proposal instead of direct edits, to preserve the audit trail."
    }
  ]
}
```

---

## Step 5 — Create Directory Scaffold

Ensure these directories exist (create if missing):

```
subagents/
commands/
hooks/
```

---

## Step 6 — Validation Report

After generation:

```
✅ Claude Code Adapter complete

Generated:
  CLAUDE.md — [N] lines (max 80)
  subagents/ — [N] subagent configs
  commands/ — [N] command files
  hooks/pre-tool-use.json — [N] hooks
  hooks/post-tool-use.json — [N] hooks

Validation:
  ✅ CLAUDE.md under 80 lines
  ✅ All subagent system prompts under 1500 tokens
  ✅ All command files have context load steps
  ✅ Default safety hooks present in pre-tool-use.json
  ✅ /velocity-init, /velocity-sync, /velocity-validate, /velocity-loop present
```

---

## Delta Mode (for /velocity-sync)

When invoked with `--delta`:

1. Compare current `CLAUDE.md`, `subagents/`, `commands/`, `hooks/` files with what would be generated from current `.velocity/` state
2. Update only files that have changed
3. Never delete a `commands/` file that has been manually customized (detect customization by checking if the file differs from its template source by more than 20%)
4. Report what was updated, what was skipped (unchanged), and what was skipped (customized)

---

## Parity with Cursor Adapter

This adapter produces Claude Code equivalents of every Cursor asset:

| Cursor asset                   | Claude Code equivalent                                 |
| ------------------------------ | ------------------------------------------------------ |
| `.cursor/rules/velocity.mdc`   | `CLAUDE.md`                                            |
| `.cursor/agents/{agent}.md`    | `subagents/{agent}.md`                                 |
| `.cursor/skills/{skill}.md`    | `commands/{command}.md`                                |
| `hooks.json` (PreToolUse only) | `hooks/pre-tool-use.json` + `hooks/post-tool-use.json` |

All capabilities from Slices 1–9 are available through this adapter:

- Grill With Docs + CONTEXT.md → `/grill-with-docs` command + Engineer subagent context injection
- Product Discovery → `/to-prd`, `/to-features`, `/to-tasks` commands + Product subagent
- TDD + Deep Modules → `/tdd` command + Engineer subagent enforcement
- Architecture Intelligence → `/architecture-doc`, `/api-design`, `/domain-model` commands + Architect subagent
- Workspace Intelligence → `/velocity-sync` command + workspace context in `CLAUDE.md`
- Guardrails + Hooks → `hooks/` directory + `/velocity-validate` command
- Organizational Memory → `/ingest`, `/handoff` commands + Researcher/Debugger subagents
- External Standards → `/rule-pack-engine` command (if configured)
- Autonomous Loop → `/velocity-loop` command
