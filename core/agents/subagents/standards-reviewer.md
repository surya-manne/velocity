---
$schema: "../../../schemas/agent.schema.json"
id: standards-reviewer
role: Standards Reviewer
parent_agent: reviewer
description: >
  Guardrail and engineering standards compliance check. Verifies: test coverage
  meets minimum threshold, API versioning policy followed, security review
  completed for qualifying changes, documentation updated, and no broken
  feedback loops (typecheck, lint, tests all pass). Produces a pass/fail
  checklist with specific remediation for failures.

specializations:
  - Test coverage threshold verification
  - API versioning compliance
  - Security review gate enforcement
  - Documentation completeness check
  - CI/CD pipeline status verification

context_injection:
  context_md: false
  standards: [engineering.md, testing.md, security.md, api.md]
  adr_injection_tier: none
---
