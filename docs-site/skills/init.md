# /init — Workspace Bootstrap

The `/init` skill bootstraps a complete Velocity workspace from scratch. It runs 15 steps, taking your bare repository to a fully configured, multi-assistant AI workspace in a single session.

::: tip When to Use
Run `/init` once per repository. If `.velocity/` already exists, use [`/sync`](/skills/sync) instead.
:::

## What It Does

```
/init
  ↓ Preflight check
  ↓ Project Intelligence (12-phase stack fingerprinting)
  ↓ .velocity/ directory structure
  ↓ CONTEXT.md scaffold (one per bounded context)
  ↓ Agent Factory
  ↓ Skill Factory
  ↓ Guardrail Factory + hooks.json
  ↓ Rule Pack Engine (starter manifest)
  ↓ Cursor Adapter
  ↓ Claude Code Adapter
  ↓ GitHub Copilot Adapter
  ↓ Gemini Adapter
  ↓ Workspace connection (optional)
  ↓ Summary report
```

## The 15 Steps

### Step 1: Preflight

Checks if `.velocity/` already exists. If it does, stops and suggests `/sync`. Verifies the repository has source files to analyze.

### Step 2: Project Intelligence

Runs the 12-phase stack fingerprinting:

- Language detection
- Frontend framework
- Backend framework
- Persistence layer
- Messaging system
- API style
- Architecture patterns
- Test framework
- Monorepo detection
- Bounded context inference
- CI/CD configuration

Writes `.velocity/project-intelligence/stack.md`.

### Step 3: Directory Structure

Creates the full `.velocity/` tree:

```
.velocity/
├── project-intelligence/
├── project-context/       ← Copies templates for your stack
├── context/               ← One CONTEXT.md per bounded context
├── guardrails/
├── knowledge-base/
│   ├── adrs/
│   ├── incidents/
│   ├── runbooks/
│   └── git-digest/
└── artifacts/
    ├── prd/
    ├── features/
    ├── tasks/
    ├── handoffs/
    ├── audit/
    └── approvals/
```

### Step 4: context-map.md

Creates the bounded context index from detected domains.

### Step 5: CONTEXT.md Scaffold

Creates an empty glossary file per detected bounded context. Does not invent terms — leaves term definition to `/grill-me` or `/grill-with-docs`.

### Step 6: Agent Factory

Configures agent definitions in `.velocity/agents/` based on detected stack:

- Selects relevant specialist subagents
- Wires appropriate skills per role
- Sets context loading instructions
- Writes ENTRY.md for each agent

### Step 7: Skill Factory

Configures the canonical skill chain with stack-specific variants:

- Configures test runner commands for your testing framework
- Sets migration commands for your database tooling
- Wires build commands for your CI system

### Step 8: Guardrail Factory

Generates guardrail configuration and hook scripts:

- Selects guardrails relevant to detected stack
- Generates `default.md` with full rule set
- Generates `hooks.json` for your primary assistant
- Creates enforcement scripts

### Step 9: Rule Pack Engine

Copies the starter `rule-packs.md` manifest with:

- Git workflow pack (enabled by default)
- Stack-specific pack examples (commented, developer confirms)
- Domain pack examples (fintech, healthtech, ecommerce)

Does **not** auto-import packs — the developer reviews and runs `/rule-pack-engine` separately.

### Step 10: Cursor Adapter

Generates Cursor-native assets:

- `.cursor/rules/velocity.mdc` (≤80 lines, always-apply)
- `.cursor/agents/[id].md` (one per agent, system prompts <1500 tokens)
- `.cursor/skills/[id].md` (configured canonical chain)
- `hooks.json` at repo root

### Step 11: Claude Code Adapter

Generates Claude Code–native assets:

- `CLAUDE.md` (≤80 lines, always loaded)
- `subagents/[id].md` (one per agent)
- `commands/[skill-id].md` (one per skill)
- `hooks/` directory with bash scripts

### Step 12: GitHub Copilot Adapter

Generates Copilot-native assets:

- `.github/copilot-instructions.md` (≤80 lines)
- `AGENTS.md` (≤150 lines, all agent roles)
- `.github/prompts/[skill-id].prompt.md` (one per skill)

### Step 13: Gemini Adapter

Generates Gemini-native assets:

- `GEMINI.md` (≤80 lines, always loaded)
- `.gemini/agents/[id].md` (one per agent)
- `.gemini/tools/[id].md` (capability definitions)
- `STYLEGUIDE.md` (style context for Gemini)

### Step 14: Workspace Connection

Optional — if a velocity-workspace repository is configured, links this project to the workspace context graph.

### Step 15: Summary Report

Produces a structured report:

- Detected stack summary
- Bounded contexts found
- Files generated (count by category)
- Next steps (recommended first commands)
- Any warnings or manual steps required

## Usage

<details open>
<summary><strong>Cursor</strong></summary>

```bash
cp velocity/skills/init/SKILL.md .cursor/skills/velocity-init.md
# In Cursor chat: /velocity-init
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
cp velocity/skills/init/SKILL.md commands/velocity-init.md
# In Claude Code: /velocity-init
```

</details>

<details>
<summary><strong>GitHub Copilot</strong></summary>

```bash
cp velocity/skills/init/SKILL.md .github/prompts/velocity-init.prompt.md
# In Copilot: #velocity:init
```

</details>

## After /init

Commit everything generated:

```bash
git add .velocity/ .cursor/ CLAUDE.md subagents/ commands/ hooks/ \
        AGENTS.md .github/ GEMINI.md .gemini/
git commit -m "chore: initialize velocity workspace"
```

Then start with [`/grill-me`](/skills/grill-me) (greenfield) or [`/grill-with-docs`](/skills/grill-with-docs) (brownfield) to establish your domain language.
