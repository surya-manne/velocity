---
name: skill-factory
description: "Generate project-specific skill configurations for this repository. Reads the stack fingerprint and configures the canonical skill chain with stack-appropriate variants (test framework, API style, etc.). Generates stack-specific skills (Kafka Review, GraphQL Governance, etc.). Writes configured skill files to .velocity/skills/. Run automatically by /init and /sync."
---


# Skill Factory

Configure and generate Velocity skills for this specific repository's stack and domain.

## Context Load

Before starting, read:

- `.velocity/project-intelligence/stack.md` — stack fingerprint
- `.velocity/context-map.md` — bounded contexts
- `skills/` directory in the Velocity repository — all master skill templates

---

## Step 1 — Canonical Skill Chain Configuration

Configure each skill in the canonical chain for this stack:

### `grill-with-docs`

Context load paths:

- CONTEXT.md path(s) from `context-map.md`
- `.velocity/knowledge-base/adrs/` index

Output path: `.velocity/artifacts/context-proposals/{session-id}.md`

Stack variant: none (skill is stack-agnostic)

### `grill-me`

Context load paths: none (greenfield — no codebase to reference)

Output path: none (drives a conversation; output is a resolved design tree)

Stack variant: none

### `domain-model`

Context load paths:

- CONTEXT.md path(s) from `context-map.md`
- `.velocity/knowledge-base/adrs/` — full ADR body reads

Output path: `.velocity/artifacts/context-proposals/{session-id}.md` (updates CONTEXT.md)

Stack variant: none

### `to-prd`

Context load paths:

- `.velocity/knowledge-base/adrs/` index (title-only)
- `.velocity/project-context/engineering.md`
- `.velocity/artifacts/context-proposals/` — pending proposals to incorporate

Output path: `.velocity/artifacts/prds/{feature-id}.md`

Stack variant: none

### `to-features`

Context load paths:

- `.velocity/artifacts/prds/{latest}.md` — the PRD to decompose

Output path: `.velocity/artifacts/features/{prd-id}-v{N}.md`

Stack variant: none

### `to-tasks`

Context load paths:

- `.velocity/artifacts/features/{feature-id}.md`

Output path: `.velocity/artifacts/tasks/{feature-id}-v{N}.md`

Stack variant: none

### `feedback-loop`

Context load paths:

- `.velocity/guardrails/default.md` — gate configuration (`feedback_loops` and `module_architecture` sections)
- `.velocity/project-context/testing.md` — test run commands and coverage thresholds

Fresh context window: **false** (runs inline during the TDD session)

Stack-specific behavior:

- Read `typecheck_command`, `test_command`, `lint_command` from `testing.md` and inject into the skill
- If `module_architecture.deep_module_enforcement: true`: activate the deep module gate step after each refactor

Output path: `.velocity/artifacts/architecture-reviews/shallow-modules-{date}.md` (deep module findings only)

### `tdd`

Context load paths:

- `.velocity/project-context/testing.md`
- CONTEXT.md for the relevant bounded context
- `.velocity/artifacts/tasks/{task-id}.md` — current task

Fresh context window: **true** (start fresh for each task)

Stack-specific variants — apply the relevant one:

| Detected           | Variant applied                                                            |
| ------------------ | -------------------------------------------------------------------------- |
| `jest` or `vitest` | Configure for Jest/Vitest: `describe`, `it`, `expect`, `vi.mock` patterns  |
| `junit`            | Configure for JUnit 5: `@Test`, `@ExtendWith`, `Mockito` patterns          |
| `pytest`           | Configure for pytest: fixture patterns, `conftest.py` conventions          |
| `rspec`            | Configure for RSpec: `describe`, `context`, `it`, `let`, `expect` patterns |
| `go testing`       | Configure for Go: `t.Run`, `testify`, table-driven tests                   |
| `vitest`           | Configure for Vitest: same as Jest but with `import.meta.vitest` guard     |

Stack-specific behavior additions:

| Detected      | Addition                                                        |
| ------------- | --------------------------------------------------------------- |
| `kafka`       | After green: run kafka integration test against embedded broker |
| `postgres`    | After green: run integration test against testcontainer         |
| `spring-boot` | After green: run `@SpringBootTest` slice test                   |
| `nextjs`      | After green: run component test with React Testing Library      |
| `graphql`     | After green: run resolver unit test + schema validation         |

Output path: none (TDD skill produces code — output is the implemented slice)

### `improve-codebase-architecture`

Context load paths:

- `.velocity/project-intelligence/stack.md`
- `.velocity/knowledge-base/adrs/` index
- CONTEXT.md for all contexts (checks term alignment with code)

Output path: `.velocity/artifacts/architecture-reviews/{date}.md`

Stack variant: none (skill is stack-agnostic by design)

### `handoff`

Context load paths:

- `.velocity/artifacts/tasks/{task-id}.md` — current slice state

Output path: `.velocity/artifacts/handoffs/{slice-id}.md`

Stack variant: none

### `prototype`

Context load paths: none (throwaway spike — minimal context by design)

Output path: none (prototypes are never committed; output is a decision)

Stack variant: none (skill is stack-agnostic)

### `roadmap`

Context load paths:

- `.velocity/artifacts/features/{feature-board}.md` — the feature board to sequence
- `.velocity/artifacts/prds/{prd-id}.md` — the originating PRD
- CONTEXT.md from `context-map.md`

Output path: `.velocity/artifacts/roadmaps/{prd-id}-v{N}.md`

Stack variant: none (skill is stack-agnostic)

### `context-merge`

Context load paths:

- CONTEXT.md for the target bounded context
- `.velocity/artifacts/context-proposals/*.md` — all pending proposals

Output path: updated CONTEXT.md (in-place); proposals archived after merge

Stack variant: none

### `context-engine`

Context load paths:

- `.velocity/context-map.md`
- CONTEXT.md for the relevant bounded context
- `.velocity/artifacts/context-proposals/` — pending proposals (for diff mode)

Output path:

- `validate` mode: `.velocity/artifacts/validation-reports/context-drift-{date}.md`
- `update` mode: updates CONTEXT.md in-place; archives proposal

Stack variant: none

### `adr-engine`

Context load paths:

- `.velocity/knowledge-base/adrs/index.md`
- `.velocity/context-map.md`
- CONTEXT.md for the relevant bounded context

Output path: `.velocity/artifacts/adrs/ADR-{id}-{slug}.md`; updates `.velocity/knowledge-base/adrs/index.md`

Stack variant: none

### `architecture-doc`

Context load paths:

- CONTEXT.md from `context-map.md`
- `.velocity/knowledge-base/adrs/index.md` + relevant full ADR bodies
- `.velocity/project-context/engineering.md`
- `.velocity/project-context/api.md`
- `.velocity/artifacts/prds/` (if applicable)

Output path: `.velocity/artifacts/architecture/{feature-slug}.md`

Stack variant: none

### `api-design`

Context load paths:

- `.velocity/project-context/api.md`
- CONTEXT.md from `context-map.md`
- `.velocity/knowledge-base/adrs/index.md` + full bodies of API-related ADRs
- `.velocity/artifacts/prds/` (if applicable)
- `.velocity/artifacts/architecture/` (if applicable)

Output path: `.velocity/artifacts/api/{slug}.md` (OpenAPI), `.velocity/artifacts/api/{slug}.graphql` (GraphQL), `.velocity/artifacts/api/{slug}.proto` (gRPC), `.velocity/artifacts/api/{slug}.md` (design narrative)

Stack-specific variant:

| Detected         | Variant                   |
| ---------------- | ------------------------- |
| `rest` / default | OpenAPI 3.x YAML scaffold |
| `graphql`        | GraphQL SDL scaffold      |
| `grpc`           | Protobuf service scaffold |
| `trpc`           | tRPC router type scaffold |

### `security-design`

Context load paths:

- `.velocity/project-context/security.md`
- CONTEXT.md from `context-map.md`
- `.velocity/knowledge-base/adrs/index.md` + full bodies of security-related ADRs
- `.velocity/artifacts/prds/` (if applicable)
- `.velocity/artifacts/architecture/` (if applicable)

Output path: `.velocity/artifacts/security/{feature-slug}.md`

Stack variant: none (compliance packs applied from `security.md`)

### `design-intelligence`

Context load paths:

- CONTEXT.md from `context-map.md`
- `.velocity/artifacts/prds/` (relevant PRD)
- `.velocity/artifacts/features/` (relevant feature definition)
- `.velocity/project-context/engineering.md`

Output path: `.velocity/artifacts/design/{feature-slug}/` (user-flow.md, screens.md, components.md, figma-contract.md, storybook-index.md)

Stack-specific behavior:

| Detected                               | Behavior addition                                        |
| -------------------------------------- | -------------------------------------------------------- |
| `react` or `nextjs` or `vue`           | Component catalogue uses framework component conventions |
| `figma` (detected via project-context) | Figma integration contract generated                     |
| `storybook`                            | Storybook story index generated                          |

### `test-strategy`

Context load paths:

- `.velocity/project-context/testing.md`
- CONTEXT.md from `context-map.md`
- `.velocity/artifacts/prds/` (relevant PRD)
- `.velocity/artifacts/features/` (if it exists)
- `.velocity/knowledge-base/adrs/index.md`

Output path: `.velocity/artifacts/test-strategy/{feature-slug}.md`; optionally `-performance.md` and `-security.md`

Stack-specific variants:

| Detected           | Variant applied                                         |
| ------------------ | ------------------------------------------------------- |
| `jest` or `vitest` | Unit and component test examples use Jest/Vitest syntax |
| `junit`            | Unit test examples use JUnit 5 + Mockito                |
| `pytest`           | Unit test examples use pytest conventions               |
| `playwright`       | E2E test examples use Playwright page object model      |
| `cypress`          | E2E test examples use Cypress command chaining          |
| `k6`               | Performance test plan uses k6 script structure          |
| `gatling`          | Performance test plan uses Gatling simulation structure |

---

## Step 2 — Generate Stack-Specific Skills

Generate skills for each active stack signal that has a corresponding skill template:

| Stack Signal     | Skill Generated                                  |
| ---------------- | ------------------------------------------------ |
| `kafka`          | `kafka-review`, `kafka-design`, `kafka-testing`  |
| `graphql`        | `graphql-governance`                             |
| `ddd`            | `ddd-patterns`                                   |
| `event-sourcing` | `event-sourcing-patterns`                        |
| `spring-boot`    | `spring-boot-patterns`, `spring-security-review` |
| `react`          | `react-component-patterns`, `react-testing`      |
| `nextjs`         | `nextjs-patterns`                                |
| `kubernetes`     | `kubernetes-security-review`                     |
| `aws`            | `aws-security-review`                            |
| `microservices`  | `microservices-patterns`                         |
| `cqrs`           | `cqrs-patterns`                                  |

For each stack-specific skill: configure context load paths for this repo's structure.

---

## Step 3 — Write Configured Skill Files

For each skill (canonical + stack-specific), write `.velocity/skills/{skill-id}.md`:

```yaml
id: <skill-id>
name: <name>
description: <one-line description>
category: <category>
chain_position: <position>
configured_at: <ISO 8601 timestamp>
stack_variants_applied: [<list of applied variants>]

context_load:
  - path: <path>
    required: <true/false>
    injection_tier: <tier>

output:
  path: <output path pattern>
  format: <format>

fresh_context_window: <true/false>

next_skills: [<list>]
preconditions: [<list>]

skill_md_path: skills/<skill-id>/SKILL.md
```

---

## Step 4 — Generate Skills Discovery Index

Write `.velocity/skills/index.md`:

```markdown
# Available Skills

## Canonical Skill Chain

| Skill                         | Command                        | When to invoke                                   |
| ----------------------------- | ------------------------------ | ------------------------------------------------ |
| grill-with-docs               | /grill-with-docs               | Before any feature work on an existing codebase  |
| grill-me                      | /grill-me                      | Greenfield interview — no codebase required      |
| domain-model                  | /domain-model                  | Align plan to CONTEXT.md before writing PRD      |
| to-prd                        | /to-prd                        | After grill session — convert decisions to PRD   |
| to-features                   | /to-features                   | PRD → vertical-slice feature board               |
| to-tasks                      | /to-tasks                      | Feature → independently implementable tasks      |
| roadmap                       | /roadmap                       | Feature board → phased delivery roadmap          |
| tdd                           | /tdd                           | Per task, in a fresh context window              |
| feedback-loop                 | /feedback-loop                 | Typecheck/test/lint gates during implementation  |
| improve-codebase-architecture | /improve-codebase-architecture | Periodic deepening                               |
| handoff                       | /handoff                       | End of each slice                                |
| prototype                     | /prototype                     | Before committing to an approach                 |
| context-merge                 | /context-merge                 | Reconcile CONTEXT.md proposals                   |
| context-engine                | /context-engine                | Validate/diff/update CONTEXT.md glossary         |
| adr-engine                    | /adr-engine                    | Create and version Architecture Decision Records |

## Architecture and Design Skills

| Skill               | Command              | When to invoke                                   |
| ------------------- | -------------------- | ------------------------------------------------ |
| architecture-doc    | /architecture-doc    | Before implementation: produce architecture doc  |
| api-design          | /api-design          | When feature introduces new API surface          |
| security-design     | /security-design     | When feature touches auth, PII, or payments      |
| design-intelligence | /design-intelligence | Before UI implementation: flows and screen specs |
| test-strategy       | /test-strategy       | Before implementation: test plan per feature     |

## Stack-Specific Skills

[Auto-generated list based on active stack signals]

## Infrastructure Skills

| Skill         | Command   | When to invoke                              |
| ------------- | --------- | ------------------------------------------- |
| velocity-init | /init     | Initialize Velocity (once per repo)         |
| sync          | /sync     | Pull latest intelligence, regenerate assets |
| validate      | /validate | Guardrail checks before PR                  |
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Read existing `.velocity/skills/` configs
2. Read `stack-delta.md` from Project Intelligence delta run
3. For each new/changed stack signal: generate or update affected skills
4. For removed signals: remove the skill config and log it
5. Regenerate `index.md` (always regenerated on delta)
