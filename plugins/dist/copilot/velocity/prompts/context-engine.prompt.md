---
mode: agent
description: "Read, validate, and maintain CONTEXT.md files. Detects drift between the glossary and the actual codebase, surfaces misaligned variable/file/schema names, diffs pending proposals against the current glossary, and prepares updates via the proposal mechanism. Invoked by grill-with-docs, domain-model, and the Reviewer Agent. Not a replacement for grill-with-docs — this skill validates and maintains what grill-with-docs produces."
---


# Context Engine

Read, validate, and maintain the ubiquitous language for this bounded context.

## Context Load

Read before starting:

1. `.velocity/context-map.md` — resolve the bounded context and its CONTEXT.md path
2. CONTEXT.md at the resolved path — all terms and decisions
3. `.velocity/artifacts/context-proposals/` — any pending proposals for this context

---

## Mode Selection

Invoke this skill in one of three modes. The developer specifies the mode, or the invoking skill specifies it:

| Mode       | Invoked by                     | What it does                                    |
| ---------- | ------------------------------ | ----------------------------------------------- |
| `validate` | Reviewer Agent, /validate      | Checks code for term drift against the glossary |
| `diff`     | context-merge, grill-with-docs | Shows pending proposals vs. current CONTEXT.md  |
| `update`   | grill-with-docs, domain-model  | Applies an approved proposal to CONTEXT.md      |

If no mode is specified, run `validate` by default.

---

## Mode: Validate — Glossary vs. Code Drift

Detect places where the codebase has diverged from the CONTEXT.md glossary.

### Step 1 — Read All Terms

Extract all term names from the `## Terms` section of CONTEXT.md.

Build a search list: for each term, derive the expected code-safe variants:

- camelCase: `paymentId`, `settlementDate`
- PascalCase: `PaymentRepository`, `SettlementService`
- snake_case: `payment_id`, `settlement_date`
- kebab-case: `payment-service`, `settlement-endpoint`
- SCREAMING_SNAKE: `PAYMENT_STATUS`, `SETTLEMENT_TIMEOUT`

### Step 2 — Scan the Codebase

Scan the following for naming patterns:

- Variable and function names in source files
- File and directory names
- API endpoint paths
- Database table and column names
- Event topic names and message field names
- TypeScript/Java/Python class and interface names

Look for:

1. **Synonym drift** — a concept from CONTEXT.md expressed with a different word (e.g., `Transaction` used where `Payment` is the defined term)
2. **Missing term usage** — a domain concept present in CONTEXT.md but not reflected in code at all
3. **Undeclared terms** — code uses a domain concept that is not defined in CONTEXT.md

### Step 3 — Report

Produce a drift report:

```
## CONTEXT.md Drift Report — {bounded-context} — {date}

### ✅ Aligned (Terms correctly used in code)

- Payment — used as `Payment`, `PaymentRepository`, `PaymentService`, `payment_id`
- Settlement — used as `Settlement`, `settlement_date`

### ⚠️ Synonym Drift (Term exists in CONTEXT.md; a synonym is used in code instead)

| CONTEXT.md Term | Synonym found in code    | Location(s)                       |
| --------------- | ------------------------ | --------------------------------- |
| Payment         | Transaction              | src/billing/transaction.ts:14     |
| Chargeback      | Dispute                  | src/billing/dispute-handler.ts:8  |

### ❌ Undeclared Terms (Used in code; not in CONTEXT.md)

| Term found in code | Location(s)                     | Suggested action                |
| ------------------ | ------------------------------- | ------------------------------- |
| Reversal           | src/payments/reversal.ts:1      | Define in CONTEXT.md or alias   |
| Authorization      | src/payments/auth-hold.ts:3     | Define relationship to Payment  |

### ℹ️ Unused Terms (In CONTEXT.md; not reflected in code yet)

| Term        | Note                                              |
| ----------- | ------------------------------------------------- |
| Chargeback  | Defined but no code references found — planned?   |
```

### Step 4 — Recommend Actions

For each drift item, recommend one of:

- **Rename code to match CONTEXT.md** — term is correct, code is wrong
- **Add to CONTEXT.md** — code introduces a valid new concept; needs a definition
- **Create an alias entry** — two terms co-exist intentionally; document the distinction
- **Investigate** — unclear which is correct; needs developer decision

Present the recommendations as a list. Do not make changes automatically in validate mode.

---

## Mode: Diff — Proposals vs. Current CONTEXT.md

Compare pending proposals against the current CONTEXT.md and produce a readable diff.

### Step 1 — Inventory Proposals

List all `.md` files in `.velocity/artifacts/context-proposals/` for this bounded context.

For each proposal, extract:

- Session ID
- Date
- New terms
- Modified terms
- Resolved decisions

### Step 2 — Diff Against Current CONTEXT.md

For each proposal entry:

```
+ New term: {Term} — {proposed definition}
  (not in current CONTEXT.md)

~ Modified: {ExistingTerm}
  Current:  {current definition}
  Proposed: {proposed definition}

+ Decision resolved: {decision statement}
  (not in current ## Decisions section)
```

Flag conflicts where two proposals modify the same term differently:

```
⚠️ CONFLICT: {Term}
   Proposal A ({session-id}): {definition A}
   Proposal B ({session-id}): {definition B}
   → Run /context-merge to resolve before applying.
```

### Step 3 — Output

Present the full diff to the developer. Do not write anything. Diff mode is read-only.

---

## Mode: Update — Apply Approved Proposal to CONTEXT.md

Apply a single approved proposal to CONTEXT.md.

This mode is invoked by `/context-merge` after conflicts are resolved, or directly by a developer who has reviewed a proposal and approved it.

### Step 1 — Confirm Target

Ask: "Which proposal are you applying? (Provide the proposal file path or session ID.)"

Read the specified proposal file.

### Step 2 — Check for Conflicts

Run a quick diff (Mode: Diff, single proposal) before applying. If conflicts exist with other pending proposals, warn:

> "This proposal conflicts with {session-id}. Applying it now may overwrite a pending change. Run /context-merge to resolve all pending proposals together, or confirm you want to apply only this proposal."

### Step 3 — Apply

Apply the changes to CONTEXT.md at its path from `context-map.md`:

1. Add new terms to `## Terms` in alphabetical order
2. Update modified terms in place
3. Add resolved decisions to `## Decisions`
4. Preserve all existing content that the proposal does not modify
5. Maintain the fixed heading structure: `## Domain Summary`, `## Terms`, `## Decisions`, `## Bounded Context Relationships`, `## Out of Scope`

Show the diff for review:

```
Changes to be written to {CONTEXT.md path}:
+ Added {N} terms
~ Modified {N} terms
+ Added {N} decisions
```

Ask: "Write these changes to CONTEXT.md? (yes / no)"

### Step 4 — Confirm and Archive

If approved:

1. Write the updated CONTEXT.md
2. Move the applied proposal to `.velocity/artifacts/context-proposals/archive/{session-id}.md`
3. Update `.velocity/knowledge-base/index.md` with the updated CONTEXT.md's last-updated date

Say: "CONTEXT.md updated. Proposal archived. {N} proposals pending."

---

## Guardrail Integration

When invoked by the `/validate` command as a pre-PR check:

- Run in **validate mode**
- Any `⚠️ Synonym Drift` item is a **warning** (logged; does not block PR)
- Any `❌ Undeclared Terms` with widespread usage (>3 locations) is a **blocking violation** if `context_md_term_consistency: true` in `.velocity/guardrails/default.md`
- Output is written to `.velocity/artifacts/validation-reports/context-drift-{date}.md`
