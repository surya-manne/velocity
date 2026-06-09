# Velocity - AI Acceleration Layer

**Velocity** is an AI acceleration layer that sits between your team and your AI assistants — carrying your architecture decisions, domain language, and safety rules into every session, from the first design conversation through the final merge.

It installs directly into your repository as version-controlled files: project intelligence, agent roles, workflow skills, guardrail hooks, and an SDLC pipeline. Every developer on the team works from the same shared context, and every AI session starts with the full picture.

---

## Overview

Without a harness, every AI session starts cold. The assistant knows nothing about your architecture, your naming conventions, the decisions your team made last month, or the things it should never do. Velocity fixes that.

Once initialized, every session — regardless of who runs it — inherits:

- The architectural decisions your team has already made
- Domain language from your codebase, written into the file your AI tool reads natively
- Guardrail hooks that catch unsafe or off-standard output before it lands in your codebase
- A shared set of agent roles and skill workflows your whole team can rely on

### What's included

| Capability | Description |
|-----------|-------------|
| **Project Intelligence** | Detects your stack (language, framework, persistence, CI/CD) and keeps a knowledge base that agents read at the start of every session |
| **Context Layer** | Writes your project context into the native file each AI tool reads: `.github/copilot-instructions.md` for Copilot, `.cursor/rules/` for Cursor, `CLAUDE.md` for Claude Code |
| **Agent Roles** | Ready-to-use Engineer, Architect, Security, QA, Planner, Researcher, and Reviewer agents, each with a clear scope |
| **Workflow Skills** | 48+ skill chains — `/tdd`, `/to-prd`, `/to-tasks`, `/validate`, `/loop`, `/grill-with-docs`, and more — that walk agents through real engineering workflows |
| **Runtime Guardrails** | Hooks that intercept agent output before it runs, flag unsafe or non-compliant operations, and block progression until the issue is resolved |
| **SDLC Pipeline** | A lifecycle layer with a Smart Router entry point, pipeline variants for different work types, phase state management, human review gates, and a team feedback loop (RALPH Loop) |

---

## SDLC Pipeline

The pipeline sits on top of Velocity's context and skill layer. It gives every piece of work a clear path — from the first question through release — with defined phases, human checkpoints, and state that persists across sessions.

### Smart Router

Run `/velocity` in Cursor or Claude Code, or use the `#velocity` prompt file in Copilot. The router asks three questions, checks your recent git history and open issues, and picks the right pipeline for your work. If it finds an in-progress pipeline on your branch, it offers to resume that first.

### Pipeline Variants

| Work Type | Phases |
|-----------|--------|
| New Feature | Discovery → Design → Planning → Build → Validate → Review → Release |
| Bug Fix | Reproduce → Root Cause → Fix → Validate → Review → Release |
| Extend Existing Feature | Context Load → Impact Analysis → Design Delta → Build → Validate → Review → Release |
| Refactor | Analysis → Proposal → Validate Proposal → Refactor → Validate → Review → Release |

### Phase State

State is saved to `.velocity/sdlc/state/<work-id>.yaml` on your feature branch — versioned alongside your code.

| Feature | How it works |
|---------|-------------|
| **Session resume** | Open a new session and Velocity picks up where you left off |
| **Audit trail** | Every phase transition is timestamped and attributed |
| **Parallel features** | Each feature has its own state file; they don't interfere |
| **Phase rollback** | Roll back to an earlier phase when a later problem traces upstream; only affected phases reset |

A phase only advances when its exit criteria pass. At human review gates, you see a summary of what was produced, what decisions were made, what you're being asked to approve, and what comes next.

### Per-Phase Interview

Before each phase runs, you get up to five questions. They're generated fresh from your current `CONTEXT.md`, open ADRs, and existing artifacts — not pulled from a static list. Each question has a suggested answer so you can move quickly when the default is right.

### RALPH Loop

An optional feedback loop you can turn on during `/velocity-init`. After each phase, rate the output at the review gate. Once you've rated the same skill or phase five or more times, Velocity spots the patterns and suggests improvements to your local skill files and agent configs in `.velocity/skills/` and `.velocity/agents/`. Everything stays in your repo.

### Who owns what

Velocity handles the pipeline structure; your AI assistant handles the work inside each phase.

| Responsibility | Owner |
|---------------|-------|
| Phase definitions and order | Velocity (`pipeline.yaml`) |
| Phase state and transitions | Velocity (Phase Engine) |
| Review gate format | Velocity |
| Artifact storage | Velocity (`.velocity/artifacts/`) |
| Guardrail checks at gates | Velocity |
| RALPH feedback and proposals | Velocity (RALPH Loop) |
| Code generation, test running, tool calls | Your AI assistant |
| Generating phase interview questions | Your AI assistant (reads current context each time) |

This means Velocity isn't tied to any one AI tool. Any assistant that reads the `.velocity/sdlc/` state files can work with the pipeline.

---

## Installation

1. Open the **Extensions** panel in VS Code (`⌘⇧X` / `Ctrl⇧X`)
2. Search for **`Velocity AI`** or enter the extension ID `SuryaManne.velocity-ai`
3. Click **Install**

---

## Getting Started

### Step 1 — Initialize a repository

1. Open your project folder in VS Code or Cursor.
2. Open the Command Palette (`⌘⇧P` / `Ctrl⇧P`) and run:

   ```
   Velocity: Initialize workspace
   ```

   The extension copies the entry skill files into your repo and opens AI Chat.

3. In AI Chat, run the init command for your IDE:

   | IDE | Command |
   |-----|---------|
   | GitHub Copilot | `#velocity-init` |
   | Cursor | `/velocity-init` |

4. Velocity will:
   - Detect your tech stack
   - Create `.velocity/` with agent definitions, skill adapters, and guardrail hooks
   - Write `docs/ARCHITECTURE.md` and `docs/TECHSTACK.md`
   - Create a context file for your AI tool:

     | AI Tool | File |
     |---------|------|
     | GitHub Copilot | `.github/copilot-instructions.md` |
     | Cursor | `.cursor/rules/velocity.mdc` |
     | Claude Code | `CLAUDE.md` |

### Step 2 — Use skills and agents

Use skill commands in AI Chat. Copilot uses `#skill-name`; Cursor uses `/skill-name`.

#### SDLC pipeline

| Command | What it does |
|---------|-------------|
| `velocity` | Runs the Smart Router — asks three questions, picks the right pipeline, starts the first phase |
| `pipeline-status` | Shows the current phase and status of all active pipelines |
| `pipeline-init` | Creates a pipeline state file and starts the first phase for a work item |
| `phase-rollback` | Rolls back a phase when an upstream artifact needs to change |

#### Session management

| Command | What it does |
|---------|-------------|
| `velocity-sync` | Syncs context files with the current codebase |
| `velocity-validate` | Checks the implementation against requirements, test coverage, and guardrails |
| `velocity-loop` | Autonomous loop — works through pipeline phases, pauses at human gates, writes RALPH Loop stubs |

#### RALPH Loop

| Command | What it does |
|---------|-------------|
| `ralph-consumer-annotate` | Records a quality rating for a completed phase at the review gate |
| `ralph-consumer-learn` | Looks for recurring patterns across collected ratings |
| `ralph-consumer-propose` | Drafts improvements to your local skill files and agent configs |
| `ralph-consumer-harden` | Applies approved improvements and regenerates the affected skill files |

#### Discovery and requirements

| Command | What it does |
|---------|-------------|
| `grill-with-docs` | Questions your design assumptions against attached docs, one at a time |
| `grill-me` | Works through the full design tree of a plan, surfacing hidden assumptions |
| `domain-model` | Checks proposed work against your domain model and `CONTEXT.md` |
| `ingest` | Pulls in git history, docs, incident reports, and runbooks into the knowledge base |

#### Planning and design

| Command | What it does |
|---------|-------------|
| `to-prd` | Writes a product requirements doc from context proposals and ADRs |
| `to-features` | Breaks a PRD into vertical slices, each with a clear user outcome |
| `to-tasks` | Turns features into tasks with dependencies, each sized for one context window |
| `roadmap` | Orders a feature board by user value, dependencies, and delivery risk |
| `api-design` | Designs REST, GraphQL, or gRPC contracts and outputs an OpenAPI scaffold |
| `architecture-doc` | Writes an architecture document grounded in `CONTEXT.md` and your ADRs |
| `design-intelligence` | Brings in design system contracts like Figma component maps and Storybook stories |
| `security-design` | Covers data classification, auth design, and compliance obligations |
| `prototype` | Runs a time-boxed spike on a single decision — never merged directly |

#### Implementation

| Command | What it does |
|---------|-------------|
| `tdd` | Test-first development — writes a failing test, implements to pass, verifies; one task per session |
| `improve-codebase-architecture` | Finds modules where a single concept is scattered across too many files |
| `feedback-loop` | Runs type checking after each generated file, then the full test suite |
| `handoff` | Writes the minimum context needed to continue in the next session |

#### Quality and validation

| Command | What it does |
|---------|-------------|
| `validate` | Checks `CONTEXT.md` term consistency, test coverage, security gates, and API standards |
| `test-strategy` | Writes a test strategy covering unit, integration, performance, and security |
| `risk-score` | Scores the current change surface, compliance posture, and guardrail state |
| `audit-trail` | Keeps a full log of actions, guardrail results, artifact changes, and approvals |
| `approval-workflow` | Handles approval gates for loop approvals, breaking-change checks, and PR merges |

#### ADRs and context management

| Command | What it does |
|---------|-------------|
| `adr-engine` | Records architectural decisions that are hard to reverse or easy to misunderstand without context |
| `context-engine` | Flags variable, file, and schema names that drift from your `CONTEXT.md` glossary |
| `context-merge` | Resolves conflicting `CONTEXT.md` changes from parallel sessions |

#### Multi-repository workspaces

| Command | What it does |
|---------|-------------|
| `workspace-setup` | Sets up a `velocity-workspace` repo for teams working across multiple repositories |
| `workspace-intelligence` | Maps bounded contexts across repos and checks `CONTEXT.md` consistency |
| `workspace-context-propagation` | Pushes context changes out to connected repositories on approval |

### Step 3 — Keep context current

Run `#velocity-sync` or `/velocity-sync` at the start of each session or after significant changes. This keeps `CONTEXT.md` and `ARCHITECTURE.md` accurate so agents aren't working from outdated assumptions.

---

## Command Palette Reference

Open the Command Palette (`⌘⇧P` / `Ctrl⇧P`) and type **Velocity**:

| Command | What it does |
|---------|-------------|
| `Velocity: Initialize workspace` | Copies entry skill files into your repo and opens AI Chat |
| `Velocity: Install plugin entry files` | Lets you pick Copilot or Cursor and installs the matching entry files |
| `Velocity: Generate local install bundle` | Creates a `velocity-local-install/` folder you can share with your team |
| `Velocity: Open documentation` | Opens this README |

---

## System Requirements

- VS Code 1.90 or later, or Cursor
- GitHub Copilot Chat or Cursor AI Chat
- A git repository (any language or framework)

---

## Example: building a feature end-to-end

**Starting out**

1. Open AI Chat and run `/velocity` (Cursor or Claude Code) or `#velocity` (Copilot). The Smart Router checks your recent git history and open issues, then asks three questions to figure out the right work type.
2. It picks a pipeline variant — New Feature, say — and starts the first phase. State is saved to `.velocity/sdlc/state/` on your branch.

**Discovery and design**

3. Each phase opens with up to five questions, each with a suggested answer. Accept the defaults to move fast, or fill in your own. Anything left unanswered is noted as an assumption in the phase output.
4. The Design phase produces an architecture doc. At the review gate you see what was built, what decisions were made, and what needs your sign-off. Approve to move on.

**Building**

5. The Engineer agent runs `/tdd` per task — failing test first, then the implementation. The automated gate runs `feedback-loop` checks before the phase closes.
6. For anything that needs more thought, `/grill-with-docs` works through the requirement with you until it's clear.

**Validating and merging**

7. `#velocity-validate` checks that the implementation covers your requirements and flags anything missing.
8. Guardrail hooks run throughout. If the agent produces something unsafe or out of spec, it stops and waits for the issue to be fixed.
9. Optionally rate the output at each review gate. After five ratings, RALPH Loop starts suggesting improvements to your local skill files.

> **End result:** a feature delivered with tests, validated requirements, a full change log, and no hardcoded secrets — driven by your AI assistant, kept on track by Velocity.

---

## FAQ

**Does Velocity send data anywhere?**
No. Everything stays in your repo. Velocity writes local files only — no network calls.

**Will it overwrite my existing customizations?**
No. If a file has been customized (more than 20% of lines changed from the bundled version), Velocity skips it and tells you.

**How do I update Velocity after it's been initialized?**
Run `#velocity-sync` or `/velocity-sync` in AI Chat. The VS Code extension updates automatically.

**Do I need the VS Code extension?**
It handles file placement automatically. Without it, you'd need to copy the skill files from the [GitHub repository](https://github.com/SuryaManne/velocity) manually.

---

## Resources

- [GitHub Repository](https://github.com/SuryaManne/velocity)
- [Issues and Feature Requests](https://github.com/SuryaManne/velocity/issues)
- [Changelog](https://github.com/SuryaManne/velocity/releases)
