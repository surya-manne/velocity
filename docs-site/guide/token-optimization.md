# Token Optimization

Velocity is designed to provide maximum context with minimum token cost. Every context injection decision is deliberate.

## The Problem

AI assistants have context windows. Long, verbose instructions fill the window with overhead — leaving less room for actual code, less precision in outputs, and higher costs.

Velocity uses several strategies to maximize the information density of every token spent.

## Strategy 1: Tiered Context Injection

Not all context is needed for every message. Velocity injects context in three tiers:

```
┌─────────────────────────────────────────────────────┐
│  Tier 1: Always-On (every message, max 80 lines)     │
│  Caveman syntax, no sentences, just facts            │
│  ─────────────────────────────────────────────────── │
│  Tier 2: Skill Context (on demand, when skill runs)  │
│  Skill-specific context loaded at invocation         │
│  ─────────────────────────────────────────────────── │
│  Tier 3: Agent System Prompt (at agent spawn)        │
│  Full standards + CONTEXT.md + ADRs                 │
└─────────────────────────────────────────────────────┘
```

## Strategy 2: Caveman Syntax

The always-on entry document (Tier 1) uses compressed caveman syntax — maximum information per token:

```
VERBOSE (220 tokens):
The project uses TypeScript as the primary language with Next.js version 14
for the frontend framework. The backend is built with Fastify. PostgreSQL 15
is used as the primary database with Prisma as the ORM. Redis is used for
caching. Authentication is handled via JWT tokens with OAuth2 support.

CAVEMAN (42 tokens):
STACK: TypeScript. Next.js 14 (AppRouter). Fastify. PostgreSQL/Prisma. Redis. JWT+OAuth2.
```

**5x token reduction for the same information.**

## Strategy 3: Fresh Context Windows

Long conversations accumulate useless context — old attempts, abandoned approaches, resolved errors. The `/tdd` skill enforces **fresh context windows** per task:

- Each task starts in a new session
- Only the handoff artifact from the previous task is loaded
- No accumulated noise from previous sessions

This keeps every task at peak model performance.

## Strategy 4: Selective Context Loading

Skills specify exactly which `.velocity/` files to load. The Engineer agent doesn't load the UX guidelines. The Security agent doesn't load the frontend component library docs.

```
# In skill header:
context:
  - .velocity/project-intelligence/stack.md
  - .velocity/project-context/engineering.md
  - .velocity/context/payments/CONTEXT.md
  # NOT: testing.md, security.md, api.md (irrelevant to this task)
```

## Strategy 5: Structured Output Formats

Velocity prompts produce structured markdown artifacts, not prose explanations. Structured output is both more compact and more parseable by downstream skills.

```
PROSE: "I've analyzed the codebase and found that the PaymentIntent model
needs a new field to track the refund window. I would suggest adding a
created_at timestamp if it doesn't exist already..."

STRUCTURED:
## Changes Required
- [ ] Add `refund_window_expires_at: DateTime` to PaymentIntent
- [ ] Populate from `created_at + 30 days` on creation
- [ ] Index for refund eligibility queries
```

## Strategy 6: No Redundant Documentation

The always-on document never duplicates `.velocity/` content. It points to files rather than repeating them:

```
# Instead of including all standards inline:
STANDARDS: .velocity/project-context/engineering.md
CONTEXT: .velocity/context/payments/CONTEXT.md
GUARDRAILS: active — read .velocity/guardrails/default.md for full rules
```

## Token Budget by Component

| Component                | Target         | Strategy                             |
| ------------------------ | -------------- | ------------------------------------ |
| Always-on entry doc      | ≤ 80 lines     | Caveman syntax, pointers not content |
| Agent system prompt      | ≤ 1,500 tokens | Structured, no prose                 |
| Skill SKILL.md           | Variable       | Procedural steps, not explanations   |
| CONTEXT.md (per context) | ≤ 2,000 tokens | Glossary format, no narrative        |
| Handoff artifact         | ≤ 500 tokens   | Just the facts for next session      |

## Monitoring Token Efficiency

Run `/validate` — it includes a context efficiency check that flags:

- Always-on documents exceeding the 80-line limit
- Agent system prompts exceeding 1,500 tokens
- CONTEXT.md sections with low information density (prose instead of glossary)
- Redundant context loaded across tiers
