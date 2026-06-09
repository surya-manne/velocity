# API Design: {{RESOURCE_OR_FEATURE_NAME}}

## Version: v{{VERSION}}

## Status: Draft

## Date: {{DATE}}

## Bounded Context: {{CONTEXT_NAME}}

## API Style: {{REST | GraphQL | gRPC | tRPC}}

## Related Architecture Doc: {{ARCHITECTURE_DOC_PATH}}

---

## Overview

{{1–2 sentences: what this API exposes and who consumes it.}}

**Consumers:**

- {{Consumer name}}: {{what they use this API for}}

**Authentication:** {{JWT / API Key / OAuth2 / mTLS / None}}

**Base URL / Namespace:** `{{base path or schema namespace}}`

---

## Resources / Operations

### REST

| Resource                           | Endpoint   | Method   | Description | Auth required     |
| ---------------------------------- | ---------- | -------- | ----------- | ----------------- |
| {{resource using CONTEXT.md term}} | `{{path}}` | {{verb}} | {{purpose}} | {{yes/no + role}} |

### GraphQL

| Operation           | Type                            | Description | Auth required     |
| ------------------- | ------------------------------- | ----------- | ----------------- |
| `{{operationName}}` | Query / Mutation / Subscription | {{purpose}} | {{yes/no + role}} |

### gRPC

| Service           | RPC           | Streaming                      | Description |
| ----------------- | ------------- | ------------------------------ | ----------- |
| `{{ServiceName}}` | `{{RpcName}}` | Unary / Server / Client / Bidi | {{purpose}} |

---

## Spec File

Full spec location:

- OpenAPI: `.velocity/artifacts/api/{{slug}}.md`
- GraphQL SDL: `.velocity/artifacts/api/{{slug}}.graphql`
- Protobuf: `.velocity/artifacts/api/{{slug}}.proto`

---

## Naming Validation

| API term       | CONTEXT.md term    | Status                                  |
| -------------- | ------------------ | --------------------------------------- |
| `{{api-term}}` | `{{context-term}}` | ✅ Aligned / ⚠️ Undefined / ❌ Conflict |

---

## Versioning Strategy

| Change type               | Backwards compatible? | Version bump required |
| ------------------------- | --------------------- | --------------------- |
| Add optional field        | Yes                   | No                    |
| Add required field        | No                    | Yes                   |
| Remove field              | No                    | Yes                   |
| Rename field              | No                    | Yes                   |
| Change field type         | No                    | Yes                   |
| Add endpoint/operation    | Yes                   | No                    |
| Remove endpoint/operation | No                    | Yes                   |

Current version: `{{v1/v2/...}}`
Breaking changes since last version: {{none / list them}}

---

## Error Handling

### REST error schema

```json
{
  "error": "{{error_code}}",
  "message": "{{human-readable message}}",
  "details": [{ "field": "{{field}}", "message": "{{field-level message}}" }]
}
```

| HTTP Status | Meaning               | When returned                                         |
| ----------- | --------------------- | ----------------------------------------------------- |
| 400         | Bad Request           | Validation failure                                    |
| 401         | Unauthorized          | Missing or invalid token                              |
| 403         | Forbidden             | Token valid, insufficient permission                  |
| 404         | Not Found             | Resource does not exist                               |
| 409         | Conflict              | State conflict (duplicate, version mismatch)          |
| 422         | Unprocessable Entity  | Semantically invalid request                          |
| 429         | Too Many Requests     | Rate limit exceeded                                   |
| 500         | Internal Server Error | Unexpected error (sanitised response, no stack trace) |

---

## Idempotency

| Operation      | Idempotent?            | Mechanism                                       |
| -------------- | ---------------------- | ----------------------------------------------- |
| `{{endpoint}}` | {{yes/no/conditional}} | {{Idempotency-Key header / natural key / none}} |

---

## Rate Limiting

| Endpoint / Operation | Limit          | Window     | Response when exceeded        |
| -------------------- | -------------- | ---------- | ----------------------------- |
| `{{endpoint}}`       | {{n}} requests | {{window}} | 429 with `Retry-After` header |

---

## ADRs Referenced

| ADR        | Title     | How it constrains this API |
| ---------- | --------- | -------------------------- |
| ADR-{{id}} | {{title}} | {{constraint}}             |

---

## Open Questions

| Question     | Owner   | Resolution needed by |
| ------------ | ------- | -------------------- |
| {{question}} | {{who}} | {{when}}             |

---

## Version History

| Version | Date     | Author        | Summary       |
| ------- | -------- | ------------- | ------------- |
| 1       | {{DATE}} | API Architect | Initial draft |
