---
$schema: "../../../../schemas/guardrails.schema.json"
version: "2.0"
pack: healthtech
name: "HealthTech Guardrails"
description: >-
  Guardrails for health technology products. Enforces HIPAA Technical Safeguards,
  PHI handling discipline, audit log requirements, BAA obligation awareness, and
  FHIR data integrity rules. Extends the base Velocity guardrails.

risk_score_modifier: +20 # PHI and clinical data changes carry significant regulatory risk

# ─── Guardrails ────────────────────────────────────────────────────────────────

guardrails:
  healthtech.phi_encryption_required:
    title: "PHI must be encrypted at rest and in transit"
    description: "All fields containing PHI must be encrypted at rest (field-level or database-level) and transmitted only over TLS 1.2+. Plain-text PHI storage or transmission is a HIPAA Security Rule violation."
    severity: block
    category: security

  healthtech.audit_log_required:
    title: "PHI access must be logged"
    description: "Every read, create, update, and delete of PHI must produce an audit log entry. Endpoints that access PHI without audit logging are blocked from merge."
    severity: block
    category: compliance

  healthtech.minimum_necessary_standard:
    title: "API responses must not return unnecessary PHI"
    description: "API responses must return only the PHI fields required for the use case. Returning full patient records when only a name and appointment date are needed violates the Minimum Necessary Standard."
    severity: warn
    category: compliance

  healthtech.baa_check_required:
    title: "New PHI-processing integrations require BAA verification"
    description: "Any new third-party service that will process, store, or transmit PHI requires a signed Business Associate Agreement before integration code is merged."
    severity: block
    category: compliance

  healthtech.phi_in_logs_blocked:
    title: "PHI must not appear in application logs"
    description: "Logging PHI (patient names, dates of birth, SSNs, MRNs, diagnoses) in application logs creates uncontrolled PHI disclosure. Mask or omit PHI from all log statements."
    severity: block
    category: security

  healthtech.fhir_validation_required:
    title: "FHIR resources must be validated before persistence"
    description: "FHIR resources written to the database must be validated against the base FHIR R4 profile (or project-specific profiles) before persistence. Invalid resources corrupt the clinical data model."
    severity: warn
    category: engineering

  healthtech.patient_consent_check:
    title: "Clinical data sharing requires consent verification"
    description: "Any feature that shares a Patient's data with a third party must verify that the Patient has provided appropriate consent. Consent verification must be a first-class step in the data flow, not an afterthought."
    severity: block
    category: compliance

  healthtech.de_identification_required_for_analytics:
    title: "Analytics workloads must use de-identified data"
    description: "Machine learning, analytics, and reporting workloads must operate on de-identified data (Safe Harbor or Expert Determination). Direct use of PHI for analytics without explicit patient consent and IRB approval is prohibited."
    severity: warn
    category: compliance

# ─── PreToolUse Hooks ──────────────────────────────────────────────────────────

hooks:
  - id: healthtech.block-phi-in-logs
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(log|logger|console\\.log|print|printf|println).*(?i)(patient|ssn|mrn|dob|date_of_birth|diagnosis|icd|loinc|snomed)"
    action: block
    message: "Potential PHI in log statement blocked. Remove PHI from log output. Use patient_id (non-PHI surrogate) instead of patient name or MRN. HIPAA Security Rule §164.312(b)."

  - id: healthtech.block-phi-plaintext-insert
    event: PreToolUse
    tool: Bash
    pattern: "(?i)INSERT.*(?i)(ssn|social_security|date_of_birth|diagnosis_code|medical_record)"
    action: warn
    message: "PHI field insert detected. Confirm this field is encrypted at rest before proceeding. Unencrypted PHI storage violates HIPAA Security Rule §164.312(a)(2)(iv)."

  - id: healthtech.warn-http-phi-endpoint
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(http://|fetch\\(|axios\\.get|requests\\.get).*(?i)(patient|encounter|observation|condition|claim)"
    action: warn
    message: "PHI endpoint called over HTTP (not HTTPS). PHI must be transmitted only over TLS 1.2+. Replace http:// with https://."

  - id: healthtech.block-phi-in-url
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(url|endpoint|path).*(?i)(ssn|mrn|patient_name|dob)=.*\\$|.*\\{"
    action: block
    message: "PHI in URL query parameter blocked. PHI must never appear in URLs (logged by web servers and proxies). Pass PHI in the request body over HTTPS."

  - id: healthtech.warn-fhir-without-validation
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(save|persist|insert|create).*(?i)(fhir|resource|bundle)(?!.*valid)"
    action: warn
    message: "FHIR resource persistence detected without apparent validation. Validate the resource against the FHIR R4 profile before saving to prevent data integrity issues."
---
