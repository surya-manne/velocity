---
mode: agent
description: "Translate .velocity/ assets into native Gemini Code Assist assets following progressive disclosure. Generates lean GEMINI.md, .gemini/agents/ agent configurations, and .gemini/tools/ tool definitions. Run automatically by /init and /sync. Invoke manually to regenerate Gemini assets after editing .velocity/ configs directly."
---


# Gemini Code Assist Adapter

Generate Gemini Code Assist-native assets from .velocity/ configuration.

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
GEMINI.md                    ← lean always-on entry document (project root)
.gemini/
  agents/
    engineer.md              ← Engineer Agent system prompt
    architect.md             ← Architect Agent system prompt
    security.md              ← Security Agent system prompt
    qa.md                    ← QA Agent system prompt
    product.md               ← Product Agent system prompt
    ux.md                    ← UX Agent system prompt
    planner.md               ← Planner Agent system prompt
    researcher.md            ← Researcher Agent system prompt
    reviewer.md              ← Reviewer Agent system prompt
    documentation.md         ← Documentation Agent system prompt
    debugger.md              ← Debugger Agent system prompt
    refactor.md              ← Refactor Agent system prompt
  tools/
    velocity-tools.json      ← Gemini tool definitions for Velocity skill invocation
  styleguide.md              ← project coding style, sourced from project-context standards
```

---

## Step 1 — Generate `GEMINI.md`

The always-on entry document is read by Gemini Code Assist at the start of every session.

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

## Skills

grill-with-docs — before feature work; reads CONTEXT.md
domain-model — align plan to CONTEXT.md before PRD
to-prd — after grill session
to-features — PRD → vertical slice board
to-tasks — features → tasks with blocking relationships
tdd — per task, fresh window
improve-codebase-architecture — periodic deepening
handoff — end of each slice
prototype — throwaway spike before committing
velocity-sync — pull latest workspace intelligence; regenerate assets
velocity-validate — run guardrail checks before PR

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
- Skills index: one line per skill, no descriptions
- Agents index: one line per agent, no descriptions
- No bullet points with explanations — just the imperative instruction

---

## Step 2 — Generate `.gemini/agents/`

For each agent in `.velocity/agents/*.md`, generate a Gemini agent configuration file at `.gemini/agents/{agent-id}.md`.

Gemini agent files contain a frontmatter block and the agent's system prompt. Gemini Code Assist uses the `name` and `description` frontmatter to surface the correct agent persona.

Format:

```markdown
---
name: [Role Name]
description: [One-line purpose — used by Gemini to activate the correct persona]
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
6. Wired skills list:
   ```
   ## Your Skills
   [skill-name]: [one-line description]
   ```
7. Guardrails:
   ```
   ## Guardrails You Enforce
   [guardrail list — merged workspace + repo guardrails; workspace takes precedence on conflicts]
   ```

**Token budget per agent system prompt:** aim for under 1500 tokens (≈1125 words). Check and trim if exceeded. Priority order for trimming:

1. ADRs (reduce tier if over budget)
2. Standards (keep — they are already concise)
3. Skills descriptions (trim to one-line-only)
4. CONTEXT.md (never trim — this is the domain language)

**Agent description values for Gemini activation:**

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

## Step 3 — Generate `.gemini/tools/velocity-tools.json`

Generate a Gemini tool definitions file that allows Gemini Code Assist to invoke Velocity skills as structured tool calls.

Each Velocity skill is declared as a Gemini function tool. Gemini uses these declarations to understand what skills are available and when to invoke them.

Format:

```json
{
  "tools": [
    {
      "name": "grill_with_docs",
      "description": "Run a context-aware discovery interview to populate domain language in CONTEXT.md. Use before starting any feature work.",
      "parameters": {
        "type": "object",
        "properties": {
          "focus": {
            "type": "string",
            "description": "Optional: the feature or domain area to focus the interview on."
          }
        },
        "required": []
      }
    },
    {
      "name": "domain_model",
      "description": "Align the proposed plan to the CONTEXT.md glossary. Produces a domain model artifact. Use before generating a PRD.",
      "parameters": {
        "type": "object",
        "properties": {
          "input": {
            "type": "string",
            "description": "The feature idea or rough plan to align."
          }
        },
        "required": ["input"]
      }
    },
    {
      "name": "to_prd",
      "description": "Transform a grill session output or feature idea into a structured PRD. Use after grill-with-docs.",
      "parameters": {
        "type": "object",
        "properties": {
          "input": {
            "type": "string",
            "description": "Grill session output or feature brief to transform."
          }
        },
        "required": ["input"]
      }
    },
    {
      "name": "to_features",
      "description": "Decompose a PRD into a vertical slice feature board. Use after to-prd.",
      "parameters": {
        "type": "object",
        "properties": {
          "prd_path": {
            "type": "string",
            "description": "Path to the PRD artifact to decompose."
          }
        },
        "required": []
      }
    },
    {
      "name": "to_tasks",
      "description": "Decompose features into tasks with blocking relationships. Use after to-features.",
      "parameters": {
        "type": "object",
        "properties": {
          "features_path": {
            "type": "string",
            "description": "Path to the features artifact to decompose."
          }
        },
        "required": []
      }
    },
    {
      "name": "tdd",
      "description": "Run the TDD loop for a single task. Write test → implement → verify feedback loop. Use per task in a fresh context window.",
      "parameters": {
        "type": "object",
        "properties": {
          "task": {
            "type": "string",
            "description": "The task ID or description to implement."
          }
        },
        "required": ["task"]
      }
    },
    {
      "name": "handoff",
      "description": "Generate a handoff artifact at the end of a slice. Records what was built, decisions made, and what the next slice should do.",
      "parameters": {
        "type": "object",
        "properties": {
          "slice_id": {
            "type": "string",
            "description": "The slice identifier for the handoff."
          }
        },
        "required": []
      }
    },
    {
      "name": "velocity_validate",
      "description": "Run all Velocity guardrail checks before opening a PR. Runs type checks, lint, tests, and CONTEXT.md consistency checks.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "velocity_sync",
      "description": "Pull latest workspace intelligence and regenerate all Velocity assets (GEMINI.md, agents, tools). Use after dependency changes or new services.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "improve_codebase_architecture",
      "description": "Analyse the codebase for Deep Modules violations, architecture debt, and naming inconsistencies. Produces improvement proposals.",
      "parameters": {
        "type": "object",
        "properties": {
          "scope": {
            "type": "string",
            "description": "Optional: directory or module to scope the analysis to."
          }
        },
        "required": []
      }
    },
    {
      "name": "adr_engine",
      "description": "Record an architectural decision. Generates a structured ADR and adds it to the knowledge base.",
      "parameters": {
        "type": "object",
        "properties": {
          "decision": {
            "type": "string",
            "description": "The architectural decision to record."
          }
        },
        "required": ["decision"]
      }
    },
    {
      "name": "architecture_doc",
      "description": "Generate or update the architecture documentation from current code and ADRs.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "api_design",
      "description": "Design or review an API contract. Produces an API spec artifact aligned to project standards.",
      "parameters": {
        "type": "object",
        "properties": {
          "scope": {
            "type": "string",
            "description": "The API surface or endpoint group to design."
          }
        },
        "required": []
      }
    },
    {
      "name": "security_design",
      "description": "Run a security design review. Produces a threat model and mitigation plan.",
      "parameters": {
        "type": "object",
        "properties": {
          "scope": {
            "type": "string",
            "description": "The feature or component to review."
          }
        },
        "required": []
      }
    },
    {
      "name": "ingest",
      "description": "Ingest an external document into the Velocity knowledge base (ADR, runbook, incident, spec).",
      "parameters": {
        "type": "object",
        "properties": {
          "document_path": {
            "type": "string",
            "description": "Path to the document to ingest."
          },
          "type": {
            "type": "string",
            "enum": ["adr", "runbook", "incident", "spec", "decision"],
            "description": "The type of document being ingested."
          }
        },
        "required": ["document_path", "type"]
      }
    },
    {
      "name": "prototype",
      "description": "Run a throwaway spike to validate a technical approach before committing. Produces a spike report — no production code is kept.",
      "parameters": {
        "type": "object",
        "properties": {
          "hypothesis": {
            "type": "string",
            "description": "The technical question the spike should answer."
          }
        },
        "required": ["hypothesis"]
      }
    },
    {
      "name": "roadmap",
      "description": "Sequence the feature board into a phased delivery roadmap.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "test_strategy",
      "description": "Generate or review the test strategy for the current feature or codebase.",
      "parameters": {
        "type": "object",
        "properties": {
          "scope": {
            "type": "string",
            "description": "Optional: feature or module to scope the test strategy to."
          }
        },
        "required": []
      }
    }
  ]
}
```

---

## Step 4 — Generate `.gemini/styleguide.md`

The styleguide file gives Gemini Code Assist a concise coding style reference sourced from the project's standards files.

Output format:

```markdown
# [Project Name] — Coding Style Guide

Source: .velocity/project-context/engineering.md
Full standards: .velocity/project-context/

## Key Rules

[Top 10 most important rules extracted from engineering.md, testing.md, and api.md — one line each]

## Domain Language

All names (variables, functions, files, API terms) must match CONTEXT.md glossary.
Path: [CONTEXT.md path]
```

---

## Step 5 — Create Directory Scaffold

Ensure these directories exist (create if missing):

```
.gemini/
.gemini/agents/
.gemini/tools/
```

---

## Step 6 — Validation Report

After generation:

```
✅ Gemini Code Assist Adapter complete

Generated:
  GEMINI.md — [N] lines (max 80)
  .gemini/agents/ — [N] agent configs
  .gemini/tools/velocity-tools.json — [N] tool definitions
  .gemini/styleguide.md — coding style reference

Validation:
  ✅ GEMINI.md under 80 lines
  ✅ All agent system prompts under 1500 tokens
  ✅ All agent files have context load steps
  ✅ velocity_validate tool present
  ✅ velocity_sync tool present
  ✅ tdd tool present
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Compare current `GEMINI.md`, `.gemini/agents/`, `.gemini/tools/`, and `.gemini/styleguide.md` files with what would be generated from current `.velocity/` state
2. Update only files that have changed
3. Never delete a `.gemini/agents/` file that has been manually customized (detect customization by checking if the file differs from its template source by more than 20%)
4. Report what was updated, what was skipped (unchanged), and what was skipped (customized)

---

## Parity with Cursor, Claude Code, and Copilot Adapters

This adapter produces Gemini Code Assist equivalents of every Cursor and Claude Code asset:

| Cursor asset                 | Claude Code equivalent    | Copilot equivalent                   | Gemini equivalent                       |
| ---------------------------- | ------------------------- | ------------------------------------ | --------------------------------------- |
| `.cursor/rules/velocity.mdc` | `CLAUDE.md`               | `.github/copilot-instructions.md`    | `GEMINI.md`                             |
| `.cursor/agents/{agent}.md`  | `subagents/{agent}.md`    | `AGENTS.md` (all agents in one file) | `.gemini/agents/{agent}.md`             |
| `.cursor/skills/{skill}.md`  | `commands/{command}.md`   | `.github/prompts/{prompt}.prompt.md` | `.gemini/tools/velocity-tools.json`     |
| `hooks.json`                 | `hooks/pre-tool-use.json` | Guardrail rules in `AGENTS.md`       | Guardrail rules in agent system prompts |

All capabilities from Slices 1–9 are available through this adapter:

- Grill With Docs + CONTEXT.md → `grill_with_docs` tool + domain context in `GEMINI.md`
- Product Discovery → `to_prd`, `to_features`, `to_tasks` tools + Product agent
- TDD + Deep Modules → `tdd` tool + Engineer agent TDD enforcement
- Architecture Intelligence → `architecture_doc`, `api_design`, `domain_model` tools + Architect agent
- Workspace Intelligence → `velocity_sync` tool + workspace context in `GEMINI.md`
- Guardrails → Guardrail rules in agent system prompts + `velocity_validate` tool
- Organizational Memory → `ingest`, `handoff` tools + Researcher/Debugger agents
- External Standards → `rule_pack_engine` tool (if configured)
