import { load } from "js-yaml";
import { join } from "node:path";
import { read } from "./fsutil.ts";

export type TargetId = "claude-code" | "cursor" | "copilot";

export interface TargetConfig {
  enabled: boolean;
  dist: string;
}

export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  author: { name: string; email?: string };
  license: string;
  homepage: string;
  repository: string;
  keywords: string[];
  sources: {
    skills: string;
    agents: string;
    subagents: string;
    templates: string;
    schemas: string;
    hooks: string;
  };
  exclude_skills: string[];
  command_overrides: Record<string, string>;
  featured_commands: string[];
  resource_consuming_skills: string[];
  targets: Record<TargetId, TargetConfig>;
}

export function loadConfig(repoRoot: string): PluginConfig {
  const path = join(repoRoot, "plugins", "velocity", "plugin.config.yml");
  const cfg = load(read(path)) as PluginConfig;

  if (!cfg.name || !cfg.version || !cfg.sources || !cfg.targets) {
    throw new Error(
      `Invalid plugin.config.yml at ${path}: missing required fields.`,
    );
  }
  cfg.exclude_skills ??= [];
  cfg.command_overrides ??= {};
  cfg.featured_commands ??= [];
  cfg.resource_consuming_skills ??= [];
  return cfg;
}
