# Domain Model: {{BOUNDED_CONTEXT_NAME}}

## Version: {{VERSION}}

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Source: grill-with-docs session / domain-model session

## Session ref: {{SESSION_ID}}

---

## Overview

{{1–2 sentences: what this bounded context is responsible for and its relationship to adjacent contexts.}}

---

## Entities

> Core domain objects with identity. They exist independently and have a lifecycle.

| Entity                           | Description                          | Identity     | Lifecycle states                         |
| -------------------------------- | ------------------------------------ | ------------ | ---------------------------------------- |
| {{Entity using CONTEXT.md term}} | {{what it represents in the domain}} | {{id field}} | {{states: e.g. Draft → Active → Closed}} |

### Entity Details

#### {{EntityName}}

**Definition:** {{Domain definition from CONTEXT.md}}

**Attributes:**

| Attribute                         | Type     | Required   | Description       |
| --------------------------------- | -------- | ---------- | ----------------- |
| `{{id}}`                          | UUID     | Yes        | Unique identifier |
| `{{field using CONTEXT.md term}}` | {{type}} | {{yes/no}} | {{description}}   |

**Invariants:**

- {{Business rule that must always hold for this entity}}

**Lifecycle:**

```
{{State A}} → {{State B}} → {{State C}}
     |
     └── {{Alternative transition}}
```

---

## Value Objects

> Domain concepts without identity. Defined entirely by their attributes.

| Value Object | Attributes | Equality      | Use                                 |
| ------------ | ---------- | ------------- | ----------------------------------- |
| {{Name}}     | {{fields}} | By all fields | {{where this value object is used}} |

---

## Aggregates

> Consistency boundaries. Defines what can be changed atomically.

| Aggregate Root | Members                                    | Invariant it enforces                         |
| -------------- | ------------------------------------------ | --------------------------------------------- |
| {{Entity}}     | {{list of entities/value objects it owns}} | {{business rule that requires atomic change}} |

**Aggregate rules:**

- External code references aggregates by aggregate root ID only
- State changes to members must go through the aggregate root
- Aggregate boundaries define transaction scope

---

## Domain Events

> Things that happened in the domain. Past tense, named using CONTEXT.md terms.

| Event              | Produced by           | Consumed by         | Payload        |
| ------------------ | --------------------- | ------------------- | -------------- |
| `{{EntityVerbed}}` | {{aggregate/command}} | {{subscriber list}} | {{key fields}} |

---

## Commands

> Intent to change state. Named in imperative form.

| Command          | Actor             | Preconditions               | Produces                  |
| ---------------- | ----------------- | --------------------------- | ------------------------- |
| `{{VerbEntity}}` | {{who initiates}} | {{what must be true first}} | {{event or state change}} |

---

## Relationships

```
{{EntityA}} 1──n {{EntityB}}
{{EntityA}} n──1 {{EntityC}} (owns)
{{EntityA}} ──── {{EntityD}} (references by ID only, separate aggregate)
```

| Relationship              | Cardinality | Type                | Notes                                     |
| ------------------------- | ----------- | ------------------- | ----------------------------------------- |
| {{EntityA}} → {{EntityB}} | 1:N         | Composition (owned) | {{why it's an aggregate relationship}}    |
| {{EntityA}} → {{EntityC}} | N:1         | Reference           | {{why it's a reference, not composition}} |

---

## Context Boundaries

> Where this bounded context ends. What it does NOT own.

**This context owns:**

- {{Entity or concept}}

**This context references but does not own:**

- {{Entity from another context}} — referenced by ID, fetched via {{mechanism}}

**Adjacent contexts:**

| Context          | Relationship                            | Integration mechanism                   |
| ---------------- | --------------------------------------- | --------------------------------------- |
| {{Context name}} | {{Upstream / Downstream / Partnership}} | {{Shared kernel / ACL / Events / REST}} |

---

## Business Rules

> Domain rules that constrain state transitions and operations.

| Rule                                 | Applies to           | Description                |
| ------------------------------------ | -------------------- | -------------------------- |
| {{Rule name using CONTEXT.md terms}} | {{entity/aggregate}} | {{precise rule statement}} |

---

## ADRs Constraining this Model

| ADR        | Decision     | Impact on domain model           |
| ---------- | ------------ | -------------------------------- |
| ADR-{{id}} | {{decision}} | {{what it prevents or requires}} |

---

## CONTEXT.md Alignment Check

| Model term | CONTEXT.md status               | Action                    |
| ---------- | ------------------------------- | ------------------------- |
| `{{term}}` | ✅ Defined                      | None                      |
| `{{term}}` | ⚠️ Not in CONTEXT.md            | Add to CONTEXT.md         |
| `{{term}}` | ❌ Conflicts with existing term | Resolve before proceeding |

---

## Open Questions

| Question     | Owner   | Resolution needed by |
| ------------ | ------- | -------------------- |
| {{question}} | {{who}} | {{when}}             |

---

## Version History

| Version | Date     | Author             | Summary       |
| ------- | -------- | ------------------ | ------------- |
| 1       | {{DATE}} | Architecture Agent | Initial draft |
