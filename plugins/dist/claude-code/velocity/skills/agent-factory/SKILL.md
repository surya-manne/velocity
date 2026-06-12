---
name: agent-factory
description: >-
  Generate configured agent instances for this repository. Reads the stack
  fingerprint, wires stack-appropriate skills and subagents to each role agent,
  injects CONTEXT.md and standards into system prompts, and writes configured
  agent files to .velocity/agents/. Also generates the Agent Context Protocol
  entry document. Run automatically by /init and /sync; invoke manually
  to reconfigure agents after a stack change.
metadata:
  surfaces:
    - agent
---

# Agent Factory

Configure Velocity's role agents for this specific repository's stack and domain.

## Context Load

Before starting, read:

- `.velocity/project-intelligence/stack.md` — stack fingerprint
- `.velocity/context-map.md` — bounded contexts
- `.velocity/project-context/` — all standards files
- `agents/` directory in the Velocity repository — all agent and subagent definitions

---

## What Agent Factory Does NOT Do

- Does not create new agent types. The agent roster is fixed.
- Does not change an agent's role or category.
- Does not remove agents — all role agents are always present.

What it does: configures each agent with the right skills, subagents, and context for this stack.

---

## Step 1 — Load Stack Signals

From `stack.md`, extract the set of active stack signals:

```
active_signals = []

if stack.frontend.framework → add: react, nextjs, vue, angular, svelte, etc.
if stack.backend.framework  → add: spring-boot, express, fastapi, rails, go, nestjs, etc.
if stack.persistence.primary_db → add: postgres, mongodb, mysql, dynamodb, etc.
if stack.persistence.orm    → add: prisma, drizzle, typeorm, jpa, sqlalchemy, etc.
if stack.messaging.broker   → add: kafka, rabbitmq, sqs, pubsub, etc.
if stack.api_style          → add: rest, graphql, grpc, trpc
if stack.architecture_patterns → add: ddd, event-sourcing, cqrs, hexagonal, microservices
if stack.testing.unit       → add: jest, vitest, junit, pytest, rspec, etc.
if stack.testing.e2e        → add: playwright, cypress
if stack.infrastructure.containers → add: kubernetes, docker
if stack.infrastructure.iac → add: terraform, pulumi, cdk
```

---

## Step 2 — Configure Each Agent

For each agent definition in `agents/*.md`:

### 2a — Skill Wiring

Start with the agent's `skills` list (always-on skills).

For each signal in `active_signals`, check the agent's `stack_conditional_skills` mapping.
Add matching skills to the agent's wired skills list.

Deduplicate. Preserve alphabetical order for determinism.

### 2b — Subagent Activation

Start with the agent's `subagents` list (always-on subagents).

For each signal in `active_signals`, check the agent's `stack_conditional_subagents` mapping.
Add matching subagent IDs to the activated subagents list.

**Engineer-specific subagent logic:**

- If `fullstack-engineer` is in the list AND any of `[backend-engineer, frontend-engineer]` is also added: remove `fullstack-engineer` (replace with specialists).
- Never activate both `fullstack-engineer` and specialist engineers simultaneously.

### 2c — System Prompt Configuration

For each agent, produce a system prompt by:

1. Starting with the agent's `system_prompt_template`
2. Injecting CONTEXT.md content per `context_injection.context_md` setting:
   - For primary-context repos: inject the primary CONTEXT.md (full body — agents always get the domain language)
   - For monorepos: inject the context-map.md and instruct the agent to read the relevant CONTEXT.md before working in a specific context
3. Injecting standards files listed in `context_injection.standards`
4. Injecting ADR content at the configured `context_injection.adr_injection_tier`:
   - `none`: no ADR injection
   - `title-only`: list of ADR titles + one-line decision
   - `summary`: title + decision + consequences (3–5 lines each)
   - `full`: complete ADR body (only for agents that regularly make architectural decisions)
5. Appending the wired skills list with one-line descriptions
6. Appending the activated subagents list with one-line descriptions

**Token discipline for system prompts:**

- CONTEXT.md: always full — this is the domain language; truncating it defeats the purpose
- Standards: always full — standards are already concise documents
- ADRs: strictly at the configured tier — never upgrade silently
- Skills/subagent list: name + one-line description only

### 2d — Write Configured Agent File

Write to `.velocity/agents/<agent-id>.md`:

```yaml
id: <id>
role: <role>
category: <category>
configured_at: <ISO 8601 timestamp>
stack_signals_used: [<list of active signals that affected this agent>]

wired_skills: [<list>]
activated_subagents: [<list>]

system_prompt: |
  <generated system prompt>

context_injection:
  context_md_path: <path>
  standards_injected: [<list>]
  adr_tier: <tier>

guardrails: [<list>]
```

---

## Step 3 — Generate Agent Context Protocol Entry Document

Write `.velocity/agents/ENTRY.md`:

This document is the always-on navigation index. It is the foundation of the Cursor rules file. It must be:

- **Lean**: under 60 lines
- **Caveman syntax**: telegraphic, imperative, no preamble
- **Navigation-only**: points to files, does not reproduce their content

```markdown
# [Project Name] — Velocity Context

## Project

[1–2 sentence summary from stack.md]

## Domain language

Before feature work: read [path to CONTEXT.md]
[For monorepos: "See .velocity/context-map.md for all contexts"]
Variable names, file names, API terms must match CONTEXT.md glossary.

## Standards

- Engineering: .velocity/project-context/engineering.md
- Testing: .velocity/project-context/testing.md
- Security: .velocity/project-context/security.md
- API: .velocity/project-context/api.md

## Architecture decisions

Before designing: read .velocity/knowledge-base/adrs/ index

## Skills (invoke when needed)

[Auto-generated one-line-per-skill index]

- /grill-with-docs — before feature work; reads CONTEXT.md
- /to-prd — after grill session
- /to-features — after PRD
- /to-tasks — after features
- /tdd — per task; fresh context window
- /improve-codebase-architecture — periodic
- /handoff — end of each slice
- /prototype — before committing to approach

## Agents (invoke when needed)

[Auto-generated one-line-per-agent index]

- Engineer — implement tasks, run tdd, create PRs
- Planner — decompose goals into slices and tasks
- Researcher — investigate before implementation
- Reviewer — review PRs, ADRs, slices
- Architect — system design, ADRs, API design
- Security — threat model, compliance review
- QA — test strategy, coverage analysis

## Key guardrails

Vertical slices only. No horizontal layers.
Each slice: tests at every layer, acceptance criteria, fresh context window.
CONTEXT.md term consistency enforced.
TDD loop required for implementation tasks.
```

---

## Step 4 — Validation

After generating all files, verify:

1. Every agent in `agents/*.md` has a corresponding `.velocity/agents/<id>.md`
2. `.velocity/agents/ENTRY.md` exists and is under 60 lines
3. No agent system prompt exceeds 500 tokens (estimate: ~375 words)
4. Every wired skill exists as a skill definition in `.velocity/skills/` (after Skill Factory runs)

Report any validation failures with specific remediation.

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Read existing `.velocity/agents/` configs
2. Read `stack-delta.md` from Project Intelligence delta run
3. For each changed signal: reconfigure affected agents only
4. Write updated agent files; leave unchanged agents untouched
5. Regenerate `ENTRY.md` (always regenerated on delta — it is the navigation index)
