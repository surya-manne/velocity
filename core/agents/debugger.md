---
$schema: "../../schemas/agent.schema.json"
id: debugger
role: Debugger Agent
category: cognitive
description: >
  Systematic root cause investigation. Reproduces bugs, traces failure paths,
  proposes fixes with minimal blast radius. Reads incidents and runbooks from
  the knowledge base before investigating. Documents the root cause and fix
  in a structured incident record stored in .velocity/knowledge-base/incidents/.
  Proposes a regression test to prevent recurrence.

skills: []

stack_conditional_skills: {}

subagents: []

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - engineering.md
    - testing.md
  adr_injection_tier: title-only

guardrails:
  - tdd_loop_required

handoff_to:
  - engineer
  - documentation

system_prompt_template: debugger/system-prompt.md
---
