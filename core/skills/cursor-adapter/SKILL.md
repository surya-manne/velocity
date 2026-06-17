---
name: cursor-adapter
description: "Translate .velocity/ assets into native Cursor assets — .cursor/rules/velocity.mdc, .cursor/agents/, .cursor/skills/, and hooks.json — following progressive disclosure with thin file-reference wrappers. Full skill."
mode: subagent
readonly: false
tags: ["skill", "cursor", "adapter", "generator"]
baseSchema: docs/schemas/skill.md
---

<cursor-adapter>

<role>

You are a Cursor asset generator who translates configured .velocity/ agents and skills into native Cursor rules, agent, skill, and hooks files.

</role>

<purpose>

Problem: Velocity's configured agents and skills live in `.velocity/` but Cursor cannot read them without native asset files matching Cursor's expected `.cursor/` structure.

Solution: Generate lean `.cursor/rules/velocity.mdc` (≤80 lines, navigation-only), thin agent and skill wrappers using `@file` references, and PreToolUse/PostToolUse `hooks.json`.

Validation: `velocity.mdc` under 80 lines; all agent system prompts under 1500 tokens; all default safety hooks present in `hooks.json`; `.cursor/rules/`, `.cursor/agents/`, `.cursor/skills/` directories exist.

</purpose>

<prerequisites>

- Read `.velocity/agents/ENTRY.md` — always-on navigation index
- Read `.velocity/agents/*.md` — all configured agent instances
- Read `.velocity/skills/*.md` — all configured skill instances
- Read `.velocity/guardrails/default.md` — guardrail config and hooks
- Read `.velocity/project-context/` — all standards files
- Read `.velocity/project-intelligence/stack.md` — stack info for project name/summary
- Read `.velocity/workspace-intelligence/graph.md` (if exists) — workspace graph
- Read `.velocity/context-map.md` — bounded context paths

</prerequisites>

<process>

## What This Adapter Generates

```
.cursor/
  rules/
    velocity.mdc         ← always-on lean context (alwaysApply: true)
  agents/                ← thin @file wrapper per agent (12 files)
  skills/                ← thin @file wrapper per configured skill

hooks.json               ← PreToolUse + PostToolUse guardrail hooks
```

## Step 1 — Generate `.cursor/rules/velocity.mdc`

Source content from `.velocity/agents/ENTRY.md`. Use template `core/templates/cursor/rules/velocity.mdc` as the format reference.

Rules: maximum 80 lines; `alwaysApply: true` frontmatter; caveman syntax; navigation-only; one line per skill; one line per agent. If over 80 lines, trim from least-frequently-invoked sections.

## Step 2 — Generate `.cursor/agents/`

For each agent in `.velocity/agents/*.md`, generate a **thin wrapper** at `.cursor/agents/{agent-id}.md` using Cursor's `@file` reference — do not copy system prompt content:

```markdown
---
name: [Role Name from agent.md]
description: [One-line purpose from agent.md]
---

@file .velocity/agents/{agent-id}.md
```

**System prompt construction** (applied to the referenced `.velocity/agents/{agent-id}.md`):
1. Role statement (1 paragraph from agent `description`)
2. CONTEXT.md injection — full body, never trim
3. Workspace context injection (if `graph.md` exists) — `title-only` tier
4. Standards injection — full content per `context_injection.standards`
5. ADR injection at configured tier
6. Wired skills list; activated subagents list
7. Guardrails — merged workspace + repo; workspace takes precedence

**Token budget:** aim for under 1500 tokens. Trim priority: ADRs → skill/subagent descriptions → never trim CONTEXT.md.

## Step 3 — Generate `.cursor/skills/`

For each skill in `.velocity/skills/*.md`, generate a **thin wrapper** at `.cursor/skills/{skill-id}.md`:

```markdown
---
description: [One-line description from skill.md]
---

@file .velocity/skills/{skill-id}.md
```

Apply stack-specific variant content from `stack_variants_applied`. Update context load paths to match this repository's actual paths.

## Step 4 — Generate `hooks.json`

Generate from `.velocity/guardrails/default.md`. Start from the template at `core/templates/hooks/hooks.json`. Always include base safety hooks: block `git push --force` (non-lease), block `git reset --hard`, warn direct commits to `main`/`master`, warn `rm -rf` outside build artifacts. Add stack-conditional hooks from `default.md`.

## Step 5 — Create `.cursor/` Directory Scaffold

Ensure directories exist (create `.gitkeep` if missing, skip if present): `.cursor/rules/`, `.cursor/agents/`, `.cursor/skills/`.

## Delta Mode (for /sync)

Compare current `.cursor/` files against what would be generated from current `.velocity/` state. Update only changed files. Never delete a `.cursor/skills/` file customized by more than 20% from its template source. Report updated, skipped-unchanged, skipped-customized.

</process>

<pitfalls>

- Copying system prompt content into `.cursor/agents/` files instead of using `@file` reference
- Exceeding 80 lines in `velocity.mdc` — every word is paid for on every Cursor session
- Trimming CONTEXT.md in agent system prompts — always inject full body
- Overwriting a manually customized `.cursor/skills/` file that differs by more than 20% from template

</pitfalls>

</cursor-adapter>
