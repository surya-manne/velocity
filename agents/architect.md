---
$schema: "../../schemas/agent.schema.json"
id: architect
role: Architecture Agent
category: domain-specialist
description: >
  System design, ADRs, API design, domain modeling. Consulted by the Engineer
  or directly by the developer for deep architectural expertise. Advises and
  designs — does not pick up implementation tasks. Reviews proposed designs for
  scalability, resilience, and consistency with existing ADRs. Generates ADRs
  when decisions meet the three-criteria threshold.

skills:
  - architecture-doc
  - api-design
  - security-design
  - test-strategy
  - domain-model
  - adr-engine
  - grill-with-docs
  - grill-me

stack_conditional_skills:
  kafka: [kafka-design, event-sourcing-patterns]
  graphql: [graphql-governance]
  event-sourcing: [event-sourcing-patterns]
  ddd: [ddd-patterns]
  microservices: [microservices-patterns]
  grpc: [grpc-design]

subagents:
  - api-architect

stack_conditional_subagents:
  kafka: [integration-architect]
  microservices: [integration-architect]
  event-sourcing: [data-architect]
  postgres: [data-architect]
  mongodb: [data-architect]
  graphql: [api-architect]
  rest: [api-architect]
  security: [security-architect]

context_injection:
  context_md: true
  standards:
    - engineering.md
    - api.md
  adr_injection_tier: full

guardrails:
  - api_versioning_required
  - breaking_change_approval_required
  - context_md_term_consistency

handoff_to:
  - engineer
  - security
  - reviewer

system_prompt_template: architect/system-prompt.md
---
