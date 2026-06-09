# Compliance Packs

Velocity ships domain-specific compliance guardrail bundles for regulated industries. Each pack adds guardrails, context standards, and always-on reminders appropriate for that regulatory environment.

## Available Packs

| Pack                 | Standards               | Industries                       |
| -------------------- | ----------------------- | -------------------------------- |
| `pci-dss`            | PCI DSS v4.0            | Payments, FinTech, E-commerce    |
| `hipaa`              | HIPAA Security Rule     | Healthcare, HealthTech           |
| `soc2`               | SOC 2 Type II           | SaaS, Enterprise software        |
| `iso-27001`          | ISO/IEC 27001:2022      | Enterprise, regulated industries |
| `fintech-compliance` | Multi-framework FinTech | Banking, Insurance, FinTech      |
| `gdpr`               | GDPR (EU)               | Any company with EU users        |

## Installing a Compliance Pack

1. Add the pack to `.velocity/rule-packs.md`:

```yaml
packs:
  - id: pci-dss
    source: velocity-domain-pack
    enabled: true
```

2. Run the rule pack engine:

```
/rule-pack-engine
```

3. Review generated guardrails and context standards
4. Commit to the repository

## PCI DSS Pack

**Coverage:** PCI DSS v4.0 Requirements 3, 4, 7, 8, 10, 12

### Guardrails Added

```yaml
# No cardholder data in application logs
- id: pci-no-pan-in-logs
  type: guardrail
  rule: Block writes to log files containing PAN patterns
  severity: critical

# No CVV storage after authorization
- id: pci-no-cvv-storage
  type: guardrail
  rule: Block database column definitions for CVV/CVC/CVN fields
  severity: critical

# Encrypted transmission required
- id: pci-encrypted-transmission
  type: guardrail
  rule: Block HTTP (non-HTTPS) endpoints handling cardholder data
  severity: high
```

### Context Standards Added

Appended to `.velocity/project-context/security.md`:

```markdown
## PCI DSS Standards

### Cardholder Data

- Primary Account Number (PAN): Never log, never store unencrypted
- CVV/CVC: Never store after authorization
- Expiry date: Encrypt at rest

### Scope

All code handling cardholder data is in PCI scope.
Flag scope with // PCI-SCOPE comment on relevant classes.
```

### Always-On Additions

Added to entry document (CLAUDE.md, velocity.mdc, etc.):

```
PCI-SCOPE: payments context | cardholder-data handling
NEVER: log PAN | store CVV | non-HTTPS endpoints for card data
ALWAYS: encrypt at rest | flag PCI scope in code comments
```

## HIPAA Pack

**Coverage:** HIPAA Security Rule — Administrative, Physical, Technical Safeguards

### Guardrails Added

```yaml
# PHI field detection
- id: hipaa-phi-detection
  type: guardrail
  rule: Flag database columns and API fields containing PHI patterns
  severity: high

# Minimum necessary access
- id: hipaa-minimum-necessary
  type: guardrail
  rule: Flag API endpoints returning full PHI records without filter parameters
  severity: medium

# Audit logging for PHI access
- id: hipaa-audit-phi-access
  type: guardrail
  rule: Require audit log entry for all PHI read operations
  severity: high
```

### PHI Field Recognition

The HIPAA pack trains the guardrail to recognize PHI field patterns:

```
PHI patterns: ssn, social_security, dob, date_of_birth, diagnosis,
              prescription, medical_record, patient_id, health_condition,
              insurance_id, treatment, medication, lab_result
```

## SOC 2 Pack

**Coverage:** SOC 2 Trust Services Criteria — Security, Availability, Confidentiality

### Change Management Controls

```yaml
- id: soc2-change-approval
  type: guardrail
  rule: Changes to production infrastructure require documented approval

- id: soc2-rollback-plan
  type: context-standard
  rule: All significant changes must include documented rollback procedure
```

### Availability Controls

```yaml
- id: soc2-availability-monitoring
  type: context-standard
  rule: New services must include health check endpoint and alerting configuration

- id: soc2-dependency-availability
  type: guardrail
  rule: External dependencies must have documented availability SLA and fallback behavior
```

## Customizing Compliance Packs

Compliance packs are starting points, not complete compliance programs. After importing:

1. Review each generated guardrail in `.velocity/guardrails/packs.md`
2. Adjust severity levels based on your risk tolerance
3. Add organization-specific rules to `.velocity/guardrails/default.md`
4. Work with your compliance team to validate coverage

::: warning
Velocity compliance packs assist engineers in writing code that is easier to audit. They do not replace a formal compliance program, security assessment, or legal review.
:::
