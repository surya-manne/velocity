# Skills Reference

Velocity ships with 48 production skills organized into 8 categories. Each skill is a `SKILL.md` file — a structured prompt chain that executes within your AI assistant.

## How to Invoke Skills

| Assistant      | Syntax        |
| -------------- | ------------- |
| Cursor         | `/skill-name` |
| Claude Code    | `/skill-name` |
| GitHub Copilot | `#skill-name` |
| Gemini         | `@skill-name` |

Skills are invoked in the assistant chat. They always begin by loading context from `.velocity/` before acting.

---

## Bootstrap & Regeneration

| Skill                                                | Command              | Description                                                                                 |
| ---------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| [/init](/skills/init)                                | `/velocity-init`     | Full workspace bootstrap — stack detect, `.velocity/` creation, all factories, all adapters |
| /plugin-installer                                    | `/plugin-installer`  | Plugin bootstrap for VS Code/GitHub Copilot, Cursor, and Claude Code                       |
| /local-installer                                     | `/local-installer`   | Generate copy-pasteable local install files for client repositories                         |
| [/sync](/skills/sync)                                | `/velocity-sync`     | Delta refresh — updates only what changed since last `/init`                                |
| [/validate](/skills/validate)                        | `/velocity-validate` | 12-point pre-PR quality gate                                                                |
| [/project-intelligence](/guide/project-intelligence) | (internal)           | 12-phase stack fingerprinting                                                               |

---

## Discovery & Product

| Skill                                       | Command            | Best For                                    |
| ------------------------------------------- | ------------------ | ------------------------------------------- |
| [/grill-me](/skills/grill-me)               | `/grill-me`        | New projects, greenfield discovery          |
| [/grill-with-docs](/skills/grill-with-docs) | `/grill-with-docs` | Existing codebases, brownfield discovery    |
| [/to-prd](/skills/to-prd)                   | `/to-prd`          | Feature brief → structured PRD              |
| [/to-features](/skills/to-features)         | `/to-features`     | PRD → vertical slice board                  |
| [/to-tasks](/skills/to-tasks)               | `/to-tasks`        | Features → tasks with blocking graph        |
| /domain-model                               | `/domain-model`    | Align plan to CONTEXT.md before PRD         |
| /roadmap                                    | `/roadmap`         | Sequence feature board into phased delivery |
| /prototype                                  | `/prototype`       | Throwaway spike before committing           |

---

## Engineering

| Skill                          | Command                          | Description                                     |
| ------------------------------ | -------------------------------- | ----------------------------------------------- |
| [/tdd](/skills/tdd)            | `/tdd`                           | Test-driven development: red → green → refactor |
| [/loop](/skills/loop)          | `/loop`                          | Autonomous task board execution                 |
| [/handoff](/skills/handoff)    | `/handoff`                       | Slice handoff artifact for context reset        |
| /feedback-loop                 | `/feedback-loop`                 | Typecheck/test/lint gates in-session            |
| /improve-codebase-architecture | `/improve-codebase-architecture` | Deep modules, shallow module detection          |

---

## Architecture & Design

| Skill                | Command                | Description                             |
| -------------------- | ---------------------- | --------------------------------------- |
| /architecture-doc    | `/architecture-doc`    | Architecture document generator         |
| /api-design          | `/api-design`          | OpenAPI / GraphQL / Protobuf scaffolds  |
| /security-design     | `/security-design`     | Threat model + auth/authz design        |
| /design-intelligence | `/design-intelligence` | User flows, screen specs, design system |
| /test-strategy       | `/test-strategy`       | Test plan generator                     |
| /adr-engine          | `/adr-engine`          | ADR generation with three-criteria gate |

---

## Context & Knowledge

| Skill           | Command           | Description                                           |
| --------------- | ----------------- | ----------------------------------------------------- |
| /context-engine | `/context-engine` | Validate code identifiers match CONTEXT.md            |
| /context-merge  | `/context-merge`  | Reconcile CONTEXT.md proposals from multiple sessions |
| /ingest         | `/ingest`         | Knowledge base ingestion + index regeneration         |

---

## Standards & Extensions

| Skill                                         | Command             | Description                                       |
| --------------------------------------------- | ------------------- | ------------------------------------------------- |
| [/rule-pack-engine](/skills/rule-pack-engine) | `/rule-pack-engine` | Import external rules → skills/guardrails/context |
| /marketplace                                  | `/marketplace`      | Browse, install, update Velocity packs            |

---

## Governance

| Skill                                           | Command              | Description                                              |
| ----------------------------------------------- | -------------------- | -------------------------------------------------------- |
| [/audit-trail](/skills/audit-trail)             | `/audit-trail`       | Append-only JSON-L audit log (18 event types)            |
| [/approval-workflow](/skills/approval-workflow) | `/approval-workflow` | In-session or PR-review sign-off                         |
| [/risk-score](/skills/risk-score)               | `/risk-score`        | 0–100 risk score from domain + surface + guardrail state |

---

## Workspace (Multi-Repo)

| Skill                          | Command                          | Description                              |
| ------------------------------ | -------------------------------- | ---------------------------------------- |
| /workspace-setup               | `/workspace-setup`               | Initialize velocity-workspace repo       |
| /workspace-intelligence        | `/workspace-intelligence`        | Build cross-repo dependency graph        |
| /workspace-context-propagation | `/workspace-context-propagation` | Push/pull shared CONTEXT.md across repos |

---

## Adapters

| Adapter                                      | Command | Generates                                       |
| -------------------------------------------- | ------- | ----------------------------------------------- |
| [cursor-adapter](/adapters/cursor)           | (auto)  | `.cursor/rules/`, agents, skills, hooks         |
| [claude-code-adapter](/adapters/claude-code) | (auto)  | `CLAUDE.md`, subagents, commands, hooks         |
| [copilot-adapter](/adapters/copilot)         | (auto)  | `copilot-instructions.md`, `AGENTS.md`, prompts |
| [gemini-adapter](/adapters/gemini)           | (auto)  | `GEMINI.md`, agents, tools, styleguide          |

Adapters run automatically as part of `/init` and `/sync`. They can also be run individually.
