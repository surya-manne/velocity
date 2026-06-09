# Cursor Adapter

The Cursor adapter generates all native Cursor assets from your `.velocity/` configuration: the always-on rules file, agent system prompts, skill definitions, and hooks.

## Generated Files

After running the Cursor adapter:

```
.cursor/
├── rules/
│   └── velocity.mdc          # Always-apply context (max 80 lines)
├── agents/
│   ├── engineer.md           # Engineer agent system prompt
│   ├── architect.md          # Architect agent system prompt
│   ├── product.md            # Product agent system prompt
│   ├── security.md           # Security agent system prompt
│   ├── qa.md                 # QA agent system prompt
│   └── [... all agents]
└── skills/
    ├── velocity-init.md      # /velocity-init
    ├── velocity-sync.md      # /velocity-sync
    ├── velocity-validate.md  # /velocity-validate
    ├── velocity-grill-me.md  # /velocity-grill-me
    └── [... all skills]

hooks.json                     # PreToolUse hook configuration
```

## velocity.mdc — The Always-Apply Rule

This is the most important file. It is applied on every Cursor agent session, loading the essential project context in maximum-compression caveman syntax.

```markdown
---
description: Velocity project context — always apply
alwaysApply: true
---

STACK: TypeScript/Next.js 14/Fastify/PostgreSQL-Prisma/Redis/Kafka
CONTEXTS: orders|payments|notifications|identity
CONTEXT_MD: .velocity/context/{context}/CONTEXT.md
STANDARDS: .velocity/project-context/
GUARDRAILS: active — hooks.json enforced
AGENTS: .cursor/agents/ — use Engineer for coding, Architect for design
SKILLS: .cursor/skills/ — use /velocity-{skill-name}
KNOWLEDGE: .velocity/knowledge-base/
NEVER: invent domain terms | skip CONTEXT.md check | bypass guardrails
ALWAYS: read stack.md before new feature | create fresh window per task
```

Max 80 lines. No prose. No explanations. Just facts.

## Agent System Prompts

Each agent has a system prompt file that loads when the agent is activated in Cursor:

```markdown
<!-- .cursor/agents/engineer.md -->

You are a Senior Software Engineer with deep expertise in:
TypeScript, Next.js 14 (App Router), Fastify, PostgreSQL with Prisma, Redis, Kafka.

## Before Every Task

1. Read .velocity/project-intelligence/stack.md
2. Read relevant .velocity/context/{context}/CONTEXT.md
3. Read .velocity/project-context/engineering.md
4. Check .velocity/artifacts/tasks/ for the task definition

## Standards

Follow .velocity/project-context/engineering.md for all coding decisions.
Use terms from CONTEXT.md for all identifiers. Never invent domain terms.

## Skills

Primary: /velocity-tdd, /velocity-validate, /velocity-handoff
Use /velocity-loop for autonomous task execution.

## Subagents

Activate backend-engineer for API + data layer tasks.
Activate frontend-engineer for UI tasks.
```

Agent system prompts are under 1,500 tokens — concise system prompts outperform verbose ones.

## Skills in Cursor

Skills appear in Cursor's skill picker (or via `/` commands):

```
/velocity-init       → Bootstrap workspace
/velocity-sync       → Delta refresh
/velocity-validate   → Pre-PR check
/velocity-grill-me   → Greenfield discovery
/velocity-tdd        → TDD implementation
/velocity-loop       → Autonomous execution
```

## hooks.json — PreToolUse Enforcement

Velocity generates hook configuration for Cursor's built-in hook system:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "match": "Bash",
      "description": "Git safety — block force push to main",
      "run": "scripts/hooks/git-safety.sh"
    },
    {
      "event": "PreToolUse",
      "match": "Write",
      "description": "Secret detection — scan file writes for credentials",
      "run": "scripts/hooks/secret-scan.sh"
    },
    {
      "event": "PreToolUse",
      "match": "Bash",
      "description": "SQL safety — require WHERE on DELETE/UPDATE",
      "run": "scripts/hooks/sql-safety.sh"
    }
  ]
}
```

Hook scripts are generated in `scripts/hooks/` with your stack-specific rules.

## Delta Mode

In `/sync`, the Cursor adapter:

- Re-reads `.velocity/` for changes
- Regenerates `velocity.mdc` if stack or context changed
- Regenerates only changed agent files
- Preserves skill files where manual customization is detected (>20% diff)
- Updates `hooks.json` if guardrail configuration changed

## Manual Customization

Skills and agents can be manually customized after generation. Velocity detects files that differ significantly from their templates and skips them during `/sync`. To force regeneration:

```
/sync --force-regenerate .cursor/skills/velocity-tdd.md
```
