# Roadmap: {{PRD_NAME}}

## Version: 1

## Date: {{DATE}}

## Source PRD: .velocity/artifacts/prds/{{PRD_ID}}.md

## Source feature board: .velocity/artifacts/features/{{FEATURE_ID}}.md

## Bounded Context: {{CONTEXT_NAME}}

---

## Summary

{{2–3 sentences: what this roadmap delivers and why it is sequenced this way.}}

**Total features:** {{N}}
**Phases:** {{N}}
**Estimated duration:** {{N}} sprints / iterations

---

## Phase 1: {{Phase name — user-facing outcome}}

**Goal:** {{What a user can do at the end of this phase that they could not do before}}

**Features:**

| Feature       | Type   | Layers                 | Blocked by |
| ------------- | ------ | ---------------------- | ---------- |
| {{Feature 1}} | Tracer | UI · API · Persistence | —          |
| {{Feature 2}} | Tracer | API · Persistence      | —          |

**Why this phase:** {{One sentence explaining the sequencing rationale}}

**Shippable?** Yes — {{describe what can be released at the end of this phase}}

---

## Phase 2: {{Phase name — user-facing outcome}}

**Goal:** {{What a user can do at the end of this phase}}

**Features:**

| Feature       | Type      | Layers                 | Blocked by       |
| ------------- | --------- | ---------------------- | ---------------- |
| {{Feature 3}} | Expansion | UI · API · Persistence | Phase 1 complete |
| {{Feature 4}} | Expansion | UI · API               | Phase 1 complete |

**Parallel candidates:** Feature 3 and Feature 4 can be worked simultaneously.

**Why this phase:** {{Sequencing rationale}}

**Shippable?** Yes — {{describe the release}}

---

{{Repeat for all phases}}

---

## Full Dependency Map

{{ASCII or list representation spanning all phases}}

Feature 1 (Tracer) → Feature 3, Feature 4
Feature 2 (Tracer) → Feature 5
Feature 3, Feature 5 → Feature 6

---

## Risks and Mitigations

| Risk               | Likelihood          | Phase affected | Mitigation              |
| ------------------ | ------------------- | -------------- | ----------------------- |
| {{Technical risk}} | High / Medium / Low | Phase {{N}}    | {{Mitigation approach}} |

---

## Version History

| Version | Date     | Author  | Summary of changes |
| ------- | -------- | ------- | ------------------ |
| 1       | {{DATE}} | {{who}} | Initial roadmap    |

---

## Next Step

Run /to-tasks on each feature in Phase 1 to generate the task board for immediate execution.
