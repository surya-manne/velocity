---
name: risk-score
description: "Compute an automated risk score (0–100) for a PR or branch based on change surface, compliance posture, domain signals, and guardrail state. Score maps to a risk band (low/medium/high/critical) that drives approval workflow thresholds and loop approval gate decisions."
mode: skill
readonly: false
tags: ["skill", "risk", "governance", "compliance"]
baseSchema: docs/schemas/skill.md
---

<risk-score>

<role>

You are a risk scoring engine that assigns a 0–100 score and a risk band (low/medium/high/critical) to any PR or branch, driving approval workflow thresholds and loop gate decisions.

</role>

<purpose>

Problem: PRs receive the same governance attention regardless of whether they touch auth code, PII, database migrations, or trivial styling changes.

Solution: Compute a weighted risk score from domain risk factors (max 50), change surface factors (max 30), and guardrail state factors (max 20), then map to a risk band that drives automated gate decisions.

Validation: Score is reproducible, every contributing factor is itemised in the output, and the band matches configured thresholds in `governance.risk_scoring`.

</purpose>

<prerequisites>

- `.velocity/guardrails/default.md` — `governance.risk_scoring` thresholds
- `.velocity/governance/enterprise-controls.md` — active compliance packs (if exists)
- CONTEXT.md from `.velocity/context-map.md` — domain terms for PII and financial signal detection
- `.velocity/project-intelligence/stack.md` — stack signals

</prerequisites>

<process>

**Step 1 — Read the Change Surface**
Run `git diff main...HEAD --name-only --stat` and full diff. Classify files by signal: auth/session/identity, payment/billing, PII, public API, migrations, crypto, secret handling, infrastructure, CI/CD, dependencies, config, deleted files, new public files.

**Step 2 — Score Each Factor**

- **Domain risk (max 50):** Auth/identity = 25 pts; Payments/billing = 25 pts; PII storage = 20 pts; Public API change = 20 pts; Crypto operations = 15 pts; Secret handling = 15 pts; Infrastructure = 10 pts; CI/CD = 5 pts. Cap at 50.
- **Change surface (max 30):** DB migration = 20 pts; Deleted source files = 10 pts; Lines > 500 = 10 pts; Lines 200–500 = 5 pts; Dependency file modified = 10 pts; New public-facing files = 5 pts. Cap at 30.
- **Guardrail state (max 20):** Validation failures present = 20 pts; Missing test coverage = 10 pts; CONTEXT.md term drift = 5 pts; Handoff artifact missing = 5 pts; Shallow module detected = 5 pts. Cap at 20.

**Step 3 — Map to Risk Band**

| Score | Band | Default Action |
|---|---|---|
| 0–24 | low | Proceed automatically |
| 25–49 | medium | Warning shown; approval recommended |
| 50–74 | high | Approval required before merge; loop pauses |
| 75–100 | critical | Approval + compliance review required; Security Agent notified |

Thresholds are configurable via `governance.risk_scoring` in guardrails.

**Step 4 — Compliance Pack Adjustment**
If a compliance pack is active, apply the highest applicable multiplier (hipaa/pci-dss = ×1.5; soc2/iso27001 = ×1.2), cap at 100.

**Step 5 — Log to Audit Trail**
Call `audit-trail` skill with event type `risk_score.computed`.

**Step 6 — Output**
Produce formatted report: total score, band, domain/surface/guardrail sub-scores with contributing factors itemised, compliance adjustment if applied, and recommended action.

</process>

<pitfalls>

- Skipping compliance pack multiplier when a pack is active — underscores risk for regulated features
- Scoring without reading the full diff — missing signals from renamed or deleted files
- Using stale cached guardrail state — re-check if validate was run recently

</pitfalls>

</risk-score>
