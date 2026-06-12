---
mode: agent
description: "Translate .velocity/ assets into native Cursor assets following progressive disclosure. Generates lean .cursor/rules/, .cursor/agents/, .cursor/skills/, and hooks.json. Run automatically by /init and /sync. Invoke manually to regenerate Cursor assets after editing .velocity/ configs directly."
---


# Cursor Adapter

Generate Cursor-native assets from .velocity/ configuration.

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
.cursor/
  rules/
    velocity.mdc         ← always-on lean context
  agents/
    engineer.md          ← Engineer Agent system prompt
    architect.md         ← Architecture Agent system prompt
    security.md          ← Security Agent system prompt
    qa.md                ← QA Agent system prompt
    product.md           ← Product Agent system prompt
    ux.md                ← UX Agent system prompt
    planner.md           ← Planner Agent system prompt
    researcher.md        ← Researcher Agent system prompt
    reviewer.md          ← Reviewer Agent system prompt
    documentation.md     ← Documentation Agent system prompt
    debugger.md          ← Debugger Agent system prompt
    refactor.md          ← Refactor Agent system prompt

  skills/
    [one SKILL.md per configured skill]

hooks.json               ← PreToolUse + PostToolUse guardrail hooks
```

---

## Step 1 — Generate `.cursor/rules/velocity.mdc`

The always-on rules file is the session entry point. It is read at the start of every Cursor session.

**Rules:**

- Maximum 80 lines
- Caveman syntax: telegraphic, imperative, no preamble
- Navigation only: points to files, never reproduces content inline
- Every word is paid for on every session — minimize ruthlessly

Source content from `.velocity/agents/ENTRY.md`.

Output format:

```markdown
---
description: Velocity — [Project Name] engineering context
alwaysApply: true
---

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

/grill-with-docs — before feature work; reads CONTEXT.md
/domain-model — align plan to CONTEXT.md before PRD
/to-prd — after grill session
/to-features — PRD → vertical slice board
/to-tasks — features → tasks with blocking relationships
/tdd — per task, fresh window
/improve-codebase-architecture — periodic deepening
/handoff — end of each slice
/prototype — throwaway spike before committing
/sync — pull latest workspace intelligence; regenerate assets

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

## Step 2 — Generate `.cursor/agents/`

For each agent in `.velocity/agents/*.md`, generate a Cursor agent config file at `.cursor/agents/{agent-id}.md`.

Cursor agent files contain the agent's system prompt. Use the system prompt from the configured `.velocity/agents/{agent-id}.md`.

Format:

```markdown
---
name: [Role Name]
description: [One-line purpose from agent.md]
---

[System prompt content from .velocity/agents/{agent-id}.md system_prompt field]
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
   - ...
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
7. Activated subagents:
   ```
   ## Your Subagents
   [subagent-name]: [one-line description] — activate when [signal]
   ```
8. Guardrails:
   ```
   ## Guardrails You Enforce
   [guardrail list — merged workspace + repo guardrails; workspace takes precedence on conflicts]
   ```

**Token budget per agent system prompt:** aim for under 1500 tokens (≈1125 words). Check and trim if exceeded. Priority order for trimming:

1. ADRs (reduce tier if over budget)
2. Standards (keep — they are already concise)
3. Skills/subagent descriptions (trim to one-line-only)
4. CONTEXT.md (never trim — this is the domain language)

---

## Step 3 — Generate `.cursor/skills/`

For each skill in `.velocity/skills/*.md`, copy the source SKILL.md template to `.cursor/skills/{skill-id}.md`.

Apply any stack-specific variant content from the skill config's `stack_variants_applied` field.

Update context load paths to match this repository's actual paths.

**SKILL.md file format for Cursor:**

```markdown
---
name: { skill-name }
description: { one-line description from skill.md }
---

{Content of the source SKILL.md template, with paths substituted}
```

---

## Step 4 — Generate `hooks.json`

Generate the Cursor hooks configuration from `.velocity/guardrails/default.md`.

The hooks in `pre_tool_use_hooks` become Cursor PreToolUse hooks.

Start with the template at `templates/hooks/hooks.json`.

Output format:

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

---

## Step 5 — Create `.cursor/` Directory Scaffold

Ensure these files exist (create if missing, skip if present):

```
.cursor/rules/.gitkeep
.cursor/agents/.gitkeep
.cursor/skills/.gitkeep
```

---

## Step 6 — Validation Report

After generation:

```
✅ Cursor Adapter complete

Generated:
  .cursor/rules/velocity.mdc — [N] lines (max 80)
  .cursor/agents/ — [N] agent configs
  .cursor/skills/ — [N] skill files
  hooks.json — [N] hooks

Validation:
  ✅ velocity.mdc under 80 lines
  ✅ All agent system prompts under 1500 tokens
  ✅ All skill files have context load steps
  ✅ Default safety hooks present
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Compare current `.cursor/` files with what would be generated from current `.velocity/` state
2. Update only files that have changed
3. Never delete a `.cursor/skills/` file that has been manually customized (detect customization by checking if the file differs from its template source by more than 20%)
4. Report what was updated, what was skipped (unchanged), and what was skipped (customized)
