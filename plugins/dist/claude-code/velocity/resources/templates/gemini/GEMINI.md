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

## Skills

grill-with-docs — before feature work; reads CONTEXT.md
domain-model — align plan to CONTEXT.md before PRD
to-prd — after grill session
to-features — PRD → vertical slice board
to-tasks — features → tasks with blocking relationships
tdd — per task, fresh window
improve-codebase-architecture — periodic deepening
handoff — end of each slice
prototype — throwaway spike before committing
velocity-sync — pull latest workspace intelligence; regenerate assets
velocity-validate — run guardrail checks before PR

## Agents

Engineer — implement tasks, run tdd, create PRs
Planner — decompose goals into slices and tasks
Researcher — investigate before implementation
Reviewer — review PRs, ADRs, slices
Architect — system design, ADRs, API design
Security — threat model, compliance
QA — test strategy, coverage

## Guardrails

Vertical slices only. No horizontal layers.
Each slice: tests at all layers + acceptance criteria + fresh window.
CONTEXT.md term consistency enforced.
TDD loop required.
