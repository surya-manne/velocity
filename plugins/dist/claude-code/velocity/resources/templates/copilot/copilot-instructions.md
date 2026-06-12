# {{PROJECT_NAME}}

{{PROJECT_SUMMARY}}

## Domain language

Before feature work: read {{CONTEXT_MD_PATH}}
{{CONTEXT_MAP_LINE}}
All names (variables, files, API terms) must match CONTEXT.md glossary.

## Standards

- Engineering: .velocity/project-context/engineering.md
- Testing: .velocity/project-context/testing.md
- Security: .velocity/project-context/security.md
- API: .velocity/project-context/api.md

## ADRs

Before designing: read .velocity/knowledge-base/adrs/index.md

## Prompts

Use #grill-with-docs before feature work; reads CONTEXT.md
Use #domain-model to align plan to CONTEXT.md before PRD
Use #to-prd after grill session
Use #to-features to produce vertical slice board from PRD
Use #to-tasks to decompose features into tasks with blocking relationships
Use #tdd per task, fresh window
Use #improve-codebase-architecture for periodic deepening
Use #handoff at end of each slice
Use #prototype for throwaway spike before committing
Use #velocity-validate before opening any PR
Use #velocity-sync to pull latest workspace intelligence and regenerate assets

## Guardrails

Vertical slices only. No horizontal layers.
Each slice: tests at all layers + acceptance criteria + fresh window.
CONTEXT.md term consistency enforced.
TDD loop required.
