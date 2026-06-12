---
mode: agent
description: "Design an API aligned to the project's detected API style (REST, GraphQL, or gRPC) and produce an OpenAPI spec scaffold (or equivalent). Validates every endpoint name and resource term against CONTEXT.md. Applies API versioning rules from project-context/api.md. Checks proposed design against accepted API ADRs. Stores the spec under .velocity/artifacts/api/. Invoked by the Architecture Agent or API Architect subagent when a feature introduces new API surface."
---


# API Design

Design the API surface for this feature.

## Context Load

Read before starting:

1. `.velocity/project-context/api.md` — API style, versioning policy, naming conventions
2. CONTEXT.md at the path from `.velocity/context-map.md` for the relevant bounded context
3. `.velocity/knowledge-base/adrs/index.md` — identify API-related ADRs
4. Full body of every ADR with "API" or "endpoint" in the title
5. `.velocity/artifacts/prds/` — relevant PRD (if it exists) for functional requirements
6. `.velocity/artifacts/architecture/` — relevant architecture doc (if it exists)

---

## Step 1 — Identify API Style

Read `.velocity/project-context/api.md` or infer from Project Intelligence:

| Style   | Detected signal                   | Design output             |
| ------- | --------------------------------- | ------------------------- |
| REST    | express/fastify/spring-boot/rails | OpenAPI 3.x YAML scaffold |
| GraphQL | apollo/relay/hasura/strawberry    | Schema SDL scaffold       |
| gRPC    | protobuf files/.proto imports     | .proto service scaffold   |
| tRPC    | trpc package                      | Router type scaffold      |

Confirm the detected style with the developer before proceeding.

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

### REST (OpenAPI)

Produce an OpenAPI 3.x scaffold following these rules:

- **Resource names**: plural nouns, matching CONTEXT.md terms exactly
- **Operation naming**: `GET /payments` (list), `GET /payments/{id}` (get), `POST /payments` (create), `PUT /payments/{id}` (replace), `PATCH /payments/{id}` (update), `DELETE /payments/{id}` (delete)
- **No verbs in paths**: `/process-payment` → wrong; `POST /payments` → correct
- **Versioning**: Follow the strategy in `api.md`. Default: `/v1/` prefix
- **Error responses**: 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 500 (internal). Every endpoint must declare its error responses.
- **Status codes**: 200 (OK), 201 (Created + Location header), 204 (No Content for DELETE), 202 (Accepted for async operations)
- **Idempotency**: Mutation endpoints must document idempotency behaviour. Non-idempotent mutations must note this explicitly.

### GraphQL

Produce a Schema Definition Language scaffold:

- **Type names**: PascalCase, matching CONTEXT.md terms exactly
- **Field names**: camelCase
- **Query / Mutation / Subscription naming**: `payment(id: ID!)`, `createPayment(input: CreatePaymentInput!)`, `paymentUpdated(id: ID!)`
- **Input types**: Separate input types for mutations — never reuse output types as inputs
- **Pagination**: Connection pattern (edges/nodes/pageInfo) for lists
- **Error handling**: Union return types for mutations (`CreatePaymentResult = Payment | ValidationError | ...`)
- **Versioning**: Document breaking vs. non-breaking changes; flag breaking schema changes

### gRPC

Produce a `.proto` service scaffold:

- **Service name**: PascalCase, matching the bounded context name
- **RPC names**: PascalCase, imperative (`CreatePayment`, `GetPayment`, `ListPayments`)
- **Message names**: PascalCase, matching CONTEXT.md terms exactly
- **Field names**: snake_case
- **Streaming**: Flag which operations are server-streaming, client-streaming, or bidi

---

## Step 4 — Validate Against ADRs and CONTEXT.md

For each endpoint/operation/type in the draft:

1. Check the resource name against CONTEXT.md. Any mismatch → flag and propose correction.
2. Check against API ADRs. Any conflict → surface explicitly.

Present a term validation table:

| API term       | CONTEXT.md match  | Status                                                 |
| -------------- | ----------------- | ------------------------------------------------------ |
| `payments`     | `Payment` entity  | ✅ Aligned                                             |
| `transactions` | Not in CONTEXT.md | ⚠️ Undefined — add to CONTEXT.md or align to `Payment` |

---

## Step 5 — Present for Review

Show the developer the draft spec:

> "Here is the API design. Review resources, operations, and naming. Say 'approve' to write it to disk, or give corrections."

For each correction: re-validate against CONTEXT.md and ADRs before finalising.

---

## Step 6 — Write the API Spec

When the developer approves:

1. Generate slug from the feature or resource name: lowercase, hyphens.
2. Write the spec to: `.velocity/artifacts/api/{slug}.md` (OpenAPI), `.velocity/artifacts/api/{slug}.graphql` (GraphQL), `.velocity/artifacts/api/{slug}.proto` (gRPC)
3. Write the design narrative to: `.velocity/artifacts/api/{slug}.md` using `templates/artifacts/api-spec.md`
4. Update `.velocity/knowledge-base/index.md`:
   - Add: `| api | {title} | .velocity/artifacts/api/{slug}.md | {date} |`

Say: "API design written to `.velocity/artifacts/api/{slug}.*`."

---

## Step 7 — Flag ADR Candidates

After writing the spec, evaluate each significant API decision against the three-criteria gate. If any decision qualifies (hard to reverse, surprising, real trade-off), say:

> "This decision may qualify for an ADR: {decision}. Run /adr-engine to capture it."

Common API ADR triggers:

- Choosing synchronous REST over async events for a write operation
- Adopting a non-standard error shape
- Choosing field-level pagination over page-offset
- Requiring idempotency keys on a specific mutation type

---

## API Design Quality Rules

A design that fails any rule should be revised before writing:

- All resource names match CONTEXT.md terms
- No verbs in REST paths
- All mutation endpoints have documented idempotency behaviour
- All endpoints have error response declarations
- Versioning strategy is explicit and consistent with `api.md`
- Breaking changes are marked as breaking
