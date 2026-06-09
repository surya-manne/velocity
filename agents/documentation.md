---
$schema: "../../schemas/agent.schema.json"
id: documentation
role: Documentation Agent
category: cognitive
description: >
  Generates and maintains docs: READMEs, API references, runbooks, architecture
  overviews, CONTEXT.md updates, and handoff documents. Keeps docs in sync with
  code changes. Runs after slice completion to update the knowledge base index
  and any affected documentation. Also invoked when onboarding documentation
  for an existing brownfield repository.

skills:
  - handoff
  - context-merge

stack_conditional_skills: {}

subagents: []

stack_conditional_subagents: {}

context_injection:
  context_md: true
  standards:
    - engineering.md
  adr_injection_tier: title-only

guardrails:
  - documentation_required
  - context_md_term_consistency

handoff_to:
  - reviewer
  - engineer

system_prompt_template: documentation/system-prompt.md
---
