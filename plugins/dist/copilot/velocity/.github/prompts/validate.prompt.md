---
mode: agent
description: "Run guardrail checks against the current branch. Validates slice completeness, CONTEXT.md term consistency, test coverage, security gates, and API standards. Use before opening a PR or when CI guardrail checks are failing. Produces a pass/fail checklist with specific remediation for each failure."
---


# Validate

Run Velocity guardrail checks against the current branch.

## Context Load

Read before starting:

1. `.velocity/guardrails/default.md` — guardrail configuration
2. CONTEXT.md from `.velocity/context-map.md`
3. `.velocity/project-context/` — all standards files

---

## Validation Checks

Run all checks. Produce a pass/fail result for each. Provide specific remediation for every failure.

---

### Check 1 — Slice Completeness

Read the current branch's diff (changed files compared to `main`).

Verify:

| Check                         | Pass condition                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| PR is a vertical slice        | Changed files span more than one layer (UI + API, or API + persistence, etc.)                                    |
| No horizontal-only PR         | PR does not touch exclusively one layer                                                                          |
| All touched layers have tests | If a new route was added, there is a test for it. If a new DB migration was added, there is an integration test. |
| Acceptance criteria met       | The PR description or linked task has acceptance criteria; they are satisfied by the changes                     |

If `vertical_slice_required: true` in guardrails config: fail any PR that touches only one layer.

If `horizontal_layer_pr_blocked: true`: fail PRs with names containing "schema", "migration", "endpoints", "components" that do not include tests at all layers.

---

### Check 2 — CONTEXT.md Term Consistency

Scan all changed files for:

1. New variable names, class names, function names, API route segments, database column names introduced in this PR
2. Compare each new name against CONTEXT.md terms

Identify:

| Term found in code                                      | CONTEXT.md status     | Severity |
| ------------------------------------------------------- | --------------------- | -------- |
| Exact match                                             | ✅ Consistent         | Pass     |
| Not in CONTEXT.md (but consistent with existing terms)  | ⚠️ Potential new term | Warning  |
| Contradicts existing CONTEXT.md term                    | ❌ Language drift     | Fail     |
| Synonym of existing term (same concept, different word) | ❌ Language drift     | Fail     |

For each failure: specify the file, line number, term used, and the correct CONTEXT.md term.

---

### Check 3 — Test Coverage

Run the test suite if possible. Read coverage report if already generated.

Check against `test_coverage_minimum` from guardrails config (default: 80%).

Also check per-slice coverage: every file modified in this PR should have corresponding test files that test the changed behavior.

Files to check:

- New source files: must have a corresponding test file
- Modified source files with behavior changes: must have tests covering the changed behavior

If coverage falls below threshold: list the specific files below threshold.

---

### Check 4 — Feedback Loop State

Verify all feedback loops are passing:

| Check      | Command                                                    | Pass condition |
| ---------- | ---------------------------------------------------------- | -------------- |
| Typecheck  | `tsc --noEmit` / `mvn compile` / `go build ./...`          | Exit code 0    |
| Unit tests | `npm test` / `./gradlew test` / `pytest` / `go test ./...` | All pass       |
| Lint       | `npm run lint` / `./gradlew checkstyle` / `flake8`         | No errors      |

If any fail: report exact error output and remediation.

---

### Check 5 — Security Gate (conditional)

Run security check if the PR touches:

- Authentication or authorization code
- PII processing or storage
- Payment processing
- A new public API endpoint
- Secret handling code

When `security_review_required: true` in guardrails config and the above signals are present:

Check that the Security Agent has reviewed this PR (look for a review comment from the Security Agent in the PR description or linked issue).

If not reviewed: "Security review required for this change. Invoke the Security Agent before merging."

Also check:

- No secrets in diff (scan for API keys, passwords, connection strings in changed files)
- No PII logged (scan for `.log` or `console.log` calls with potential PII fields)

---

### Check 6 — API Versioning (conditional)

If the PR adds or modifies API endpoints and `api_versioning_required: true`:

- New endpoints must include a version prefix (`/api/v1/`, `/api/v2/`)
- Modified endpoints must not change the response shape of an existing versioned endpoint
- If response shape changes are required: a new version endpoint must be added

---

### Check 7 — Handoff Artifact (conditional)

If `handoff_artifact_required_per_slice: true` and this is a slice completion PR:

Check that `.velocity/artifacts/handoffs/{slice-id}.md` exists and was updated as part of this PR.

---

### Check 8 — Breaking Change Detection (conditional)

If `api.breaking_change_approval_required: true` in guardrails config:

Scan the diff for breaking changes across three surfaces:

**API Contract Breaks**

| Signal                                                  | Severity                   |
| ------------------------------------------------------- | -------------------------- |
| Existing versioned endpoint path removed                | Fail                       |
| Request field removed or renamed in existing endpoint   | Fail                       |
| Response field removed or renamed in existing endpoint  | Fail                       |
| Status code changed for an existing endpoint            | Fail                       |
| New required request field added to existing endpoint   | Fail                       |
| Response field type changed (e.g., `string` → `number`) | Fail                       |
| New optional field added                                | Pass (backward-compatible) |
| New endpoint added under new version prefix             | Pass                       |

Detection heuristics:

- Scan controller/route/handler files for deleted route definitions
- Scan OpenAPI/Swagger files for removed or modified paths
- Scan DTO/schema types for removed or renamed fields
- If the diff removes a line with a route annotation (`@GetMapping`, `app.get(`, `router.get(`, `path: /`) without a corresponding replacement, flag as a potential break

**Database Schema Breaks**

| Signal                                                       | Severity |
| ------------------------------------------------------------ | -------- |
| Migration removes a column                                   | Fail     |
| Migration renames a column without a compatibility alias     | Fail     |
| Migration changes a column type to an incompatible type      | Fail     |
| Migration adds a NOT NULL column without a default           | Fail     |
| Migration drops a table                                      | Fail     |
| Migration drops an index (may affect query performance SLAs) | Warning  |

Detection heuristics:

- Scan migration files for `DROP COLUMN`, `DROP TABLE`, `RENAME COLUMN`, `ALTER COLUMN TYPE`
- Scan Flyway/Liquibase/Alembic/Rails migration files

**CONTEXT.md Contract Breaks**

| Signal                                         | Severity |
| ---------------------------------------------- | -------- |
| Existing term removed from CONTEXT.md          | Warning  |
| Existing term definition fundamentally changed | Warning  |
| Term renamed without a deprecation note        | Warning  |

Removing a term from CONTEXT.md without deprecating it is a language breaking change — code, docs, and other agents that relied on the old term are now inconsistent.

**Approval Gate**

If any Fail-severity breaking change is detected:

```
❌ Breaking Change Detected — Approval Required

  {list of specific changes with file and line}

  To proceed:
  1. Confirm this break is intentional (add a note to the PR description)
  2. Verify all consumers of the changed contract have been updated in this PR
  3. If this is an API break: bump the API version (new /v2/ endpoint)
  4. If this is a schema break: add a backward-compatible migration step
  5. Request explicit approval from the Architecture Agent or a senior reviewer

  breaking_change_approval_required: true — this PR cannot merge without a breaking change acknowledgment.
```

---

### Check 9 — Deep Module Guardrail (conditional)

If `module_architecture.shallow_module_detection: true` in guardrails:

Scan changed files for shallow module anti-patterns:

| Anti-pattern             | Indicator                                                                                               | Severity |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| Single-caller extraction | New file exports 1–2 functions, called from exactly one location                                        | Warning  |
| Utils/helpers catch-all  | New file added under a `utils/`, `helpers/`, or `common/` directory with 3+ unrelated exports           | Warning  |
| Leaking internal types   | Public interface exposes implementation-level types (e.g., internal DB rows, raw ORM entities)          | Fail     |
| Complexity in caller     | Callers must call 3+ methods in sequence to achieve one behavior; module offers no encapsulating method | Fail     |

For each finding: specify file, anti-pattern type, and a concrete deepening suggestion.

If `module_architecture.context_md_term_consistency: true`: also check that new function/class/variable names in the diff match CONTEXT.md terms (supplements Check 2 with a module-level focus).

Skip this check if `module_architecture.shallow_module_detection: false`.

---

---

### Check 10 — Risk Score (conditional)

If `governance.risk_scoring.enabled: true` in guardrails config:

Run the `risk-score` skill for the current branch.

Report the result:

```
Check 10: Risk Score
  Score:   {N} / 100  →  Band: {low | medium | high | critical}
  Factors: {top 3 contributing factors}
```

Action by band:

| Band     | Action                                                                                   |
| -------- | ---------------------------------------------------------------------------------------- |
| low      | ✅ Pass — no action required                                                             |
| medium   | ⚠️ Warning — approval recommended but not blocking                                       |
| high     | ❌ Fail — approval required before merge; trigger `approval-workflow` skill              |
| critical | ❌ Fail — approval + compliance review required; invoke Security Agent; trigger approval |

If approval is required but no approved approval request exists in `.velocity/artifacts/approvals/` for this branch: report as a failure.

---

### Check 11 — Compliance Pack Evaluation (conditional)

If `governance.compliance_packs.active` is non-empty in guardrails config:

For each active compliance pack, run the pack's controls against the current branch diff.

Read the compliance pack definition from `.velocity/governance/compliance-packs/{pack}.md`.

For each control in the pack:

1. Check whether the control's `velocity_enforcement` conditions are satisfied
2. Evaluate applicable PreToolUse hook patterns against the diff content
3. Check that required approver roles have been satisfied (if `approval_workflow: enabled` for this control)

Report per pack:

```
Check 11: Compliance — {PACK_NAME}
  Controls checked: {N}
  Controls passed:  {N}
  Controls failed:  {N}

  {if failures:}
  Failures:
  - {control-id}: {title} — {specific reason for failure}
```

If any compliance control fails: overall validate result is FAIL.

Log the compliance evaluation to the audit trail (event type `compliance.evaluated`).

---

### Check 12 — Audit Trail Write

After all checks complete, write a `validate.result` audit log entry regardless of pass/fail.

Call `skills/audit-trail/SKILL.md` with:

- Event: `validate.result`
- Branch: current branch
- Checks run: count
- Checks passed: count
- Checks failed: count
- Outcome: `success` if all checks pass, `failure` otherwise

This check always passes — it is a bookkeeping step, not a blocking gate.

---

## Output Format

```
Velocity Guardrail Validation — {branch-name}
Date: {date}

══════════════════════════════════════════════

✅ Check 1: Slice Completeness — PASS
   Changed layers: API + Persistence + Tests
   Acceptance criteria: ✅ Present and satisfied

❌ Check 2: CONTEXT.md Term Consistency — FAIL
   Failures:
   - src/payments/service.ts:47 — "transaction" should be "payment" (per CONTEXT.md)
   - src/payments/service.ts:83 — "txnId" should be "paymentId" (per CONTEXT.md)

⚠️  Check 3: Test Coverage — WARNING
   Current: 74% (threshold: 80%)
   Below threshold files:
   - src/payments/service.ts — 61% (missing: error path tests)

✅ Check 4: Feedback Loop — PASS
   Typecheck: ✅ Pass
   Tests: ✅ 42 passing
   Lint: ✅ No errors

✅ Check 5: Security Gate — PASS
   No security-sensitive changes detected.

✅ Check 6: API Versioning — PASS
   New endpoints are versioned.

✅ Check 7: Handoff Artifact — PASS
   .velocity/artifacts/handoffs/slice-4.md present.

✅ Check 8: Breaking Change Detection — PASS
   No API contract, schema, or CONTEXT.md breaking changes detected.

⚠️  Check 9: Deep Module Guardrail — WARNING
   Findings:
   - src/payments/utils.ts — single-caller extraction (formatAmount called only from service.ts)
     Suggestion: move formatAmount into PaymentService

⚠️  Check 10: Risk Score — MEDIUM (score: 38 / 100)
   Top factors: public API change (+20), medium change surface (+5), missing handoff (+5)
   Approval recommended but not required.

✅ Check 11: Compliance — skipped (no active compliance packs)

✅ Check 12: Audit Trail — written
   .velocity/artifacts/audit/2026-06.jsonl

══════════════════════════════════════════════

Result: ❌ FAIL — 1 failure, 3 warnings

Remediation required before merge:
1. Fix CONTEXT.md term drift in src/payments/service.ts (lines 47, 83)
2. Add error path tests for src/payments/service.ts to reach 80% coverage
```
