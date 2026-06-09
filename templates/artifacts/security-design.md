# Security Design: {{FEATURE_NAME}}

## Version: 1

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## Compliance obligations: {{PCI-DSS | HIPAA | SOC2 | ISO27001 | None}}

## Related Architecture Doc: {{ARCHITECTURE_DOC_PATH}}

---

## Scope

{{1–2 sentences: what feature this security design covers and which security triggers are present.}}

**Triggers present:**

- [ ] Authentication or authorization changes
- [ ] PII stored or processed
- [ ] Payment or financial data
- [ ] New public API endpoint
- [ ] Cross-service trust boundary
- [ ] Third-party integration
- [ ] File upload or download
- [ ] HIPAA obligations

---

## Threat Model (STRIDE)

| Threat category                                          | Applies?   | Specific risk                      | Mitigation              |
| -------------------------------------------------------- | ---------- | ---------------------------------- | ----------------------- |
| **Spoofing** — false identity claims                     | {{yes/no}} | {{specific risk for this feature}} | {{specific mitigation}} |
| **Tampering** — data modification in transit or at rest  | {{yes/no}} | {{specific risk}}                  | {{specific mitigation}} |
| **Repudiation** — deny performing an action              | {{yes/no}} | {{specific risk}}                  | {{specific mitigation}} |
| **Information Disclosure** — data leakage                | {{yes/no}} | {{specific risk}}                  | {{specific mitigation}} |
| **Denial of Service** — availability attack              | {{yes/no}} | {{specific risk}}                  | {{specific mitigation}} |
| **Elevation of Privilege** — access beyond authorisation | {{yes/no}} | {{specific risk}}                  | {{specific mitigation}} |

---

## Trust Boundary Map

```
[{{Actor}}] — {{transport + auth}} → [{{Component}}] — {{transport + auth}} → [{{Component}}]
                                            |
                                   [{{Data Store: encryption}}]
```

| Boundary      | Identity verification    | Transport encryption | Data crossing boundary |
| ------------- | ------------------------ | -------------------- | ---------------------- |
| {{From → To}} | {{JWT / mTLS / API key}} | {{HTTPS / TLS 1.3}}  | {{data description}}   |

---

## Data Classification

| Field                             | Classification                                         | At-rest encryption        | In-transit encryption | Retention  | Access                  |
| --------------------------------- | ------------------------------------------------------ | ------------------------- | --------------------- | ---------- | ----------------------- |
| `{{field using CONTEXT.md term}}` | {{Public / Internal / Confidential / PII / PCI / PHI}} | {{required/not required}} | HTTPS                 | {{period}} | {{who/what can access}} |

Classifications: `Public` | `Internal` | `Confidential` | `PII` | `PCI` | `PHI`

---

## Authentication Design

_(Complete only if authentication changes are in scope.)_

| Aspect              | Design                                                      |
| ------------------- | ----------------------------------------------------------- |
| Mechanism           | {{JWT / OAuth2 / API Key / Session / mTLS}}                 |
| Token lifetime      | {{duration}}                                                |
| Token rotation      | {{policy}}                                                  |
| Validation location | {{API gateway / middleware / service layer}}                |
| Failure behaviour   | {{what happens on auth failure — no data leak in response}} |

---

## Authorization Design

_(Complete only if authorization changes are in scope.)_

| Aspect               | Design                                                 |
| -------------------- | ------------------------------------------------------ |
| Model                | {{RBAC / ABAC / Ownership-based / Policy-based}}       |
| Policy summary       | {{who can do what to which resources}}                 |
| Enforcement location | {{middleware / service layer / DB row-level security}} |
| Minimum permissions  | {{least privilege statement}}                          |

**Permission matrix:**

| Role / Attribute | Read {{Resource}} | Create {{Resource}} | Update {{Resource}} | Delete {{Resource}} |
| ---------------- | ----------------- | ------------------- | ------------------- | ------------------- |
| {{role}}         | {{yes/no}}        | {{yes/no}}          | {{yes/no}}          | {{yes/no}}          |

---

## Compliance Checklist

_(Complete only for triggered compliance frameworks.)_

### PCI-DSS

- [ ] Cardholder data not stored after authorisation
- [ ] Full PAN absent from logs
- [ ] Cardholder data encrypted at rest (AES-256)
- [ ] Access to cardholder data limited to need-to-know roles
- [ ] All access to cardholder data logged with actor and timestamp

### HIPAA

- [ ] Minimum necessary standard applied to all PHI access
- [ ] PHI encrypted at rest and in transit
- [ ] Access log for every PHI access event
- [ ] Patient right-to-deletion path documented and tested

### SOC2

- [ ] Audit log for all data mutations (actor, timestamp, resource ID, action)
- [ ] Access control reviewed against least privilege
- [ ] Encryption verified for all sensitive data fields

---

## Secrets Management

| Secret            | Type                                             | Storage location         | Rotation policy     | Access scope                    |
| ----------------- | ------------------------------------------------ | ------------------------ | ------------------- | ------------------------------- |
| `{{SECRET_NAME}}` | {{API key / RSA key / symmetric key / password}} | {{Secrets manager name}} | {{rotation period}} | {{service(s) that can read it}} |

**Invariants:**

- No secret stored in environment variables committed to source control
- No secret in log output (verified by log sanitisation middleware)
- No secret in error responses to callers

---

## Input Validation

| Input surface           | Validation applied                                | Failure response                    |
| ----------------------- | ------------------------------------------------- | ----------------------------------- |
| `{{endpoint or field}}` | {{schema validation / length limit / allow-list}} | {{status code + sanitised message}} |

---

## Audit Logging

| Event                                         | Data logged                                    | Log location | Retention  |
| --------------------------------------------- | ---------------------------------------------- | ------------ | ---------- |
| `{{sensitive action using CONTEXT.md terms}}` | actor, timestamp, resource ID, action, outcome | {{log sink}} | {{period}} |

---

## ADRs Referenced

| ADR        | Title     | Security constraint                    |
| ---------- | --------- | -------------------------------------- |
| ADR-{{id}} | {{title}} | {{what this ADR requires or prevents}} |

---

## Open Questions

| Question     | Owner   | Resolution needed by |
| ------------ | ------- | -------------------- |
| {{question}} | {{who}} | {{when}}             |

---

## Version History

| Version | Date     | Author         | Summary       |
| ------- | -------- | -------------- | ------------- |
| 1       | {{DATE}} | Security Agent | Initial draft |
