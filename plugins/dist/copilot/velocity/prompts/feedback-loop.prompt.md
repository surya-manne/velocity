---
mode: agent
description: "Deterministic feedback gates enforced inside agent sessions during implementation. Run typecheck after every generated file, full test suite after every red-green-refactor cycle, lint before any commit. If any gate fails, stop and fix before proceeding. Not a PR check — an in-session implementation discipline."
---


# Feedback Loop

Enforce deterministic quality gates at the point of implementation — not at PR time.

## Context Load

Read before starting:

1. `.velocity/guardrails/default.md` — gate configuration (`feedback_loops` section)
2. `.velocity/project-context/testing.md` — test run commands and coverage thresholds

---

## Purpose

Feedback loops are not optional. They are the mechanism that keeps agent output honest.

An agent without feedback loops will:

- Generate files with type errors it cannot see
- Pass tests locally that break downstream
- Accumulate lint violations across a session
- Ship broken code because no gate stopped it

This skill defines exactly when to run each gate and what to do when a gate fails.

---

## Gate 1 — Typecheck (after every generated file)

**When:** Immediately after writing or modifying any source file.

**Command:** Read from `testing.md` → `{typecheck_command}` (e.g., `tsc --noEmit`, `mvn compile`, `go build ./...`, `mypy`)

**Pass condition:** Exit code 0.

**On failure:**

1. Show the full error output.
2. Fix the error in the generated file.
3. Re-run typecheck.
4. Do not proceed to the next file until exit code is 0.

**Do not batch typechecks.** Run after each file. Accumulated type errors compound and become hard to trace.

---

## Gate 2 — Test Suite (after every red-green-refactor cycle)

**When:** After completing the refactor step of each TDD cycle (not just the new test — the full suite).

**Command:** Read from `testing.md` → `{test_command}` (e.g., `npm test`, `./gradlew test`, `pytest`, `go test ./...`, `bundle exec rspec`)

**Pass condition:** All tests pass. Zero failures, zero errors.

**On failure:**

1. Show the failing test output.
2. Determine if the failure is in the new test or a regression.
3. If regression: fix it before writing the next test. Do not add failing tests on top of failing tests.
4. If new test: the implementation is incomplete — return to green step.
5. Re-run the full suite.
6. Do not proceed until the full suite is green.

**Coverage check:** After each cycle, note current coverage. Warn (do not block) if coverage is trending below `test_coverage_minimum` from guardrails config.

---

## Gate 3 — Lint (before any commit)

**When:** Before executing any `git commit` command.

**Command:** Read from `testing.md` → `{lint_command}` (e.g., `npm run lint`, `./gradlew checkstyle`, `flake8`, `golangci-lint run`, `rubocop`)

**Pass condition:** Zero errors. Warnings are acceptable — errors block commit.

**On failure:**

1. Show the lint errors.
2. Fix all errors (auto-fix if the linter supports it: `npm run lint --fix`, `rubocop -a`).
3. Re-run lint.
4. Do not commit until lint exits clean.

---

## Gate Sequence in a TDD Cycle

```
Write source file
    ↓
Gate 1: Typecheck → fix if fail
    ↓
Write test file
    ↓
Gate 1: Typecheck → fix if fail
    ↓
Run test (red — confirm failure)
    ↓
Implement minimum to pass
    ↓
Gate 1: Typecheck → fix if fail
    ↓
Run test (green — confirm pass)
    ↓
Refactor
    ↓
Gate 1: Typecheck → fix if fail
    ↓
Gate 2: Full test suite → fix regressions if any
    ↓
[next TDD cycle]
    ↓
...
    ↓
Before git commit:
Gate 3: Lint → fix if fail
    ↓
Commit
```

---

## Gate Bypass Rules

Gates may only be bypassed when:

- **`typecheck_on_every_generated_file: false`** in guardrails → skip Gate 1
- **`test_after_every_red_green_cycle: false`** in guardrails → skip Gate 2
- **`lint_before_commit: false`** in guardrails → skip Gate 3

Always read guardrails before assuming a gate applies. Never bypass a gate that is enabled.

---

## Reporting

After any gate failure and fix, report:

```
Gate 1 (Typecheck) — ❌ Failed
Error: src/payments/service.ts:47 — Type 'string' is not assignable to type 'PaymentId'
Fix applied: Changed type annotation to PaymentId
Re-run: ✅ Pass
```

At the end of a TDD session, report gate summary:

```
Feedback Loop Summary
Gates run: 12 typecheck, 6 full-suite, 1 lint
Failures caught: 2 type errors, 1 regression (fixed before next cycle)
Final state: ✅ All gates green
```

---

## Deep Module Gate (conditional)

When `module_architecture.deep_module_enforcement: true` in guardrails:

After each refactor step, ask:

- Does this module's interface expose more than it needs to?
- Is there complexity in the caller that belongs in the module?
- Are there multiple small functions with a single caller that should be collapsed?

If yes: propose a deepening. Do not apply it automatically — surface it as a finding.

Flag shallow module patterns:

- Module with 1–2 functions and no shared state (extract only for testability, not for real reuse)
- Interface with more parameters than the implementation has meaningful variations
- Helper/util modules with 5+ unrelated functions

Log each finding to `.velocity/artifacts/architecture-reviews/shallow-modules-{date}.md` (append if file exists).
