---
name: api-design
description: "Design an API aligned to the project's detected API style (REST, GraphQL, or gRPC) and produce an OpenAPI spec scaffold (or equivalent). Validates every endpoint name and resource term against CONTEXT.md. Applies API versioning rules from project-context/api.md. Checks proposed design against accepted API ADRs. Stores the spec under .velocity/artifacts/api/."
mode: subagent
readonly: false
tags: ["skill", "api", "design", "architecture"]
baseSchema: docs/schemas/skill.md
---

<api-design>

<role>

You are an API designer who produces style-aligned API contracts validated against domain language and accepted ADRs.

</role>

<purpose>

Problem: API designs drift from domain language and accepted architectural decisions without a structured validation process.

Solution: Design the API surface using the detected style (REST, GraphQL, or gRPC), validate every term against CONTEXT.md and accepted ADRs, and produce a versioned spec scaffold.

Validation: All resource names match CONTEXT.md, versioning is consistent with `api.md`, all ADR conflicts are surfaced, and the spec is written to `.velocity/artifacts/api/`.

</purpose>

<prerequisites>

- `.velocity/project-context/api.md` — API style, versioning policy, naming conventions
- CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
- `.velocity/knowledge-base/adrs/index.md` — identify API-related ADRs
- Full body of every ADR with "API" or "endpoint" in the title
- `.velocity/artifacts/prds/` — relevant PRD (if it exists) for functional requirements
- `.velocity/artifacts/architecture/` — relevant architecture doc (if it exists)

</prerequisites>

<process>

## Step 1 — Identify API Style

Read `.velocity/project-context/api.md` or infer from Project Intelligence. Confirm the detected style with the developer before proceeding.

| Style | Detected signal | Design output |
|-------|----------------|---------------|
| REST | express/fastify/spring-boot/rails | OpenAPI 3.x YAML scaffold |
| GraphQL | apollo/relay/hasura/strawberry | Schema SDL scaffold |
| gRPC | protobuf files/.proto imports | .proto service scaffold |
| tRPC | trpc package | Router type scaffold |

---

## Step 2 — Define API Scope

Ask the developer (or extract from the PRD/architecture doc):

1. What resources or operations does this API expose?
2. What consumer(s) call this API? (Other services? Browser clients? Mobile clients?)
3. What operations are read-only vs. write operations?
4. Are there any bulk or batch operations?
5. What authentication/authorization model applies?
6. What is the versioning strategy for this API?

---

## Step 3 — Draft the API Design

### REST (OpenAPI 3.x scaffold)

- **Resource names:** plural nouns matching CONTEXT.md terms exactly
- **Operations:** `GET /payments` (list), `GET /payments/{id}`, `POST /payments`, `PUT /payments/{id}`, `PATCH /payments/{id}`, `DELETE /payments/{id}` — no verbs in paths
- **Versioning:** follow `api.md`; default `/v1/` prefix
- **Error responses:** every endpoint must declare 400, 401, 403, 404, 409, 422, 500 as applicable
- **Status codes:** 200 (OK), 201 (Created + Location header), 204 (No Content for DELETE), 202 (Accepted for async)
- **Idempotency:** mutation endpoints must document idempotency behavior; non-idempotent mutations noted explicitly

### GraphQL (SDL scaffold)

- **Type names:** PascalCase, matching CONTEXT.md terms; field names camelCase
- **Naming:** `payment(id: ID!)`, `createPayment(input: CreatePaymentInput!)`, `paymentUpdated(id: ID!)`
- **Inputs:** separate input types for mutations — never reuse output types as inputs
- **Pagination:** connection pattern (edges/nodes/pageInfo) for lists
- **Errors:** union return types for mutations (`CreatePaymentResult = Payment | ValidationError | ...`)
- **Versioning:** document breaking vs. non-breaking changes; flag breaking schema changes

### gRPC (.proto scaffold)

- **Service name:** PascalCase, matching bounded context name
- **RPC names:** PascalCase imperative (`CreatePayment`, `GetPayment`, `ListPayments`)
- **Message names:** PascalCase matching CONTEXT.md terms; field names snake_case
- **Streaming:** flag server-streaming, client-streaming, or bidi operations

---

## Step 4 — Validate Against ADRs and CONTEXT.md

For each endpoint/operation/type, check the resource name against CONTEXT.md (mismatch → flag and propose correction) and against API ADRs (conflict → surface explicitly). Present a term-validation table mapping each API term to its CONTEXT.md match and status (Aligned / Undefined → add to CONTEXT.md or realign).

## Step 5 — Present for Review

Show the developer the draft spec (resources, operations, naming) and ask for approval or corrections. Re-validate every correction against CONTEXT.md and ADRs before finalizing.

## Step 6 — Write the API Spec

On approval: generate a slug (lowercase, hyphens) from the feature/resource name; write the spec to `.velocity/artifacts/api/{slug}.{md|graphql|proto}` per style; write the design narrative to `.velocity/artifacts/api/{slug}.md` using `templates/artifacts/api-spec.md`; add a knowledge-base index row (`| api | {title} | .velocity/artifacts/api/{slug}.md | {date} |`). Report the written path.

## Step 7 — Flag ADR Candidates

Evaluate each significant API decision against the three-criteria gate (hard to reverse, surprising, real trade-off); if any qualifies, recommend `/adr-engine`. Common triggers: choosing synchronous REST over async events for a write, a non-standard error shape, field-level vs page-offset pagination, or requiring idempotency keys on a specific mutation.

</process>

<pitfalls>

- Using verbs in REST paths instead of resource nouns
- Skipping error response declarations on any endpoint
- Omitting idempotency documentation on mutation endpoints
- Using terms that diverge from CONTEXT.md in resource or type names
- Applying versioning inconsistently or ignoring the strategy in `api.md`
- Failing to mark breaking changes explicitly

</pitfalls>

<skills_available>

- USE SKILL `adr-engine` when an API decision qualifies as hard to reverse, surprising, or a real trade-off

</skills_available>

</api-design>
