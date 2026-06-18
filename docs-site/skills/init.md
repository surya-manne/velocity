# /init — Workspace Bootstrap

The `/init` skill bootstraps a complete Velocity workspace from scratch. It runs 11 steps, taking your repository to a fully configured, multi-assistant AI workspace in a single session — under five minutes, nothing to install, never leave the editor.

::: tip When to Use
Run `/init` once per repository. If `.velocity/` already exists, use [`/sync`](/skills/sync) instead.
:::

## What It Does

```
/init
  ↓ Preflight check
  ↓ Detect active AI tool(s)
  ↓ Project Intelligence — stack fingerprint + repo maturity
  ↓ .velocity/ directory structure
  ↓ context-map.md + CONTEXT.md scaffold per bounded context
  ↓ [brownfield] context-harvest — DRAFT glossary from code signals
  ↓ Agent Factory + Skill Factory + Guardrail Factory
  ↓ [brownfield] Ingest knowledge base (ADRs, git history, docs)
  ↓ Rule Pack manifest (developer reviews before import)
  ↓ Adapters — only for detected AI tools
  ↓ Workspace connection (optional) + RALPH loop activation
  ↓ Summary report
```

## The 11 Steps

### Step 1: Preflight

Checks if `.velocity/` already exists. If it does, stops and suggests `/sync`.

### Step 2: Detect Active AI Tool(s)

Detects which assistants are in use from file signals (`.cursor/`, `CLAUDE.md`, `.github/copilot-instructions.md`, `GEMINI.md`). Multiple tools can be active at once. If no signal is found, you are asked to choose. This drives which adapters run in Step 8 — **only detected tools get adapters**, not all four.

### Step 3: Fingerprint the Stack + Detect Repo Maturity

Runs `project-intelligence` (12-phase stack fingerprinting): language, frontend/backend framework, persistence, messaging, API style, architecture patterns, test framework, monorepo detection, bounded context inference, CI/CD. Writes `.velocity/project-intelligence/stack.md`.

Also classifies **repo maturity** — a branch that controls Steps 5b and 6b:

| Maturity | Signals | Effect |
|----------|---------|--------|
| **Greenfield** | Little/no source code, no docs, shallow git history (<20 commits) | CONTEXT.md scaffold left empty; knowledge base placeholder only |
| **Brownfield** | Meaningful source, existing docs, ADRs, or substantial history | DRAFT terms harvested from code; knowledge base ingested |

### Step 4: Create Directory Structure

Creates the full `.velocity/` tree:

```
.velocity/
├── project-intelligence/
├── project-context/        ← Stack-specific templates pre-filled
├── agents/
├── skills/
├── workflows/
├── guardrails/
├── knowledge-base/
│   ├── index.md
│   ├── adrs/
│   ├── incidents/
│   ├── runbooks/
│   ├── git-digest/
│   ├── product/
│   └── graph-clusters.md   ← Added later by /knowledge-graph (optional)
└── artifacts/
    ├── adrs/    ├── prds/     ├── features/   ├── tasks/
    ├── roadmaps/ ├── context/ ├── handoffs/  ├── impact/
    ├── refactor-proposals/   └── ralph/
sdlc/
├── pipeline.yaml
├── pipeline-config.yaml
└── state/
```

### Step 5: Write context-map.md + CONTEXT.md Scaffold

Writes `.velocity/context-map.md` from detected bounded contexts. For each context, generates a `CONTEXT.md` scaffold from template. For greenfield, the glossary is left empty but the domain summary is seeded from the README. For brownfield, the scaffold is a placeholder — Step 5b fills it.

### Step 5b: Harvest DRAFT Context (Brownfield Only)

Runs `context-harvest` to seed each `CONTEXT.md` with a domain summary and DRAFT glossary terms extracted from:

- Entity/aggregate class names (`domain/`, `model/`, `entities/`)
- API route namespaces (`/api/v1/<noun>/`)
- Database table and column names (migrations/schema)
- Event topic names (`*Producer*`, `*Consumer*`, `*Event*`)
- Knowledge graph clusters (if `.velocity/knowledge-base/graph-clusters.md` exists — higher-confidence structural signals)

Every seeded term is hard-marked `DRAFT`. Nothing is asserted as confirmed domain language until you run `/grill-with-docs`.

### Step 6: Configure Agents, Skills, Guardrails, Project-Context

Runs three factories in sequence:

- **Agent Factory** — Configures agent instances in `.velocity/agents/` plus `ENTRY.md` navigation index
- **Skill Factory** — Configures skill instances with stack-specific commands (test runner, migrations, build)
- **Guardrail Factory** — Generates `guardrails/default.md` and `hooks.json`; preserves any manually tightened values

Also populates `.velocity/project-context/` files from detected signals instead of blank templates — test framework, CI system, API style, lint tooling. Fields without a detected signal are left as `TODO`.

### Step 6b: Ingest Knowledge Base (Brownfield Only)

Runs `ingest` to populate `.velocity/knowledge-base/` from existing project artifacts: ADRs, CONTEXT.md files, 90-day git digest, incidents, runbooks. For very large repos, you are asked to confirm before the full scan runs.

### Step 7: Generate Rule Pack Manifest

Copies the starter `rule-packs.md` with git-workflow enabled and stack-specific packs listed for review. Does **not** auto-import — you review, then run `/rule-pack-engine` or `/sync`.

### Step 8: Run Adapters (Detected Tools Only)

Generates tool-native files **only for the tools detected in Step 2**:

| Tool | Generates |
|------|-----------|
| Cursor | `.cursor/rules/velocity.mdc`, agent files, skill files, `hooks.json` |
| Claude Code | `CLAUDE.md`, `subagents/`, `commands/`, `hooks/` |
| GitHub Copilot | `.github/copilot-instructions.md`, `AGENTS.md`, `.github/prompts/` |
| Gemini | `GEMINI.md`, `.gemini/agents/`, `.gemini/tools/`, `STYLEGUIDE.md` |

All adapter files are ≤80 lines — thin wrappers that point into `.velocity/` rather than duplicating it.

### Step 9: Workspace Connection + RALPH Activation

**Workspace (optional):** If this repo belongs to a multi-repo workspace, a `workspace` block is added to `stack.md` with sync-on-pull configured.

**RALPH:** You are asked whether to enable team-level feedback. If yes, `ralph_enabled: true` is set in `pipeline-config.yaml`. Annotations stay local in `.velocity/artifacts/ralph/`.

### Step 10: Summary Report

Reports: detected tools, stack, repo maturity, bounded contexts, generated artifacts per tool, workspace status. For brownfield repos, also includes DRAFT term count per context, knowledge-base item count, and which project-context fields were auto-filled vs left as TODO.

**Next steps listed in the report:**
1. Run `/velocity` to start the SDLC pipeline
2. Run `/grill-with-docs` to confirm DRAFT terms (brownfield) or `/grill-me` to build the glossary from scratch (greenfield)
3. Review `project-context/`, `guardrails/`, `rule-packs.md`
4. Commit generated files
5. (If workspace connected) Run `/sync` and install `downstream-sync.yml`

## After /init

Commit everything generated. The exact paths depend on which tools were detected:

```bash
git add .velocity/
# Add whichever of these were generated for your tools:
git add .cursor/ CLAUDE.md subagents/ commands/ hooks/ AGENTS.md .github/ GEMINI.md .gemini/
git commit -m "chore: initialize velocity workspace"
```

Then start with [`/grill-me`](/skills/grill-me) (greenfield) or [`/grill-with-docs`](/skills/grill-with-docs) (brownfield) to confirm domain language.
