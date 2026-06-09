# /validate — Pre-PR Quality Gate

`/validate` runs 12 checks before a pull request. It enforces Velocity's quality standards and blocks PRs that would introduce technical debt, security issues, or architectural drift.

::: warning Run Before Every PR
`/validate` should be the last step before opening a pull request. The `/loop` skill runs it automatically. When working manually, run it explicitly.
:::

## Usage

```
/validate
```

Validates the current working branch against main.

## The 12 Checks

### 1. Vertical Slice Compliance

Verifies the PR contains end-to-end feature work, not horizontal layer changes.

```
✓ PASS: PR contains API endpoint + domain logic + database migration + tests
✗ FAIL: PR contains only database models with no API or business logic
```

### 2. CONTEXT.md Alignment

Checks that code identifiers in the diff match CONTEXT.md vocabulary.

```
✓ PASS: Code uses PaymentIntent consistently
✗ FAIL: Code introduces "PaymentOrder" which is explicitly NOT in CONTEXT.md
```

### 3. Test Coverage

Verifies test coverage does not drop below the configured threshold.

```
✓ PASS: Coverage 87% (threshold: 85%)
✗ FAIL: Coverage 83% (threshold: 85%) — new code in refund-processor.ts not covered
```

### 4. Secret Detection

Scans the diff for credentials, API keys, and sensitive data.

```
✓ PASS: No secrets detected
✗ FAIL: Possible API key in src/config/stripe.ts line 12 — use env variable
```

### 5. Guardrail Compliance

Verifies no guardrail rules were bypassed or disabled.

```
✓ PASS: All guardrail hooks active
✗ FAIL: hooks.json modified — kafka-topic-guard disabled
```

### 6. ADR Currency

Checks that new architectural decisions have ADRs, and existing ADRs are still accurate.

```
✓ PASS: EventSourcing decision covered by ADR-0023
✗ WARN: New async processing pattern has no ADR — consider creating one
```

### 7. Risk Assessment

Runs `/risk-score` on the PR diff. Flags if risk exceeds threshold.

```
✓ PASS: Risk score 42 (threshold: 70)
✗ WARN: Risk score 74 — approval required before merge
```

### 8. API Contract Safety

Checks that no existing API contracts are broken by the change.

```
✓ PASS: New endpoint added, no existing endpoints modified
✗ FAIL: POST /payments changed — required field added (breaking change)
```

### 9. Database Migration Safety

Validates migration scripts for dangerous operations.

```
✓ PASS: Migration adds nullable column (safe)
✗ FAIL: Migration drops column without prior deprecation period
```

### 10. Dependency Vulnerabilities

Scans new or updated dependencies for known vulnerabilities.

```
✓ PASS: No new vulnerabilities in added dependencies
✗ WARN: axios@1.6.0 — upgrade to 1.7.x (moderate severity)
```

### 11. Performance Regression

Checks for common performance issues in the diff.

```
✓ PASS: No N+1 query patterns detected
✗ WARN: Potential N+1 in refund-processor.ts:45 — consider eager loading
```

### 12. Documentation Currency

Verifies that documentation is updated when public-facing code changes.

```
✓ PASS: OpenAPI spec updated to include new /refunds endpoint
✗ FAIL: New API endpoint not in OpenAPI spec
```

## Validation Report

After all checks run:

```markdown
# Validation Report — refund-support/slice-1

## Result: ⚠ WARNINGS (mergeable with review)

### ✓ Passed (10/12)

- Vertical slice compliance
- CONTEXT.md alignment
- Test coverage (87%)
- Secret detection
- Guardrail compliance
- ADR currency
- API contract safety
- Database migration safety
- Dependency vulnerabilities
- Documentation currency

### ⚠ Warnings (2)

- Risk score: 65 (approaching threshold of 70)
  → Stripe integration is external dependency
  → Recommend: Engineering Lead review before merge
- N+1 potential in refund-processor.ts:45
  → SELECT for each refund item in batch
  → Recommend: Add .include() for PaymentIntent in query

### Recommendation

Merge with review. Address N+1 before Slice 2 (will be exacerbated in batch processing).
```

## Configuring Thresholds

Edit `.velocity/guardrails/default.md`:

```yaml
validate:
  coverage_threshold: 85
  risk_threshold: 70
  require_adr_for:
    - new_async_pattern
    - new_external_integration
    - cross_context_data_access
  performance_checks:
    - n_plus_one_detection: warn # warn | error | off
    - large_payload_check: error
```
