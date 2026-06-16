# User Flow: {{FEATURE_NAME}}

## Version: 1

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Related PRD: {{PRD_PATH}}

## Related Feature: {{FEATURE_PATH}}

---

## Overview

{{1–2 sentences: what user goal this flow enables.}}

**User type:** {{Who is completing this flow}}

**Entry trigger:** {{What initiates this flow — link, button, navigation, notification}}

**Success state:** {{What the user has accomplished when the flow completes}}

---

## Flow Diagram

```
[{{Entry point}}]
       |
       ↓
[{{Screen A: action the user takes}}]
       |
       ↓ {{data submitted / decision made}}
  [Decision: {{condition}}?]
   ↓ Yes                ↓ No
[{{Screen B}}]      [{{Screen C}}]
       |
       ↓
[{{Success state}}]

--- Error paths ---

[{{Screen A}}] → [{{Validation error state}}] → [{{Screen A with error}}]
[{{Screen B}}] → [{{System error}}] → [{{Error screen with recovery action}}]
```

---

## Screens in This Flow

| Screen                          | User goal | Entry points    | Primary action     | Exit points       |
| ------------------------------- | --------- | --------------- | ------------------ | ----------------- |
| {{Name using CONTEXT.md terms}} | {{goal}}  | {{how arrived}} | {{primary action}} | {{where they go}} |

---

## Happy Path

Step-by-step description of the primary success path:

1. {{User action at entry point}}
2. {{System response}}
3. {{User action}}
4. {{System response}}
5. {{Completion: user has achieved their goal}}

---

## Error Paths

| Error scenario                                | Trigger            | User sees         | Recovery action                   |
| --------------------------------------------- | ------------------ | ----------------- | --------------------------------- |
| {{Validation failure using CONTEXT.md terms}} | {{what causes it}} | {{message shown}} | {{what the user does to recover}} |
| {{System error}}                              | {{what causes it}} | {{message shown}} | {{recovery or escalation}}        |

---

## State Transitions

> Domain state changes triggered by this flow.

| User action                       | Domain event    | State before     | State after      |
| --------------------------------- | --------------- | ---------------- | ---------------- |
| {{action using CONTEXT.md terms}} | `{{EventName}}` | {{entity state}} | {{entity state}} |

---

## Edge Cases

| Scenario                             | Expected behaviour       |
| ------------------------------------ | ------------------------ |
| {{Edge case using CONTEXT.md terms}} | {{what the system does}} |

---

## Accessibility Requirements

- Keyboard navigation: {{flow is completable without a mouse}}
- Screen reader: {{critical state changes are announced}}
- Focus management: {{focus moves to first error on validation failure; moves to success message on completion}}
- Error association: {{error messages are associated with their input fields via aria-describedby}}

---

## Open Questions

| Question     | Owner   | Resolution needed by |
| ------------ | ------- | -------------------- |
| {{question}} | {{who}} | {{when}}             |

---

## Version History

| Version | Date     | Author   | Summary       |
| ------- | -------- | -------- | ------------- |
| 1       | {{DATE}} | UX Agent | Initial draft |
