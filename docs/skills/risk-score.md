# /risk-score — Change Risk Assessment

`/risk-score` evaluates the risk of a proposed change on a 0–100 scale, based on domain factors, surface area, and guardrail state. Used by `/validate`, `/loop`, and `/approval-workflow`.

## Usage

```
/risk-score
```

Scores the current working branch changes.

```
/risk-score TASK-005
```

Scores a specific task before implementation.

## Scoring Model

The score aggregates three dimensions:

### 1. Domain Risk (0–40 points)

How sensitive is the domain being changed?

| Domain Factor                      | Points |
| ---------------------------------- | ------ |
| Financial data (payments, billing) | +15    |
| Authentication / authorization     | +12    |
| PII or PHI data                    | +10    |
| Compliance-regulated domain        | +8     |
| Core business logic                | +6     |
| Supporting infrastructure          | +3     |
| Pure UI / presentation             | +1     |

### 2. Surface Risk (0–40 points)

How broad and irreversible is the change?

| Surface Factor                           | Points |
| ---------------------------------------- | ------ |
| External API integration (payment, auth) | +15    |
| Database schema migration                | +12    |
| Cross-service contract change            | +10    |
| Shared library / package change          | +8     |
| Background job / async processor         | +6     |
| Single-service API endpoint              | +4     |
| Internal module / pure function          | +2     |

### 3. Guardrail State (0–20 points)

What is the current compliance posture?

| State                                  | Points |
| -------------------------------------- | ------ |
| Guardrails disabled or bypassed        | +20    |
| Recent guardrail trigger (unresolved)  | +10    |
| Below coverage threshold               | +8     |
| Missing ADR for architectural decision | +5     |
| All guardrails active and passing      | 0      |

## Score Interpretation

| Score  | Level    | Action                                  |
| ------ | -------- | --------------------------------------- |
| 0–30   | Low      | Proceed without additional review       |
| 31–50  | Moderate | Review before merge (normal PR process) |
| 51–70  | Elevated | Engineering lead review recommended     |
| 71–85  | High     | Approval required before proceeding     |
| 86–100 | Critical | Multiple approvals required; escalate   |

## Example Score Breakdown

```
/risk-score TASK-005

Risk Assessment: TASK-005 — Stripe Refunds Integration

Domain Risk:  28 / 40
  ├── Financial data (payments):      +15
  ├── External API integration:       +8
  └── Core business logic:            +5

Surface Risk:  32 / 40
  ├── External API (Stripe):          +15
  ├── Background async processor:     +6
  ├── New DB columns:                 +5
  └── Single-service endpoint:        +4  (partial credit, reduced)
  [Modifier: -2 for covered by existing tests]

Guardrail State:  14 / 20
  ├── Missing ADR: async refund pattern: +5
  └── Coverage: 83% (threshold 85%):    +8
  [All guardrails active]

Total Score:  74 / 100
Level:  HIGH — Approval required

Recommendation:
  1. Create ADR for async refund processor pattern
  2. Add tests to reach 85% coverage threshold
  3. Obtain approval from @engineering-lead

  These would reduce score to ~52 (Elevated — no approval required)
```

## Reducing Risk Score

The risk breakdown shows exactly which factors are contributing. Common risk reducers:

| Action                                            | Score Reduction |
| ------------------------------------------------- | --------------- |
| Add missing ADR                                   | -5              |
| Increase coverage to threshold                    | -8              |
| Add integration tests for external API            | -5              |
| Document decision in CONTEXT.md                   | -3              |
| Add explicit error handling for external failures | -4              |

## Risk Scoring in the Development Lifecycle

- **Before implementation** (`/to-tasks`): Tasks are pre-scored to plan the queue order and identify tasks needing approval
- **During `/loop`**: Scored after each task; loop pauses if threshold exceeded
- **During `/validate`**: Scored as part of the 12-point check
- **In PR description**: Score included as context for reviewers
