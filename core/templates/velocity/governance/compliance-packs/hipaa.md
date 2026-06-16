---
version: "1.0"

pack: hipaa
name: "HIPAA Security Rule"
description: >-
  Health Insurance Portability and Accountability Act — Security Rule controls
  mapped to Velocity guardrails. Applies to any system that creates, receives,
  maintains, or transmits electronic Protected Health Information (ePHI).
  Velocity enforces the technical safeguards automatable at the agent and CI layer.

risk_score_multiplier: 1.5 # Applied by risk-score skill when this pack is active

# Controls enforced by Velocity
controls:
  # ─── Administrative Safeguards ────────────────────────────────────────────

  164.308.a.1:
    title: "Security Officer — Risk Analysis"
    description: "Conduct an accurate and thorough risk analysis of ePHI."
    velocity_enforcement:
      - risk_score: enabled
        approval_threshold: 50
        rationale: "Every PR touching ePHI-related code is risk-scored automatically."
      - approval_workflow: enabled
        triggers: ["pii_files", "high_risk_score"]
    evidence_artifact: ".velocity/artifacts/audit/{YYYY-MM}.jsonl"

  164.308.a.3:
    title: "Workforce Access Management"
    description: "Implement procedures for authorizing access to ePHI."
    velocity_enforcement:
      - enterprise_controls: enabled
        required_roles: ["hipaa-compliance-officer", "security-lead"]
        applies_to: ["pii_files", "auth_files"]
        rationale: "Changes to ePHI access paths require authorized approver sign-off."
      - guardrail: security_review_required
        value: true
    evidence_artifact: ".velocity/artifacts/approvals/"

  164.308.a.5:
    title: "Security Awareness and Training"
    description: "Train workforce on security policies and procedures."
    velocity_enforcement:
      - adr_required: true
        trigger: "any new ePHI storage or processing pattern"
        rationale: "Security decisions must be documented as ADRs."
    evidence_artifact: ".velocity/artifacts/adrs/"

  # ─── Technical Safeguards ─────────────────────────────────────────────────

  164.312.a.1:
    title: "Access Control — Unique User Identification"
    description: "Assign a unique name/number to track user identity and access."
    velocity_enforcement:
      - guardrail: security_review_required
        value: true
        applies_to: auth_files
      - risk_score_signal: auth_files
        points: 25
      - pre_tool_use_hook:
          pattern: "(?i)(shared.*(password|credential|secret)|generic.*(user|account))"
          action: warn
          message: "Shared credential pattern detected. HIPAA 164.312.a.1 requires unique user identification."

  164.312.a.2.iv:
    title: "Encryption and Decryption"
    description: "Encrypt and decrypt ePHI in transit and at rest."
    velocity_enforcement:
      - risk_score_signal: crypto_files
        points: 15
        rationale: "Cryptographic code changes require heightened review."
      - pre_tool_use_hook:
          pattern: "(?i)(md5|sha1).*(?i)(password|hash|encrypt)"
          action: block
          message: "Weak hash algorithm detected for sensitive data. HIPAA 164.312.a.2.iv requires strong encryption (AES-256, SHA-256+). Do not use MD5 or SHA-1 for ePHI."

  164.312.b:
    title: "Audit Controls"
    description: "Implement hardware, software, and procedural mechanisms to record and examine access and activity."
    velocity_enforcement:
      - audit_trail: enabled
        scope: "All agent actions, guardrail events, approval decisions."
        retention_days: 2555 # 7 years for HIPAA
    evidence_artifact: ".velocity/artifacts/audit/"

  164.312.c.1:
    title: "Integrity Controls"
    description: "Protect ePHI from improper alteration or destruction."
    velocity_enforcement:
      - guardrail: breaking_change_approval_required
        value: true
        rationale: "Schema changes that could destroy ePHI require approval."
      - pre_tool_use_hook:
          pattern: "(?i)(drop table|truncate).*(?i)(patient|health|phi|medical|record|encounter)"
          action: block
          message: "Potential ePHI table destruction blocked. HIPAA 164.312.c.1 — integrity controls require approval before modifying ePHI data structures."

  164.312.d:
    title: "Person Authentication"
    description: "Implement procedures to verify the identity of a person seeking access to ePHI."
    velocity_enforcement:
      - risk_score_signal: auth_files
        points: 25
      - approval_workflow: enabled
        triggers: ["auth_files"]
        required_roles: ["security-lead"]

  164.312.e.1:
    title: "Transmission Security"
    description: "Implement technical security measures to guard against unauthorized access to ePHI being transmitted over an electronic communications network."
    velocity_enforcement:
      - pre_tool_use_hook:
          pattern: "(?i)http://(?!localhost|127\\.0\\.0\\.1)"
          action: warn
          message: "Non-HTTPS URL detected in code. HIPAA 164.312.e.1 requires encrypted transmission of ePHI. Use HTTPS."

# Mandatory PHI data handling guardrails
phi_guardrails:
  no_phi_in_logs: true
  no_phi_in_test_fixtures: true
  phi_fields_must_be_in_context_md: true

# Evidence collection
evidence:
  audit_log: ".velocity/artifacts/audit/"
  retention_days: 2555 # 7 years
  approvals: ".velocity/artifacts/approvals/"
  adrs: ".velocity/artifacts/adrs/"

reporting:
  period: annual
  evidence_export_skill: "Collect .velocity/artifacts/audit/*.jsonl + approvals for the reporting period. Export to .velocity/artifacts/compliance/hipaa-evidence-{YYYY}.zip"
---
