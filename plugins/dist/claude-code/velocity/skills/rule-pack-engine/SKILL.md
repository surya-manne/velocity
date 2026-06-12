---
name: rule-pack-engine
description: >-
  Import external rule and standard ecosystems into Velocity. Reads the rule-packs
  manifest (.velocity/rule-packs.md), fetches rules from each configured source
  (Agent Rules Books, Cursor community packs, Claude Instructions, Copilot
  Instructions, internal company standards), normalizes them into Velocity's internal
  model, deduplicates, and converts rules into Skills and Guardrails. Runs as part
  of /init and /sync. Zero manual rule authoring for any standard stack.
metadata:
  surfaces:
    - agent
---

# Rule Pack Engine

Import external standards and community rule packs. Zero manual authoring.

## Context Load

Read before starting:

1. `.velocity/rule-packs.md` — manifest declaring which packs to import
2. `.velocity/project-intelligence/stack.md` — detected stack (used to select relevant packs)
3. `.velocity/guardrails/default.md` — existing guardrails (to detect duplicates)
4. `.velocity/skills/index.md` — existing skills index (to detect duplicates)
5. `.velocity/rule-packs/imported.md` — previously imported pack state (for delta mode)

---

## Purpose

Every standard stack has a well-established body of community knowledge: React best practices,
TypeScript strictness rules, Kafka design patterns, Spring Security guidelines. Writing these
manually for every project wastes developer time and produces inconsistent results.

The Rule Pack Engine imports this knowledge automatically. It reads rules from external sources,
normalizes them into Velocity's format, and converts them to the right artifact type:

- Behavioral rules and patterns → **Skills** (invoked on demand)
- Enforcement rules and gates → **Guardrails** (enforced at commit or PR time)
- Context rules and standards → **Project Context** files (always-on reference)

Rules that already exist in Velocity's generated output are skipped. No duplication.

---

## Supported Sources

| Source ID                | Description                                           | Reference                                    |
| ------------------------ | ----------------------------------------------------- | -------------------------------------------- |
| `agent-rules-books`      | Curated rules for AI agents across tech stacks        | github.com/ciembor/agent-rules-books         |
| `cursor-rules-community` | Community-contributed Cursor rules packs              | github.com/PatrickJS/awesome-cursorrules     |
| `claude-instructions`    | Claude-optimized instruction libraries                | (community and official sources)             |
| `copilot-instructions`   | GitHub Copilot instruction files                      | (community and official sources)             |
| `local`                  | Internal company standards stored in the repository   | Any local path (e.g., `.company/standards/`) |
| `velocity-domain-pack`   | Pre-built Velocity domain packs (FinTech, HealthTech) | Built-in Velocity pack registry              |

---

## Rule Pack Manifest

The developer declares which packs to import in `.velocity/rule-packs.md`.

Velocity generates a starter manifest at setup time based on the detected stack. The developer
can extend it manually.

### Manifest Format

```yaml
version: "2.0"

packs:
  - id: <unique-pack-id>
    source: <source-id>
    enabled: true # set false to disable without removing
    packs: # list of packs from this source (varies by source)
      - <pack-name>
    path: <local-path> # for source: local only
    ref: <git-url> # optional: override default source URL
    overrides: # optional: source-level config overrides
      severity: warn # downgrade all blocks to warns for this pack
```

### Example Manifest (React + TypeScript project)

```yaml
version: "2.0"

packs:
  - id: react-community-rules
    source: cursor-rules-community
    enabled: true
    packs:
      - react
      - typescript
      - tailwindcss

  - id: agent-rules-typescript
    source: agent-rules-books
    enabled: true
    packs:
      - typescript
      - react-best-practices

  - id: internal-standards
    source: local
    enabled: true
    path: .company/standards/

  - id: fintech-domain-pack
    source: velocity-domain-pack
    enabled: true
    packs:
      - fintech
```

---

## Step 1 — Read Manifest

Read `.velocity/rule-packs.md`.

If the manifest does not exist:

1. Generate a starter manifest from the detected stack (see §Auto-Selection Logic below)
2. Write it to `.velocity/rule-packs.md`
3. Inform the developer: "Generated a starter rule-packs.md based on detected stack. Review and adjust, then re-run."
4. Stop — do not proceed without developer confirmation on first run

If the manifest exists and is valid: continue to Step 2.

### Auto-Selection Logic

When generating the starter manifest, select packs based on `stack.md` signals:

| Stack Signal           | Packs Selected                                             |
| ---------------------- | ---------------------------------------------------------- |
| `frontend: react`      | `cursor-rules-community/react`                             |
| `frontend: nextjs`     | `cursor-rules-community/react`, `agent-rules-books/nextjs` |
| `frontend: vue`        | `cursor-rules-community/vue`                               |
| `frontend: angular`    | `cursor-rules-community/angular`                           |
| `typescript: true`     | `cursor-rules-community/typescript`                        |
| `backend: springboot`  | `agent-rules-books/java`, `agent-rules-books/spring`       |
| `backend: django`      | `agent-rules-books/python`, `agent-rules-books/django`     |
| `backend: fastapi`     | `agent-rules-books/python`, `agent-rules-books/fastapi`    |
| `backend: nestjs`      | `agent-rules-books/nestjs`                                 |
| `messaging: kafka`     | `agent-rules-books/kafka`                                  |
| `database: postgresql` | `agent-rules-books/postgresql`                             |
| `cloud: aws`           | `agent-rules-books/aws`                                    |
| `cloud: kubernetes`    | `agent-rules-books/kubernetes`                             |

Always include (regardless of stack):

- `agent-rules-books/git-workflow`

---

## Step 2 — Fetch Rules from Each Source

Process each enabled pack in the manifest in order.

For each pack:

### Fetching Strategy by Source Type

#### `agent-rules-books`

Source URL: `https://github.com/ciembor/agent-rules-books`

Rules are markdown files organized by technology. Each file contains ordered rules.

Fetch strategy:

1. If the repository is locally available (cloned under `.velocity/repo-cache/agent-rules-books/`): read files directly
2. If not locally available: read from the raw GitHub URL pattern:
   `https://raw.githubusercontent.com/ciembor/agent-rules-books/main/{pack-name}/rules.md`
3. If not accessible: log a warning and skip this pack (do not fail the entire run)

#### `cursor-rules-community`

Source URL: `https://github.com/PatrickJS/awesome-cursorrules`

Rules are `.cursorrules` files or markdown files organized by technology.

Fetch strategy: same as `agent-rules-books`. Path pattern:
`https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/master/rules/{pack-name}/.cursorrules`

#### `claude-instructions`

Rules are markdown instruction blocks formatted for Claude's CLAUDE.md.

Fetch from known community sources. If unavailable, log and skip.

#### `copilot-instructions`

Rules are markdown instruction blocks in `.github/copilot-instructions.md` format.

Fetch from known community sources. If unavailable, log and skip.

#### `local`

Read all markdown (`.md`) and YAML (`.md`, `.yml`) files at the declared `path`.

If the path does not exist:

- Log a warning: "Local standards path `{path}` not found. Skipping pack `{id}`."
- Do not fail — the developer may add the path later.

#### `velocity-domain-pack`

Built-in packs distributed with Velocity. Read from `templates/rule-packs/{pack-name}/`.

Report fetch results for each pack before proceeding:

```
Fetch summary:
  ✅ react-community-rules (cursor-rules-community/react): 42 rules
  ✅ agent-rules-typescript (agent-rules-books/typescript): 31 rules
  ✅ internal-standards (local): 18 rules
  ⚠ fintech-domain-pack: pack not found — skipping
```

---

## Step 3 — Normalize Rules

For each fetched rule, produce a normalized rule record.

### Normalization Process

1. **Parse** the source document into individual rules. Rules are identified as:
   - A numbered or bulleted list item in a markdown file
   - A YAML object with `rule:` or `description:` key
   - A heading followed by a paragraph (treat heading as rule title, paragraph as body)

2. **Normalize** each rule into the canonical format:

```yaml
id: <source-id>/<pack-name>/<sequential-N>
source_pack: <pack-id from manifest>
source_document: <filename or URL>
title: <extracted title — first sentence of the rule, ≤80 chars>
body: <full rule text, preserved verbatim>
classification: <see §Classification Logic>
scope: <see §Scope Assignment>
severity: <block | warn | info> # guardrails only
tags:
  - <technology tag, e.g., react, typescript, kafka>
  - <topic tag, e.g., testing, security, naming, architecture>
```

3. **Title extraction rules:**
   - If the source line is a heading: use heading text
   - If the source line starts with a verb (imperative): use first clause
   - Otherwise: use first 10 words + "..."

4. **Tag extraction:**
   - Tags are derived from: the pack name, detected technology keywords in the rule body, and topic keywords (testing, security, naming, api, performance, accessibility, etc.)

---

## Step 4 — Classify Rules

Assign each normalized rule to one of four classification types.

### Classification Logic

| Classification     | When to assign                                                                         | Output artifact                          |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `skill`            | Rule describes a pattern, practice, or design principle to apply when building         | Added to a generated skill prompt        |
| `guardrail`        | Rule describes a gate, check, or prohibition that should be enforced automatically     | Added to `.velocity/guardrails/packs.md` |
| `context-standard` | Rule describes a naming convention, terminology preference, or team communication norm | Added to `.velocity/project-context/`    |
| `always-on`        | Rule is a universal directive that applies to every agent session                      | Added to the always-on context document  |

### Classification Signals

**Classify as `guardrail`** when the rule body contains any of:

- Prohibition keywords: "never", "do not", "must not", "avoid", "block", "prevent", "disallow", "forbidden"
- Enforcement keywords: "always check", "verify before", "require", "ensure", "validate"
- Automation markers: "CI should", "lint rule", "test gate", "pre-commit"

**Classify as `skill`** when the rule body contains any of:

- Pattern keywords: "use", "prefer", "implement", "design", "structure", "organize", "pattern"
- Process keywords: "follow", "apply", "write", "define", "create", "generate"
- Decision framing: "when X, then Y", "if X, use Y"

**Classify as `context-standard`** when the rule body contains any of:

- Naming keywords: "name", "naming", "call it", "refer to", "terminology", "vocabulary", "language"
- Communication keywords: "say", "term", "definition", "glossary"

**Classify as `always-on`** when the rule:

- Applies to every task (e.g., "always read CONTEXT.md before writing code")
- Is a universal safety directive (e.g., "never write secrets to files")
- Is fewer than 20 words and unconditional

When a rule matches multiple classifications, prefer `guardrail` > `always-on` > `skill` > `context-standard`.

---

## Step 5 — Deduplicate

Before writing any output, check for duplicates.

### Duplication Detection

A rule is a **duplicate** if:

1. **Exact match:** The same rule ID was imported in a previous run (check `.velocity/rule-packs/imported.md`)
2. **Semantic match:** A rule with the same title or >80% body similarity already exists in:
   - `.velocity/guardrails/default.md` (Velocity-generated guardrails)
   - `.velocity/guardrails/packs.md` (previously imported pack guardrails)
   - `.velocity/skills/` (existing skill configs)

### Duplication Resolution

| Scenario                                   | Action                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Exact match from previous import           | Skip — already imported                                                        |
| Semantic match in `default.md`             | Skip — Velocity's generated rule takes precedence                              |
| Semantic match in `packs.md`               | Skip — first import wins; log which pack it came from                          |
| Conflict (two packs contradict each other) | Import both with a `conflict: true` flag; notify the developer to resolve      |
| Stricter version in new pack               | Import the stricter version; log that it overrides a less-strict existing rule |

Log all deduplication actions in the completion report.

---

## Step 6 — Convert Rules to Skills

For each rule classified as `skill`:

1. Group rules by technology tag (e.g., all `react` skill rules together)
2. For each technology group, check if a generated skill already exists for that technology in `.velocity/skills/`
3. If a skill exists: append the rules to its `imported_rules` section
4. If no skill exists: generate a new stack-specific skill config

### Generated Skill Config (for imported skill rules)

Write to `.velocity/skills/{source-pack-id}-{tech-tag}.md`:

```yaml
id: <source-pack-id>-<tech-tag>
name: <Tech Tag> Patterns (<source-pack-id>)
description: Imported patterns from <source-pack-id> for <tech-tag>
source: rule-pack-engine
source_pack: <pack-id>
generated_at: <ISO 8601 timestamp>
category: engineering

context_load:
  - path: .velocity/project-context/engineering.md
    required: true

imported_rules:
  - id: <rule-id>
    title: <rule-title>
    body: <rule-body>
    tags: [<tags>]
  # ... more rules

skill_md_path: .velocity/rule-packs/skills/<source-pack-id>-<tech-tag>.md
```

### Generated SKILL.md for Imported Rules

Write to `.velocity/rule-packs/skills/{source-pack-id}-{tech-tag}.md`:

```markdown
# {Tech Tag} Patterns — {Source Pack}

Patterns imported from {source-pack-id}. Apply when implementing {tech-tag} features.

## Context Load

- `.velocity/project-context/engineering.md`

## Rules

{For each rule, formatted as:}

### {rule-title}

{rule-body}

---
```

---

## Step 7 — Convert Rules to Guardrails

For each rule classified as `guardrail`:

1. Map rule severity:

| Rule body signal                                     | Severity |
| ---------------------------------------------------- | -------- |
| "never", "must not", "forbidden", "block", "prevent" | `block`  |
| "avoid", "do not", "should not", "warn"              | `warn`   |
| "prefer not", "consider", "be careful", "check"      | `info`   |

2. If the pack manifest has a `severity: warn` override: downgrade all `block` rules to `warn`

3. Convert to hook format for guardrail rules that have pattern-matchable content:
   - If the rule references a specific command, pattern, or file type: generate a PreToolUse hook
   - If the rule is a general principle without a matchable pattern: add as a declarative guardrail (no hook)

### Generated Guardrail Config

Write to `.velocity/guardrails/packs.md`:

```yaml
version: "2.0"
generated_at: <ISO 8601 timestamp>
sources:
  - pack: <pack-id>
    rules_imported: <N>

guardrails:
  - id: <rule-id>
    source_pack: <pack-id>
    title: <rule-title>
    type: declarative # or: hook (if pattern-matchable)
    severity: <block|warn|info>
    description: <rule-body>

hooks:
  - id: <rule-id>-hook
    source_pack: <pack-id>
    event: PreToolUse
    tool: Bash
    pattern: <regex-pattern>
    action: <block|warn>
    message: <actionable message — what the developer should do instead>
```

**Message quality rule:** Every generated hook message must state both what is blocked AND what to do instead. `"X blocked. Use Y instead."` — never just `"X blocked."`.

### Merge with hooks.json

After writing `packs.md`, update `hooks.json` by appending the new hooks from packs to the hooks generated by Guardrail Factory.

Do not rewrite hooks that already exist (identified by `id`). Add only new ones.

---

## Step 8 — Convert Rules to Context Standards

For each rule classified as `context-standard`:

1. Group by topic (naming, terminology, communication)
2. Append to the relevant project-context file:
   - Naming rules → `.velocity/project-context/engineering.md`
   - Terminology rules → `.velocity/project-context/engineering.md`
   - Security naming rules → `.velocity/project-context/security.md`
   - API naming rules → `.velocity/project-context/api.md`
   - Testing naming rules → `.velocity/project-context/testing.md`

Write rules under a `## Imported Standards — {pack-id}` section at the end of the file. Never modify existing content above the imported section marker.

---

## Step 9 — Convert Always-On Rules

For each rule classified as `always-on`:

1. Collect all always-on rules across packs
2. Deduplicate against existing always-on context (in `.velocity/agents/ENTRY.md`)
3. Append unique rules to a `## Imported Directives` section in `.velocity/agents/ENTRY.md`

Token discipline: always-on rules must be compressed to caveman syntax. If the original rule is more than 20 words, rewrite it as a single imperative line ≤15 words before appending.

Original: "Before writing any code, make sure to read the CONTEXT.md file to understand the domain terminology..."
Compressed: "Before code: read CONTEXT.md. Variable names must match glossary terms."

---

## Step 10 — Update Imported Pack State

Write `.velocity/rule-packs/imported.md`:

```yaml
version: "2.0"
last_run: <ISO 8601 timestamp>

imported_packs:
  - id: <pack-id>
    source: <source>
    packs:
      - <pack-name>
    rules_imported: <N>
    rules_skipped_duplicate: <N>
    rules_skipped_conflict: <N>
    skill_configs_generated: <N>
    guardrails_added: <N>
    hooks_added: <N>
    last_imported_at: <ISO 8601 timestamp>

conflicts:
  - rule_id: <rule-id>
    pack_a: <pack-id>
    pack_b: <pack-id>
    description: <what the conflict is>
    status: unresolved # developer must resolve
```

---

## Output

```
Rule Pack Engine — {project-name}

Packs processed:
  ✅ {pack-id} ({source}/{packs}): {N} rules fetched
  ⚠  {pack-id}: not accessible — skipped
  ✅ {pack-id} ({source}/local): {N} rules fetched

Normalization:
  Total rules: {N}
  Classified as skills: {N}
  Classified as guardrails: {N}
  Classified as context-standards: {N}
  Classified as always-on: {N}

Deduplication:
  Rules skipped (already imported): {N}
  Rules skipped (duplicate of Velocity-generated rule): {N}
  Conflicts flagged for developer review: {N}

Skills generated:
  .velocity/rule-packs/skills/{tech-tag}.md — {N} rules
  [list each generated skill file]

Guardrails added:
  .velocity/guardrails/packs.md — {N} declarative guardrails, {N} hooks
  hooks.json updated — total hooks now: {N}

Context standards added:
  .velocity/project-context/engineering.md — {N} rules appended
  .velocity/project-context/security.md — {N} rules appended

Always-on directives added:
  .velocity/agents/ENTRY.md — {N} directives appended

{If conflicts detected:}
⚠ Conflicts requiring developer review:
  - {rule-id}: {pack-a} says "X" / {pack-b} says "Y"
    Resolve in .velocity/rule-packs/imported.md → set preferred_pack to the one you want

Rule pack import complete. External standards are now active.
```

---

## Delta Mode (for /sync)

When invoked with `--delta`:

1. Read `.velocity/rule-packs/imported.md` for previous import state
2. Read `.velocity/rule-packs.md` for current manifest
3. Detect changes:
   - New packs added to manifest: fetch and process only new packs
   - Packs removed from manifest: log which packs were removed (do not auto-delete generated output — ask developer)
   - `enabled: false` set on a previously enabled pack: skip this pack in delta run
   - Source URL change: treat as new pack (re-fetch)
4. For unchanged packs: skip (do not re-process)
5. Run Steps 3–9 only for changed/new packs
6. Update `.velocity/rule-packs/imported.md`

---

## Error Handling

| Scenario                           | Action                                                          |
| ---------------------------------- | --------------------------------------------------------------- |
| Source URL not accessible          | Log warning, skip pack, continue with remaining packs           |
| Manifest YAML syntax error         | Report specific line/field, stop, ask developer to fix          |
| Unknown `source` value in manifest | Log warning: "Unknown source type `{x}`. Supported: {list}"     |
| Local path does not exist          | Log warning, skip pack                                          |
| Rule cannot be classified          | Default to `context-standard`; log the unclassified rule        |
| All packs unavailable              | Complete with warning: "No rules imported — all sources failed" |
