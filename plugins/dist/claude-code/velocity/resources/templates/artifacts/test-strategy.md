# Test Strategy: {{FEATURE_NAME}}

## Version: 1

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Test framework: {{TEST_FRAMEWORK}}

## Related PRD: {{PRD_PATH}}

---

## Scope

{{1–2 sentences: what feature this test strategy covers and which layers it touches.}}

**Layers in scope:** {{UI | API | Domain | Persistence | Messaging}}

**Test types required:**

- [ ] Unit
- [ ] Integration
- [ ] Contract
- [ ] Component (UI)
- [ ] End-to-End
- [ ] Performance _(if latency/throughput requirements exist)_
- [ ] Security _(if auth/PII/payment surface present)_

---

## Acceptance Criteria Coverage

> Every acceptance criterion from the PRD must map to at least one test case.

| Acceptance Criterion                 | Test type                    | Test case name                          |
| ------------------------------------ | ---------------------------- | --------------------------------------- |
| {{criterion using CONTEXT.md terms}} | {{Unit / Integration / E2E}} | `should_{{outcome}}_when_{{condition}}` |

---

## Unit Tests

| Behaviour                            | Test case name                          | Input     | Expected output |
| ------------------------------------ | --------------------------------------- | --------- | --------------- |
| {{behaviour using CONTEXT.md terms}} | `should_{{outcome}}_when_{{condition}}` | {{input}} | {{assertion}}   |

**Test case naming convention:** `should_{outcome}_when_{condition}`

**Coverage target:** {{TEST_COVERAGE_MINIMUM}}%

---

## Integration Tests

| Integration point        | Scenario     | Test data                            | Expected side effect                       |
| ------------------------ | ------------ | ------------------------------------ | ------------------------------------------ |
| {{DB / service / queue}} | {{scenario}} | {{test data using CONTEXT.md terms}} | {{what is asserted after the interaction}} |

**Infrastructure:** {{TestContainers / embedded DB / test instance}}

---

## Contract Tests

_(Complete if this feature publishes or consumes events, or exposes APIs consumed by other services.)_

| Provider    | Consumer     | Contract                             | Verification    |
| ----------- | ------------ | ------------------------------------ | --------------- |
| {{service}} | {{consumer}} | {{Pact / schema registry / OpenAPI}} | On PR / Nightly |

---

## End-to-End Tests

| User journey                       | Entry point      | Steps             | Final assertion                       |
| ---------------------------------- | ---------------- | ----------------- | ------------------------------------- |
| {{journey using CONTEXT.md terms}} | {{URL / screen}} | {{ordered steps}} | {{what proves the journey succeeded}} |

**Flakiness policy:** A flaky E2E test is blocked from merge until stabilised. No exceptions.

---

## Coverage Targets

| Layer               | Minimum                    | Basis            |
| ------------------- | -------------------------- | ---------------- |
| Domain logic        | {{TEST_COVERAGE_MINIMUM}}% | Guardrail config |
| API handlers        | {{TEST_COVERAGE_MINIMUM}}% | Guardrail config |
| UI components       | {{TEST_COVERAGE_MINIMUM}}% | Guardrail config |
| Acceptance criteria | 100%                       | PRD              |

---

## Test Data Strategy

| Entity                           | Source            | PII fields                    | Isolation | Cleanup         |
| -------------------------------- | ----------------- | ----------------------------- | --------- | --------------- |
| {{Entity using CONTEXT.md term}} | Factory / fixture | {{anonymised/synthetic/none}} | Per test  | After each test |

---

## CI Gate Placement

| Test type        | Gate                                     | Blocking         |
| ---------------- | ---------------------------------------- | ---------------- |
| Unit             | Every PR                                 | Yes              |
| Integration      | Every PR                                 | Yes              |
| Contract         | Every PR (provider) / Nightly (consumer) | Yes              |
| E2E — smoke      | Every PR                                 | Yes              |
| E2E — full suite | Nightly                                  | No               |
| Performance      | Pre-release                              | Yes (SLA breach) |
| Security (SAST)  | Every PR                                 | Yes              |
| Security (DAST)  | Weekly                                   | No               |

---

## Version History

| Version | Date     | Author   | Summary       |
| ------- | -------- | -------- | ------------- |
| 1       | {{DATE}} | QA Agent | Initial draft |
