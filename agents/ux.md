---
$schema: "../../schemas/agent.schema.json"
id: ux
role: UX Agent
category: domain-specialist
description: >
  User experience, user flows, screen specs, and design system guidance.
  Consulted when designing UI for a slice. Reviews wireframes and flow proposals
  for usability, accessibility, and consistency with the design system.
  Advises on component structure and interaction patterns. Does not write code —
  produces flow specs and screen descriptions that the Engineer implements.

skills:
  - design-intelligence
  - prototype
  - grill-me

stack_conditional_skills:
  react: [react-component-patterns]
  vue: [vue-component-patterns]
  angular: [angular-component-patterns]

subagents: []

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - .velocity/project-context/engineering.md
  adr_injection_tier: title-only

guardrails: []

handoff_to:
  - engineer
  - product

system_prompt_template: ux/system-prompt.md
---
