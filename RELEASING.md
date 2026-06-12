# Releasing the Velocity Plugins

Velocity ships as three native, installable plugins generated from one unified source:

| Target          | Bundle                               | Distribution                                              |
| --------------- | ------------------------------------ | --------------------------------------------------------- |
| Claude Code     | `plugins/dist/claude-code/velocity/` | Plugin marketplace (this git repo)                        |
| Cursor          | `plugins/dist/cursor/velocity/`      | Cursor Marketplace (submitted for review) + local install |
| VS Code Copilot | `plugins/dist/copilot/velocity/`     | `.github/` bundle via git / template repo                 |

The single source of truth is the canonical `skills/`, `agents/`, `templates/`, `schemas/`, and `hooks.json`, plus the authoring manifest [`plugins/velocity/plugin.config.yml`](plugins/velocity/plugin.config.yml). The generator lives in [`tools/plugin-builder/`](tools/plugin-builder). See [ADR-0001](.velocity/knowledge-base/adrs/ADR-0001-plugin-build-generator.md) for the rationale.

> Never hand-edit `plugins/dist/` or the root `marketplace.json` files. Edit the canonical sources or `plugin.config.yml` and rebuild.

---

## 1. Build

```bash
cd tools/plugin-builder
npm install          # first time only
npm run build:plugins
```

Regenerates all three bundles plus the root manifests `.claude-plugin/marketplace.json` and `.cursor-plugin/marketplace.json`.

To change the version or metadata, edit `plugin.config.yml` (`version`, `author`, `repository`, `homepage`, `keywords`) and rebuild.

---

## 2. Verify

```bash
cd tools/plugin-builder
npm run typecheck     # tsc --noEmit
npm run check         # build to a temp dir, validate, fail if plugins/dist is stale
```

`npm run check` is what CI runs ([.github/workflows/build-plugins.yml](.github/workflows/build-plugins.yml)). It enforces:

- valid JSON manifests,
- non-empty bundled `resources/` (templates + schemas),
- every featured command has a generated file,
- the committed `plugins/dist/` matches a fresh build (no stale output).

Optional manifest sanity check:

```bash
cd <repo-root>
jq . .claude-plugin/marketplace.json .cursor-plugin/marketplace.json \
   plugins/dist/claude-code/velocity/.claude-plugin/plugin.json \
   plugins/dist/cursor/velocity/.cursor-plugin/plugin.json
```

---

## 3. Test locally (before publishing)

The key smoke test for every target: `init` runs end-to-end and creates `.velocity/` using the bundled `resources/` with no missing-template errors.

### Claude Code

Point the plugin manager at your local checkout (no push required):

```text
/plugin marketplace add /absolute/path/to/velocity
/plugin install velocity
/velocity-init
```

Or launch with the dev flag:

```bash
claude --plugin-dir plugins/dist/claude-code/velocity
```

### Cursor

Copy the bundle into the local plugins directory so it loads with no install step:

```bash
cp -R plugins/dist/cursor/velocity ~/.cursor/plugins/local/velocity
```

Restart Cursor, open a test repo, run `/velocity-init`. Confirm the rule loads (Settings → Rules) and skills appear under "Agent Decides".

### VS Code Copilot

Copy the bundle into a throwaway repo and reload VS Code:

```bash
cp -R plugins/dist/copilot/velocity/.github  /path/to/test-repo/.github
cp    plugins/dist/copilot/velocity/AGENTS.md /path/to/test-repo/
```

Run `#velocity:init` in Copilot Chat. No VS Code settings changes required — the plugin exposes skills natively via `skills/` and always-on instructions via `rules/` at the plugin root.

---

## 4. Publish

### Claude Code

The marketplace _is_ this git repo (`.claude-plugin/marketplace.json` at root). Publishing = pushing.

```bash
git add plugins/ .claude-plugin/ .cursor-plugin/ tools/ docs/ README.md RELEASING.md .gitignore .velocity/
git commit -m "feat: native multi-platform plugins (vX.Y.Z)"
git push
git tag vX.Y.Z && git push --tags   # CI rebuilds + uploads artifacts
```

Users install with:

```text
/plugin marketplace add https://github.com/surya-manne/velocity
/plugin install velocity
```

Optionally list it on the community directory (claudemarketplaces.com).

### Cursor

Cursor's marketplace requires submitting the Git repo to the Cursor team for manual review (listed at cursor.com/marketplace). Push the repo (above), then submit via the flow in the [Cursor Plugins docs](https://cursor.com/docs/plugins). Until accepted, the local-install path (§3) and `.cursor-plugin/marketplace.json` work for your own org.

### VS Code Copilot

No marketplace exists. Distribute the `.github/` bundle via git:

- commit `.github/` + `AGENTS.md` into consumer repos, or
- publish this repo as a GitHub **template repository** so teams copy the bundle.

---

## Release checklist

1. Bump `version` in [`plugins/velocity/plugin.config.yml`](plugins/velocity/plugin.config.yml).
2. `cd tools/plugin-builder && npm run build:plugins && npm run typecheck && npm run check`.
3. Local-test all three targets (§3).
4. Commit regenerated `plugins/dist/` + root manifests, push.
5. Tag `vX.Y.Z` (triggers the build workflow).
6. Claude Code: done on push. Cursor: submit/resubmit for review. Copilot: update the template repo.

> All install URLs derive from `plugin.config.yml` (`repository` / `homepage`). If the public repo differs from `https://github.com/surya-manne/velocity`, update the manifest and rebuild so the generated manifests, READMEs, and docs point to the right place.
