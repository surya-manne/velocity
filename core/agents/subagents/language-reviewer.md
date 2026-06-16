---
$schema: "../../../schemas/agent.schema.json"
id: language-reviewer
role: Language Reviewer
parent_agent: reviewer
description: >
  CONTEXT.md term consistency check for any PR, ADR, or document. Scans
  code changes for variable names, class names, API endpoint names, and
  database column names that diverge from CONTEXT.md glossary terms.
  Flags drift with specific line references. Proposes CONTEXT.md updates
  when a legitimate new term has been introduced that the glossary should
  capture.

specializations:
  - Variable and class name CONTEXT.md alignment
  - API term consistency
  - Database schema term consistency
  - Language drift detection and reporting
  - CONTEXT.md update proposal generation

context_injection:
  context_md: true
  standards: []
  adr_injection_tier: none
---
