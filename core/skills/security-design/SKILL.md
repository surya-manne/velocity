---
name: security-design
description: >-
  Produce a security design for a feature: threat model, trust boundary map,
  data classification, auth/authz design, and compliance obligations. Aligned
  to the detected security posture from project-context/security.md and
  existing security ADRs. Stores the output under .velocity/artifacts/security/.
  Invoked by the Security Agent or Architecture Agent when a feature touches
  auth, PII, payments, trust boundaries, or public API surface.
metadata:
  surfaces:
    - agent
---

# Security Design

Produce a security design for this feature.

## Context Load

Read before starting:

1. `.velocity/project-context/security.md` — security standards, compliance obligations, auth model
2. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
3. `.velocity/knowledge-base/adrs/index.md` — identify security-related ADRs
4. Full body of every ADR with "security", "auth", "PII", "encryption", or "compliance" in the title
5. `.velocity/artifacts/prds/` — relevant PRD (if it exists)
6. `.velocity/artifacts/architecture/` — relevant architecture doc (if it exists)

---

## Step 1 — Security Trigger Assessment

Determine which security disciplines apply to this feature:

| Trigger                      | Present? | Action                                                |
| ---------------------------- | -------- | ----------------------------------------------------- |
| PII stored or processed      | {yes/no} | Data classification required                          |
| Payments or financial data   | {yes/no} | PCI-DSS checklist required                            |
| Authentication changes       | {yes/no} | Auth design section required                          |
| New public API endpoint      | {yes/no} | Input validation + rate limiting required             |
| Cross-service trust boundary | {yes/no} | mTLS / service identity design required               |
| File upload or download      | {yes/no} | Content scanning + path traversal protection required |
| Third-party integration      | {yes/no} | Secrets management + webhook verification required    |
| HIPAA obligations            | {yes/no} | Access audit logging required                         |

Only complete sections that are triggered. Do not produce a security design for risks that do not apply.

---

## Step 2 — Threat Model

Identify threats using the STRIDE model:

| Threat                     | Example for this feature                    | Mitigation                                          |
| -------------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Spoofing**               | Caller claims identity without proof        | JWT validation, mTLS, API key rotation              |
| **Tampering**              | Request body modified in transit            | HTTPS, request signing, HMAC                        |
| **Repudiation**            | Deny performing an action                   | Immutable audit log, signed events                  |
| **Information Disclosure** | Leak PII in error messages                  | Sanitised error responses, field-level encryption   |
| **Denial of Service**      | Flood endpoint with requests                | Rate limiting, circuit breakers, queue depth limits |
| **Elevation of Privilege** | Access resource belonging to another tenant | Attribute-based access control, row-level security  |

For each threat: state whether it applies, the specific risk in this feature's context, and the mitigation approach.

---

## Step 3 — Trust Boundary Map

Produce a trust boundary diagram (ASCII):

```
[External Client] — HTTPS/JWT → [API Gateway] — mTLS → [Service A]
                                                              |
                                                   [DB: encrypted at rest]
```

For each boundary, state:

- The identity verification mechanism
- The transport encryption mechanism
- What data crosses this boundary

---

## Step 4 — Data Classification

For every data element handled by this feature:

| Field           | Classification | At-rest encryption | In-transit encryption | Retention  | Accessible to  |
| --------------- | -------------- | ------------------ | --------------------- | ---------- | -------------- |
| `email`         | PII            | Required           | HTTPS                 | 90 days    | Owner only     |
| `paymentMethod` | PCI            | Required (PCI-DSS) | HTTPS                 | 7 years    | Processor only |
| `orderId`       | Internal       | Not required       | HTTPS                 | Indefinite | Service        |

Classifications: `Public` | `Internal` | `Confidential` | `PII` | `PCI` | `PHI`

---

## Step 5 — Authentication and Authorization Design

If authentication or authorization changes are triggered:

**Authentication:**

- Mechanism: (JWT / OAuth2 / API Key / Session / mTLS)
- Token lifetime and rotation policy
- Token validation location (gateway vs. service)
- Failure mode: what happens when authentication fails

**Authorization:**

- Model: (RBAC / ABAC / ownership-based / policy-based)
- Policy: which roles or attributes allow which operations
- Enforcement location: (middleware / service layer / database row-level)
- Least privilege: confirm the minimum permission set required

---

## Step 6 — Compliance Checklist

Apply only the checklists relevant to this feature (from `security.md`):

### PCI-DSS (if payment data present)

- [ ] Cardholder data never stored after authorisation
- [ ] No full PAN in logs
- [ ] Encryption of cardholder data at rest (AES-256)
- [ ] Access to cardholder data limited to need-to-know
- [ ] All access to cardholder data logged

### HIPAA (if PHI present)

- [ ] Minimum necessary standard applied
- [ ] PHI encrypted at rest and in transit
- [ ] Access logs for all PHI access
- [ ] Patient right-to-deletion path documented

### SOC2 (if applicable)

- [ ] Audit log for all data mutations
- [ ] Access control reviewed
- [ ] Encryption in place for sensitive data

---

## Step 7 — Secrets Management

For any secrets introduced by this feature:

| Secret            | Type           | Storage         | Rotation | Exposed to           |
| ----------------- | -------------- | --------------- | -------- | -------------------- |
| `STRIPE_API_KEY`  | API key        | Secrets manager | 90 days  | Payment service only |
| `JWT_PRIVATE_KEY` | Asymmetric key | HSM / KMS       | Annual   | Auth service only    |

Rules:

- Secrets never in environment variables checked into source control
- Secrets never in log output
- Secrets never in error messages returned to callers

---

## Step 8 — Present for Review

Show the developer the security design:

> "Here is the security design. Review threats, mitigations, and data classification. Say 'approve' to write it to disk."

---

## Step 9 — Write the Security Design

When the developer approves:

1. Generate slug from feature name: lowercase, hyphens.
2. Write to: `.velocity/artifacts/security/{slug}.md` using `templates/artifacts/security-design.md`
3. Update `.velocity/knowledge-base/index.md`:
   - Add: `| security | {title} | .velocity/artifacts/security/{slug}.md | {date} |`

Say: "Security design written to `.velocity/artifacts/security/{slug}.md`."

---

## Step 10 — Flag ADR Candidates

Evaluate each significant security decision against the three-criteria gate. Common security ADR triggers:

- Choosing RBAC over ABAC for a specific use case
- Storing tokens in cookies vs. localStorage
- Adopting field-level encryption for a specific data class
- Choosing a specific key management approach

If any decision qualifies: suggest invoking `/adr-engine`.

---

## Security Design Quality Rules

A design that fails any rule should be revised:

- All threats assessed, not just the obvious ones
- Every mitigation is specific — not "use HTTPS" but "HTTPS enforced at ingress; HSTS enabled"
- Data classification covers every field that crosses a service boundary
- Auth model states enforcement location explicitly
- No secrets in plaintext anywhere in the document
- Compliance items checked only against obligations that actually apply
