# Workspace Intelligence

Workspace Intelligence enables Velocity to work across multiple repositories — building a cross-repo dependency graph, propagating shared context, and providing organization-level visibility.

## What is a Velocity Workspace?

A **velocity-workspace** is a dedicated repository that acts as the coordination hub for multi-repo engineering organizations. It contains:

- Cross-repo dependency graph
- Shared bounded context glossaries
- Organization-level guardrails
- Shared agent definitions
- Inter-service contract registry

```
your-org/
├── velocity-workspace/    ← Coordination hub
│   ├── .velocity/
│   │   ├── workspace-config.yaml
│   │   ├── context-graph.md          # Cross-repo dependencies
│   │   ├── shared-context/           # Organization-wide CONTEXT.md
│   │   └── shared-guardrails/        # Org-level rules
│   └── services/
│       ├── payments-service.md       # Service registry entry
│       ├── orders-service.md
│       └── notifications-service.md
│
├── payments-service/      ← Linked repo
│   └── .velocity/         ← Points to workspace
│
├── orders-service/        ← Linked repo
│   └── .velocity/
│
└── notifications-service/ ← Linked repo
    └── .velocity/
```

## Setup

### Step 1: Create the Workspace Repo

```
/workspace-setup
```

Initializes the velocity-workspace repository with the cross-repo coordination structure.

### Step 2: Link Service Repos

In each service repo, `/init` or `/sync` asks if you want to connect to a workspace:

```
Workspace detected: ../velocity-workspace
Link this repository? [Y/n]
```

When linked, the service repo's `.velocity/` pulls shared context from the workspace on every `/sync`.

## Workspace Intelligence

```
/workspace-intelligence
```

Builds a cross-repo dependency graph by:

1. Reading each linked service's `stack.md` and `context-map.md`
2. Analyzing inter-service API calls and event consumers
3. Mapping shared domain concepts across contexts
4. Identifying breaking changes that span services

Output: `velocity-workspace/.velocity/context-graph.md`

```markdown
# Context Graph

## Service Registry

| Service               | Context       | Upstream         | Downstream            |
| --------------------- | ------------- | ---------------- | --------------------- |
| payments-service      | payments      | —                | orders, notifications |
| orders-service        | orders        | payments         | notifications         |
| notifications-service | notifications | payments, orders | —                     |

## Cross-Service Contracts

### PaymentIntent ID

Shared by: payments → orders
Format: pi\_[alphanumeric]
Owner: payments-service

### OrderPlaced Event

Published by: orders-service (Kafka: order-events)
Consumed by: notifications-service

## Breaking Change Risk

If payments-service changes PaymentIntent.status enum:
→ orders-service requires update (reads status)
→ notifications-service requires update (status-based triggers)
Risk: HIGH — coordinate deployment
```

## Context Propagation

```
/workspace-context-propagation
```

Synchronizes shared domain terms between the workspace and linked service repos:

- **Push**: Workspace receives CONTEXT.md updates from services, reconciles conflicts
- **Pull**: Services receive updated shared glossary from workspace

This ensures that cross-service concepts (`CustomerId`, `CorrelationId`, `TraceId`) are defined consistently everywhere.

## Workspace Guardrails

The workspace can define organization-level guardrails that apply to all linked repos:

```yaml
# velocity-workspace/.velocity/shared-guardrails/org-standards.md

org_guardrails:
  - id: org-no-direct-db-cross-service
    rule: Services must not query another service's database directly
    severity: critical

  - id: org-correlation-id-required
    rule: All service API calls must propagate CorrelationId header
    severity: high

  - id: org-event-schema-versioned
    rule: All Kafka event schemas must include a version field
    severity: high
```

These are merged into each service repo's guardrail configuration during `/sync`.

## Value for Engineering Organizations

| Problem                                   | Workspace Solution                                    |
| ----------------------------------------- | ----------------------------------------------------- |
| Inconsistent terminology across services  | Shared CONTEXT.md propagated to all repos             |
| Breaking changes discovered at deployment | Cross-service contract registry with dependency graph |
| Each team reinvents standards             | Workspace guardrails applied everywhere               |
| No visibility into cross-repo impact      | Workspace Intelligence maps it automatically          |
| New engineers learn one service at a time | Workspace context gives org-level picture             |
