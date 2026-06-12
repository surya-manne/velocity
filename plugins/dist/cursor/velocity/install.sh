#!/usr/bin/env bash
# Install the Velocity Cursor plugin from GitHub into Cursor's local plugins dir.
# Usage: ./install.sh [dest]   (default: ~/.cursor/plugins/local/velocity)
set -euo pipefail

SRC="surya-manne/velocity/plugins/dist/cursor/velocity"
DEST="${1:-$HOME/.cursor/plugins/local/velocity}"

echo "Fetching Velocity Cursor plugin from $SRC ..."
npx --yes degit --force "$SRC" "$DEST"

echo "Installed to $DEST"
echo "Restart Cursor, then run /velocity-init in any repository."
