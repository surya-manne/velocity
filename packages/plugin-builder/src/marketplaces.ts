import { join } from "node:path";
import type { PluginConfig } from "./config.ts";
import { write } from "./fsutil.ts";

/**
 * Write the root marketplace manifests that let Claude Code and Cursor discover
 * and install the generated bundles. `source` paths point at the committed
 * bundle locations regardless of where the build is staged.
 */
export function writeMarketplaces(
  cfg: PluginConfig,
  outBase: string,
): string[] {
  const written: string[] = [];

  if (cfg.targets["claude-code"]?.enabled) {
    const path = join(outBase, ".claude-plugin", "marketplace.json");
    write(
      path,
      JSON.stringify(
        {
          name: cfg.name,
          owner: { name: cfg.author.name, url: cfg.repository },
          plugins: [
            {
              name: cfg.name,
              source: `./${cfg.targets["claude-code"].dist}`,
              description: cfg.description.replace(/\s+/g, " ").trim(),
              version: cfg.version,
            },
          ],
        },
        null,
        2,
      ) + "\n",
    );
    written.push(path);
  }

  if (cfg.targets.cursor?.enabled) {
    const path = join(outBase, ".cursor-plugin", "marketplace.json");
    write(
      path,
      JSON.stringify(
        {
          name: cfg.name,
          plugins: [
            {
              name: cfg.name,
              source: `./${cfg.targets.cursor.dist}`,
              description: cfg.description.replace(/\s+/g, " ").trim(),
              keywords: cfg.keywords,
              category: "Productivity",
            },
          ],
        },
        null,
        2,
      ) + "\n",
    );
    written.push(path);
  }

  return written;
}
