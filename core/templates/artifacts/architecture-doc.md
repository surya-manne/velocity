# Architecture Document: {{FEATURE_NAME}}

## Version: 1

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Author: Architecture Agent

## Related PRD: {{PRD_PATH}}

---

## Overview

{{2–3 sentences: what this feature does and why it needs an architecture document.}}

---

## System Context

> How this feature fits within the broader system. Who calls it. What it calls.

```
[External Actor / System] → [This Component] → [Downstream System]
                                    |
                             [Data Store]
```

**External actors:**

- {{Actor name}}: {{what they do with this component}}

**External dependencies:**

- {{System name}}: {{what this component needs from it}}

---

## Component Design

> The internal structure of this feature. What each component is responsible for.
> Level: components and their contracts — not classes, not files.

| Component                       | Responsibility                           | Interface                               |
| ------------------------------- | ---------------------------------------- | --------------------------------------- |
| {{Name using CONTEXT.md terms}} | {{What it does — single responsibility}} | {{What it exposes to other components}} |

### Component diagram

```
[ComponentA]
    |
    ↓ {data or event}
[ComponentB]
    |
    ↓ {persists}
[Data Store]
```

---

## Data Flows

> How data moves through the system for the primary operations of this feature.

### {{Primary operation name}}

```
[Caller] → POST /{{resource}} → [API Handler]
                                       |
                                  [Domain Logic: validates {{entity}}]
                                       |
                                  [Repository: persists {{entity}}]
                                       |
                               [Event: {{EventName}} emitted]
                                       |
                               [Subscriber: {{downstream effect}}]
```

**Data at each boundary:**

| Boundary     | Data crossing                       | Format          | Sensitive? |
| ------------ | ----------------------------------- | --------------- | ---------- |
| API entry    | {{fields}}                          | JSON / Protobuf | {{yes/no}} |
| Domain layer | {{entities using CONTEXT.md terms}} | Domain objects  | {{yes/no}} |
| Persistence  | {{fields stored}}                   | DB record       | {{yes/no}} |
| Event bus    | {{event schema}}                    | {{format}}      | {{yes/no}} |

---

## API Surface

> New or modified API surface introduced by this feature. Full spec in `.velocity/artifacts/api/`.

| Endpoint / Operation | Method        | Request        | Response           | Auth                 |
| -------------------- | ------------- | -------------- | ------------------ | -------------------- |
| `{{path}}`           | {{HTTP verb}} | {{key fields}} | {{response shape}} | {{auth requirement}} |

Full API specification: `.velocity/artifacts/api/{{slug}}.*`

---

## Domain Model

> Key domain entities and their relationships for this feature. Use CONTEXT.md terms.

```
{{EntityA}} 1──n {{EntityB}}
     |
     └── {{EntityC}} (optional)
```

| Entity   | Attributes     | Invariants                               |
| -------- | -------------- | ---------------------------------------- |
| {{Name}} | {{key fields}} | {{business rules that must always hold}} |

---

## Deployment Topology

> Where this feature runs. What infrastructure it touches.

| Component     | Deployment unit                    | Scaling                           | Region     |
| ------------- | ---------------------------------- | --------------------------------- | ---------- |
| {{Component}} | {{container / function / service}} | {{horizontal / vertical / fixed}} | {{region}} |

---

## Quality Attributes

| Attribute     | Target     | How it is achieved |
| ------------- | ---------- | ------------------ |
| Latency (p99) | {{target}} | {{mechanism}}      |
| Availability  | {{target}} | {{mechanism}}      |
| Consistency   | {{model}}  | {{mechanism}}      |
| Scalability   | {{limit}}  | {{mechanism}}      |

---

## Design Decisions

> Significant choices made in this design. Why this, not that.

| Decision     | Chosen approach     | Alternative rejected    | Reason  |
| ------------ | ------------------- | ----------------------- | ------- |
| {{Decision}} | {{What was chosen}} | {{What was not chosen}} | {{Why}} |

**ADRs generated or referenced:**

| ADR        | Title     | Status   |
| ---------- | --------- | -------- |
| ADR-{{id}} | {{title}} | Accepted |

---

## Constraints and Risks

### Constraints

- {{Constraint from existing ADRs or system properties}}

### Risks

| Risk     | Likelihood          | Impact              | Mitigation     |
| -------- | ------------------- | ------------------- | -------------- |
| {{Risk}} | High / Medium / Low | High / Medium / Low | {{mitigation}} |

---

## Open Questions

{{Any unresolved questions that must be answered before implementation begins.}}

| Question     | Owner           | Resolution needed by |
| ------------ | --------------- | -------------------- |
| {{question}} | {{who decides}} | {{when}}             |

---

## Out of Scope

{{What this architecture document explicitly does not cover.}}

---

## Next Steps

- [ ] API Design: run /api-design for `{{resource}}`
- [ ] Security Design: run /security-design (if auth/PII/payments involved)
- [ ] Domain Model update: run /domain-model (if new terms introduced)
- [ ] ADR: run /adr-engine for open decisions
- [ ] Implement: Engineer Agent picks up tasks from feature board

---

## Version History

| Version | Date     | Author             | Summary       |
| ------- | -------- | ------------------ | ------------- |
| 1       | {{DATE}} | Architecture Agent | Initial draft |
