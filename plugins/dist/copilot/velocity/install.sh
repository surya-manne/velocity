#!/usr/bin/env bash
# Install the Velocity Copilot bundle from GitHub into the current repository.
# Run from your repository root.
set -euo pipefail

SRC="surya-manne/velocity/plugins/dist/copilot/velocity"
TMP="$(mktemp -d)"

echo "Fetching Velocity Copilot bundle from $SRC ..."
npx --yes degit --force "$SRC" "$TMP"

mkdir -p .github
cp -R "$TMP/.github/." .github/
cp "$TMP/AGENTS.md" ./AGENTS.md
rm -rf "$TMP"

echo "Installed .github/ bundle and AGENTS.md into $(pwd)"
echo "Reload VS Code, then run #velocity-init in Copilot Chat."
