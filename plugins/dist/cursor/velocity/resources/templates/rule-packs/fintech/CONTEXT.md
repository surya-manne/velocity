# CONTEXT.md — Payments Domain

> **Template:** FinTech Domain Pack v1.0.0
> **Bounded context:** payments
> **Usage:** Populate the Terms and Decisions sections with your project's specifics during a `grill-with-docs` session. Terms marked `[FILL]` require project-specific definitions. Pre-filled terms are FinTech-standard definitions — modify only if your project uses a different meaning.

---

## Terms

**Payment**: A transfer of funds initiated by a Payer and directed to a Payee, processed through one or more Payment Networks. A Payment is immutable after Capture — modifications require a Refund or Chargeback. [FILL: specify whether your Payments are synchronous (instant), async (ACH/SEPA), or mixed]

**Payment Initiation**: The act of creating a new Payment record and submitting it to the Payment Processor. Every Payment Initiation must carry an Idempotency Key to prevent duplicate charges.

**Idempotency Key**: A client-generated unique identifier attached to each Payment Initiation request. Guarantees that retrying a failed request produces the same outcome without duplicate charges. TTL: [FILL — e.g. 24 hours].

**Authorization**: The step at which the Payment Processor reserves funds from the Payer's account without transferring them. An Authorization has an expiry window (typically 7 days for cards).

**Capture**: The step at which authorized funds are transferred to the Merchant's settlement account. May be immediate (auto-capture) or deferred (manual capture).

**Settlement**: The process by which a Payment Processor disburses captured funds to the Merchant's bank account. Settlement timing varies by network: card networks typically T+1 to T+2; ACH is T+1 to T+3; SEPA Credit Transfer is T+1.

**Refund**: A reversal of a previously captured Payment, returned to the Payer's original payment method. A Refund is a separate Payment record — it does not modify the original.

**Chargeback**: A disputed Payment initiated by the Cardholder's issuing bank on behalf of the Cardholder. A Chargeback reverses the Settlement and incurs a Chargeback Fee. [FILL: specify your chargeback liability model — platform bears risk or passes to merchants]

**Chargeback Fee**: [FILL — amount and currency, e.g. $15 per chargeback from processor]

**Ledger Entry**: An append-only record of a financial movement. Every Ledger Entry has a Debit side and a Credit side of equal value (double-entry). Ledger Entries are immutable — corrections are made by posting a reversing entry, never by editing.

**Double-Entry Ledger**: An accounting model in which every financial event is recorded as two equal and opposite Ledger Entries: one Debit and one Credit. The sum of all Debits equals the sum of all Credits at all times.

**Reconciliation**: The process of comparing internal Ledger state against external Payment Processor records to detect and resolve discrepancies. Reconciliation runs [FILL — frequency: real-time / daily / T+1].

**Reconciliation Discrepancy**: A mismatch between the internal Ledger balance and the external processor settlement report. Every Discrepancy must be investigated and resolved within [FILL — SLA, e.g. 24 hours].

**Wallet**: [FILL if applicable — a stored value account belonging to a User or Merchant, denominated in one or more currencies, subject to money transmission licensing requirements in each jurisdiction where funds are held]

**Merchant**: An entity that receives Payments from Customers in exchange for goods or services. [FILL: specify whether your Merchants are onboarded directly or through a sub-merchant / marketplace model]

**Payment Facilitator (PayFac)**: A model in which the platform holds a master merchant account with the processor and sponsors sub-merchants beneath it. The PayFac bears chargeback liability and KYC/AML responsibility for all sub-merchants.

**Customer**: [FILL — the Payer in your payment flows. Specify whether Customer is synonymous with User, or a distinct concept (e.g., a Business entity)]

**Payer**: The entity initiating a Payment and from whose account funds are drawn.

**Payee**: The entity receiving funds from a Payment.

**Payment Method**: A funding source associated with a Payer — e.g., credit card, debit card, bank account (ACH/SEPA), or Wallet balance.

**Payment Token**: A non-sensitive surrogate for a Payment Method issued by the Payment Processor or a Vault service. Payment Tokens replace PANs in all internal systems. No raw PAN is ever stored.

**PAN (Primary Account Number)**: The 16-digit card number. Never stored. Always replaced by a Payment Token on first contact.

**KYC (Know Your Customer)**: The regulatory process of verifying the identity of a Customer or Merchant before allowing them to transact. Required under AML regulations. [FILL: specify your KYC provider and verification levels]

**AML (Anti-Money Laundering)**: Regulatory requirements to detect, prevent, and report money laundering activities. Applies to all Payments above [FILL — threshold, e.g. $10,000 in the US (CTR requirement)].

**Sanctions Screening**: The process of checking Payers, Payees, and Merchants against government sanctions lists (OFAC, EU, UN) before allowing a transaction to proceed.

**Payment Network**: The infrastructure through which Payments are routed — e.g., Visa, Mastercard, American Express, ACH, SEPA, SWIFT, Faster Payments (UK). [FILL: list the networks in scope for this project]

**Payment Processor**: The third-party service that connects the platform to Payment Networks — e.g., Stripe, Braintree, Adyen, Square. [FILL: your processor(s)]

**Merchant Category Code (MCC)**: A four-digit code assigned to a Merchant by the Payment Network that classifies the type of business. Affects interchange rates and certain regulatory treatments.

**Interchange**: The fee paid by the acquiring bank to the issuing bank on every card transaction. Varies by card type, MCC, and transaction type. Not directly configurable by the platform.

**FX Rate**: The exchange rate applied to a cross-currency Payment. [FILL: specify whether the FX Rate is locked at Payment Initiation or applied at Settlement, and where the FX spread is captured]

**Webhook**: An HTTP callback sent by the Payment Processor to notify the platform of asynchronous state changes (e.g., payment.succeeded, chargeback.created). Every Webhook must be signature-verified before processing.

---

## Decisions

[FILL — document non-obvious decisions made during grill-with-docs. Examples below:]

- **Idempotency key ownership**: Client generates the key (not server) — ensures retries from the client are safe without server-side key pre-creation.
- **Ledger immutability**: Ledger Entries are never updated or deleted. Corrections post a reversing Ledger Entry pair. (Rationale: audit trail must be complete and tamper-evident.)
- **PAN storage**: Never stored at any layer. Replaced by Payment Token on first API contact. All internal references use the token. (Rationale: PCI-DSS scope reduction.)
- [FILL: your payment state machine decision — what are the states and valid transitions?]
- [FILL: your partial failure recovery strategy — what happens when the processor accepts but the internal DB write fails?]
- [FILL: your reconciliation frequency and owner — who runs it and what is the escalation path for discrepancies?]

---

## Bounded Contexts

[FILL — if this is a monorepo, list adjacent bounded contexts and their CONTEXT.md paths here]

- **payments** — this context
- [FILL: e.g., customer — ../customer/CONTEXT.md]
- [FILL: e.g., risk — ../risk/CONTEXT.md]
