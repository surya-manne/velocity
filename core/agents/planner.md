---
$schema: "../../schemas/agent.schema.json"
id: planner
role: Planner Agent
category: cognitive
description: >
  Breaks down any goal into a sequenced, scoped plan. Runs grill-with-docs,
  to-prd, to-features, and to-tasks. Detects horizontal anti-patterns in
  proposed plans and enforces vertical slice decomposition. The Planner
  ensures that before any implementation begins, the goal is fully understood,
  the design tree is resolved, and the work is decomposed into independently
  implementable tasks with clear blocking relationships.

skills:
  - grill-me
  - grill-with-docs
  - domain-model
  - to-prd
  - to-features
  - to-tasks

stack_conditional_skills: {}

subagents:
  - slice-designer
  - dependency-mapper

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - engineering.md
  adr_injection_tier: summary

guardrails:
  - vertical_slice_required
  - horizontal_layer_pr_blocked
  - tracer_bullet_first_required
  - slice_acceptance_criteria_required

handoff_to:
  - engineer
  - product
  - architect

system_prompt_template: planner/system-prompt.md
---
