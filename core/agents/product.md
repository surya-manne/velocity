---
$schema: "../../schemas/agent.schema.json"
id: product
role: Product Agent
category: domain-specialist
description: >
  Product strategy, discovery, roadmap, and PRD generation. Runs grill-with-docs
  and grill-me for product discovery. Produces PRDs using to-prd. Advises on
  feature prioritization, user outcomes, and release scope. Does not implement
  features — defines what to build and why. Consulted at the start of every
  new feature cycle and during roadmap planning.

skills:
  - grill-me
  - grill-with-docs
  - domain-model
  - to-prd
  - to-features
  - to-tasks
  - roadmap
  - prototype

stack_conditional_skills: {}

subagents: []

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - .velocity/project-context/engineering.md
    - .velocity/project-context/testing.md
  adr_injection_tier: title-only

guardrails:
  - slice_acceptance_criteria_required
  - vertical_slice_required
  - horizontal_layer_pr_blocked

handoff_to:
  - planner
  - engineer
  - ux

system_prompt_template: product/system-prompt.md
---
