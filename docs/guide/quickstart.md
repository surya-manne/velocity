# Quickstart

Get Velocity running in your repository in under 5 minutes.

## Step 1 — Install

### Option 1: Plugin (Recommended)

**VS Code Copilot & Cursor** — Open the **Agent Customizations** panel in the Chat sidebar, go to **Plugins → Install Plugin from Source**, and enter:

```
https://github.com/surya-manne/velocity
```

**Claude Code:**

```text
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

### Option 2: VS Code Extension

1. Open Extensions (`⌘⇧X` / `Ctrl⇧X`), search **Velocity AI** (`SuryaManne.velocity-ai`), click **Install**
2. Open Command Palette (`⌘⇧P` / `Ctrl⇧P`) and run **Velocity: Initialize workspace**

### Option 3: Offline

Copy the full bundle for your assistant into your repository:

<details>
<summary><strong>VS Code Copilot</strong></summary>

```bash
npx degit surya-manne/velocity/plugins/dist/copilot/velocity /tmp/velocity-copilot \
  && cp -R /tmp/velocity-copilot/.github/. .github/ \
  && cp /tmp/velocity-copilot/AGENTS.md ./AGENTS.md \
  && rm -rf /tmp/velocity-copilot
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

```bash
npx degit surya-manne/velocity/plugins/dist/cursor/velocity ~/.cursor/plugins/local/velocity
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

</details>

## Step 2 — Run /init

Open a new AI chat and run the init command:

| Assistant       | Command           |
| --------------- | ----------------- |
| VS Code Copilot | `#velocity:init`  |
| Cursor          | `/velocity-init`  |
| Claude Code     | `/velocity-init`  |

::: info What /init does
Detects your stack, creates `.velocity/`, scaffolds `CONTEXT.md`, generates adapters for your assistant, and wires guardrail hooks. Resumable if interrupted.
:::

## Step 3 — Commit

```bash
git add .velocity/ .cursor/ AGENTS.md .github/ CLAUDE.md commands/ subagents/ hooks/
git commit -m "chore: initialize velocity workspace"
```

---

## Your First Session

### New codebase?

After `/init`, run `/grill-me`. It asks you one focused question at a time to establish domain language — bounded contexts, architecture decisions, scale, security constraints, and your first vertical slice.

### Existing codebase?

After `/init`, run `/grill-with-docs`. It reads your code and documentation first, then fills the gaps. It never invents terms — it discovers the language already in your codebase.

---

## The Canonical Workflow

For any new feature after your first session:

1. `/to-prd` — Write the product requirement document
2. `/to-features` — Break the PRD into vertical slices
3. `/to-tasks` — Break features into tasks with blocking relationships
4. `/tdd` — Implement each task: red → green → refactor
5. `/validate` — Run the 12-point guardrail check before PR

Or run the entire chain autonomously:

```
/loop
```

`/loop` executes every step end-to-end, pausing only at high-risk decisions and after each task for a handoff artifact.

---

## Common Commands

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
