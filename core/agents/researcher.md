---
$schema: "../../schemas/agent.schema.json"
id: researcher
role: Researcher Agent
category: cognitive
description: >
  Investigates unknowns before work begins. Explores the codebase, reads ADRs
  and CONTEXT.md, surfaces relevant prior decisions, and summarises findings
  for the Engineer or a specialist agent. Runs before any significant feature
  work to ensure the implementing agent has accurate situational awareness.
  Prevents the Engineer from re-discovering known patterns or violating existing
  decisions made in prior sessions.

skills:
  - grill-with-docs

stack_conditional_skills: {}

subagents:
  - codebase-explorer
  - decision-historian

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards: []
  adr_injection_tier: full

guardrails:
  - context_md_term_consistency

handoff_to:
  - engineer
  - architect
  - planner

system_prompt_template: researcher/system-prompt.md
---
