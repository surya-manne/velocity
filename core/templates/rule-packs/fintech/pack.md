---
$schema: "../../../../schemas/marketplace-pack.schema.json"
id: fintech
name: "FinTech Domain Pack"
version: "1.0.0"
type: domain
description: >-
  Domain pack for financial technology products. Seeds CONTEXT.md with
  canonical FinTech terms (Payment, Settlement, Chargeback, Ledger, Reconciliation,
  KYC/AML, etc.), injects domain-specific grill questions, adds PCI-DSS-adjacent
  guardrails, and wires FinTech-aware skills for payments, lending, and trading
  workflows.
author:
  name: Velocity Team
  url: https://velocity.dev
  verified: true
license: MIT
velocity_version_min: "2.0"
tags:
  - fintech
  - payments
  - banking
  - finance
  - pci-dss
  - compliance
homepage: https://velocity.dev/marketplace/fintech
repository: https://github.com/velocity-dev/packs/fintech

signals:
  file_patterns:
    - "**/payment*.{ts,js,py,java,go}"
    - "**/ledger*.{ts,js,py,java,go}"
    - "**/transaction*.{ts,js,py,java,go}"
    - "**/settlement*.{ts,js,py,java,go}"
    - "**/stripe/**"
    - "**/plaid/**"
    - "**/braintree/**"
  import_patterns:
    - "stripe"
    - "plaid"
    - "braintree"
    - "square"
    - "dwolla"
    - "paypal"
    - "adyen"
    - "@stripe"
  context_md_terms:
    - Payment
    - Settlement
    - Chargeback
    - Ledger
    - Reconciliation
    - KYC
    - AML
    - Wallet
    - Merchant
  dependency_names:
    - stripe
    - plaid
    - braintree
    - square
    - "@stripe/stripe-js"
    - com.stripe:stripe-java
    - stripe-python

contents:
  context_template:
    path: CONTEXT.md
    bounded_context: payments
    merge_strategy: propose

  skills:
    - id: fintech-payment-design
      name: "Payment Flow Design"
      description: "Design idempotent payment flows with correct state machines, retry logic, and reconciliation checkpoints."
      path: skills/payment-design/SKILL.md
      category: domain

    - id: fintech-ledger-design
      name: "Double-Entry Ledger Design"
      description: "Design double-entry ledger structures aligned to standard accounting principles. Ensures debit/credit symmetry and audit-trail integrity."
      path: skills/ledger-design/SKILL.md
      category: domain

    - id: fintech-reconciliation
      name: "Reconciliation Workflow"
      description: "Build reconciliation jobs that detect mismatches between internal ledger state and external payment processor records."
      path: skills/reconciliation/SKILL.md
      category: domain

    - id: fintech-kyc-aml
      name: "KYC / AML Design"
      description: "Design Know-Your-Customer and Anti-Money-Laundering flows aligned to FATF recommendations and common regulatory expectations."
      path: skills/kyc-aml/SKILL.md
      category: domain

  guardrails:
    path: guardrails.md
    merge_strategy: append

  grill_seeds:
    product:
      - "Is this a payment initiation flow, a reporting flow, or a settlement flow? Each has different idempotency and consistency requirements."
      - "Which payment networks are in scope? (Visa/Mastercard, ACH, SEPA, SWIFT, Crypto) Each has different latency, finality, and reversal rules."
      - "Who is the merchant of record? Is the platform a payment facilitator (PayFac) or an ISO/agent?"
      - "What is the chargeback liability model? (Platform bears risk vs. passes to merchants)"
      - "Is this a B2C or B2B payment flow? B2B typically requires invoice reconciliation; B2C requires refund self-service."
      - "Does the product need stored value / wallet functionality? If so, what are the money transmission licensing requirements in each jurisdiction?"

    architecture:
      - "How is payment idempotency enforced? (Idempotency key on every payment initiation call — what is the key structure and TTL?)"
      - "What is the consistency model for ledger writes? (Strong consistency across accounts, or eventual with reconciliation?)"
      - "How are partial failures handled? (Payment processor accepts but internal DB write fails — what is the recovery path?)"
      - "What is the state machine for a Payment? (Initiated → Authorized → Captured → Settled → Reconciled — or a different set?)"
      - "How is the audit trail maintained? (Append-only ledger entries, event sourcing, or mutable records?)"
      - "How are FX conversions handled? (Rate lock at initiation? Settlement rate? Spread captured where?)"
      - "What is the disaster recovery model for the ledger? (RPO/RTO — can any transactions be lost?)"

    security:
      - "Is PAN (Primary Account Number) ever stored? If so, what is the tokenization strategy? (Stripe tokens, Vault, custom HVT)"
      - "What PCI-DSS SAQ level applies? (SAQ A, SAQ A-EP, SAQ D) This drives infrastructure and code requirements."
      - "How are webhook signatures verified? (Stripe-Signature header, HMAC — what is the key rotation policy?)"
      - "What is the secrets management strategy for payment processor API keys? (Vault, AWS Secrets Manager — no env vars in code)"
      - "How are fraudulent transactions detected and blocked before settlement?"
      - "What is the AML screening approach? (Real-time screening, batch, third-party provider?)"

    performance:
      - "What is the p99 latency target for payment initiation? (200ms? 500ms? What drives the SLA?)"
      - "What is the expected transaction volume at peak? (TPS — does the ledger need partitioning?)"
      - "Are there batch settlement windows? (End-of-day, real-time? How does this affect UI state display?)"

    vertical_slice:
      - "Does this slice touch cardholder data (PANs, CVVs, expiry dates)? If yes, PCI-DSS scope is triggered for this slice."
      - "Does this slice write to the ledger? Every ledger-touching slice must include reconciliation verification in its acceptance criteria."
      - "What is the failure mode if the payment processor is unavailable during this slice's operation? Is it acceptable to queue, reject, or degrade gracefully?"

install:
  post_install_skill: grill-with-docs
  requires_regeneration: true
---
