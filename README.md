# Velocity

**The Acceleration Layer for AI Coding Assistants**

Velocity transforms AI coding assistants from generic coding tools into project-aware engineering organizations by providing shared intelligence, agents, skills, workflows, guardrails, and organizational knowledge.

Works with: **Cursor** · Claude Code · GitHub Copilot · Gemini Code Assist · Future AI Agents

Velocity does not replace coding assistants. It becomes the intelligence layer that sits alongside them.

---

## What Velocity Does

```text
Without Velocity          With Velocity
─────────────────         ──────────────────────────────
Developer                 Developer + Velocity Context
    ↓                              ↓
AI Assistant              Claude / Cursor / Copilot / Gemini
    ↓                              ↓
Code                             Code
```

Velocity owns: Project Intelligence · Workspace Intelligence · CONTEXT.md (Ubiquitous Language) · Agents · Skills · Workflows · Guardrails · Knowledge Base · Governance

---

## Quickstart (Cursor)

Velocity now supports two installation paths:

1. **Plugin installation** for VS Code/GitHub Copilot, Cursor, and Claude Code. The plugin places the native Velocity entry file, then the existing `/velocity-init` pipeline generates `.velocity/` and adapter assets.
2. **Local installation** for teams that want copy-pasteable files. Run `local-installer` to generate `velocity-local-install/` with `velocity-init.md`, `velocity-sync.md`, `velocity-validate.md`, and a copy map for client repos.

Manual copy-paste remains available and is the most explicit path.

**Step 1 — Copy the init skill into your repository:**

```bash
mkdir -p .cursor/skills
cp path/to/velocity/skills/init/SKILL.md .cursor/skills/velocity-init.md
```

**Step 2 — Run `/velocity-init` inside Cursor Agent:**

```
/velocity-init
```

This single command:

- Fingerprints your stack (reads `package.json`, `pom.xml`, `go.mod`, etc.)
- Creates `.velocity/` with detected project intelligence
- Generates a `CONTEXT.md` scaffold for your bounded contexts
- Runs Agent Factory to wire the right agents for your stack
- Runs Skill Factory to configure the canonical skill chain
- Runs the Cursor Adapter to generate `.cursor/rules/`, `.cursor/agents/`, `.cursor/skills/`
- Runs the Claude Code Adapter to generate `CLAUDE.md`, `subagents/`, `commands/`, `hooks/`
- Runs the GitHub Copilot Adapter to generate `.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/`
- Runs the Gemini Code Assist Adapter to generate `GEMINI.md`, `.gemini/agents/`, `.gemini/tools/`
- Generates `hooks.json` and `hooks/` with PreToolUse guardrail hooks

**Under five minutes. Nothing to install. Never leave your editor.**

## Quickstart (Claude Code)

**Step 1 — Copy the init command into your repository:**

```bash
mkdir -p commands
cp path/to/velocity/skills/init/SKILL.md commands/velocity-init.md
```

**Step 2 — Run `/velocity-init` inside Claude Code:**

```
/velocity-init
```

Same outcome as the Cursor quickstart — full `.velocity/` layout plus native Claude Code assets (`CLAUDE.md`, `subagents/`, `commands/`, `hooks/`).

**Under five minutes. Nothing to install. Never leave your editor.**

## Quickstart (GitHub Copilot)

**Step 1 — Copy the prompt file into your repository:**

```bash
mkdir -p .github/prompts
cp path/to/velocity/skills/init/SKILL.md .github/prompts/velocity-init.prompt.md
```

**Step 2 — Open Copilot Chat and run:**

```
#velocity-init
```

Same outcome as the Cursor quickstart — full `.velocity/` layout plus native Copilot assets (`.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/`).

**Under five minutes. Nothing to install. Never leave your editor.**

## Quickstart (Gemini Code Assist)

**Step 1 — Copy the init skill into your repository:**

```bash
mkdir -p .gemini
cp path/to/velocity/skills/init/SKILL.md .gemini/velocity-init.md
```

**Step 2 — Open Gemini Code Assist and run:**

```
@velocity-init
```

Same outcome as the Cursor quickstart — full `.velocity/` layout plus native Gemini assets (`GEMINI.md`, `.gemini/agents/`, `.gemini/tools/`).

**Under five minutes. Nothing to install. Never leave your editor.**

---

## Commands

### Cursor

| Command        | What it does                                                     |
| -------------- | ---------------------------------------------------------------- |
| `/velocity-init` | Initialize `.velocity/` and generate all Cursor assets        |
| `/velocity-sync` | Pull latest workspace intelligence and regenerate adapter assets |
| `/velocity-validate` | Run guardrail checks (incl. risk score + compliance pack checks) |
| `/velocity-loop` | Start an autonomous agent loop over the feature board         |
| `/marketplace` | Browse, install, update, and manage Velocity packs               |

### Claude Code

| Command              | What it does                                       |
| -------------------- | -------------------------------------------------- |
| `/velocity-init`     | Initialize `.velocity/` and generate Claude assets |
| `/velocity-sync`     | Pull latest workspace intelligence                 |
| `/velocity-validate` | Run guardrail checks                               |
| `/velocity-loop`     | Start an autonomous agent loop                     |
| `/marketplace`       | Browse, install, update, and manage Velocity packs |

### GitHub Copilot

| Prompt               | What it does                                        |
| -------------------- | --------------------------------------------------- |
| `#velocity-init`     | Initialize `.velocity/` and generate Copilot assets |
| `#velocity-sync`     | Pull latest workspace intelligence                  |
| `#velocity-validate` | Run guardrail checks before PR                      |
| `#velocity-loop`     | Start an autonomous agent loop                      |
| `#marketplace`       | Browse, install, update, and manage Velocity packs  |
| `#grill-with-docs`   | Populate domain language in CONTEXT.md              |
| `#tdd`               | Run TDD loop for a task                             |

### Gemini Code Assist

| Tool / Skill        | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `velocity_sync`     | Pull latest workspace intelligence and regenerate assets |
| `velocity_validate` | Run guardrail checks before PR                           |
| `velocity_loop`     | Start an autonomous agent loop                           |
| `marketplace`       | Browse, install, update, and manage Velocity packs       |
| `grill_with_docs`   | Populate domain language in CONTEXT.md                   |
| `tdd`               | Run TDD loop for a task                                  |
| `to_prd`            | Transform feature brief into a structured PRD            |

---

## The Canonical Skill Chain

The default engineering workflow from idea to merged code:

```text
domain-model / grill-with-docs   ← shared language + assumptions
        ↓
     to-prd                      ← product requirements document
        ↓
   to-features                   ← vertical-slice feature board
        ↓
    to-tasks                     ← tasks with blocking relationships
        ↓
   tdd (per task, fresh window)  ← red-green-refactor
        ↓
improve-codebase-architecture    ← periodic deepening
```

Each step is a skill invoked inside your AI coding assistant. Velocity wires all of them as native commands.

---

## Repository Structure

```text
velocity/
├── README.md
├── schemas/                        ← JSON/YAML schemas for all Velocity primitives
│   └── marketplace-pack.schema.json ← Marketplace pack manifest schema
├── skills/                         ← Master skill templates (the Velocity engine)
│   ├── init/SKILL.md               ← /init command
│   ├── sync/SKILL.md               ← /sync command
│   ├── validate/SKILL.md           ← /validate command (checks 1–12 incl. risk + compliance)
│   ├── plugin-installer/SKILL.md   ← Plugin bootstrap for VS Code, Cursor, Claude Code
│   ├── local-installer/SKILL.md    ← Copy-pasteable local install bundle generator
│   ├── loop/SKILL.md               ← Autonomous agent loop
│   ├── marketplace/SKILL.md        ← Marketplace pack management (browse/install/update)
│   ├── project-intelligence/       ← Stack fingerprinting
│   ├── agent-factory/              ← Agent configuration generator
│   ├── skill-factory/              ← Skill configuration generator
│   ├── cursor-adapter/             ← .cursor/ asset generator
│   ├── claude-code-adapter/        ← CLAUDE.md + subagents/ + commands/ + hooks/ generator
│   ├── copilot-adapter/            ← copilot-instructions.md + AGENTS.md + .github/prompts/ generator
│   ├── gemini-adapter/             ← GEMINI.md + .gemini/agents/ + .gemini/tools/ generator
│   ├── grill-with-docs/            ← Context-aware interview (domain pack seeds injected when active)
│   ├── grill-me/                   ← Greenfield interview
│   ├── domain-model/               ← Domain alignment
│   ├── to-prd/                     ← PRD generation
│   ├── to-features/                ← Feature decomposition
│   ├── to-tasks/                   ← Task decomposition
│   ├── tdd/                        ← TDD loop
│   ├── guardrail-factory/          ← Guardrail + hooks.json generator
│   ├── rule-pack-engine/           ← External standards importer
│   ├── audit-trail/SKILL.md        ← Append-only JSON-L audit log (18 event types)
│   ├── approval-workflow/SKILL.md  ← High-risk change sign-off (in-session + PR-review modes)
│   ├── risk-score/SKILL.md         ← 0–100 risk score (domain + surface + guardrail state)
│   ├── feedback-loop/              ← Typecheck/test/lint gates (in-session)
│   ├── improve-codebase-architecture/
│   ├── architecture-doc/           ← Architecture document generator
│   ├── api-design/                 ← OpenAPI / GraphQL SDL / Protobuf scaffold generator
│   ├── security-design/            ← Threat model + auth/authz design
│   ├── design-intelligence/        ← User flows, screen specs, design system catalogue
│   ├── test-strategy/              ← Test plan generator
│   ├── adr-engine/                 ← ADR generation (three-criteria gate)
│   ├── ingest/                     ← Knowledge base ingestion
│   ├── handoff/                    ← Slice handoff
│   ├── prototype/                  ← Throwaway spike
│   ├── context-merge/              ← CONTEXT.md conflict resolution
│   └── ralph/                      ← RALPH self-improvement loop (internal)
│       ├── SKILL.md                ← Top-level RALPH navigation
│       ├── annotate/SKILL.md       ← Structured annotation capture
│       ├── learn/SKILL.md          ← Pattern extraction from annotations
│       ├── propose/SKILL.md        ← Targeted improvement proposals
│       └── harden/SKILL.md         ← Apply approved proposals to source files
├── agents/                         ← Agent role definitions
│   ├── engineer.md
│   ├── architect.md
│   ├── security.md
│   ├── qa.md
│   ├── product.md
│   ├── ux.md
│   ├── planner.md
│   ├── researcher.md
│   ├── reviewer.md
│   ├── documentation.md
│   ├── debugger.md
│   ├── refactor.md
│   └── subagents/                  ← Stack-activated subagents
├── templates/                      ← What /init writes to user repos
│   ├── velocity/                   ← .velocity/ template
│   │   └── governance/             ← Enterprise governance templates
│   │       ├── enterprise-controls.md ← Role definitions + approval requirement classes
│   │       └── compliance-packs/   ← SOC 2 · HIPAA · PCI-DSS · ISO 27001
│   ├── rule-packs/                 ← Domain and marketplace pack bundles
│   │   ├── fintech/                ← FinTech domain pack (payments, ledger, KYC/AML)
│   │   ├── healthtech/             ← HealthTech domain pack (FHIR, PHI, claims)
│   │   └── ecommerce/              ← E-Commerce domain pack (orders, inventory, pricing)
│   ├── context/CONTEXT.md          ← CONTEXT.md scaffold
│   ├── hooks/hooks.json            ← Cursor hooks template (base; Guardrail Factory extends)
│   ├── claude-code/                ← Claude Code template assets
│   │   ├── CLAUDE.md               ← Lean always-on entry template
│   │   └── hooks/                  ← PreToolUse/PostToolUse hook templates
│   ├── copilot/                    ← GitHub Copilot template assets
│   │   ├── copilot-instructions.md ← Always-on instructions template
│   │   └── AGENTS.md               ← Agent mode instructions template
│   ├── gemini/                     ← Gemini Code Assist template assets
│   │   └── GEMINI.md               ← Lean always-on entry template
│   └── ci/                        ← CI/CD workflow templates
│       ├── github-actions/         ← GitHub Actions (velocity.yml, workspace-sync.yml, downstream-sync.yml)
│       ├── gitlab-ci/              ← GitLab CI (.gitlab-ci.yml)
│       └── jenkins/                ← Jenkins (Jenkinsfile)
└── .velocity/                      ← Velocity's own intelligence (dogfooding)
```

---

## What Gets Generated in Your Repository

After `/init`, your repository contains:

```text
.velocity/
├── project-intelligence/
│   └── stack.md                  ← Detected stack fingerprint
├── project-context/
│   ├── engineering.md              ← Engineering standards
│   ├── testing.md                  ← Testing standards
│   ├── security.md                 ← Security standards
│   └── api.md                      ← API standards
├── context-map.md                ← Bounded contexts index
├── agents/                         ← Configured agent instances
├── skills/                         ← Configured skill instances
├── guardrails/
│   └── default.md                ← Guardrail config (incl. governance section)
├── governance/
│   ├── enterprise-controls.md      ← Role definitions + approval requirement classes
│   └── compliance-packs/           ← Active compliance packs (SOC 2 · HIPAA · PCI-DSS · ISO 27001)
├── marketplace/
│   └── lock.md                     ← Installed pack versions + applied contents
├── knowledge-base/
│   ├── index.md                    ← Knowledge index (entry point for all agents)
│   ├── adrs/                       ← External ADRs normalized by /ingest
│   ├── incidents/                  ← Incident and postmortem records
│   ├── runbooks/                   ← Operational runbooks
│   ├── git-digest/                 ← Monthly git history summaries
│   └── product/                    ← Product decision index
└── artifacts/
    ├── adrs/                       ← Architecture decision records
    ├── prds/                       ← Product requirements docs
    ├── features/                   ← Feature boards
    ├── tasks/                      ← Task definitions
    ├── loop/
    │   └── state.md                ← Autonomous loop run state (resumes on restart)
    ├── audit/
    │   └── index.md                ← Append-only JSON-L audit log index
    ├── approvals/
    │   └── index.md                ← Approval request index
    ├── context/                    ← CONTEXT.md files per bounded context
    ├── handoffs/                   ← Slice handoff documents
    └── context-proposals/          ← CONTEXT.md update proposals

.cursor/
├── rules/
│   └── velocity.mdc                ← Always-on project context (lean, caveman syntax)
├── agents/                         ← Cursor agent configs for all Velocity agents
└── skills/                         ← All Velocity skills as Cursor SKILL.md files

hooks.json                          ← Cursor PreToolUse/PostToolUse guardrail hooks

CLAUDE.md                           ← Claude Code always-on entry document (lean, caveman syntax)
subagents/                          ← Claude Code subagent configs for all Velocity agents
commands/                           ← All Velocity skills as Claude Code slash commands
hooks/
├── pre-tool-use.json               ← Claude Code PreToolUse guardrail hooks
└── post-tool-use.json              ← Claude Code PostToolUse notification hooks

.github/
├── copilot-instructions.md         ← GitHub Copilot always-on instructions (lean, caveman syntax)
└── prompts/                        ← All Velocity skills as Copilot prompt files (.prompt.md)
AGENTS.md                           ← Copilot agent mode instructions for all Velocity agent roles

GEMINI.md                           ← Gemini Code Assist always-on entry document (lean, caveman syntax)
.gemini/
├── agents/                         ← Gemini agent configs for all Velocity agent roles
├── tools/
│   └── velocity-tools.json         ← Gemini tool definitions for all Velocity skills
└── styleguide.md                   ← Project coding style reference

CONTEXT.md                          ← Ubiquitous language for primary bounded context
```

---

## Design Principles

**AI Assistant Agnostic** — Velocity never depends on a specific coding assistant. All integrations happen through adapters.

**Product First** — Velocity starts from ideas, not code. Discovery → PRD → Features → Tasks → Implementation.

**Brownfield Native** — Primary focus is existing enterprise systems: legacy, monorepos, multi-repo, technical debt.

**Vertical Slice by Default** — Every delivery is a thin, complete, end-to-end implementation of a single user-facing capability grounded in tracer bullet discipline.

**Progressive Disclosure** — Generated context files are lean and focused. Agents receive the context they need, when they need it.

**Purely Prompt-Driven** — No daemon, no CLI, no server. Every Velocity capability is a generated file.

---

## CONTEXT.md — Ubiquitous Language

The key v2 innovation. A per-bounded-context glossary used simultaneously by:

1. The codebase — variable names, file names, schema names reflect it
2. Developers — speak it during planning and review
3. Domain experts — use it without implementation knowledge

When all three groups speak the same language, AI agents navigate the codebase accurately.

---

## Agents

### The Engineer (primary)

Picks up tasks from the feature board, implements them end-to-end, runs `tdd`, writes code, tests, and commits, creates PRs.

### Domain Specialists

Product · UX · Architecture · Security · QA

### Cognitive Agents

Planner · Researcher · Reviewer · Documentation · Debugger · Refactor

Each agent's skill wiring and subagent hierarchy is configured by Agent Factory based on the detected stack — not hardcoded.

---

## Token Optimization

Velocity is built for cost efficiency without sacrificing quality:

1. **Caveman syntax** in always-on files — every word is paid for on every session
2. **Tiered artifact injection** — title only / summary / full body on demand
3. **Prompt cache alignment** — stable content first
4. **Fresh context windows per task** — no stale context bleed between slices
5. **Skill minimalism** — imperative-only, no preamble
6. **Selective agent activation** — discovery index only; agent prompts loaded on demand

---

## Guardrails and Automated Enforcement

Velocity generates all guardrails and enforcement hooks automatically — no manual configuration required.

### Guardrail Factory

The `/guardrail-factory` skill generates `.velocity/guardrails/default.md` and `hooks.json` from Project Intelligence:

- **Coverage thresholds** — derived from detected test framework and risk profile
- **Feedback loop gates** — typecheck/test/lint enabled when a typecheck command is detected
- **Security review** — required when cloud deployment, PII domains, or payment signals are present
- **PreToolUse hooks** — base safety hooks + stack-specific hooks (SQL, Kafka, AWS, Node, Java, Python, Docker)

Runs automatically as part of `/init` and `/sync`. No developer configuration required.

### PreToolUse Hook Coverage

| Category      | Examples                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Git safety    | Force push blocked, hard reset blocked, direct-to-main commit warned      |
| SQL databases | DROP TABLE/DATABASE blocked, DELETE without WHERE warned, TRUNCATE warned |
| Kafka         | Topic deletion blocked, offset reset warned                               |
| AWS           | Destructive commands warned, recursive S3 delete blocked                  |
| Node.js       | Package publish warned, deprecation warned                                |
| Java          | Maven deploy/release warned, -DskipTests warned                           |
| Python        | Global pip install warned, Django flush blocked                           |
| Docker        | docker system prune warned, privileged mode warned                        |
| Secrets       | Secret patterns in Write tool warned                                      |

### CI/CD Integration

Velocity ships CI/CD templates for three platforms:

| Platform       | Template                                   |
| -------------- | ------------------------------------------ |
| GitHub Actions | `templates/ci/github-actions/velocity.yml` |
| GitLab CI      | `templates/ci/gitlab-ci/.gitlab-ci.yml`    |
| Jenkins        | `templates/ci/jenkins/Jenkinsfile`         |

All three enforce the same guardrail checks on every PR/MR:

1. Vertical slice validation (no horizontal-only PRs)
2. Test coverage for changed source files
3. Secrets scanning
4. Breaking change detection (API contract, schema, CONTEXT.md)
5. API versioning check

---

## External Standards and Rule Packs

Velocity imports industry best practices and internal company standards automatically — zero manual rule authoring required for any standard stack.

### Rule Pack Engine

The `/rule-pack-engine` skill reads `.velocity/rule-packs.md`, fetches rules from each configured source, normalizes them into Velocity's internal model, deduplicates, and converts rules to the right artifact type.

### Supported Sources

| Source                   | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `agent-rules-books`      | Curated AI agent rules across tech stacks            |
| `cursor-rules-community` | Community-contributed Cursor rules packs             |
| `claude-instructions`    | Claude-optimized instruction libraries               |
| `copilot-instructions`   | GitHub Copilot instruction files                     |
| `local`                  | Internal company standards stored in the repository  |
| `velocity-domain-pack`   | Velocity built-in domain packs (FinTech, HealthTech) |

### How Rules Are Converted

Imported rules are classified and converted to the appropriate Velocity artifact:

| Classification     | Output                                                             |
| ------------------ | ------------------------------------------------------------------ |
| `guardrail`        | Added to `.velocity/guardrails/packs.md` + `hooks.json`            |
| `skill`            | Added to generated skill prompts in `.velocity/rule-packs/skills/` |
| `context-standard` | Appended to `.velocity/project-context/` files                     |
| `always-on`        | Compressed to caveman syntax and appended to `ENTRY.md`            |

### Deduplication

Rules that already exist in Velocity's generated guardrails or skills are skipped. No duplication. Conflicts between packs are flagged for developer review.

### Rule Pack Manifest

`.velocity/rule-packs.md` is generated at init time based on the detected stack. Extend it to add more sources:

```yaml
version: "2.0"

packs:
  - id: react-patterns
    source: cursor-rules-community
    enabled: true
    packs:
      - react
      - typescript

  - id: company-standards
    source: local
    enabled: true
    path: .company/standards/
```

Run `/rule-pack-engine` to import immediately, or `/sync` to run it as part of the delta cycle.

---

## Organizational Memory and Knowledge Engine

Velocity maintains organizational memory as a structured, agent-readable directory under `.velocity/knowledge-base/`. There is no query-time retrieval system, no vector database, and no embedding pipeline — knowledge is stored as markdown and YAML files agents read on demand.

### What Gets Indexed

| Source                        | Location                               | Skill     |
| ----------------------------- | -------------------------------------- | --------- |
| Architecture Decision Records | `.velocity/knowledge-base/adrs/`       | `/ingest` |
| CONTEXT.md files              | per `context-map.md`                   | `/ingest` |
| Git history (compact digest)  | `.velocity/knowledge-base/git-digest/` | `/ingest` |
| Incidents and postmortems     | `.velocity/knowledge-base/incidents/`  | `/ingest` |
| Runbooks                      | `.velocity/knowledge-base/runbooks/`   | `/ingest` |
| Product decisions (PRDs)      | `.velocity/knowledge-base/product/`    | `/ingest` |
| Documentation files           | indexed by path (not copied)           | `/ingest` |

### Access Pattern

Every agent navigates knowledge through `.velocity/knowledge-base/index.md`. Skills read the index first, then navigate to specific documents by path. No agent reads the entire knowledge base at once.

### `/ingest` Skill

Performs full ingestion: discovery, normalization, cross-link building, and index regeneration. Runs automatically as part of `/init` and `/sync`. Run directly after adding incidents, runbooks, or other knowledge documents.

### `/handoff` Skill

At the end of every slice, `/handoff` produces `.velocity/artifacts/handoffs/{slice-id}.md` — a compact brief the next session reads instead of carrying conversation history forward. This enforces the `context_window_reset_between_slices` guardrail.

### Cross-Links

The Knowledge Engine builds cross-references between ADRs, incidents, and code changes. For example: an ADR referenced by an incident's root cause and a PRD's constraints will show both links in the index. The Researcher Agent and Debugger Agent use these links to surface relevant history without reading everything.

---

## Autonomous Agent Loop

The `/loop` skill runs the full canonical skill chain autonomously — unattended, one task at a time, with built-in safety rails:

- **Task queue** — reads from the feature board; picks the next unblocked task
- **Per-task context isolation** — each task runs in a fresh TDD context window; no stale context bleed
- **Self-correction** — on test or lint failure, retries with a fresh TDD context (configurable `max_attempts`)
- **High-risk detection** — signal-based (auth, payments, PII, schema, public API changes); pauses for human approval before continuing
- **Handoff artifacts** — writes `.velocity/artifacts/handoffs/` and `.velocity/artifacts/loop/state.md` at the end of each task; resumes automatically on restart
- **RALPH stubs** — auto-generates pre-structured feedback stubs for each completed task; developer fills in the quality signal after PR review
- **PR per task** — default `pr_per_task: true`; keeps PRs small and reviewable
- **`--dry-run` mode** — validates the execution plan without making changes

Loop configuration lives in the `loop` section of `.velocity/guardrails/default.md` (generated by Guardrail Factory).

---

## Enterprise Governance

Velocity generates enterprise-grade governance controls automatically. No manual configuration required for standard compliance stacks.

### Audit Trail

The `/audit-trail` skill writes append-only JSON-L audit records to `.velocity/artifacts/audit/`. Covers 18 event types including task start/complete, approval grant/deny, guardrail override, loop events, and validate runs. Partitioned by year-month. Called automatically by `/loop`, `/validate`, and `/approval-workflow`.

### Approval Workflow

The `/approval-workflow` skill enforces sign-off for high-risk changes before the loop continues. Two modes:

- **In-session** — developer approval inline (default)
- **PR-review** — out-of-band approval via GitHub PR review for teams with GitHub integration

Role-verified approvals, expiry enforcement, and archive management are included.

### Risk Scoring

The `/risk-score` skill computes a 0–100 risk score from three independent buckets:

| Bucket          | Max | Examples                                       |
| --------------- | --- | ---------------------------------------------- |
| Domain signals  | 50  | auth (25 pts), payments (25 pts), PII (20 pts) |
| Change surface  | 30  | files changed, test coverage delta, public API |
| Guardrail state | 20  | overrides active, compliance pack penalties    |

Scores map to `low / medium / high / critical` bands and drive approval thresholds in `/loop` and `/validate`.

### Compliance Packs

Activate compliance overlay packs in `.velocity/governance/compliance-packs/`:

| Pack       | Standard            | Controls                                               |
| ---------- | ------------------- | ------------------------------------------------------ |
| `soc2`     | SOC 2 Type II       | CC6.x, CC7.x, CC8.x, CC9.x, C1.x                       |
| `hipaa`    | HIPAA Security Rule | Technical Safeguards 164.312.x; 7-year retention       |
| `pci-dss`  | PCI DSS v4.0        | Requirements 3, 4, 6, 7, 8, 10, 12; 1-year retention   |
| `iso27001` | ISO/IEC 27001:2022  | Annex A.8 (Technology Controls) + A.5 (Organizational) |

Compliance packs are additive overlays — they extend the base guardrail config with additional PreToolUse hooks and approval requirements. Activated via the `governance.compliance_packs` section in `.velocity/guardrails/default.md`.

### Enterprise Controls

`.velocity/governance/enterprise-controls.md` defines:

- **Six role tiers** — `engineering-lead`, `security-lead`, `compliance-officer`, HIPAA/PCI variants, `platform-engineer`, `default`
- **Eight approval requirement classes** — mapped to risk bands and compliance contexts
- **Guardrail override policy** — overridable vs. non-overridable guardrails (`secrets_scan_required` and `breaking_change_approval_required` are unconditional)
- **Audit policy** — retention periods, export format

---

## Marketplace

The `/marketplace` skill provides pack management for Velocity. Browse, install, update, and uninstall packs without leaving your AI coding assistant.

### Commands

```
/marketplace browse        ← Recommended packs from stack signals + remote registry
/marketplace search <q>    ← Filter by type, tag, or keyword
/marketplace info <id>     ← Full pack detail
/marketplace install <id>  ← 12-step install: resolve → validate → conflict check → copy → merge
/marketplace update <id>   ← Semver-aware upgrade
/marketplace uninstall <id>← Clean removal (lock-file backed; idempotent)
/marketplace list          ← Installed packs and versions
/marketplace publish       ← Scaffold a new pack + contribution guide
```

### Pack Types

| Type               | What it installs                                            |
| ------------------ | ----------------------------------------------------------- |
| `domain`           | CONTEXT.md template, domain skills, guardrails, grill seeds |
| `skill`            | Additional skill prompts into `.velocity/skills/`           |
| `agent`            | Agent role extensions into `.velocity/agents/`              |
| `workflow`         | Workflow templates into `.velocity/artifacts/`              |
| `guardrail`        | Guardrail overlays + PreToolUse hooks                       |
| `context-template` | CONTEXT.md starter for a new bounded context                |

### Built-In Domain Packs

| Pack         | Terms | Skills                                                             | Guardrails  |
| ------------ | ----- | ------------------------------------------------------------------ | ----------- |
| `fintech`    | 28    | payment-design, ledger-design, reconciliation, kyc-aml             | 8 + 8 hooks |
| `healthtech` | 23    | fhir-design, phi-handling, claims-design, interoperability         | 8 + 5 hooks |
| `ecommerce`  | 30    | order-design, inventory-design, pricing-design, marketplace-design | 7 + 6 hooks |

All domain packs include product, architecture, security, performance, and vertical-slice **grill seeds** injected into `grill-with-docs` sessions when the pack is active.

Domain packs apply a **risk score modifier** (`+15` for FinTech, `+20` for HealthTech) to the base risk score to reflect inherent regulatory sensitivity.

### Installation Behavior

- **CONTEXT.md merge** defaults to `propose` — domain pack glossaries never overwrite an existing CONTEXT.md; a context-proposal is created for developer review via `context-merge`
- **Idempotent** — installing the same pack twice is safe; guardrails and hooks are deduplicated by ID
- **Lock file** — `.velocity/marketplace/lock.md` tracks exact versions and applied contents; `uninstall` reverses every step cleanly

---

## RALPH Loop (Internal)

Velocity builds itself using the RALPH loop:

**R**un → **A**nnotate → **L**earn → **P**ropose → **H**arden

| Sub-skill         | What it does                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `/ralph-annotate` | Captures structured feedback after a Velocity skill run; severity + quality signal       |
| `/ralph-learn`    | Extracts patterns from N accumulated annotations; ranks by critical-first then frequency |
| `/ralph-propose`  | Generates targeted improvement proposals with exact before/after diffs                   |
| `/ralph-harden`   | Applies approved proposals to source skill/agent files; regenerates adapter assets       |

**Loop integration** — `/loop` auto-generates a RALPH stub at the end of every task. The developer fills in the quality signal after reviewing the merged PR. `ralph-learn` skips stubs with empty quality signals.

**Batch thresholds** — minimum 5 annotations per learn batch (patterns are unreliable below this); maximum 20 (mark processed after each batch to prevent double-counting).

RALPH is strictly internal. It does not ship to consumer repositories. `/init` and `/sync` never copy `.velocity/artifacts/ralph/` to consumer repos.

---

## Implementation Status

| Slice | Description                                  | Status      |
| ----- | -------------------------------------------- | ----------- |
| 1a    | Repository Structure + Project Intelligence  | ✅ Complete |
| 1b    | Agent Factory + Skill Factory                | ✅ Complete |
| 1c    | Cursor Adapter + Continuous Regeneration     | ✅ Complete |
| 2     | Grill With Docs + CONTEXT.md Engine          | ✅ Complete |
| 3     | Product Discovery to Kanban                  | ✅ Complete |
| 4     | TDD + Deep Modules                           | ✅ Complete |
| 5     | Architecture and Design Intelligence         | ✅ Complete |
| 6     | Workspace Intelligence (Multi-Repo)          | ✅ Complete |
| 7     | Guardrails, Hooks, and Automated Enforcement | ✅ Complete |
| 8     | Organizational Memory and Handoff            | ✅ Complete |
| 9     | External Standards and Rule Packs            | ✅ Complete |
| 10    | Claude Code Adapter                          | ✅ Complete |
| 11    | GitHub Copilot and Gemini Adapters           | ✅ Complete |
| 12    | Autonomous Agent Loop                        | ✅ Complete |
| 13    | Enterprise Governance                        | ✅ Complete |
| 14    | Marketplace                                  | ✅ Complete |
| 15    | RALPH Loop (Internal)                        | ✅ Complete |
