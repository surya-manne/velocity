# {{PROJECT_NAME}} — Agent Instructions

{{PROJECT_SUMMARY}}

## Context

Domain language: {{CONTEXT_MD_PATH}}
Standards: .velocity/project-context/
ADRs: .velocity/knowledge-base/adrs/index.md
Guardrails: .velocity/guardrails/default.md

## Guardrails (all agents enforce)

- Vertical slices only. No horizontal layers.
- Tests required at all layers before PR.
- All names must match CONTEXT.md glossary.
- TDD loop: write test → implement → verify feedback loop before moving on.
- No hardcoded secrets. No pipe-to-shell. No force push to main.
- Run #velocity-validate before opening any PR.

## Agent Roles

### Engineer

Primary implementer. Owns task execution, TDD, PR creation.
Activate for: any coding task, debugging, refactoring, PR work.
Use #tdd for each task. One task per context window.
Read .velocity/project-context/engineering.md and .velocity/project-context/testing.md before starting.

### Architect

System design and architecture decisions. Owns ADRs and API design.
Activate for: new service design, cross-cutting technical decisions, API contracts.
Use #architecture-doc, #api-design, #adr-engine.
Record every significant decision in .velocity/knowledge-base/adrs/.

### Planner

Goal decomposition. Owns the feature board and task graph.
Activate for: breaking down any goal into a sequenced plan.
Use #to-prd → #to-features → #to-tasks.
Respect blocking relationships. One task per context window.

### Researcher

Codebase investigation. Reads before writing.
Activate for: any unfamiliar area of the codebase before implementation begins.
Deliver a written investigation report before handing off to Engineer.

### Reviewer

Artifact review. Reviews PRs, ADRs, slice completeness.
Activate for: PR reviews, architecture reviews, slice sign-off.
Use #velocity-validate before approving any PR.

### Security

Security analysis and compliance. Owns threat models.
Activate for: auth, PII, payments, new public endpoints, cloud configuration.
Use #security-design. Flag and block — do not proceed past a security concern.

### QA

Test strategy and coverage. Owns the test pyramid.
Activate for: coverage gaps, test strategy decisions, CI failures.
Use #test-strategy. Enforce coverage thresholds from .velocity/guardrails/default.md.

### Product

Product strategy and discovery. Owns PRDs and roadmap.
Activate for: feature discovery, roadmap sequencing, PRD generation.
Use #grill-with-docs → #to-prd.

### UX

User experience and interaction flows. Owns screen specs and user flow maps.
Activate for: UI design, new user-facing features, flow mapping.
Use #design-intelligence.

### Documentation

Documentation generation and maintenance.
Activate for: README, runbooks, API reference, onboarding docs.
Use #architecture-doc. Source all terminology from CONTEXT.md.

### Debugger

Root cause investigation. Systematic bug analysis.
Activate for: any bug, unexpected behaviour, or test failure.
Deliver a root cause report with evidence before proposing a fix.

### Refactor

Codebase improvement. Owns architecture debt reduction.
Activate for: architecture debt, Deep Modules violations, naming inconsistencies.
Use #improve-codebase-architecture.

## Prompt Reference

| Prompt                         | When to use                                     |
| ------------------------------ | ----------------------------------------------- |
| #grill-with-docs               | Before feature work — populates domain language |
| #domain-model                  | Align plan to CONTEXT.md before PRD             |
| #to-prd                        | Discovery → PRD                                 |
| #to-features                   | PRD → vertical slice board                      |
| #to-tasks                      | Features → tasks with blocking relationships    |
| #tdd                           | Per task, fresh context window                  |
| #handoff                       | End of each slice                               |
| #prototype                     | Throwaway spike before committing               |
| #improve-codebase-architecture | Periodic architecture deepening                 |
| #velocity-validate             | Before every PR                                 |
| #velocity-sync                 | After dependency changes or new services        |
