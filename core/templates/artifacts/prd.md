# PRD: {{FEATURE_NAME}}

## Version: 1

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Produced by: grill-with-docs session / domain-model session

## Session ref: {{SESSION_ID}}

---

## Overview

{{2–3 sentence summary of what this feature delivers and why.}}

## Problem Statement

{{What user problem or business problem does this solve? Why now?}}

## Goals

- {{Measurable goal 1}}
- {{Measurable goal 2}}
- {{Measurable goal 3}}

## Non-Goals

- {{What this explicitly does NOT do}}

---

## User Stories

{{For each user type:}}

As a {{user role}}, I want to {{action}} so that {{outcome}}.

Acceptance criteria:

- [ ] {{Specific, testable criterion using CONTEXT.md terms}}
- [ ] {{Specific, testable criterion}}

---

## Domain Model

{{Key domain objects and their relationships, using CONTEXT.md terms.}}

{{Reference relevant ADRs that constrain the domain model.}}

---

## Functional Requirements

### {{Requirement Group 1}}

| ID     | Requirement                                    | Priority |
| ------ | ---------------------------------------------- | -------- |
| FR-001 | {{Precise requirement using CONTEXT.md terms}} | Must     |
| FR-002 | {{Precise requirement}}                        | Should   |
| FR-003 | {{Precise requirement}}                        | Could    |

---

## Non-Functional Requirements

| Requirement     | Target    | Notes                        |
| --------------- | --------- | ---------------------------- |
| Latency (p99)   | {{value}} |                              |
| Availability    | {{value}} |                              |
| Test coverage   | ≥ 80%     | Per guardrail config         |
| Security review | Required  | If touches auth/PII/payments |

---

## Technical Decisions

{{Reference ADRs made during the grill session that constrain implementation.}}

| Decision     | ADR        | Status   |
| ------------ | ---------- | -------- |
| {{decision}} | ADR-{{id}} | Accepted |

---

## Out of Scope

{{Explicitly list what is NOT in this PRD to prevent scope creep.}}

---

## Open Questions

{{Any unresolved questions that must be answered before implementation begins.}}

---

## Version History

| Version | Date     | Author  | Summary of changes |
| ------- | -------- | ------- | ------------------ |
| 1       | {{DATE}} | {{who}} | Initial draft      |

---

## Next Step

Run /to-features to decompose this PRD into a vertical-slice feature board.
