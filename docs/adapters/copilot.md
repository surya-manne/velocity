# GitHub Copilot Adapter

The GitHub Copilot adapter generates native Copilot assets for VS Code and JetBrains: the always-on instructions file, the agents manifest, and prompt files for each skill.

::: tip Install as a plugin
Open the Agent Customizations panel in the Chat sidebar, go to Plugins → Install Plugin from Source, enter `https://github.com/surya-manne/velocity`, then run `#velocity-init`. See [Installable Plugins](/adapters/plugins). The adapter below describes the per-repo files `init`/`sync` generate inside an initialized project.
:::

## Generated Files

```
.github/
└── copilot-instructions.md       # Always loaded by Copilot
    prompts/
    ├── velocity-init.prompt.md
    ├── velocity-sync.prompt.md
    ├── velocity-validate.prompt.md
    ├── velocity-grill-me.prompt.md
    ├── velocity-tdd.prompt.md
    ├── velocity-loop.prompt.md
    └── [... all skills]

AGENTS.md                          # All agent roles (max 150 lines)
```

## copilot-instructions.md

Loaded by GitHub Copilot on every session. Maximum 80 lines:

```markdown
# Velocity — Project Context

## Stack

TypeScript | Next.js 14 (App Router) | Fastify | PostgreSQL (Prisma) | Redis | Kafka

## Bounded Contexts

orders | payments | notifications | identity
Context glossaries: .velocity/context/{context}/CONTEXT.md

## Standards

Read before every task:

- .velocity/project-intelligence/stack.md
- .velocity/project-context/engineering.md

## Guardrails

Active guardrails apply on all tool calls.
Full rules: .velocity/guardrails/default.md

## Prompts

Use #velocity-{skill-name} to invoke skills.
Example: #velocity-tdd, #velocity-validate, #velocity-loop

## Rules

- Never invent domain terms — always use CONTEXT.md vocabulary
- Run #velocity-validate before every pull request
- Use fresh context window per task (open new session for each /tdd)
```

## AGENTS.md

The agents manifest defines all agent roles in a single file (Copilot's format):

```markdown
# Agents

## Engineer

Senior Software Engineer with expertise in TypeScript, Next.js 14, Fastify, PostgreSQL.
**Use for:** Implementation, TDD, code review, bug fixes.
**Prompts:** #velocity-tdd, #velocity-validate, #velocity-loop, #velocity-handoff
**Context:** Always read .velocity/project-context/engineering.md

---

## Architect

System architect with deep understanding of DDD and this project's bounded context model.
**Use for:** Design decisions, API design, ADR creation, architecture review.
**Prompts:** #velocity-architecture-doc, #velocity-api-design, #velocity-adr-engine
**Context:** Always read context-map.md and relevant ADRs

---

## Product

Product manager skilled at domain-driven requirements.
**Use for:** PRDs, feature planning, discovery sessions.
**Prompts:** #velocity-grill-me, #velocity-grill-with-docs, #velocity-to-prd, #velocity-to-features

---

## Security

Security engineer focused on threat modeling and compliance.
**Use for:** Security review, auth/authz design, risk scoring.
**Prompts:** #velocity-security-design, #velocity-risk-score, #velocity-audit-trail

---

[... more agent definitions ...]
```

## Prompt Files

Each skill is a `.prompt.md` file in `.github/prompts/`. Copilot loads these as slash commands:

```markdown
---
# .github/prompts/velocity-tdd.prompt.md
mode: agent
---

You are running the Velocity TDD skill.

## Context Load (Required First)

1. Read .velocity/project-intelligence/stack.md
2. Read the task definition from .velocity/artifacts/tasks/
3. Read relevant .velocity/context/{context}/CONTEXT.md
4. Read most recent handoff from .velocity/artifacts/handoffs/

## TDD Protocol

1. Write failing tests first
2. Run tests to confirm they fail for the right reason
3. Implement minimal code to pass
4. Refactor with tests green
5. Run: npx vitest run && npx tsc --noEmit && npx eslint src/
6. Produce handoff artifact

## Output

At completion, create .velocity/artifacts/handoffs/{task-id}.md
```

## Prompt Modes

Copilot prompts support two modes:

| Mode          | Use Case                                           |
| ------------- | -------------------------------------------------- |
| `mode: agent` | Multi-step, autonomous tasks (TDD, loop, validate) |
| `mode: ask`   | Single-turn queries (risk score, context lookup)   |

Velocity assigns modes based on skill type:

- Engineering skills (`/tdd`, `/loop`, `/validate`) → `mode: agent`
- Query skills (`/risk-score`, `/audit-trail`) → `mode: ask`

## Invoking Skills in Copilot

```
# In Copilot Chat
#velocity-tdd TASK-003

#velocity-validate

#velocity-grill-me

#velocity-loop
```

## Limitations vs Cursor/Claude Code

Copilot does not have native hook support. Guardrail enforcement is implemented as:

- Instructions in `copilot-instructions.md` that tell the agent to check guardrails
- Prompt content that includes the guardrail rules inline

For full hook enforcement, prefer Cursor or Claude Code.

## VS Code Setup

No additional configuration needed. Copilot automatically reads:

- `copilot-instructions.md` (global instructions)
- `AGENTS.md` (agent definitions)
- `.github/prompts/*.prompt.md` (skill prompts)

After the Velocity adapter runs, Copilot is fully configured.
