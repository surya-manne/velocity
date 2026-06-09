# CONTEXT.md — Clinical Domain

> **Template:** HealthTech Domain Pack v1.0.0
> **Bounded context:** clinical
> **Usage:** Populate Terms and Decisions during a `grill-with-docs` session. Terms marked `[FILL]` require project-specific definitions. Pre-filled terms follow HL7 FHIR R4 and HIPAA standard definitions — modify only if your project uses a different meaning.

---

## Terms

**Patient**: An individual who is the subject of healthcare services. In FHIR: the `Patient` resource. Identified by a Patient ID (internal) and one or more external identifiers (MRN, SSN where legally required, insurance member ID). [FILL: specify your patient identity model — single MRN, enterprise MPI, or federated identity]

**Encounter**: A clinical interaction between a Patient and one or more Practitioners at a Healthcare Facility. Encounters have a type (outpatient, inpatient, emergency, telehealth), a start time, and an end time. All clinical observations, orders, and notes belong to an Encounter. In FHIR: the `Encounter` resource.

**Observation**: A measurement or assertion made about a Patient — e.g., vital sign, lab result, symptom, clinical finding. In FHIR: the `Observation` resource. Each Observation has a LOINC code, a value, a status (registered, preliminary, final, amended, corrected, cancelled), and a timestamp.

**Condition**: A clinical condition, problem, or diagnosis associated with a Patient. In FHIR: the `Condition` resource. Coded using ICD-10-CM (US billing), SNOMED CT (clinical), or both.

**Practitioner**: A licensed healthcare professional who provides clinical care. In FHIR: the `Practitioner` resource. Identified by NPI (National Provider Identifier) in the US.

**PractitionerRole**: The combination of a Practitioner, their specialty, and the organization and location where they practice. In FHIR: the `PractitionerRole` resource.

**Organization**: A healthcare organization — hospital, clinic, practice group, insurance company, or laboratory. In FHIR: the `Organization` resource.

**Location**: A physical or virtual place where healthcare services are provided — e.g., a room, building, or telehealth platform. In FHIR: the `Location` resource.

**PHI (Protected Health Information)**: Any individually identifiable health information held or transmitted by a HIPAA-covered entity or Business Associate. Includes 18 HIPAA Safe Harbor identifiers (name, dates, geographic data, phone, email, SSN, MRN, health plan numbers, account numbers, certificate numbers, URLs, IP addresses, biometrics, photos, and unique identifiers). PHI must be encrypted in transit and at rest, and access must be logged.

**ePHI (Electronic Protected Health Information)**: PHI that is created, received, maintained, or transmitted in electronic form. Subject to the HIPAA Security Rule (Technical, Physical, and Administrative Safeguards). All ePHI in this system is subject to the Technical Safeguards defined in the Security Rule (45 CFR §164.312).

**Minimum Necessary Standard**: The HIPAA requirement that covered entities and Business Associates access, use, and disclose only the PHI necessary to accomplish the intended purpose. Applied to: API response fields, database queries, and agent context loading.

**De-identification**: The process of removing or obscuring PHI so that the resulting data cannot reasonably be used to identify an individual. Two standards: (1) Safe Harbor — remove all 18 identifiers; (2) Expert Determination — statistical verification that re-identification risk is very small. [FILL: which standard applies to your analytics use cases]

**MRN (Medical Record Number)**: The local patient identifier assigned by a healthcare facility. Not globally unique — the same patient may have different MRNs at different facilities. [FILL: specify your MRN scheme]

**Claim**: A request submitted to a Payer (insurance company or government program) for reimbursement of healthcare services. In FHIR: the `Claim` resource. Coded using CPT (procedures), ICD-10-CM (diagnoses), and HCPCS.

**Prior Authorization**: Approval required from a Payer before certain services can be provided to a Patient and be covered for reimbursement. In FHIR: the `CoverageEligibilityRequest` and `ClaimResponse` resources (Da Vinci Prior Auth IG). [FILL: which payers and service types require prior auth in your product]

**Coverage**: A Patient's insurance coverage, including plan details, member ID, and coverage period. In FHIR: the `Coverage` resource.

**Payer**: An entity that pays for healthcare services — insurance company (commercial, Medicare Advantage, Medicaid managed care) or government program (Medicare FFS, Medicaid FFS). [FILL: which payers does this product interact with?]

**FHIR (Fast Healthcare Interoperability Resources)**: The HL7 standard for healthcare data exchange. Version R4 (4.0.1) is the current stable version and the default for this project unless otherwise specified. [FILL: confirm FHIR version — R4 or R5]

**LOINC**: Logical Observation Identifiers Names and Codes. The standard coding system for laboratory and clinical observations. Used for Observation codes.

**SNOMED CT**: Systematized Nomenclature of Medicine — Clinical Terms. A clinical terminology standard for conditions, procedures, findings, and body structures.

**ICD-10-CM**: International Classification of Diseases, 10th Revision, Clinical Modification. Used for diagnosis coding in US billing.

**CPT**: Current Procedural Terminology. Used for procedure coding in US billing.

**NPI (National Provider Identifier)**: A unique 10-digit identifier for US healthcare providers and organizations. Required on all HIPAA-covered transactions.

**SMART on FHIR**: A standard for OAuth2-based authorization for FHIR apps. Defines launch contexts (EHR launch, standalone launch) and scopes (patient/_.read, user/_.\*, openid, fhirUser). [FILL: is this a SMART on FHIR app? Which launch context?]

**BAA (Business Associate Agreement)**: A HIPAA-required contract between a Covered Entity and a Business Associate that processes PHI on its behalf. Every vendor that processes ePHI for this product must have a signed BAA. [FILL: list your Business Associates — cloud provider, analytics vendor, logging service, etc.]

**Audit Log**: An append-only record of who accessed which PHI, when, and from where. Required by HIPAA Security Rule §164.312(b). Audit events include: read, create, update (via new version), search, delete, export, and login/logout.

---

## Decisions

[FILL — document non-obvious decisions made during grill-with-docs. Examples below:]

- **FHIR persistence strategy**: [FILL — FHIR-native (resources stored as FHIR JSON), FHIR-mapped (relational DB projected to FHIR at API boundary), or FHIR-adjacent (used only for interchange)]
- **PHI encryption**: [FILL — field-level encryption, database-level (TDE), or application-level with which key management system]
- **Audit log storage**: [FILL — append-only table, separate audit service, cloud audit service (AWS CloudTrail, GCP Cloud Audit Logs)]
- **De-identification standard**: [FILL — Safe Harbor or Expert Determination for analytics]
- **Patient identity resolution**: [FILL — local MRN, enterprise MPI, or patient-supplied identity]
- [FILL: consent model — explicit per-use-case or implicit through terms of service]

---

## Bounded Contexts

[FILL — if monorepo, list adjacent bounded contexts]

- **clinical** — this context
- [FILL: e.g., billing — ../billing/CONTEXT.md]
- [FILL: e.g., scheduling — ../scheduling/CONTEXT.md]
- [FILL: e.g., pharmacy — ../pharmacy/CONTEXT.md]
