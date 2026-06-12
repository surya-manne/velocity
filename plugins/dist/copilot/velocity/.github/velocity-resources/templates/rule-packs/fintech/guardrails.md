---
$schema: "../../../../schemas/guardrails.schema.json"
version: "2.0"
pack: fintech
name: "FinTech Guardrails"
description: >-
  Guardrails for financial technology products. Enforces idempotency discipline,
  PCI-DSS scope reduction (no PAN storage), ledger immutability, webhook signature
  verification, and AML/KYC gating. Extends the base Velocity guardrails.

risk_score_modifier: +15 # Payment and ledger changes carry inherent financial risk

# ─── Guardrails ────────────────────────────────────────────────────────────────

guardrails:
  fintech.pan_storage_blocked:
    title: "No PAN storage"
    description: "Primary Account Numbers (card numbers) must never be stored. Replace with Payment Token on first contact."
    severity: block
    category: security

  fintech.idempotency_key_required:
    title: "Payment initiation requires idempotency key"
    description: "Every Payment Initiation API call must carry an Idempotency Key. Endpoints without idempotency key enforcement are blocked from merge."
    severity: block
    category: engineering

  fintech.ledger_immutability:
    title: "Ledger entries are immutable"
    description: "No UPDATE or DELETE statement against ledger tables. Corrections must use reversing entries. Flag any migration that alters existing ledger rows."
    severity: block
    category: engineering

  fintech.webhook_signature_required:
    title: "Webhook signature verification required"
    description: "Every payment processor webhook endpoint must verify the signature (e.g., Stripe-Signature, X-PayPal-Transmission-Sig) before processing the payload."
    severity: block
    category: security

  fintech.reconciliation_tests_required:
    title: "Ledger-touching slices require reconciliation tests"
    description: "Any PR that writes to the ledger must include at least one test asserting that debit and credit totals remain balanced after the operation."
    severity: warn
    category: testing

  fintech.pii_encryption_required:
    title: "Financial PII must be encrypted at rest"
    description: "Fields containing account numbers, routing numbers, SSN, or date of birth must use field-level encryption or be tokenized. Plain-text storage is blocked."
    severity: block
    category: security

  fintech.kyc_gate_required:
    title: "High-value transactions require KYC verification check"
    description: "Transactions above the configured AML threshold must verify that the Payer has passed KYC before processing. Missing KYC gate is a blocking guardrail violation."
    severity: block
    category: compliance

  fintech.double_entry_balance_check:
    title: "Double-entry balance must be asserted in tests"
    description: "Any test that writes ledger entries must assert debit_total == credit_total. Tests that write to the ledger without a balance assertion fail the guardrail."
    severity: warn
    category: testing

# ─── PreToolUse Hooks ──────────────────────────────────────────────────────────

hooks:
  - id: fintech.block-pan-in-logs
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(log|print|console\\.log|logger|printf).*(?i)(pan|card.?number|credit.?card|\\d{13,19})"
    action: block
    message: "Potential PAN in log statement blocked. Never log card numbers — use Payment Token instead."

  - id: fintech.block-pan-insert
    event: PreToolUse
    tool: Bash
    pattern: "(?i)INSERT.*(?i)(pan|card_number|credit_card_number|primary_account_number)"
    action: block
    message: "PAN column insert blocked. Store Payment Token, not the raw PAN. See PCI-DSS requirement 3.4."

  - id: fintech.block-ledger-update
    event: PreToolUse
    tool: Bash
    pattern: "(?i)UPDATE\\s+(ledger|ledger_entries|journal_entries|transactions)\\s+SET"
    action: block
    message: "Ledger UPDATE blocked. Ledger entries are immutable. Post a reversing entry pair instead of modifying existing rows."

  - id: fintech.block-ledger-delete
    event: PreToolUse
    tool: Bash
    pattern: "(?i)DELETE\\s+FROM\\s+(ledger|ledger_entries|journal_entries|transactions)"
    action: block
    message: "Ledger DELETE blocked. Ledger entries are immutable. Post a reversing entry pair instead."

  - id: fintech.warn-hardcoded-amount
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(amount|price|fee|charge)\\s*=\\s*[0-9]+(?:\\.[0-9]+)?"
    action: warn
    message: "Hardcoded monetary amount detected. Use a named constant or configuration value. Hardcoded amounts are a common source of payment bugs."

  - id: fintech.warn-float-for-money
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(amount|price|balance|fee).*(?:float|double|Float|Double|f64|f32)"
    action: warn
    message: "Floating-point type for monetary amount detected. Use integer (minor currency units: cents) or a Decimal type. Float arithmetic causes rounding errors in financial calculations."

  - id: fintech.block-plaintext-routing-number
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(routing.?number|account.?number|iban|sort.?code).*=\\s*['\"][0-9]"
    action: block
    message: "Hardcoded financial account identifier blocked. Use a Payment Token or encrypted field reference. Never hardcode routing/account numbers."

  - id: fintech.warn-missing-idempotency
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(initiatePayment|createPayment|processPayment|chargeCard|debitAccount)(?!.*idempotency)"
    action: warn
    message: "Payment initiation function call detected without an idempotency key parameter. Ensure the idempotency key is passed. Missing idempotency keys cause duplicate charges on retry."
---
