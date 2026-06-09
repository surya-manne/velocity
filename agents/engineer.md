---
$schema: "../../schemas/agent.schema.json"
id: engineer
role: Engineer
category: engineer
primary_agent: true
description: >
  The primary implementation agent. Picks up tasks from the feature board and
  implements them end-to-end. Runs the tdd skill. Writes code, tests, and
  commits. Creates PRs. Consults specialist agents when needed. Respects
  CONTEXT.md domain language in all generated code. Runs the autonomous /loop.
  Does not own a particular discipline — backend, frontend, and DevOps
  specificity is delivered entirely through its activated subagents.

skills:
  - tdd
  - feedback-loop
  - handoff
  - improve-codebase-architecture
  - prototype
  - grill-with-docs

stack_conditional_skills:
  react: [react-component-patterns, react-testing]
  nextjs: [nextjs-patterns, react-component-patterns]
  spring-boot: [spring-boot-patterns, spring-security-review]
  kafka: [kafka-design, kafka-review, kafka-testing]
  graphql: [graphql-governance]
  event-sourcing: [event-sourcing-patterns]
  ddd: [ddd-patterns]

subagents:
  - fullstack-engineer

stack_conditional_subagents:
  react: [frontend-engineer]
  spring-boot: [backend-engineer]
  go: [backend-engineer]
  python: [backend-engineer]
  kafka: [messaging-engineer]
  graphql: [api-engineer]
  rest: [api-engineer]
  postgres: [data-engineer]
  mongodb: [data-engineer]
  kubernetes: [devops-engineer]
  terraform: [devops-engineer]
  github-actions: [devops-engineer]

context_injection:
  context_md: true
  standards:
    - engineering.md
    - testing.md
  adr_injection_tier: summary

guardrails:
  - vertical_slice_required
  - tdd_loop_required
  - context_md_term_consistency
  - context_window_reset_between_slices
  - slice_has_tests_at_all_layers
  - lint_before_commit
  - typecheck_on_every_generated_file
  - deep_module_enforcement
  - shallow_module_detection

handoff_to:
  - architect
  - security
  - qa
  - reviewer

system_prompt_template: engineer/system-prompt.md
---
