---
name: phase-interview
description: >-
  Per-phase Q&A interview. Runs at the start of every phase before the owning
  agent begins execution. Reads current context and existing artifacts, then
  generates 1–5 MECE questions with recommended answers. Records skipped
  answers as flagged assumptions. Invoke at the start of each pipeline phase.
metadata:
  surfaces:
    - agent
---

# Phase Interview

Surface assumptions and confirm context before executing a pipeline phase.

## Context Load

Read before starting:

1. `.velocity/sdlc/state/<work-id>.yaml` on the `velocity-state` branch — current phase, prior phase artifacts, recorded assumptions
2. `.velocity/artifacts/context/CONTEXT.md` — active domain language and bounded context
3. Artifacts from all `approved` phases (read the `artifacts` array from each approved phase in the state file)
4. `.velocity/sdlc/pipeline.yaml` — phase definition for the current phase (owning agent, key skills, exit artifact)

---

## When to Run

Run this skill **once per phase**, at phase start, before any execution work begins.

The owning agent invokes this skill at the start of its phase. The agent does not begin implementation until the interview is complete.

---

## Step 1 — Determine Current Phase

Read `current_phase` from the state file. Confirm the phase `status` is `in_progress`.

If `status` is `pending`, update it to `in_progress` and record `started_at: <now>` in the state file on the `velocity-state` branch before proceeding.

---

## Step 2 — Generate Questions

Generate questions fresh from context. Do not use a static question bank.

Read CONTEXT.md, approved phase artifacts, and the phase definition. Identify unknowns that would invalidate the phase output if wrong.

**Question priority tiers:**

| Priority | Type | Max |
|----------|------|-----|
| P1 | Scope blockers — things that would invalidate phase output if wrong | 1–2 |
| P2 | Security or privacy flags detected in context | 0–1 |
| P3 | UX or user impact — only if ambiguous | 0–1 |
| P4 | Technical detail — only if necessary | 0–1 |

**Maximum 5 questions per phase.** No nitpicking.

If no P1 questions exist, skip the interview entirely and proceed to the fast path (Step 3b).

---

## Step 3a — Present Interview

Use the fixed Phase Interview Format:

```
[Agent name] — [Phase name]

I'm about to [one-sentence statement of what this phase produces].
Before I start, I have [N] question(s).

Q1: [Question text]
    Recommended: [Agent's best-guess answer with brief rationale]

Q2: [Question text — if applicable]
    Recommended: [Agent's best-guess answer with brief rationale]

[... up to 5 questions]

Based on your answers, I'll [brief summary of how answers shape execution].
Ready to start?
```

---

## Step 3b — No-Question Fast Path

If no P1 questions exist:

```
[Agent name] — [Phase name]

Proceeding with the following assumed context:
- [One-line summary of key context facts that will guide this phase]

No questions — starting now.
```

---

## Step 4 — Process Answers

For each question the developer answers:
- Record the answer as confirmed context for this phase execution.

For each question the developer **skips or does not answer**:
- Record the recommended answer as an **assumption**.
- Flag it visibly: `⚠ Assumption (unanswered): [question] → defaulted to: [recommended]`

Collect all flagged assumptions into an assumptions list.

---

## Step 5 — Record Assumptions

If any assumptions were recorded:

1. Write an assumptions note:
   - Path: `.velocity/artifacts/architecture/<work-id>-<phase-id>-assumptions.md` (Design phases)
   - Path: `.velocity/artifacts/tasks/<work-id>-<phase-id>-assumptions.md` (Build/Planning phases)
   - Path: `.velocity/artifacts/<artifact-dir>/<work-id>-<phase-id>-assumptions.md` (other phases, use phase `artifact_dir` from pipeline.yaml)

2. Update the state file on the `velocity-state` branch:
   - Append each assumption string to `phases.<current-phase>.assumptions[]`
   - Commit: `chore(sdlc): record phase-interview assumptions for <work-id>/<phase-id>`

3. Assumptions will be surfaced automatically by `phase-gate` at the human gate.

---

## Step 6 — Proceed

Signal to the owning agent that the interview is complete and execution may begin.

If you are the owning agent, proceed directly to phase execution using the confirmed context and flagged assumptions as your working brief.
