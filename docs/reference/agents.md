# Agents Roster

Complete reference for all 12 primary agents and their specialist subagents.

## Primary Agents

### Engineer

The primary workhorse. Handles implementation, testing, and autonomous task execution.

| Property                | Value                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| **Primary skills**      | `/tdd`, `/validate`, `/loop`, `/handoff`, `/feedback-loop`                  |
| **Subagents**           | Backend Engineer, Frontend Engineer, Fullstack Engineer, Messaging Engineer |
| **Spawns fresh window** | Yes (per `/tdd` task)                                                       |
| **Context**             | `stack.md` + `engineering.md` + task CONTEXT.md                             |

---

### Product

Owns product requirements and feature planning from discovery through task board creation.

| Property           | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| **Primary skills** | `/grill-me`, `/grill-with-docs`, `/to-prd`, `/to-features`, `/roadmap` |
| **Subagents**      | PRD Reviewer, Stakeholder Analyst                                      |
| **Context**        | `CONTEXT.md` + relevant ADRs                                           |

---

### Architect

Owns system design, architecture decisions, domain model alignment, and technical documentation.

| Property           | Value                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Primary skills** | `/domain-model`, `/architecture-doc`, `/api-design`, `/adr-engine`, `/improve-codebase-architecture` |
| **Subagents**      | API Designer, Context Mapper                                                                         |
| **Context**        | `context-map.md` + all ADRs + `CONTEXT.md`                                                           |

---

### Security

Owns threat modeling, authentication/authorization design, vulnerability assessment, and compliance review.

| Property           | Value                                             |
| ------------------ | ------------------------------------------------- |
| **Primary skills** | `/security-design`, `/risk-score`, `/audit-trail` |
| **Subagents**      | Threat Modeler, Auth Reviewer                     |
| **Context**        | `security.md` + compliance pack guardrails        |

---

### QA

Owns test strategy, coverage analysis, and regression planning.

| Property           | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Primary skills** | `/test-strategy`, `/validate`, `/feedback-loop`    |
| **Subagents**      | API Tester, E2E Test Designer                      |
| **Context**        | `testing.md` + coverage thresholds from `stack.md` |

---

### UX

Owns user flows, screen specifications, and design system alignment.

| Property           | Value                                            |
| ------------------ | ------------------------------------------------ |
| **Primary skills** | `/design-intelligence`, `/grill-me` (UX variant) |
| **Subagents**      | Flow Designer, Accessibility Reviewer            |
| **Context**        | `CONTEXT.md` (user-facing terminology)           |

---

### Planner

Decomposes features into tasks and builds the blocking dependency graph.

| Property           | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Primary skills** | `/to-tasks`, `/roadmap`, `/prototype`              |
| **Subagents**      | Slice Designer, Dependency Analyzer, Risk Assessor |
| **Context**        | Feature board from `/to-features` + `stack.md`     |

---

### Researcher

Analyzes external libraries, produces spike reports, and recommends approaches.

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| **Primary skills** | `/prototype`, external library analysis                         |
| **Subagents**      | Library Evaluator, Spike Writer                                 |
| **Note**           | Never writes production code — reports and recommendations only |

---

### Reviewer

Performs code review with a fresh context window. Never reviews its own work.

| Property           | Value                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| **Primary skills** | `/validate` (review variant)                                                 |
| **Subagents**      | API Reviewer, Security Reviewer, Performance Reviewer, Architecture Reviewer |
| **Note**           | Always fresh window — has never seen the implementation struggles            |

---

### Debugger

Systematic root cause analysis using a blank-slate approach.

| Property           | Value                                                      |
| ------------------ | ---------------------------------------------------------- |
| **Primary skills** | Systematic debugging protocol, hypothesis testing          |
| **Subagents**      | Log Analyst, Regression Tracer                             |
| **Note**           | Does not read implementation history; starts from symptoms |

---

### Documentation

Produces architecture documentation, API documentation, runbooks, and ADRs.

| Property           | Value                                         |
| ------------------ | --------------------------------------------- |
| **Primary skills** | `/architecture-doc`, `/adr-engine`, `/ingest` |
| **Subagents**      | API Documenter, Runbook Writer                |

---

### Refactor

Deep module extraction, dependency inversion, and systematic technical debt reduction.

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| **Primary skills** | `/improve-codebase-architecture`     |
| **Subagents**      | Module Extractor, Interface Designer |

---

## Subagent Reference

### Stack-Activated Subagents

| Subagent           | Activated When              | Under     |
| ------------------ | --------------------------- | --------- |
| Backend Engineer   | Backend framework detected  | Engineer  |
| Frontend Engineer  | Frontend framework detected | Engineer  |
| Fullstack Engineer | Both frontend + backend     | Engineer  |
| Database Engineer  | Complex multi-DB setup      | Engineer  |
| Messaging Engineer | Kafka/RabbitMQ/SQS detected | Engineer  |
| API Designer       | REST/GraphQL/gRPC APIs      | Architect |
| DevOps Engineer    | CI/CD + infrastructure      | Engineer  |

### Review Subagents

| Subagent              | Focus                           | Under    |
| --------------------- | ------------------------------- | -------- |
| API Reviewer          | Contract adherence, versioning  | Reviewer |
| Security Reviewer     | Auth, injection, secrets        | Reviewer |
| Performance Reviewer  | N+1, memory, computation        | Reviewer |
| Architecture Reviewer | Slice compliance, DDD alignment | Reviewer |

### Planning Subagents

| Subagent            | Focus                       | Under   |
| ------------------- | --------------------------- | ------- |
| Slice Designer      | Vertical slice enforcement  | Planner |
| Dependency Analyzer | Blocking graph construction | Planner |
| Risk Assessor       | Task risk scoring           | Planner |

## Agent Context Protocol

All agents follow a three-tier context loading protocol:

1. **Tier 1 (Always-on):** Entry document loaded on every message (~80 lines)
2. **Tier 2 (Skill context):** Loaded when a skill is invoked (skill-specific `.velocity/` files)
3. **Tier 3 (Agent system prompt):** Full context at agent spawn (standards + CONTEXT.md + ADRs)

Context injection is deliberately tiered to minimize token usage while ensuring the agent has everything it needs.
