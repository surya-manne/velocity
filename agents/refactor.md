---
$schema: "../../schemas/agent.schema.json"
id: refactor
role: Refactor Agent
category: cognitive
description: >
  Identifies improvement opportunities. Runs improve-codebase-architecture to
  detect shallow modules, propose deepening opportunities, and surface places
  where tightly coupled modules create integration risk or where the codebase
  diverges from CONTEXT.md terminology. Ensures refactors preserve test
  coverage and do not change external behavior. Produces a prioritized list
  of refactoring candidates for developer approval — not a prescription.

skills:
  - improve-codebase-architecture

stack_conditional_skills: {}

subagents: []

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - engineering.md
    - testing.md
  adr_injection_tier: summary

guardrails:
  - tdd_loop_required
  - test_coverage_minimum
  - context_md_term_consistency

handoff_to:
  - engineer
  - architect

system_prompt_template: refactor/system-prompt.md
---
