#!/usr/bin/env bash
# Run from the repo root.
# Copies skill files into the extension, installs deps, and packages a .vsix.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTENSION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$EXTENSION_DIR/.." && pwd)"

echo "→ Copying Velocity skill files into extension..."
mkdir -p "$EXTENSION_DIR/skills/init"
mkdir -p "$EXTENSION_DIR/skills/sync"
mkdir -p "$EXTENSION_DIR/skills/validate"
mkdir -p "$EXTENSION_DIR/templates/local-install"

cp "$REPO_ROOT/skills/init/SKILL.md"     "$EXTENSION_DIR/skills/init/SKILL.md"
cp "$REPO_ROOT/skills/sync/SKILL.md"     "$EXTENSION_DIR/skills/sync/SKILL.md"
cp "$REPO_ROOT/skills/validate/SKILL.md" "$EXTENSION_DIR/skills/validate/SKILL.md"
cp "$REPO_ROOT/templates/local-install/README.md"    "$EXTENSION_DIR/templates/local-install/README.md"
cp "$REPO_ROOT/templates/local-install/manifest.yml" "$EXTENSION_DIR/templates/local-install/manifest.yml"

echo "→ Installing dependencies..."
cd "$EXTENSION_DIR"
npm install

echo "→ Building..."
npm run build

echo "→ Packaging..."
npx vsce package

echo ""
echo "Done. .vsix file is in $EXTENSION_DIR/"
echo "To install locally in VS Code:  code --install-extension velocity-ai-*.vsix"
echo "To install locally in Cursor:   cursor --install-extension velocity-ai-*.vsix"
