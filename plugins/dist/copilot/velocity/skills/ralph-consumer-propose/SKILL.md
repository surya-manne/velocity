---
name: ralph-consumer-propose
description: "RALPH Loop — Propose step. Reads a learn artifact and drafts targeted improvements to this project's deployed skill instances in .velocity/skills/. Each proposal includes a before/after diff and rationale. Proposals are project-local — they never touch Velocity platform templates. Developer reviews and approves each proposal before harden runs."
---


# RALPH Loop — Propose

Draft improvement proposals for this project's local Velocity skill instances based on learn findings.

> **Scope:** Proposals modify only `.velocity/skills/`, `.velocity/agents/`, and `.velocity/guardrails/`
> in this repository. The Velocity platform templates (`skills/**/SKILL.md` in the Velocity repo)
> are never touched.

## Context Load

Read before starting:

1. The target learn artifact — `.velocity/artifacts/ralph/learn-<skill>-<date>.md`
2. `.velocity/skills/<skill-id>.md` — the currently deployed local skill instance to be improved
3. `.velocity/agents/<agent-id>.md` — the local agent config (if agent-level changes are proposed)
4. `.velocity/guardrails/default.md` — current guardrail thresholds (if guardrail changes are proposed)

---

## When to Run

Run after a learn artifact has been produced:

```
/ralph-consumer-propose [learn-artifact-path]
```

If no argument: read the most recent learn artifact from `.velocity/artifacts/ralph/index.md` with `status: proposals-pending`.

---

## Step 1 — Read Learn Findings

Parse the target learn artifact. Extract:
- Recurring failures (F1, F2, ...) with severity and frequency
- Consistent gaps (G1, G2, ...)
- Positive patterns (preserve these)
- Proposed improvement areas

---

## Step 2 — Draft Proposals

For each improvement area in the learn artifact, draft one proposal.

Each proposal must be:
- **Specific** — targets a named section of the skill, agent, or guardrail file
- **Minimal** — changes only what is needed to address the identified failure; no refactoring
- **Preserving** — does not remove or weaken behaviors identified as positive patterns
- **Testable** — the developer can verify the change by running a scenario

### Proposal format

```markdown
### Proposal <N> — <short title>

**Target file:** .velocity/skills/<skill-id>.md (or .velocity/agents/, .velocity/guardrails/)
**Section:** <section heading in the target file>
**Addresses:** <F1, G2> from learn artifact

**Problem:**
<What the agent currently does that causes the failure — cite specific annotation evidence>

**Proposed change:**

Before:
```
<current text from the target file — exact quote>
```

After:
```
<proposed replacement text>
```

**Rationale:**
<Why this change addresses the root cause, not just the symptom>

**Risk:**
<What positive behavior could be affected — reference preserved patterns list>

**Verification scenario:**
<How the developer can validate this change worked — e.g., "Run a Design phase on a feature with X characteristics and confirm Y">

**Status:** [ ] Approved  [ ] Modified  [ ] Rejected
```

---

## Step 3 — Write Proposal Artifact

Write to: `.velocity/artifacts/ralph/propose-<skill-or-phase>-<YYYYMMDD>.md`

```markdown
# RALPH Loop Proposals — <skill-or-phase> — <date>

Source: learn-<skill>-<date>.md
Status: draft — awaiting developer review

---

## Summary

<N> proposals for `.velocity/skills/<skill-id>.md`
Addresses: <list of F and G ids from learn artifact>

---

<Proposal 1>

---

<Proposal 2>

---

## Review instructions

For each proposal:
- Mark `[x] Approved` to include in the next harden run
- Mark `[x] Modified` and edit the "After" block to change the proposal
- Mark `[x] Rejected` to exclude it

When review is complete, run `/ralph-consumer-harden` to apply all approved proposals.
```

---

## Step 4 — Update Index

Record the proposal artifact in `.velocity/artifacts/ralph/index.md`:

```markdown
## Proposal Artifacts

| File | Skill | Date | Proposals | Status |
|------|-------|------|-----------|--------|
| propose-<skill>-<date>.md | <skill> | <date> | <N> | awaiting-review |
```

Update the corresponding learn artifact entry: change `Proposals generated` from `pending` to `propose-<skill>-<date>.md`.

Commit: `chore(ralph): proposals drafted for <skill> — <N> proposals`

---

## Guardrail and Agent Proposals

If the learn findings point to issues that are not in skill content but in guardrail thresholds or agent configuration:

- **Guardrail proposals:** Target `.velocity/guardrails/default.md`. Use the same before/after format. Clearly state which threshold is being changed and by how much.
- **Agent proposals:** Target `.velocity/agents/<agent-id>.md`. Scope to the specific role statement, wired skills list, or system prompt section. Never propose changing the agent's identity or role.

List guardrail and agent proposals in separate sections of the proposal artifact.
