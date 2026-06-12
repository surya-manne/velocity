---
mode: agent
description: "Draft targeted improvements to skill templates, agent configs, and guardrails based on RALPH Learn patterns. Each proposal is a specific diff against the current template with rationale. Produces proposals for developer review. Run after ralph-learn produces a pattern summary."
---


# RALPH Propose

Draft targeted improvements based on extracted failure patterns.

## Context Load

Read before starting:

1. `.velocity/artifacts/ralph/learn-{skill-name}-{date}.md` — the learn report
2. The source skill template(s) that need improvement (from `skills/`)
3. Relevant agent definition(s) from `agents/` if agent config is implicated

---

## Step 1 — Select Patterns to Address

Read the learn report. List the patterns and ask the developer which ones to address in this proposal batch:

"These patterns were identified. Which would you like to address? (Reply 'all', list numbers, or 'skip all to defer')"

---

## Step 2 — Draft Improvement Proposals

For each selected pattern, draft a specific, targeted improvement.

**Proposal format:**

```markdown
## Proposal {N}: {Pattern Name}

**Target:** {skill-name/SKILL.md | agents/<id>.md | templates/<path>}

**Pattern addressed:** {Link to learn report pattern}

**Type of change:** {context-load-addition | instruction-clarification | output-format-change | step-addition | step-removal | step-reorder | schema-field-addition | hook-addition}

**Rationale:**
{Why this change fixes the pattern. Reference specific annotation run IDs.}

**Proposed change:**

Before:
\`\`\`
{Exact current content to be replaced — include sufficient context (5+ lines) to uniquely identify the location}
\`\`\`

After:
\`\`\`
{Exact proposed replacement content}
\`\`\`

**Expected outcome:**
{What will change in the skill's output after this fix. How to verify it worked.}

**Risk:**
{What could break or regress. Low | Medium | High.}

**Test scenario to verify:**
{The specific stack or scenario to re-run after applying this proposal.}
```

---

## Step 3 — Write Proposal Bundle

Write to `.velocity/artifacts/ralph/propose-{skill-name}-{date}.md`:

Include all proposals in one document, with a summary table at the top:

```markdown
# RALPH Proposals — {skill-name}

## Date: {date}

## Source learn report: .velocity/artifacts/ralph/learn-{skill-name}-{date}.md

## Proposals summary

| #   | Pattern | Target | Type   | Risk   |
| --- | ------- | ------ | ------ | ------ |
| 1   | {name}  | {file} | {type} | Low    |
| 2   | {name}  | {file} | {type} | Medium |

---

[Proposal 1]
[Proposal 2]
...
```

---

## Step 4 — Developer Review Request

"Proposals written to `.velocity/artifacts/ralph/propose-{skill-name}-{date}.md`."

"Review each proposal and reply with one of:

- 'approve {N}' — apply proposal N
- 'approve all' — apply all proposals
- 'modify {N}: [your modification]' — apply with changes
- 'reject {N}' — skip this proposal and note why"

After approval: run `/ralph-harden` to apply approved proposals.
