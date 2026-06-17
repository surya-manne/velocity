---
name: validate
description: "Run guardrail checks against the current branch. Validates slice completeness, CONTEXT.md term consistency, test coverage, security gates, and API standards. Use before opening a PR or when CI guardrail checks are failing."
mode: skill
readonly: false
tags: ["skill", "validation", "guardrails", "quality"]
baseSchema: docs/schemas/skill.md
---

<validate>

<role>

You are a guardrail validator who runs a structured eight-check pass/fail checklist against the current branch, producing specific file/line remediation instructions for every failure before a PR is opened.

</role>

<purpose>

Problem: PRs merge with slice completeness violations, language drift, missing tests, broken feedback loops, and unreviewed security changes — discovered only post-merge.

Solution: Run eight guardrail checks in sequence: slice completeness, CONTEXT.md term consistency, test coverage, feedback loop state, security gate, API versioning, handoff artifact, and breaking change detection. Produce a pass/fail result per check with actionable remediation.

Validation: All eight checks run; every failure has a specific file/line/remediation reference; no check is skipped without noting the reason.

</purpose>

<prerequisites>

- `.velocity/guardrails/default.md` — guardrail configuration
- CONTEXT.md from `.velocity/context-map.md`
- `.velocity/project-context/` — all standards files

</prerequisites>

<process>

**Check 1 — Slice Completeness**
Read branch diff vs main. Verify: PR touches more than one layer; no horizontal-only PRs; all touched layers have tests; acceptance criteria are met. Fail if `vertical_slice_required: true` in guardrails and only one layer is touched.

**Check 2 — CONTEXT.md Term Consistency**
Scan all changed files for new names (variables, classes, functions, routes, DB columns). Compare each against CONTEXT.md. Fail on contradictions or synonyms of existing terms. Warn on potential new terms not yet in CONTEXT.md (specify file, line, term used, correct CONTEXT.md term).

**Check 3 — Test Coverage**
Run or read coverage report. Check against `test_coverage_minimum` (default 80%). Also verify every modified source file has corresponding tests covering changed behaviour. List specific files below threshold.

**Check 4 — Feedback Loop State**
Verify typecheck (`tsc --noEmit` / `mvn compile` / `go build ./...`), unit tests, and lint all pass with exit code 0. Report exact error output and remediation for any failure.

**Check 5 — Security Gate** (conditional: auth/PII/payment/public API/secret code changed)
When `security_review_required: true` and security signals present: verify Security Agent reviewed the PR. Scan diff for secrets (API keys, passwords, connection strings) and PII in log calls.

**Check 6 — API Versioning** (conditional: endpoints added/modified, `api_versioning_required: true`)
New endpoints must have version prefix (`/api/v1/`). Modified endpoints must not change existing versioned response shape without a new version endpoint.

**Check 7 — Handoff Artifact** (conditional: `handoff_artifact_required_per_slice: true`)
Verify `.velocity/artifacts/handoffs/{slice-id}.md` exists and was updated in this PR.

**Check 8 — Breaking Change Detection** (conditional: `api.breaking_change_approval_required: true`)
Scan for: API contract breaks (removed routes, changed response shapes, new required fields on existing endpoints); DB schema breaks (DROP COLUMN/TABLE, incompatible ALTER, NOT NULL without default); CONTEXT.md contract breaks (removed terms without deprecation). Fail-severity breaks trigger approval workflow before merge.

</process>

<pitfalls>

- Skipping security check when diff includes secret-handling code — missing critical compliance signal
- Treating CONTEXT.md term warnings as passes — new terms must be proposed and approved
- Running validate after opening a PR instead of before — creates rework cycles

</pitfalls>

</validate>
