---
mode: agent
description: "Produce a PRD from a resolved grill-with-docs or domain-model session. Reads the context proposals and ADRs from the session, synthesizes them into a structured PRD, and writes it to .velocity/artifacts/prds/. Run after grill-with-docs or domain-model, before to-features."
---


# To PRD

Produce a Product Requirements Document from the resolved design session.

## Context Load

Read before starting:

1. `.velocity/artifacts/context-proposals/` — latest proposal from the grill session
2. `.velocity/artifacts/adrs/` — ADRs generated in this session
3. CONTEXT.md from `.velocity/context-map.md`
4. `.velocity/project-context/engineering.md`

---

## Versioning

### New PRD

When writing a PRD for the first time:

- Write to: `.velocity/artifacts/prds/{feature-id}-v1.md`
- Set `## Version: 1` in the frontmatter
- Set `## Status: Draft`

### Revised PRD

When revising an existing PRD (scope changed, new decisions, open questions resolved):

1. Check whether `.velocity/artifacts/prds/{feature-id}-v{N}.md` already exists
2. If yes: the new version number is `N+1`
3. Write the new version to: `.velocity/artifacts/prds/{feature-id}-v{N+1}.md`
4. Add a `## Change from v{N}:` line at the top of the new file describing what changed and why
5. Do not delete the previous version — it is the audit trail

Create a `.velocity/artifacts/prds/index.md` if it does not exist, and update it with an entry for this PRD:

```
| {feature-id} | v{N} | {date} | {status} | {one-line summary} |
```

---

## PRD Structure

Write the PRD using this structure:

```markdown
# PRD: {Feature Name}

## Version: {N}

## Status: Draft

## Date: {date}

## Bounded Context: {context-name}

## Session ref: {session-id from context-proposals filename}

{If revision: ## Change from v{N-1}: {one sentence describing the change}}

---

## Overview

{2–3 sentence summary of what this feature delivers and why.}

## Problem Statement

{What user problem or business problem does this solve? Why now?}

## Goals

- {Measurable goal 1}
- {Measurable goal 2}
- {Measurable goal 3}

## Non-Goals

- {What this explicitly does NOT do}

---

## User Stories

{For each user type:}

As a {user role}, I want to {action} so that {outcome}.

Acceptance criteria:

- [ ] {Specific, testable criterion using CONTEXT.md terms}
- [ ] {Specific, testable criterion}

---

## Domain Model

{Key domain objects and their relationships, using CONTEXT.md terms.}

{Reference relevant ADRs that constrain the domain model.}

---

## Functional Requirements

### {Requirement Group 1}

| ID     | Requirement                                  | Priority |
| ------ | -------------------------------------------- | -------- |
| FR-001 | {Precise requirement using CONTEXT.md terms} | Must     |
| FR-002 | {Precise requirement}                        | Should   |
| FR-003 | {Precise requirement}                        | Could    |

---

## Non-Functional Requirements

| Requirement     | Target   | Notes                        |
| --------------- | -------- | ---------------------------- |
| Latency (p99)   | {value}  |                              |
| Availability    | {value}  |                              |
| Test coverage   | ≥ 80%    | Per guardrail config         |
| Security review | Required | If touches auth/PII/payments |

---

## Technical Decisions

{Reference ADRs made during the grill session that constrain implementation.}

| Decision   | ADR      | Status   |
| ---------- | -------- | -------- |
| {decision} | ADR-{id} | Accepted |

---

## Out of Scope

{Explicitly list what is NOT in this PRD to prevent scope creep.}

---

## Open Questions

{Any unresolved questions that must be answered before implementation begins.}

---

## Version History

| Version | Date   | Summary of changes |
| ------- | ------ | ------------------ |
| {N}     | {date} | {summary}          |

---

## Next Step

Run /to-features to decompose this PRD into a vertical-slice feature board.
```

---

## Quality Checks

Before writing the PRD:

1. Every functional requirement must use CONTEXT.md terms — not informal language.
2. Every acceptance criterion must be testable — not subjective.
3. Every non-goal must be explicit — ambiguity creates horizontal work.
4. If any open questions remain: list them in the PRD and do not proceed to /to-features until they are answered.
5. No requirement should describe implementation — requirements describe behavior and outcomes, not code.

---

## Output

Write the PRD to: `.velocity/artifacts/prds/{feature-id}-v{N}.md`

Generate `{feature-id}` from the feature name: kebab-case, e.g., `payment-processing`, `policy-cancellation`.

After writing: "PRD written to .velocity/artifacts/prds/{feature-id}-v{N}.md. Run /to-features to decompose into a vertical-slice feature board."
