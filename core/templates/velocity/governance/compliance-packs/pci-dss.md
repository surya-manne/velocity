---
version: "1.0"

pack: pci-dss
name: "PCI DSS v4.0"
description: >-
  Payment Card Industry Data Security Standard v4.0 controls mapped to Velocity
  guardrails. Applies to any system that stores, processes, or transmits
  cardholder data (CHD) or sensitive authentication data (SAD). Velocity enforces
  the technical controls automatable at the agent and CI layer.

risk_score_multiplier: 1.5 # Applied by risk-score skill when this pack is active

# Cardholder data environment signals — Velocity uses these to identify in-scope code
cardholder_data_signals:
  - "card"
  - "pan"
  - "cvv"
  - "cvc"
  - "expir"
  - "cardholder"
  - "payment"
  - "billing"
  - "stripe"
  - "braintree"
  - "paypal"

controls:
  # ─── Requirement 3 — Protect Stored Account Data ─────────────────────────

  3.3.1:
    title: "SAD not retained after authorization"
    description: "Sensitive authentication data must not be retained after authorization."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)(cvv|cvc2|cid|cap|sad|track_data|magnetic_stripe|full_pan).*(?i)(store|save|insert|persist|log|write)"
          action: block
          message: "PCI DSS 3.3.1 — Sensitive authentication data (CVV/CVC, track data, full PAN) must never be stored. Remove this before committing."

  3.5.1:
    title: "PAN protected wherever stored"
    description: "Primary Account Number must be rendered unreadable wherever stored."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)(pan|card_number|credit_card).*(?i)(plain|unencrypted|raw|cleartext)"
          action: block
          message: "PCI DSS 3.5.1 — PAN must be encrypted, hashed, or masked wherever stored. Do not store PAN in plaintext."

  # ─── Requirement 4 — Protect Cardholder Data with Cryptography ───────────

  4.2.1:
    title: "Strong cryptography for CHD in transit"
    description: "Use strong cryptography and security protocols for CHD in transit."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)http://(?!localhost|127\\.0\\.0\\.1)"
          action: block
          message: "PCI DSS 4.2.1 — Non-HTTPS URL detected. Cardholder data transmission must use TLS 1.2+. Replace with HTTPS."
      - pre_tool_use_hook:
          pattern: "(?i)(tls_?1[_.]?0|tls_?1[_.]?1|ssl_?v?[23]|sslv[23])"
          action: block
          message: "PCI DSS 4.2.1 — TLS 1.0/1.1 and SSLv2/3 are prohibited. Use TLS 1.2 or higher."

  # ─── Requirement 6 — Develop and Maintain Secure Systems ─────────────────

  6.2.4:
    title: "Prevent common software vulnerabilities"
    description: "Protect against injection, XSS, and other OWASP Top 10 vulnerabilities."
    velocity_enforcement:
      - guardrail: security_review_required
        value: true
        applies_to: payment_files
        rationale: "All payment-related code changes require Security Agent review."
      - approval_workflow: enabled
        triggers: ["payment_files", "auth_files"]
        required_roles: ["security-lead", "pci-compliance-officer"]

  6.3.3:
    title: "Security patches"
    description: "All software components are protected from known vulnerabilities."
    velocity_enforcement:
      - guardrail: dependency_vulnerability_scan
        value: true
        rationale: "All dependency updates scanned for known CVEs."
      - pre_tool_use_hook:
          pattern: "(?i)(npm install|pip install|go get|mvn install).*(?i)(--ignore-scripts|--no-audit)"
          action: warn
          message: "PCI DSS 6.3.3 — Installing dependencies while bypassing security audit. Confirm all new dependencies are vulnerability-scanned."

  6.4.1:
    title: "Web-facing applications protected"
    description: "Public-facing web apps are protected against attacks."
    velocity_enforcement:
      - risk_score_signal: public_api_files
        points: 20
      - approval_workflow: enabled
        triggers: ["public_api_files"]
        required_roles: ["security-lead"]

  # ─── Requirement 7 — Restrict Access by Business Need ────────────────────

  7.2.1:
    title: "Access control model defined"
    description: "Access control is based on least privilege."
    velocity_enforcement:
      - enterprise_controls: enabled
        required_roles: ["pci-compliance-officer", "security-lead"]
        applies_to: payment_files
      - risk_score_signal: auth_files
        points: 25

  # ─── Requirement 8 — Identify and Authenticate Access ────────────────────

  8.2.1:
    title: "Unique user IDs"
    description: "All users are assigned a unique ID."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)(shared.*(user|account|login)|generic.*(user|account))"
          action: warn
          message: "PCI DSS 8.2.1 — Shared user accounts are not permitted in cardholder data environments."

  8.3.6:
    title: "Password / passphrase complexity"
    description: "Passwords must meet minimum complexity requirements."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: '(?i)(min.?length|password.?min).*[''"]?[0-9]'
          action: warn
          message: "Password minimum length configuration detected. PCI DSS 8.3.6 requires minimum 12 characters for new systems."

  # ─── Requirement 10 — Log and Monitor Access ─────────────────────────────

  10.2.1:
    title: "Audit logs capture required events"
    description: "Implement audit logs to detect anomalous activity."
    velocity_enforcement:
      - audit_trail: enabled
        scope: "All agent actions, guardrail events, approval decisions for payment code."
        retention_days: 365 # PCI DSS requires 1 year minimum
    evidence_artifact: ".velocity/artifacts/audit/"

  10.3.1:
    title: "Audit log protection"
    description: "Audit logs are protected from destruction and unauthorized modification."
    velocity_enforcement:
      - audit_log_immutable: true
        rationale: "Velocity audit logs are append-only JSON-L files. Never overwrite."

  # ─── Requirement 12 — Organizational Policies ────────────────────────────

  12.3.2:
    title: "Targeted risk analysis"
    description: "Perform targeted risk analysis for each requirement."
    velocity_enforcement:
      - risk_score: enabled
        approval_threshold: 50
        compliance_review_threshold: 75
      - adr_required: true
        trigger: "any new payment processing pattern, cardholder data storage, or cryptographic choice"
    evidence_artifact: ".velocity/artifacts/adrs/"

# Evidence collection
evidence:
  audit_log: ".velocity/artifacts/audit/"
  retention_days: 365
  approvals: ".velocity/artifacts/approvals/"
  adrs: ".velocity/artifacts/adrs/"

reporting:
  period: annual
  evidence_export_skill: "Collect .velocity/artifacts/audit/*.jsonl + approvals + adrs for the reporting period. Export to .velocity/artifacts/compliance/pci-dss-evidence-{YYYY}.zip"
---
