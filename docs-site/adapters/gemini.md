# Gemini Adapter

The Gemini adapter generates native Google Gemini assets: the always-on `GEMINI.md`, agent definitions, tool definitions, and a style guide.

## Generated Files

```
GEMINI.md                         # Always loaded by Gemini (max 80 lines)
STYLEGUIDE.md                     # Code style and naming conventions
.gemini/
├── agents/
│   ├── engineer.md
│   ├── architect.md
│   ├── product.md
│   ├── security.md
│   └── [... all agents]
└── tools/
    ├── velocity-init.md
    ├── velocity-tdd.md
    ├── velocity-loop.md
    └── [... all skills]
```

## GEMINI.md

Loaded by Gemini at the start of every session:

```markdown
# Velocity — Project Context for Gemini

## Stack

TypeScript | Next.js 14 | Fastify | PostgreSQL + Prisma | Redis | Kafka

## Bounded Contexts

orders | payments | notifications | identity
→ Read .velocity/context/{context}/CONTEXT.md before any feature work

## Engineering Standards

Read before task: .velocity/project-context/engineering.md
Style reference: STYLEGUIDE.md

## Guardrails

Active — see .velocity/guardrails/default.md
Never bypass. Pause on high-risk actions.

## Agent Roles

.gemini/agents/ — activate via @agent-name

## Tools (Skills)

.gemini/tools/ — invoke via @tool-name
Key tools: @velocity-tdd @velocity-validate @velocity-loop

## Protocols

- Read CONTEXT.md vocabulary before all code
- Fresh session per TDD task
- Run @velocity-validate before PR
- Never invent domain terms
```

## STYLEGUIDE.md

The style guide provides Gemini with detailed coding conventions derived from your project:

```markdown
# Styleguide — TypeScript + Next.js 14 + Fastify

## Naming Conventions

### Files

- Components: PascalCase (`PaymentForm.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- Tests: `{file}.test.ts` or `{file}.spec.ts`
- API routes: kebab-case (`/api/refund-requests`)

### Code

- Domain models: PascalCase class (`RefundRequest`)
- Value objects: PascalCase class (`RefundWindow`)
- Repository interfaces: `I{Name}Repository`
- Use CONTEXT.md terms for all domain identifiers

## TypeScript Conventions

- Strict mode enabled — no `any`
- Explicit return types on public functions
- Result<T, E> pattern for domain errors (not exceptions)
- Zod for runtime validation (API boundaries only)

## Fastify Conventions

- Route handlers in `{context}/api/` directory
- Schemas in `{context}/api/{name}.schema.ts`
- Error format: RFC 7807 (application/problem+json)

## Testing Conventions

- Framework: Vitest
- Unit tests in `__tests__/` adjacent to source
- Integration tests in `test/integration/`
- Mock external services (Stripe, etc.) — never hit real APIs in tests
```

## Agent Definitions

Gemini agents are defined with tool access and context loading:

```markdown
<!-- .gemini/agents/engineer.md -->

# Engineer Agent

## Role

Senior Software Engineer: TypeScript, Next.js 14, Fastify, PostgreSQL + Prisma, Kafka.

## Before Every Session

- Read .velocity/project-intelligence/stack.md
- Read relevant CONTEXT.md
- Read .velocity/project-context/engineering.md
- Read task definition from .velocity/artifacts/tasks/

## Primary Tools

- @velocity-tdd (implementation)
- @velocity-validate (quality gate)
- @velocity-handoff (context reset)
- @velocity-loop (autonomous execution)

## Standards

Follow STYLEGUIDE.md for all code.
Use only CONTEXT.md terms for domain identifiers.
```

## Tool Definitions

Gemini tool definitions map to Velocity skills:

```markdown
<!-- .gemini/tools/velocity-tdd.md -->

# Tool: velocity-tdd

## Description

Test-Driven Development implementation loop for a single task.

## Usage

@velocity-tdd {task-id}

## Steps

1. Load context (stack.md + CONTEXT.md + task + handoff)
2. Write failing tests
3. Implement minimal code to pass
4. Refactor with tests green
5. Run feedback gates: {test_command} && {typecheck_command} && {lint_command}
6. Produce handoff artifact

## Output

Creates .velocity/artifacts/handoffs/{task-id}.md
```

## Invoking in Gemini

```
# Activate an agent
@engineer Implement TASK-003

# Invoke a tool
@velocity-tdd TASK-003

# Use a skill directly
@velocity-validate
```
