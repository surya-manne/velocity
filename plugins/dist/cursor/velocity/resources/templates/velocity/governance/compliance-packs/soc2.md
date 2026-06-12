---
version: "1.0"

pack: soc2
name: "SOC 2 Type II"
description: >-
  Service Organization Control 2 compliance controls mapped to Velocity guardrails.
  Covers the five Trust Service Criteria: Security (CC), Availability (A),
  Processing Integrity (PI), Confidentiality (C), and Privacy (P).
  Velocity enforces the controls that are automatable at the agent and CI layer.

# Which Trust Service Criteria are in scope for this repository
# Set to false to disable criteria not relevant to your service
criteria:
  security: true # CC — Common Criteria (required for all SOC 2)
  availability: false # A — Availability (include if SLA commitments exist)
  processing_integrity: false # PI — (include if financial transaction processing)
  confidentiality: true # C — (include if confidential data handled)
  privacy: false # P — (include if PII is collected/stored/processed)

risk_score_multiplier: 1.2 # Applied by risk-score skill when this pack is active

# Controls enforced by Velocity
controls:
  # ─── Security (Common Criteria) ──────────────────────────────────────────

  CC6.1:
    title: "Logical and physical access controls"
    description: "Restrict access to systems and data to authorized users only."
    velocity_enforcement:
      - guardrail: security_review_required
        value: true
        rationale: "Auth and access control changes require Security Agent review."
      - guardrail: pre_tool_use_hooks
        pattern: "(?i)(chmod|chown|sudo|su\\s)"
        action: warn
        message: "Permission change detected. Confirm this is intended and does not broaden access."
    ci_check: "Verify no new open permissions in infrastructure diffs."
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  CC6.2:
    title: "Authentication and credential management"
    description: "Multi-factor authentication and secure credential storage."
    velocity_enforcement:
      - guardrail: secrets_scan_required
        value: true
        rationale: "No secrets in source code."
      - risk_score_signal: secret_handling
        points: 15
    ci_check: "Secrets scan on every PR. Fail on any detected credential pattern."
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  CC6.3:
    title: "Access removal and role changes"
    description: "Remove access promptly when roles change."
    velocity_enforcement:
      - audit_event: guardrail.override
        rationale: "Every guardrail override is logged with actor identity and justification."
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  CC7.1:
    title: "System monitoring and detection"
    description: "Detect and respond to security events."
    velocity_enforcement:
      - audit_trail: enabled
        scope: "All agent actions, guardrail results, approval decisions."
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  CC7.2:
    title: "Incident identification and response"
    description: "Investigate and document security incidents."
    velocity_enforcement:
      - knowledge_base: ".velocity/knowledge-base/incidents/"
        rationale: "Incident postmortems stored and indexed."
    evidence_artifact: ".velocity/knowledge-base/incidents/"

  CC8.1:
    title: "Change management"
    description: "Changes to infrastructure and software are authorized and tested."
    velocity_enforcement:
      - guardrail: vertical_slice_required
        value: true
        rationale: "Every change is a testable vertical slice."
      - guardrail: slice_has_tests_at_all_layers
        value: true
      - guardrail: breaking_change_approval_required
        value: true
      - approval_workflow: enabled
        triggers: ["breaking_change", "high_risk_score"]
    evidence_artifact: ".velocity/artifacts/approvals/"

  CC9.1:
    title: "Risk assessment"
    description: "Identify and mitigate risks to system availability and security."
    velocity_enforcement:
      - risk_score: enabled
        approval_threshold: 50
        compliance_review_threshold: 75
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  CC9.2:
    title: "Vendor and third-party risk"
    description: "Assess risk from third-party components."
    velocity_enforcement:
      - guardrail: dependency_vulnerability_scan
        value: true
      - pre_tool_use_hooks:
          - pattern: "npm install|pip install|go get"
            action: warn
            message: "New dependency installation. Confirm dependency is approved and vulnerability-scanned."
    ci_check: "Dependency vulnerability scan on every PR that modifies dependency files."

  # ─── Confidentiality ─────────────────────────────────────────────────────

  C1.1:
    title: "Confidential information identification"
    description: "Identify and protect confidential information."
    velocity_enforcement:
      - context_md_term_consistency: true
        rationale: "Confidential data concepts must be named consistently in code and CONTEXT.md."
      - risk_score_signal: pii_files
        points: 20
    evidence_artifact: ".velocity/artifacts/context/CONTEXT.md"

  C1.2:
    title: "Confidential information disposal"
    description: "Dispose of confidential information securely."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)(delete from|truncate|drop table).*(?i)(user|customer|account|pii|personal)"
          action: block
          message: "Deletion of potentially confidential data blocked. Ensure compliance with data retention policy before proceeding."

# Evidence collection guidance
evidence:
  audit_log: ".velocity/artifacts/audit/"
  approvals: ".velocity/artifacts/approvals/"
  adrs: ".velocity/artifacts/adrs/"
  incidents: ".velocity/knowledge-base/incidents/"
  retention_days: 365

# Reporting
reporting:
  period: annual
  evidence_export_skill: "Collect .velocity/artifacts/audit/*.jsonl + .velocity/artifacts/approvals/*.md for the reporting period. Export to .velocity/artifacts/compliance/soc2-evidence-{YYYY}.zip"
---
