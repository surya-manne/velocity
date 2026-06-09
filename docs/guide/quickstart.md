# Quickstart

Get Velocity running in your repository in under 5 minutes.

## TL;DR

**Option A — VS Code Extension (fastest)**
1. Install **Velocity AI** (`SuryaManne.velocity-ai`) from the VS Code Marketplace
2. Run **Velocity: Initialize workspace** from the Command Palette
3. In AI Chat, run `/velocity-init` (Cursor / Claude Code) or `#velocity-init` (Copilot)

**Option B — Manual copy**
```bash
# Copy init skill for your assistant, e.g. for Cursor:
mkdir -p .cursor/skills
cp /path/to/velocity/skills/init/SKILL.md .cursor/skills/velocity-init.md

# Run in your assistant
# /velocity-init

# Commit the generated files
git add .velocity/ .cursor/ CLAUDE.md && git commit -m "chore: initialize velocity"
```

---

## Your First Session

Once `/init` is complete, here's the recommended first session with Velocity:

### Greenfield Project (New Codebase)

```
You (in chat): /velocity-init
```

Wait for init to complete, then:

```
You: /grill-me
```

`/grill-me` asks you one sharp question at a time to establish domain language. It covers product fundamentals, bounded contexts, architecture decisions, scale requirements, security constraints, and your first vertical slice.

After the session, CONTEXT.md is populated with your domain's ubiquitous language.

### Brownfield Project (Existing Codebase)

```
You (in chat): /velocity-init
```

Wait for init to complete, then:

```
You: /grill-with-docs
```

`/grill-with-docs` reads your existing code and documentation first, then interviews you to fill gaps. It never invents terms — it discovers the language already used in your codebase.

---

## The Canonical Workflow

After your first session, the standard workflow for any new feature is:

```
1. /domain-model    — Align the feature to CONTEXT.md
2. /to-prd          — Write the product requirement document
3. /to-features     — Break the PRD into vertical slices
4. /to-tasks        — Break features into tasks with blocking relationships
5. /tdd             — Implement each task: red → green → refactor
6. /validate        — Run 12-point guardrail check before PR
```

Or run the full chain autonomously:

```
/loop
```

The `/loop` skill executes the task board end-to-end, pausing at high-risk actions and after each task for a handoff artifact.

---

## Common First Commands

| Goal                       | Command             |
| -------------------------- | ------------------- |
| Start a new feature        | `/to-prd`           |
| Discover existing domain   | `/grill-with-docs`  |
| Check guardrails before PR | `/validate`         |
| Import team standards      | `/rule-pack-engine` |
| Update after stack change  | `/sync`             |
| Run full autonomous loop   | `/loop`             |
| Score change risk          | `/risk-score`       |
| Create architecture doc    | `/architecture-doc` |

---

## Example: First Feature

Here's a complete example of building a feature in a brownfield payment service:

**Step 1: Discover domain**

```
/grill-with-docs
```

Agent reads existing code, finds `PaymentIntent`, `SettlementBatch` terms, asks clarifying questions about business rules.

**Step 2: Write PRD**

```
/to-prd
Add refund support for SettlementBatch items within 30 days
```

Agent produces a structured PRD with acceptance criteria, edge cases, and vertical slice framing.

**Step 3: Plan features**

```
/to-features
```

Agent breaks the PRD into 3 vertical slices: (1) API endpoint, (2) processing logic, (3) notifications.

**Step 4: Create tasks**

```
/to-tasks
```

Agent creates a task queue with blocking relationships, estimated complexity, and risk scores.

**Step 5: Build**

```
/tdd [task-id]
```

In a fresh window, agent implements the task using TDD: writes failing test, makes it pass, refactors.

**Step 6: Validate**

```
/validate
```

Agent checks: slice compliance, CONTEXT.md alignment, test coverage, no secrets, risk within threshold.

---

## Next Steps

- [Key Concepts](/guide/concepts) — Understand skills, agents, adapters, and guardrails
- [Skills Reference](/skills/) — Browse all 48 skills
- [Adapters](/adapters/) — Configure for your specific assistant
- [Enterprise Features](/enterprise/governance) — Audit, approvals, compliance
