---
name: test-strategy
description: "Produce a test strategy for a feature covering unit, integration, end-to-end, performance, and security testing. Configured for the detected test framework. Specifies test types, coverage targets, test data requirements, and CI gate placement. Also produces Performance Test Plans and Security Testing Plans when the feature requires them. Stored under .velocity/artifacts/test-strategy/. Invoked by the QA Agent or directly before implementation begins."
---


# Test Strategy

Produce a test strategy for this feature.

## Context Load

Read before starting:

1. `.velocity/project-context/testing.md` — testing standards, framework, coverage requirements
2. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
3. `.velocity/artifacts/prds/` — relevant PRD for acceptance criteria
4. `.velocity/artifacts/features/` — feature task list (if it exists)
5. `.velocity/knowledge-base/adrs/index.md` — any ADRs relevant to testing strategy
6. `.velocity/project-intelligence/stack.md` — detected test framework(s)

---

## Step 1 — Identify Test Scope

Ask the developer (or extract from PRD and feature definition):

1. What layers does this feature touch? (UI / API / domain logic / persistence / messaging)
2. What are the acceptance criteria from the PRD?
3. Are there performance requirements? (latency targets, throughput targets)
4. Does this feature touch security-sensitive areas? (auth, PII, payments)
5. What is the existing test coverage baseline for this area?

---

## Step 2 — Test Type Selection

Determine which test types are required for this feature:

| Test Type   | Applies when                                                 | Framework (detected)            |
| ----------- | ------------------------------------------------------------ | ------------------------------- |
| Unit        | Domain logic, pure functions, data transformations           | {{TEST_FRAMEWORK}}              |
| Integration | DB interactions, service-to-service calls, message consumers | {{INTEGRATION_TEST_FRAMEWORK}}  |
| Contract    | API consumed by other services; event schema changes         | Pact / schema registry          |
| Component   | UI components in isolation                                   | Jest + Testing Library / Vitest |
| End-to-End  | Critical user journeys that span all layers                  | {{E2E_FRAMEWORK}}               |
| Performance | Features with latency/throughput requirements                | k6 / Gatling / JMeter           |
| Security    | Features touching auth, PII, or public endpoints             | OWASP ZAP / custom              |

---

## Step 3 — Test Plan

For each test type that applies, produce:

### Unit Tests

| Behaviour to test                         | Test case name                      | Happy path? | Edge case? |
| ----------------------------------------- | ----------------------------------- | ----------- | ---------- |
| {domain behaviour using CONTEXT.md terms} | `should_{outcome}_when_{condition}` | {yes/no}    | {yes/no}   |

Rules:

- Test behaviour, not implementation. Assert on outcomes, not on which methods were called.
- One behaviour per test. No multi-assertion tests unless they test the same behaviour.
- Test case names use the `should_{outcome}_when_{condition}` convention.
- All domain terms in test names match CONTEXT.md.

### Integration Tests

| Integration point  | Scenario   | Test data requirement      |
| ------------------ | ---------- | -------------------------- |
| {service/db/queue} | {scenario} | {what test data is needed} |

Rules:

- Use test containers or equivalents — no mocked databases in integration tests.
- Every message consumer must have an integration test that sends a real message and asserts the side effect.
- Every database interaction must have an integration test that confirms persistence and retrieval.

### Contract Tests (if applicable)

| Provider  | Consumer   | Contract type | Verification cadence |
| --------- | ---------- | ------------- | -------------------- |
| {service} | {consumer} | Pact / schema | {on PR / nightly}    |

### End-to-End Tests

| User journey                     | Entry point    | Critical assertions | Exit state    |
| -------------------------------- | -------------- | ------------------- | ------------- |
| {journey using CONTEXT.md terms} | {URL / screen} | {what must be true} | {final state} |

Rules:

- E2E tests cover the critical paths only — not every edge case.
- E2E tests must be isolated: no shared state between test runs.
- Flaky tests are blocked from merge.

---

## Step 4 — Coverage Targets

State coverage targets per test type:

| Layer                  | Minimum coverage            | Basis            |
| ---------------------- | --------------------------- | ---------------- |
| Domain logic           | {{TEST_COVERAGE_MINIMUM}}%  | Guardrail config |
| API handlers           | {{TEST_COVERAGE_MINIMUM}}%  | Guardrail config |
| UI components          | {{TEST_COVERAGE_MINIMUM}}%  | Guardrail config |
| Critical user journeys | 100% of acceptance criteria | PRD              |

---

## Step 5 — Performance Test Plan (if triggered)

Produce when the feature has latency or throughput requirements:

### Load Profile

| Scenario       | Concurrent users | Duration   | Ramp-up |
| -------------- | ---------------- | ---------- | ------- |
| Normal load    | {n}              | {duration} | {ramp}  |
| Peak load      | {n}              | {duration} | {ramp}  |
| Sustained load | {n}              | {duration} | {ramp}  |

### SLA Targets

| Metric      | Target     | Failure threshold |
| ----------- | ---------- | ----------------- |
| p50 latency | {value}    | {value}           |
| p95 latency | {value}    | {value}           |
| p99 latency | {value}    | {value}           |
| Error rate  | < {value}% | > {value}%        |
| Throughput  | {rps}      | {rps}             |

### Bottleneck Hypothesis

State the expected bottleneck before running the test. Do not run performance tests without a hypothesis.

Example: "Expected bottleneck is DB connection pool exhaustion under peak load for the `listPayments` query."

---

## Step 6 — Security Testing Plan (if triggered)

Produce when the feature touches auth, PII, payments, or public API surface:

### Security Test Cases

| Category         | Test scenario                               | Pass criteria                                 |
| ---------------- | ------------------------------------------- | --------------------------------------------- |
| Authentication   | Call API without token                      | 401, no data leak                             |
| Authentication   | Call API with expired token                 | 401, no data leak                             |
| Authorization    | Access resource belonging to another tenant | 403, no data leak                             |
| Input validation | Send oversized payload                      | 400 or 413, no crash                          |
| Input validation | Inject SQL in query param                   | 400, no stack trace                           |
| Input validation | XSS payload in string field                 | Escaped in response                           |
| Rate limiting    | Exceed rate limit                           | 429 with Retry-After header                   |
| Secrets          | Check error responses for secrets           | No keys, passwords, tokens in body            |
| Audit log        | Perform a sensitive action                  | Action logged with actor, timestamp, resource |

### Penetration Test Scope (if applicable)

If this feature introduces significant new attack surface, document the pentest scope:

- Endpoints in scope
- Auth mechanisms to probe
- Data classes at risk
- Known exclusions

---

## Step 7 — CI Gate Placement

State where each test type runs in the pipeline:

| Test type   | CI gate                                  | Blocking?             |
| ----------- | ---------------------------------------- | --------------------- |
| Unit        | Every PR                                 | Yes                   |
| Integration | Every PR                                 | Yes                   |
| Contract    | Every PR (provider) / nightly (consumer) | Yes                   |
| E2E         | Every PR (smoke) / nightly (full suite)  | Smoke: yes / Full: no |
| Performance | Pre-release / nightly                    | Yes (SLA breach)      |
| Security    | Every PR (SAST) / weekly (DAST)          | SAST: yes / DAST: no  |

---

## Step 8 — Test Data Strategy

| Data type                       | Source                   | Isolation | Cleanup         |
| ------------------------------- | ------------------------ | --------- | --------------- |
| {entity using CONTEXT.md terms} | Factory / fixture / seed | Per-test  | After each test |

Rules:

- No production data in tests. Ever.
- Test data factories use CONTEXT.md terms for all fields.
- PII fields use anonymised or synthetic values.

---

## Step 9 — Write the Test Strategy

When the developer approves:

1. Write to: `.velocity/artifacts/test-strategy/{feature-slug}.md` using `templates/artifacts/test-strategy.md`
2. If a performance test plan was produced: `.velocity/artifacts/test-strategy/{feature-slug}-performance.md`
3. If a security testing plan was produced: `.velocity/artifacts/test-strategy/{feature-slug}-security.md`
4. Update `.velocity/knowledge-base/index.md`:
   - Add: `| test-strategy | {title} | .velocity/artifacts/test-strategy/{feature-slug}.md | {date} |`

Say: "Test strategy written to `.velocity/artifacts/test-strategy/{feature-slug}.md`."

---

## Test Strategy Quality Rules

A test strategy that fails any rule should be revised:

- Every acceptance criterion from the PRD maps to at least one test case
- Unit test names describe behaviour, not implementation
- Integration tests use real infrastructure (no mocked databases)
- E2E tests cover all critical happy paths and the most important error path
- Performance tests have a bottleneck hypothesis before running
- Security tests cover auth bypass, input validation, and data leakage for every triggered area
- Coverage targets are explicit numbers, not "comprehensive" or "good"
