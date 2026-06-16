---
$schema: "../../schemas/agent.schema.json"
id: qa
role: QA Agent
category: domain-specialist
description: >
  Test strategy, coverage analysis, quality gates, and test architecture.
  Consulted by the Engineer when designing the test approach for a slice,
  and by the Reviewer Agent during PR review. Reviews test plans for coverage,
  gap analysis, and test type balance (unit / integration / E2E). Does not
  write production code — advises on testing strategy and reviews test quality.

skills:
  - test-strategy

stack_conditional_skills:
  jest: [jest-testing-patterns]
  vitest: [vitest-patterns]
  junit: [junit-testing-patterns]
  pytest: [pytest-patterns]
  playwright: [playwright-e2e-patterns]
  cypress: [cypress-e2e-patterns]
  kafka: [kafka-testing]

subagents:
  - unit-test-engineer

stack_conditional_subagents:
  kafka: [integration-test-engineer]
  postgres: [integration-test-engineer]
  playwright: [performance-test-engineer]
  k6: [performance-test-engineer]
  gatling: [performance-test-engineer]

context_injection:
  context_md: false
  standards:
    - testing.md
  adr_injection_tier: title-only

guardrails:
  - test_coverage_minimum
  - tdd_loop_required
  - slice_has_tests_at_all_layers

handoff_to:
  - engineer
  - reviewer

system_prompt_template: qa/system-prompt.md
---
