---
$schema: "../../../../schemas/marketplace-pack.schema.json"
id: healthtech
name: "HealthTech Domain Pack"
version: "1.0.0"
type: domain
description: >-
  Domain pack for health technology products. Seeds CONTEXT.md with canonical
  clinical and administrative terms (Patient, Encounter, Observation, Practitioner,
  Claim, Prior Authorization, etc.), enforces HIPAA Technical Safeguards and ePHI
  handling guardrails, injects clinical domain grill questions, and wires HL7 FHIR
  and HIPAA-aware skills.
author:
  name: Velocity Team
  url: https://velocity.dev
  verified: true
license: MIT
velocity_version_min: "2.0"
tags:
  - healthtech
  - healthcare
  - fhir
  - hl7
  - hipaa
  - clinical
  - ehr
  - phi
homepage: https://velocity.dev/marketplace/healthtech
repository: https://github.com/velocity-dev/packs/healthtech

signals:
  file_patterns:
    - "**/patient*.{ts,js,py,java,go}"
    - "**/encounter*.{ts,js,py,java,go}"
    - "**/fhir/**"
    - "**/hl7/**"
    - "**/claim*.{ts,js,py,java,go}"
    - "**/*ehr*/**"
    - "**/*emr*/**"
  import_patterns:
    - "fhir"
    - "@ahryman40k/ts-fhir-types"
    - "hl7"
    - "ca.uhn.hapi.fhir"
    - "google-cloud-healthcare"
    - "azure-health-insights"
  context_md_terms:
    - Patient
    - Encounter
    - Observation
    - Practitioner
    - Claim
    - PHI
    - ePHI
    - FHIR
    - Prior Authorization
  dependency_names:
    - fhir
    - "@ahryman40k/ts-fhir-types"
    - ca.uhn.hapi.fhir:hapi-fhir-base
    - health-fhir-r4
    - fhirclient

contents:
  context_template:
    path: CONTEXT.md
    bounded_context: clinical
    merge_strategy: propose

  skills:
    - id: healthtech-fhir-design
      name: "FHIR Resource Design"
      description: "Design FHIR R4 resource structures, profiles, and extensions aligned to your clinical data model. Validates resource shapes against the FHIR specification."
      path: skills/fhir-design/SKILL.md
      category: domain

    - id: healthtech-phi-handling
      name: "PHI Handling Review"
      description: "Review code and data flows for correct Protected Health Information (PHI) handling — de-identification, minimum necessary access, and HIPAA Technical Safeguard compliance."
      path: skills/phi-handling/SKILL.md
      category: domain

    - id: healthtech-claims-design
      name: "Claims and Prior Authorization Design"
      description: "Design claims submission, adjudication, and prior authorization workflows aligned to X12 837/835 and FHIR Prior Authorization IG."
      path: skills/claims-design/SKILL.md
      category: domain

    - id: healthtech-interoperability
      name: "Interoperability Design"
      description: "Design clinical data exchange patterns: FHIR APIs, CCD/CDA documents, SMART on FHIR, and patient data portability (21st Century Cures Act compliance)."
      path: skills/interoperability/SKILL.md
      category: domain

  guardrails:
    path: guardrails.md
    merge_strategy: append

  grill_seeds:
    product:
      - "Who are the clinical users of this feature? (Clinician, patient, administrator, biller, payer) Each has different access rights and workflow needs."
      - "Does this feature store, process, or transmit Protected Health Information (PHI)? If so, HIPAA Technical Safeguards apply from the first line of code."
      - "Is the patient the person using this feature, or is clinical staff the primary user? This drives UX flow and consent requirements."
      - "Is this feature inside a HIPAA-covered entity or a Business Associate? This affects your BAA obligations."
      - "Does this feature need to interoperate with EHRs (Epic, Cerner, Athenahealth)? If so, which integration standard applies — HL7 v2, FHIR R4, CCD/CDA?"
      - "What is the minimum necessary PHI rule for this feature? Does the feature access more PHI than the task requires?"

    architecture:
      - "Is the data model FHIR-native, FHIR-mapped, or FHIR-adjacent? (Native: FHIR resources are the persistence layer. Mapped: internal model projected to FHIR at API boundary. Adjacent: FHIR used for interchange only)"
      - "What FHIR version is in scope? (R4 is the current standard — R5 is in progress. R3/DSTU2 only if legacy system requires it)"
      - "How is PHI encrypted at rest? (Field-level encryption, database-level encryption, or application-level encryption with key rotation?)"
      - "What is the audit log architecture for PHI access? (HIPAA requires logging who accessed what PHI and when — where does this log live and who can read it?)"
      - "How is patient consent managed? (Explicit consent per use case? Implicit consent through terms of service? State-specific consent requirements?)"
      - "Is this a SMART on FHIR app? (Authorization model, scopes, launch context, EHR-embedded vs. standalone)"
      - "What is the de-identification standard? (Safe Harbor: 18 identifiers removed. Expert Determination: statistical verification. Which applies here?)"

    security:
      - "What is the Minimum Necessary Standard implementation? Who can access which Patient records, and how is that access controlled?"
      - "How are PHI-containing fields identified in the database schema? (Tagged in ORM models, documented in CONTEXT.md, enforced by guardrails?)"
      - "What is the key management strategy for PHI encryption? (AWS KMS, HashiCorp Vault, customer-managed keys?)"
      - "Is there a Business Associate Agreement (BAA) in place with every vendor that processes PHI? (Cloud provider, analytics, logging service)"
      - "What is the breach notification procedure? (HIPAA requires notification within 60 days of discovery)"
      - "How are de-identification and re-identification risks managed for analytics use cases?"

    performance:
      - "What is the expected concurrent patient volume? (Critical for deciding whether FHIR resources should be stored natively or projected from a relational model)"
      - "What is the acceptable latency for clinical decision support queries? (Sub-second for real-time alerts vs. asynchronous for batch analysis)"
      - "How large is the expected Observation / measurement time series? (Vitals at 1-minute intervals for ICU patients can generate millions of rows per patient)"

    vertical_slice:
      - "Does this slice touch PHI? If yes, the HIPAA audit log must be active before this slice goes to production."
      - "Does this slice expose a FHIR endpoint? If so, SMART on FHIR authorization is required before the endpoint is accessible outside the internal network."
      - "Does this slice transmit PHI to any third party? If so, confirm a BAA exists with that party before implementing the data transfer."

install:
  post_install_skill: grill-with-docs
  requires_regeneration: true
---
