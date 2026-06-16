---
name: risk-score
description: >-
  Compute an automated risk score (0–100) for a PR or branch based on change
  surface, compliance posture, domain signals, and guardrail state. Score maps
  to a risk band (low / medium / high / critical) that drives approval workflow
  thresholds and loop approval gate decisions. Invoked automatically by validate
  and loop skills. Can also be run directly on any branch.
metadata:
  surfaces:
    - agent
---

# Risk Score

Compute an automated risk score for a PR or branch.

## Context Load

Read before starting:

1. `.velocity/guardrails/default.md` — guardrail config and `governance.risk_scoring` thresholds
2. `.velocity/governance/enterprise-controls.md` — active compliance packs (if exists)
3. CONTEXT.md from `.velocity/context-map.md` — domain terms for PII and financial signal detection
4. `.velocity/project-intelligence/stack.md` — stack signals (cloud, payments, PII domains)

---

## Purpose

Risk scoring gives every PR a single number that summarises how much governance attention it needs. A score of 0 means the change is routine with no sensitive signals. A score of 100 means the change touches multiple critical surfaces and requires full governance review.

The score is used by:

- The `validate` skill — to determine whether an approval request is required
- The `loop` skill — as an additional high-risk signal beyond the built-in keyword checks
- The `approval-workflow` skill — included in every approval request
- CI/CD gates — to enforce merge policies by score band

---

## Invocation

```
/risk-score [branch-name]
```

If no branch is supplied, score the current branch against `main`.

---

## Step 1 — Read the Change Surface

Run a diff to understand what the current branch changes:

```bash
git diff main...HEAD --name-only
git diff main...HEAD --stat
git diff main...HEAD
```

From the diff, extract:

| Signal category      | What to look for                                                     |
| -------------------- | -------------------------------------------------------------------- |
| **Files changed**    | Count of files touched                                               |
| **Lines changed**    | Total insertions + deletions                                         |
| **Layer spread**     | How many distinct layers are touched (UI, API, persistence, infra)   |
| **New files**        | Count of newly created source files                                  |
| **Deleted files**    | Count of deleted source files (higher risk — potential breaks)       |
| **Migration files**  | Any files in `migrations/`, `db/migrate/`, `flyway/`, `liquibase/`   |
| **Auth files**       | Files containing `auth`, `login`, `session`, `jwt`, `oauth`, `token` |
| **PII files**        | Files containing `pii`, `personal`, `gdpr`, `hipaa`, `ssn`, `dob`    |
| **Payment files**    | Files containing `payment`, `charge`, `billing`, `card`, `stripe`    |
| **Public API files** | Route files, controller files, OpenAPI/Swagger specs                 |
| **Secret handling**  | Files containing `secret`, `credential`, `key_management`, `vault`   |
| **Infrastructure**   | Terraform, CloudFormation, Kubernetes, Helm, Dockerfile              |
| **CI/CD files**      | GitHub Actions, GitLab CI, Jenkins pipeline files                    |
| **Dependency files** | `package.json`, `pom.xml`, `go.mod`, `requirements.txt`, `Gemfile`   |
| **Config files**     | `.env`, `application.yml`, `config.md`, `settings.py`              |

---

## Step 2 — Score Each Factor

Compute the total risk score by summing factor points. Maximum score is 100.

### Domain Risk Factors (max 50 points)

| Factor                              | Points | Condition                                          |
| ----------------------------------- | ------ | -------------------------------------------------- |
| Auth / session / identity files     | 25     | Any auth-pattern file in diff                      |
| Payment / billing / financial files | 25     | Any payment-pattern file in diff                   |
| PII storage or processing           | 20     | Any PII-pattern file in diff                       |
| Public API contract change          | 20     | Route/controller/OpenAPI file modified             |
| Cryptographic operations            | 15     | Files with `encrypt`, `decrypt`, `hash`, `hmac`    |
| Secret or credential handling       | 15     | Files with `secret`, `credential`, `vault`, `kms`  |
| Infrastructure change               | 10     | Terraform, K8s, CloudFormation, Helm files in diff |
| CI/CD pipeline change               | 5      | GitHub Actions, GitLab CI, Jenkinsfile in diff     |

Cap at 50 points. If multiple domain factors apply, sum them but do not exceed 50.

### Change Surface Factors (max 30 points)

| Factor                   | Points | Condition                                          |
| ------------------------ | ------ | -------------------------------------------------- |
| Database migration       | 20     | Any migration file in diff                         |
| Deleted source files     | 10     | Count of deleted non-test source files ≥ 1         |
| Large change surface     | 10     | Lines changed > 500                                |
| Medium change surface    | 5      | Lines changed 200–500                              |
| Dependency file modified | 10     | `package.json`, `pom.xml`, `go.mod`, etc. modified |
| New public-facing files  | 5      | New route files or new OpenAPI paths added         |

Cap at 30 points.

### Guardrail State Factors (max 20 points)

Run a lightweight check (do not re-run the full validate skill — use cached results if available):

| Factor                          | Points | Condition                                                  |
| ------------------------------- | ------ | ---------------------------------------------------------- |
| Validation failures present     | 20     | `/validate` was run and has unresolved failures            |
| Missing test coverage           | 10     | Coverage below `test_coverage_minimum` in guardrails       |
| CONTEXT.md term drift detected  | 5      | Any term-consistency failures in recent validate output    |
| Handoff artifact missing        | 5      | `handoff_artifact_required_per_slice: true` but no handoff |
| Shallow module pattern detected | 5      | Any shallow module findings in recent validate output      |

Cap at 20 points.

### Total Score

```
total = min(domain_score + surface_score + guardrail_score, 100)
```

---

## Step 3 — Map to Risk Band

| Score  | Band         | Default action                                                                        |
| ------ | ------------ | ------------------------------------------------------------------------------------- |
| 0–24   | **low**      | Proceed automatically. No approval required.                                          |
| 25–49  | **medium**   | Warning shown. Approval recommended but not required (configurable).                  |
| 50–74  | **high**     | Approval required before merge. Loop pauses. Approval workflow triggered.             |
| 75–100 | **critical** | Approval required + compliance review required. Loop pauses. Security Agent notified. |

Thresholds are configurable in `governance.risk_scoring` in `.velocity/guardrails/default.md`:

```yaml
governance:
  risk_scoring:
    approval_threshold: 50 # score >= this triggers approval workflow
    compliance_review_threshold: 75 # score >= this also triggers compliance review
    medium_warn_threshold: 25 # score >= this shows a warning
```

---

## Step 4 — Compliance Pack Adjustment

If a compliance pack is active (`governance.compliance_packs` in guardrails):

Apply pack-specific multipliers:

| Pack       | Affected factors                                       | Adjustment     |
| ---------- | ------------------------------------------------------ | -------------- |
| `hipaa`    | PII files, auth files, infrastructure                  | ×1.5 (cap 100) |
| `pci-dss`  | Payment files, auth files, secret handling             | ×1.5 (cap 100) |
| `soc2`     | Auth files, infrastructure, CI/CD, dependency changes  | ×1.2 (cap 100) |
| `iso27001` | All domain factors, infrastructure, dependency changes | ×1.2 (cap 100) |

Apply at most one multiplier (highest applicable pack multiplier wins).

---

## Step 5 — Log to Audit Trail

Call `skills/audit-trail/SKILL.md` with event type `risk_score.computed`.

---

## Step 6 — Output

```
Velocity Risk Score — {branch}
Date: {date}

══════════════════════════════════════════════

Score: {total} / 100  →  Band: {BAND}

──────────────────────────────────────────────

Domain risk:         {domain_score} / 50
  {factor}: +{points}
  {factor}: +{points}

Change surface:      {surface_score} / 30
  {factor}: +{points}

Guardrail state:     {guardrail_score} / 20
  {factor}: +{points}

{if compliance pack active:}
Compliance pack:     {pack} (×{multiplier} applied)
Adjusted score:      {adjusted_total}

══════════════════════════════════════════════

{if band == low:}
✅ Risk: LOW — No approval required. Proceed.

{if band == medium:}
⚠ Risk: MEDIUM — Review recommended before merge.
  No blocking action required, but consider running /approval-workflow.

{if band == high:}
❌ Risk: HIGH — Approval required before merge.
  Approval threshold: {approval_threshold}
  Run: /approval-workflow request --pr {pr_number}
  Or the loop will trigger this automatically.

{if band == critical:}
🚨 Risk: CRITICAL — Approval + compliance review required.
  Compliance review threshold: {compliance_review_threshold}
  1. Run: /approval-workflow request --pr {pr_number}
  2. Invoke the Security Agent for a threat model review
  3. Check compliance pack: /validate --compliance {pack}
```

---

## Integration with Other Skills

### Called by `validate`

After Check 5 (Security Gate), `validate` calls `risk-score` and appends the score to its output:

```
Check 10: Risk Score — {score} / 100 ({band})
  Approval required: {yes/no}
  Compliance review required: {yes/no}
```

### Called by `loop` (Step 3)

The loop calls `risk-score` before starting any task. If the score is ≥ `approval_threshold`:

- Treat the task as high-risk regardless of keyword matching
- Trigger the approval gate (Step 3b of `loop`)

### Called by CI/CD

The risk score is computed in CI on every PR. The CI job fails if:

- Score ≥ `approval_threshold` and no approved approval request exists for the PR
- Score ≥ `compliance_review_threshold` and no compliance review has been recorded
