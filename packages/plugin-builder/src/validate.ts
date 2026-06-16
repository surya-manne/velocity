import { join } from "node:path";
import type { PluginConfig } from "./config.ts";
import type { SkillSource } from "./discover.ts";
import { existsSync, listFiles, read } from "./fsutil.ts";

export function validate(
  cfg: PluginConfig,
  skills: SkillSource[],
  outBase: string,
): string[] {
  const errors: string[] = [];
  const byCommand = new Map(skills.map((s) => [s.command, s]));

  const checkManifest = (path: string): void => {
    if (!existsSync(path)) {
      errors.push(`Missing manifest: ${path}`);
      return;
    }
    try {
      JSON.parse(read(path));
    } catch (e) {
      errors.push(`Invalid JSON manifest ${path}: ${(e as Error).message}`);
    }
  };

  const checkResources = (resourcesDir: string, label: string): void => {
    for (const sub of ["templates", "schemas"]) {
      if (listFiles(join(resourcesDir, sub)).length === 0) {
        errors.push(`${label}: bundled resources/${sub} is empty or missing.`);
      }
    }
  };

  const checkFeatured = (
    resolve: (cmd: string) => string,
    label: string,
  ): void => {
    for (const cmd of cfg.featured_commands) {
      if (!byCommand.has(cmd)) {
        errors.push(
          `${label}: featured command "${cmd}" has no matching skill.`,
        );
        continue;
      }
      const path = resolve(cmd);
      if (!existsSync(path))
        errors.push(`${label}: missing generated file for "${cmd}" (${path}).`);
    }
  };

  if (cfg.targets["claude-code"]?.enabled) {
    const dist = join(outBase, cfg.targets["claude-code"].dist);
    checkManifest(join(dist, ".claude-plugin", "plugin.json"));
    checkResources(join(dist, "resources"), "claude-code");
    checkFeatured((cmd) => join(dist, "commands", `${cmd}.md`), "claude-code");
  }

  if (cfg.targets.cursor?.enabled) {
    const dist = join(outBase, cfg.targets.cursor.dist);
    checkManifest(join(dist, ".cursor-plugin", "plugin.json"));
    checkResources(join(dist, "resources"), "cursor");
    checkFeatured(
      (cmd) => join(dist, "skills", byCommand.get(cmd)!.dir, "SKILL.md"),
      "cursor",
    );
  }

  if (cfg.targets.copilot?.enabled) {
    const dist = join(outBase, cfg.targets.copilot.dist);
    checkResources(join(dist, ".github", "velocity-resources"), "copilot");
    checkFeatured(
      (cmd) => join(dist, ".github", "prompts", `${cmd}.prompt.md`),
      "copilot",
    );
  }

  return errors;
}
