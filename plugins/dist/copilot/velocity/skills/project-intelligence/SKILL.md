---
name: project-intelligence
description: "Fingerprint the technology stack of this repository from source files. Reads package manifests, config files, and directory structure to detect languages, frameworks, patterns, and bounded contexts. Outputs stack.md. Run automatically by /init and /sync; invoke manually to refresh."
---


# Project Intelligence — Stack Fingerprinting

Analyze this repository and produce a technology stack fingerprint.

## Output

Write `.velocity/project-intelligence/stack.md` conforming to `schemas/project-intelligence.schema.json`.

---

## Fingerprinting Protocol

### Phase 1 — Inventory

List all files in the repository root and scan these locations:

```
Root:          package.json, pom.xml, go.mod, Cargo.toml, requirements.txt,
               Gemfile, composer.json, pyproject.toml, build.gradle, build.sbt,
               tsconfig.json, .nvmrc, .python-version, .ruby-version

Config:        docker-compose.yml, Dockerfile, .env.example
               kubernetes/, helm/, terraform/, pulumi/

CI/CD:         .github/workflows/*.yml, .gitlab-ci.yml, .circleci/config.yml,
               Jenkinsfile, .buildkite/pipeline.yml, bitbucket-pipelines.yml

Source dirs:   src/, app/, lib/, pkg/, internal/, cmd/, server/, client/,
               frontend/, backend/, api/, web/, mobile/

Mono/multi:    apps/*, services/*, packages/*, modules/*, domains/*
```

### Phase 2 — Language Detection

| Signal                                 | Language                |
| -------------------------------------- | ----------------------- |
| `package.json` present                 | JavaScript / TypeScript |
| `tsconfig.json` present                | TypeScript (primary)    |
| `pom.xml` or `build.gradle`            | Java / Kotlin           |
| `go.mod`                               | Go                      |
| `requirements.txt` or `pyproject.toml` | Python                  |
| `Gemfile`                              | Ruby                    |
| `Cargo.toml`                           | Rust                    |
| `composer.json`                        | PHP                     |
| `*.cs` files, `.csproj`                | C# / .NET               |

### Phase 3 — Frontend Framework Detection

Scan `package.json` dependencies and `devDependencies`:

| Dependency           | Framework           |
| -------------------- | ------------------- |
| `react`, `react-dom` | React               |
| `next`               | Next.js (React SSR) |
| `vue`                | Vue.js              |
| `@angular/core`      | Angular             |
| `svelte`             | Svelte              |
| `@solidjs/core`      | SolidJS             |
| `nuxt`               | Nuxt (Vue SSR)      |
| `remix`              | Remix (React)       |
| `astro`              | Astro               |

UI library detection: `@mui/material` (MUI), `antd` (Ant Design), `@shadcn/ui` (shadcn), `tailwindcss`, `@chakra-ui/react`.

State management: `redux`, `@reduxjs/toolkit`, `zustand`, `jotai`, `recoil`, `mobx`, `@tanstack/query`, `swr`.

### Phase 4 — Backend Framework Detection

Java/Kotlin `pom.xml` / `build.gradle`:

- `spring-boot-starter-*` → Spring Boot
- `quarkus-*` → Quarkus
- `micronaut-*` → Micronaut

Go `go.mod`:

- `github.com/gin-gonic/gin` → Gin
- `github.com/labstack/echo` → Echo
- `github.com/gofiber/fiber` → Fiber
- `github.com/go-chi/chi` → Chi

Node.js `package.json`:

- `@nestjs/core` → NestJS
- `express` → Express
- `fastify` → Fastify
- `hapi` → Hapi

Python:

- `django` → Django
- `fastapi` → FastAPI
- `flask` → Flask

Ruby:

- `rails` → Rails

### Phase 5 — Persistence Detection

Scan all manifest files for ORM and database driver dependencies:

| Dependency / Pattern                                          | Persistence   |
| ------------------------------------------------------------- | ------------- |
| `pg`, `@prisma/client` (postgres adapter), Hibernate postgres | PostgreSQL    |
| `mysql2`, Spring Data MySQL                                   | MySQL         |
| `mongoose`, `mongodb`                                         | MongoDB       |
| `@aws-sdk/client-dynamodb`                                    | DynamoDB      |
| `redis`, `ioredis`                                            | Redis         |
| `better-sqlite3`, `sqlite3`                                   | SQLite        |
| `@prisma/client`                                              | Prisma ORM    |
| `drizzle-orm`                                                 | Drizzle ORM   |
| `typeorm`                                                     | TypeORM       |
| Spring Data JPA                                               | JPA/Hibernate |
| SQLAlchemy                                                    | SQLAlchemy    |

### Phase 6 — Messaging Detection

| Dependency / Config                                 | Messaging           |
| --------------------------------------------------- | ------------------- |
| `kafkajs`, `spring-kafka`, `confluent-kafka-python` | Apache Kafka        |
| `amqplib`, `spring-rabbit`                          | RabbitMQ            |
| `@aws-sdk/client-sqs`                               | Amazon SQS          |
| `@google-cloud/pubsub`                              | Google Pub/Sub      |
| `nats`                                              | NATS                |
| Bull, BullMQ                                        | Redis-backed queues |

Detect event-driven pattern when: Kafka/RabbitMQ present AND files named `*Producer*`, `*Consumer*`, `*Event*`, `*EventHandler*` exist.

### Phase 7 — API Style Detection

| Signal                                                       | API Style |
| ------------------------------------------------------------ | --------- |
| `graphql`, `@apollo/server`, `type-graphql`                  | GraphQL   |
| `@grpc/grpc-js`, grpc-java                                   | gRPC      |
| `@trpc/server`                                               | tRPC      |
| REST endpoints in source (controllers with HTTP annotations) | REST      |
| Both GraphQL and REST present                                | mixed     |

### Phase 8 — Architecture Pattern Detection

Detect these patterns from directory structure and naming conventions:

**DDD:**

- Directories: `domain/`, `aggregate/`, `valueobject/`, `domainservice/`
- Classes/files: `*Aggregate*`, `*Repository*`, `*DomainEvent*`, `*ValueObject*`

**Event Sourcing:**

- Directories: `events/`, `eventstore/`, `projections/`
- Classes: `*EventStore*`, `*Projection*`, `*Aggregate*` with event application methods

**CQRS:**

- Directories: `commands/`, `queries/`, `handlers/`
- Classes: `*Command*`, `*Query*`, `*CommandHandler*`, `*QueryHandler*`

**Hexagonal / Ports & Adapters:**

- Directories: `ports/`, `adapters/`, `application/`, `infrastructure/`

**Microservices:**

- Multiple `docker-compose.yml` service definitions
- Multiple independent `package.json` / `pom.xml` at service level
- Kubernetes manifests for multiple services

### Phase 9 — Test Framework Detection

| Dependency                      | Test Framework   |
| ------------------------------- | ---------------- |
| `jest`, `@jest/globals`         | Jest             |
| `vitest`                        | Vitest           |
| `mocha`, `chai`                 | Mocha/Chai       |
| JUnit 5 (`junit-jupiter`)       | JUnit 5          |
| JUnit 4 (`junit`)               | JUnit 4          |
| `pytest`                        | pytest           |
| RSpec (`rspec-rails`)           | RSpec            |
| Go `testing` package            | Go testing       |
| Playwright (`@playwright/test`) | Playwright (E2E) |
| Cypress                         | Cypress (E2E)    |

### Phase 10 — Monorepo Detection

Monorepo indicators (high confidence if 2+ present):

| Signal                                      | Tool                 |
| ------------------------------------------- | -------------------- |
| `pnpm-workspace.md`                         | pnpm workspaces      |
| `turbo.json`                                | Turborepo            |
| `nx.json`                                   | Nx                   |
| `lerna.json`                                | Lerna                |
| `workspaces` key in root `package.json`     | npm/yarn workspaces  |
| Multiple `pom.xml` with parent POM          | Maven multi-module   |
| `settings.gradle` with `include` directives | Gradle multi-project |

If monorepo detected: enumerate `apps/`, `services/`, `packages/` directories as separate module candidates.

### Phase 11 — Bounded Context Detection

Derive bounded contexts from:

1. **Explicit service directories**: `services/<name>/`, `apps/<name>/`, `modules/<name>/`
2. **Package/module namespaces**: `com.acme.payments.*`, `src/payments/`, `lib/billing/`
3. **API route namespaces**: `/api/v1/payments/`, `/api/v1/orders/`
4. **Database schema names**: detected from migration files
5. **Kafka topic prefixes**: `payments.*`, `orders.*`

For each detected context, record:

- `id`: kebab-case version of the name
- `name`: PascalCase display name
- `paths`: directories associated with this context
- `evidence`: how it was detected (e.g., "directory: services/payments/")

### Phase 12 — CI/CD Detection

Detect CI/CD platform from:

- `.github/workflows/` → GitHub Actions
- `.gitlab-ci.yml` → GitLab CI
- `.circleci/config.yml` → CircleCI
- `Jenkinsfile` → Jenkins
- `.buildkite/` → Buildkite

---

## Output Format

Populate all detected fields in `.velocity/project-intelligence/stack.md`.

For undetected fields: omit the field (do not write `null` or empty strings).

Record `signals_used` as a list of every file and directory pattern that contributed to the fingerprint.

Set `confidence` to:

- `0.9+` if 5+ strong signals detected
- `0.7–0.89` if 3–4 signals detected
- `0.5–0.69` if 1–2 signals detected
- `< 0.5` if only weak signals (note which fields are uncertain)

Set `detected_at` to current ISO 8601 timestamp.

---

## Delta Mode (for /sync)

When invoked with `--delta` (from `/sync`):

1. Read existing `.velocity/project-intelligence/stack.md`
2. Re-read all source files
3. Identify changed signals only
4. Output: a `stack-delta.md` with only changed/added/removed fields
5. The caller (sync skill) merges delta into `stack.md`

Delta mode avoids regenerating unchanged agent and skill configs.
