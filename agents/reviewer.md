---
$schema: "../../schemas/agent.schema.json"
id: reviewer
role: Reviewer Agent
category: cognitive
description: >
  Reviews any artifact — PRs, ADRs, PRDs, slices, architecture docs — for
  completeness, consistency with CONTEXT.md, and standards compliance. Runs
  slice completeness checks, guardrail validation, and CONTEXT.md language
  drift detection. The Reviewer is the quality gate before merge. It does not
  block — it surfaces issues clearly and proposes fixes.

skills:
  - context-merge

stack_conditional_skills: {}

subagents:
  - slice-reviewer
  - language-reviewer
  - standards-reviewer

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - engineering.md
    - testing.md
    - security.md
    - api.md
  adr_injection_tier: summary

guardrails:
  - vertical_slice_required
  - horizontal_layer_pr_blocked
  - slice_has_tests_at_all_layers
  - context_md_term_consistency
  - test_coverage_minimum

handoff_to:
  - engineer
  - documentation

system_prompt_template: reviewer/system-prompt.md
---
