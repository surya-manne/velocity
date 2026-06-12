---
applyTo: '**'
---

# Velocity

Velocity AI acceleration layer — project intelligence, domain context, agent roles, the SDLC skill chain, and runtime guardrails. Run /velocity-init to set up project context and intelligence in any repository.

## First run

If `.velocity/` does not exist: run `#velocity-init` to set up project context and intelligence.

## Domain language

Before feature work: read `.velocity/artifacts/context/CONTEXT.md`.
All names (variables, files, API terms) must match the CONTEXT.md glossary.

## Standards

- Engineering: `.velocity/project-context/engineering.md`
- Testing: `.velocity/project-context/testing.md`
- Security: `.velocity/project-context/security.md`

## ADRs

Before designing: read `.velocity/knowledge-base/adrs/index.md`.

## Prompts

#velocity-init
#grill-with-docs
#domain-model
#to-prd
#to-features
#to-tasks
#tdd
#validate
#handoff
#sync

## Guardrails

Vertical slices only. No horizontal layers.
Tests required for changed behavior. Secrets never in source. No force push to main.
