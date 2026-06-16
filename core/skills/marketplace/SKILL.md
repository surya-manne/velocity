---
name: marketplace
description: >-
  Browse, search, install, update, and publish Velocity Marketplace packs. Packs
  are versioned bundles of agents, skills, workflows, guardrails, domain knowledge,
  and CONTEXT.md templates. Invoke from /marketplace in Cursor, /velocity-marketplace
  in Claude Code, or the Marketplace prompt file in Copilot.
metadata:
  surfaces:
    - agent
---

# Marketplace

Browse and install community-built and official Velocity packs.

## Context Load

Read before starting:

1. `.velocity/marketplace/lock.md` — currently installed packs (create if missing)
2. `.velocity/project-intelligence/stack.md` — detected stack (used for recommendations)
3. `.velocity/guardrails/default.md` — existing guardrails (conflict detection)

---

## What the Marketplace Does

The Marketplace is the distribution layer for Velocity extensions. Packs bundle any
combination of:

- **Domain Packs** — CONTEXT.md templates, domain guardrails, grill-with-docs question seeds, domain-specific skills
- **Skill Packs** — one or more SKILL.md files extending the canonical skill chain
- **Agent Packs** — additional agent and subagent definitions
- **Workflow Packs** — prompt sequences for repeatable multi-step processes
- **Guardrail Packs** — additional guardrail and PreToolUse hook sets

Pack format is defined in `schemas/marketplace-pack.schema.json`. Every pack has an `id`,
`version`, `type`, `description`, and `contents`. Built-in domain packs live in
`templates/rule-packs/`. Community packs are fetched from the Velocity registry.

---

## Commands

Invoke with one of: `browse`, `search`, `install`, `update`, `uninstall`, `list`, `publish`, `info`.

If no command is provided: run `browse` (show the recommended packs for this project).

---

## browse

Show packs recommended for this project based on detected stack and domain signals.

### Step 1 — Read stack signals

Read `.velocity/project-intelligence/stack.md`. Extract:

- `frontend`, `backend`, `database`, `messaging`, `cloud` fields
- Any domain signals (see each pack's `signals` section)

### Step 2 — Load built-in pack registry

Read all `pack.md` files from `templates/rule-packs/*/pack.md`.

If the Velocity registry is accessible (network available):

- Fetch the registry index from `https://registry.velocity.dev/index.md`
- Merge remote pack metadata with local registry (remote packs take precedence on version)

**Local-first registry:** Before any network fetch, load `templates/marketplace/registry.json` as the local pack catalog. Built-in packs (fintech, healthtech, ecommerce, git-workflow, soc2, hipaa, pci-dss, iso27001) are always available offline from this file.

If the registry is not accessible (or `--offline` flag passed, or `VELOCITY_REGISTRY_OFFLINE=true`):

- Use `templates/marketplace/registry.json` exclusively
- Warn: "Remote registry unavailable — showing local packs only. Run `/marketplace` with `--online` to retry when network is available."

### Step 3 — Score recommendations

For each pack in the registry:

1. Check `signals.file_patterns` against the project file tree
2. Check `signals.import_patterns` against source files
3. Check `signals.dependency_names` against detected dependency files
4. Check `signals.context_md_terms` against `.velocity/artifacts/context/CONTEXT.md`
5. Check `signals.stack` against `stack.md` fields

Score: 1 point per matching signal type. Max score = 5. Sort by score descending.

### Step 4 — Filter installed packs

Mark already-installed packs (from `.velocity/marketplace/lock.md`) as `[installed]`.
Do not re-recommend installed packs as primary suggestions — list them separately.

### Step 5 — Display

```
Velocity Marketplace — Recommended for {project-name}

Recommended packs:

  🎯 fintech v1.0.0            [domain]     Official
     FinTech Domain Pack — payments, ledger, KYC/AML, PCI-DSS guardrails
     Signals matched: payment files, stripe dependency, Ledger in CONTEXT.md
     → velocity marketplace install fintech

  🎯 healthtech v1.0.0         [domain]     Official
     HealthTech Domain Pack — FHIR, PHI handling, HIPAA guardrails
     Signals matched: fhir imports, patient files
     → velocity marketplace install healthtech

  ── Also available ──────────────────────────────────────────────

  ecommerce v1.0.0             [domain]     Official
  kafka-patterns v2.1.0        [skill]      Official
  react-accessibility v1.3.0   [skill]      Community — @accessibility-org
  ddd-patterns v1.0.0          [workflow]   Official

  ── Already installed ───────────────────────────────────────────

  [none]

Run: velocity marketplace install <pack-id>
     velocity marketplace search <term>
     velocity marketplace info <pack-id>
```

---

## search

Filter the registry by type, tag, or keyword.

Usage: `velocity marketplace search <term> [--type domain|skill|agent|workflow|guardrail] [--tag <tag>]`

### Step 1 — Load registry (same as browse Step 2)

### Step 2 — Filter

Match `<term>` against: pack `id`, `name`, `description`, `tags`.
Apply `--type` and `--tag` filters if provided.

### Step 3 — Display

Same format as browse, filtered to matches only.

If no matches:

```
No packs found matching "{term}".
Showing similar packs: [top 3 packs by tag overlap]
```

---

## info

Show full details for a specific pack.

Usage: `velocity marketplace info <pack-id>`

### Step 1 — Fetch pack manifest

Check `.velocity/marketplace/installed/{pack-id}/pack.md` (if installed).
Otherwise fetch from registry or `templates/rule-packs/{pack-id}/pack.md`.

### Step 2 — Display

```
Pack: fintech v1.0.0 [domain]  Official ✓

FinTech Domain Pack — payments, ledger, KYC/AML, PCI-DSS guardrails, and
domain-seeded CONTEXT.md template for the payments bounded context.

Author:  Velocity Team (https://velocity.dev)
License: MIT
Min Velocity: 2.0

Tags: fintech, payments, banking, pci-dss, compliance

Contents:
  CONTEXT.md template   → payments bounded context (FHIR glossary, 25 terms)
  Skills (4)            → payment-design, ledger-design, reconciliation, kyc-aml
  Guardrails (8)        → PAN storage block, idempotency, ledger immutability, ...
  Hooks (8)             → PreToolUse: PAN in logs, ledger UPDATE, hardcoded amounts, ...
  Grill seeds           → 6 product, 7 architecture, 6 security, 3 performance, 3 slice questions

Dependencies: none

Detection signals:
  File patterns:   **/payment*.{ts,js,py,java,go}, **/ledger*.*, ...
  Dependencies:    stripe, plaid, braintree, square
  CONTEXT.md terms: Payment, Settlement, Chargeback, ...

Status: not installed

→ velocity marketplace install fintech
```

---

## install

Install a pack into this repository.

Usage: `velocity marketplace install <pack-id> [--version <version>]`

### Step 1 — Resolve pack

Find the pack manifest:

1. Check `templates/marketplace/registry.json` — local registry (always available)
2. Check `templates/rule-packs/{pack-id}/pack.md` — built-in domain pack files
3. If not found locally and network is available: fetch from registry `https://registry.velocity.dev/packs/{pack-id}/{version}/pack.md`
4. If still not found: error — "Pack `{pack-id}` not found in local registry or remote registry. Run `marketplace search {pack-id}` to find similar packs."

If `--version` is not specified: install the latest stable version from the local registry entry (or remote if newer).

### Step 2 — Validate manifest

Validate the pack manifest against `schemas/marketplace-pack.schema.json`.

If invalid: error — "Pack `{pack-id}` has an invalid manifest: {validation errors}. Contact the pack author."

### Step 3 — Check Velocity version compatibility

Compare `pack.velocity_version_min` against the current Velocity version (read from `.velocity/velocity-version`).

If incompatible: error — "Pack `{pack-id}` requires Velocity >= {min}. Current version: {current}. Run `/sync` to update Velocity."

### Step 4 — Check conflicts

For each pack ID in `pack.conflicts`:

- Check if that pack is in `.velocity/marketplace/lock.md`
- If yes: error — "Pack `{pack-id}` conflicts with installed pack `{conflict-id}`. Reason: {reason}. Uninstall `{conflict-id}` before installing `{pack-id}`."

### Step 5 — Resolve dependencies

For each dependency in `pack.dependencies`:

- Check if the dependency is already installed at a compatible version
- If not installed: recursively install (prompt developer before proceeding)

```
Pack fintech depends on:
  (no dependencies)

Proceed with installation? [Y/n]
```

If the developer declines: stop.

### Step 6 — Copy pack contents

Create directory: `.velocity/marketplace/installed/{pack-id}/`

Copy pack files:

- Pack manifest → `.velocity/marketplace/installed/{pack-id}/pack.md`
- CONTEXT.md template (if present) → `.velocity/marketplace/installed/{pack-id}/CONTEXT.md`
- Skills → `.velocity/marketplace/installed/{pack-id}/skills/`
- Agent definitions → `.velocity/marketplace/installed/{pack-id}/agents/`
- Workflow prompts → `.velocity/marketplace/installed/{pack-id}/workflows/`
- Guardrail YAML → `.velocity/marketplace/installed/{pack-id}/guardrails.md`

### Step 7 — Apply CONTEXT.md template

If the pack includes a `contents.context_template`:

Read `pack.contents.context_template.merge_strategy`:

- **`replace-if-empty`**: If no CONTEXT.md exists for this bounded context, write the template as the initial CONTEXT.md. Write to `.velocity/artifacts/context/{bounded-context}/CONTEXT.md`.
- **`propose`** (default): Write a context proposal to `.velocity/artifacts/context-proposals/{pack-id}-install.md`. Notify the developer to run `context-merge` to incorporate the domain terms.
- **`append`**: Append terms not already present in the existing CONTEXT.md under a `## Imported from {pack-id}` section.

### Step 8 — Apply guardrails

If the pack includes a `contents.guardrails`:

Per `merge_strategy`:

- **`append`**: Merge pack guardrails into `.velocity/guardrails/packs.md`. Do not overwrite existing guardrails. Append new hooks to `hooks.json`.
- **`replace`**: Replace the `packs.md` section for this pack ID.

Log which guardrails and hooks were added.

### Step 9 — Register skills and agents

For each skill in `pack.contents.skills`:

- Register the skill path in `.velocity/skills/index.md` under a `## Marketplace Skills` section
- If the skill has a `replaces` field: annotate the original skill as `[overridden by {pack-id}]`

For each agent in `pack.contents.agents`:

- Register the agent in `.velocity/agents/` following the standard agent YAML format
- Note: marketplace agents are advisory additions — they do not replace the core Velocity agent roster

### Step 10 — Update lock file

Write or update `.velocity/marketplace/lock.md`:

```yaml
version: "2.0"
updated_at: <ISO 8601 timestamp>

installed:
  - id: fintech
    version: "1.0.0"
    type: domain
    installed_at: <ISO 8601 timestamp>
    contents_applied:
      context_proposal: .velocity/artifacts/context-proposals/fintech-install.md
      guardrails_added: 8
      hooks_added: 8
      skills_registered: 4
```

### Step 11 — Trigger adapter regeneration

If `pack.install.requires_regeneration` is true (default): invoke the cursor-adapter skill (or the adapter for the current environment) to update `.cursor/` assets with the new skills and guardrails.

### Step 12 — Post-install instructions

```
✅ fintech v1.0.0 installed

Applied:
  Guardrails: 8 rules added to .velocity/guardrails/packs.md
  Hooks:      8 PreToolUse hooks added to hooks.json
  Skills:     4 registered (payment-design, ledger-design, reconciliation, kyc-aml)
  CONTEXT.md: Proposal written to .velocity/artifacts/context-proposals/fintech-install.md

Next steps:
  1. Run context-merge to review and apply the CONTEXT.md domain terms
  2. Run grill-with-docs to populate the CONTEXT.md template with your project's specifics
  3. Review new guardrails in .velocity/guardrails/packs.md

Adapters regenerated: .cursor/rules, .cursor/agents, hooks.json updated.
```

If `pack.install.post_install_skill` is set: offer to run that skill immediately.

```
Run grill-with-docs now to populate the CONTEXT.md template? [Y/n]
```

---

## update

Update installed packs to their latest compatible versions.

Usage: `velocity marketplace update [<pack-id>]`

If `<pack-id>` is provided: update only that pack.
If omitted: check all installed packs for updates.

### Step 1 — Check for updates

For each installed pack:

1. Read current version from `.velocity/marketplace/lock.md`
2. Fetch latest version from registry
3. Compare versions (semver)

### Step 2 — Display update plan

```
Available updates:

  fintech    1.0.0 → 1.1.0   [domain]
  ecommerce  1.0.0 → 1.0.1   [domain] — patch (guardrail fix)

Proceed with update? [Y/n]
```

If the developer declines: stop.

### Step 3 — Update each pack

For each pack being updated:

1. Run uninstall (Steps 6–10 of uninstall, but preserve CONTEXT.md proposals)
2. Run install for the new version
3. Report diff of guardrails and skills added/removed/changed

### Step 4 — Conflict check after update

After all updates are applied: check for new conflicts between updated packs and re-emit any conflict warnings.

---

## uninstall

Remove an installed pack.

Usage: `velocity marketplace uninstall <pack-id>`

### Step 1 — Confirm

```
Uninstall fintech v1.0.0?

This will remove:
  8 guardrails from .velocity/guardrails/packs.md
  8 hooks from hooks.json
  4 skills from .velocity/skills/index.md
  Pack files from .velocity/marketplace/installed/fintech/

CONTEXT.md proposals are not removed — they remain as proposals.

Proceed? [Y/n]
```

### Step 2 — Remove pack files

Delete `.velocity/marketplace/installed/{pack-id}/`.

### Step 3 — Remove guardrails and hooks

From `.velocity/guardrails/packs.md`: remove all guardrails with `source_pack: {pack-id}`.
From `hooks.json`: remove all hooks with `source_pack: {pack-id}`.

### Step 4 — Remove skill registrations

From `.velocity/skills/index.md`: remove entries under `## Marketplace Skills` for this pack.
For any skills with `replaces` annotation: restore the original skill's status.

### Step 5 — Update lock file

Remove the pack entry from `.velocity/marketplace/lock.md`.

### Step 6 — Trigger adapter regeneration

Regenerate adapter assets to remove the pack's skills and guardrails from `.cursor/` assets.

---

## list

Show all currently installed packs.

Usage: `velocity marketplace list`

```
Installed packs:

  fintech    v1.0.0   [domain]   Installed 2026-06-08 — 8 guardrails, 4 skills
  ecommerce  v1.0.0   [domain]   Installed 2026-06-08 — 7 guardrails, 4 skills

Total: 2 packs
```

If nothing is installed:

```
No packs installed. Run `velocity marketplace browse` to explore available packs.
```

---

## publish

Scaffold a new community pack for contribution to the Velocity Marketplace.

Usage: `velocity marketplace publish init <pack-id>`

Guides the developer through creating a valid, publishable pack.

### Step 1 — Interview

Ask the developer (one question at a time, with a recommended answer):

1. What type of pack is this? (domain / skill / agent / workflow / guardrail)
2. What is the pack name? (human-readable)
3. What is the one-line description?
4. Who is the author? (name, optional email or URL)
5. What are the relevant tags? (e.g., react, typescript, fintech, accessibility)
6. What detection signals indicate this pack should be recommended? (file patterns, import names, dependency names)

For **domain packs**, also ask:

- What bounded context does this pack seed? (what does your domain call its core entities?)
- What are the top 5–10 domain terms that should be in the CONTEXT.md template?
- What are the most common mistakes developers make in this domain? (these become guardrails)
- What are the most important questions to ask before implementing a feature in this domain? (these become grill seeds)

For **skill packs**, also ask:

- What capability does this skill provide? (one sentence)
- What files should the skill read before executing? (context load)
- What is the step-by-step behaviour of the skill?

### Step 2 — Generate pack scaffold

Create the following structure:

```
.velocity/marketplace/publishing/{pack-id}/
  pack.md          ← generated from interview
  CONTEXT.md         ← if domain pack: seeded glossary template
  guardrails.md    ← if domain pack: guardrail stubs for common violations
  skills/            ← if skill pack: SKILL.md stub(s)
  agents/            ← if agent pack: agent YAML stub(s)
  workflows/         ← if workflow pack: workflow prompt stub(s)
  CONTRIBUTING.md    ← contribution guide and submission instructions
  README.md          ← pack documentation template
```

### Step 3 — Display contribution guide

```
Pack scaffold generated at .velocity/marketplace/publishing/{pack-id}/

To publish this pack to the Velocity Marketplace:

1. Complete the pack files:
   - Fill in all [FILL] placeholders in CONTEXT.md and guardrails.md
   - Write the SKILL.md content following the Velocity skill format
   - Add detection signals to pack.md so Project Intelligence auto-recommends it

2. Test the pack:
   - Install it locally: velocity marketplace install .velocity/marketplace/publishing/{pack-id}/
   - Run grill-with-docs to verify CONTEXT.md template quality
   - Verify guardrail hooks trigger correctly on test inputs

3. Submit for review:
   - Fork: https://github.com/velocity-dev/packs
   - Add your pack under packs/{pack-id}/
   - Open a pull request with the PR template provided in the repo

4. Review criteria:
   - pack.md validates against schemas/marketplace-pack.schema.json
   - CONTEXT.md template covers at least 10 domain terms with precise definitions
   - Guardrails are actionable (hook messages say what to do, not just what is blocked)
   - Grill seeds are domain-specific (not generic questions any project could answer)
   - No proprietary or confidential content
   - MIT or Apache-2.0 license

Questions: https://velocity.dev/community/marketplace
```

---

## Registry

### Built-in Registry (always available)

Packs bundled with Velocity and available without network access:

| ID         | Type   | Version | Description                                    |
| ---------- | ------ | ------- | ---------------------------------------------- |
| fintech    | domain | 1.0.0   | FinTech — payments, ledger, KYC/AML, PCI-DSS   |
| healthtech | domain | 1.0.0   | HealthTech — FHIR, PHI, HIPAA, clinical terms  |
| ecommerce  | domain | 1.0.0   | E-Commerce — orders, inventory, pricing, carts |

### Remote Registry

Fetched from `https://registry.velocity.dev/index.md` when network is available.

Format:

```yaml
version: "2.0"
updated_at: <ISO 8601>

packs:
  - id: fintech
    version: "1.0.0"
    type: domain
    description: "FinTech Domain Pack"
    author: Velocity Team
    verified: true
    pack_url: https://registry.velocity.dev/packs/fintech/1.0.0/pack.md

  - id: kafka-patterns
    version: "2.1.0"
    type: skill
    description: "Kafka design and review patterns"
    author: Velocity Team
    verified: true
    pack_url: https://registry.velocity.dev/packs/kafka-patterns/2.1.0/pack.md

  - id: react-accessibility
    version: "1.3.0"
    type: skill
    description: "React accessibility patterns and WCAG 2.1 guardrails"
    author: "@accessibility-org"
    verified: false
    pack_url: https://registry.velocity.dev/packs/react-accessibility/1.3.0/pack.md
```

`verified: true` = officially maintained by the Velocity team. `verified: false` = community pack — install with awareness that the Velocity team has reviewed but does not maintain it.

---

## Lock File Format

`.velocity/marketplace/lock.md` tracks all installed packs with their exact versions and applied contents.

```yaml
version: "2.0"
updated_at: <ISO 8601 timestamp>

installed:
  - id: fintech
    name: "FinTech Domain Pack"
    version: "1.0.0"
    type: domain
    source: built-in # or: registry, local
    installed_at: <ISO 8601 timestamp>
    contents_applied:
      context_bounded_context: payments
      context_proposal: .velocity/artifacts/context-proposals/fintech-install.md
      guardrails_file: .velocity/guardrails/packs.md
      guardrails_added: 8
      hooks_added: 8
      skills_registered:
        - id: fintech-payment-design
          path: .velocity/marketplace/installed/fintech/skills/payment-design/SKILL.md
        - id: fintech-ledger-design
          path: .velocity/marketplace/installed/fintech/skills/ledger-design/SKILL.md
        - id: fintech-reconciliation
          path: .velocity/marketplace/installed/fintech/skills/reconciliation/SKILL.md
        - id: fintech-kyc-aml
          path: .velocity/marketplace/installed/fintech/skills/kyc-aml/SKILL.md
```

---

## Error Handling

| Scenario                                 | Action                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Pack ID not found                        | Error: not found. Suggest `search` to find similar packs.                             |
| Registry unreachable                     | Warn: continue with built-in packs only.                                              |
| Invalid pack manifest                    | Error: list validation failures. Do not install partial packs.                        |
| Version conflict with dependency         | Error: list the conflict. Ask developer which version to prefer.                      |
| Pack conflicts with installed pack       | Error: name both packs and explain the conflict. Do not install.                      |
| CONTEXT.md already exists (merge needed) | Use `propose` strategy by default — never overwrite CONTEXT.md without consent.       |
| Guardrail ID already exists in packs.md  | Skip duplicate. Log: "Guardrail {id} already present — skipping."                     |
| Hook already exists in hooks.json        | Skip duplicate. Log: "Hook {id} already present — skipping."                          |
| Adapter regeneration fails               | Warn: "Adapter regeneration failed — run `/sync` manually." Installation is complete. |
