import { join } from "node:path";
import type { PluginConfig, TargetId } from "./config.ts";
import type { AgentSource, SkillSource } from "./discover.ts";
import {
  copyDir,
  copyFile,
  read,
  resetDir,
  write,
  writeExecutable,
} from "./fsutil.ts";
import {
  copilotInstructions,
  copilotInstructionsFile,
  cursorRule,
  subagentBody,
  withResourceBanner,
} from "./render.ts";

export interface BuildContext {
  repoRoot: string;
  cfg: PluginConfig;
  skills: SkillSource[];
  agents: AgentSource[];
}

function skillContent(
  skill: SkillSource,
  target: TargetId,
  repo: string,
): string {
  return skill.resourceConsuming
    ? withResourceBanner(skill.content, target, repo)
    : skill.content;
}

/** Drop the leading `---`-fenced frontmatter block, keeping any injected banner + body. */
function stripLeadingFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

/** Derive the `owner/repo` slug degit expects from the repository URL. */
function degitSlug(repository: string): string {
  return repository
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
}

/** Copy templates/ and schemas/ into <dest>/resources so init/sync are self-contained. */
function copyResources(ctx: BuildContext, dest: string): void {
  const { repoRoot, cfg } = ctx;
  copyDir(join(repoRoot, cfg.sources.templates), join(dest, "templates"));
  copyDir(join(repoRoot, cfg.sources.schemas), join(dest, "schemas"));
}

function copyHooks(ctx: BuildContext, destFile: string): void {
  copyFile(join(ctx.repoRoot, ctx.cfg.sources.hooks), destFile);
}

function pluginJson(ctx: BuildContext, extra: Record<string, unknown>): string {
  const { cfg } = ctx;
  return (
    JSON.stringify(
      {
        name: cfg.name,
        version: cfg.version,
        description: cfg.description.replace(/\s+/g, " ").trim(),
        author: cfg.author,
        homepage: cfg.homepage,
        repository: cfg.repository,
        license: cfg.license,
        keywords: cfg.keywords,
        ...extra,
      },
      null,
      2,
    ) + "\n"
  );
}

export function buildClaudeCode(ctx: BuildContext, dist: string): void {
  const { cfg, skills, agents } = ctx;
  const repo = cfg.repository;
  resetDir(dist);

  write(join(dist, ".claude-plugin", "plugin.json"), pluginJson(ctx, {}));

  for (const skill of skills) {
    write(
      join(dist, "skills", skill.dir, "SKILL.md"),
      skillContent(skill, "claude-code", repo),
    );
    const wrapper = [
      `Read \${CLAUDE_PLUGIN_ROOT}/skills/${skill.dir}/SKILL.md and execute it`,
      "following its instructions exactly.",
      "",
    ].join("\n");
    write(join(dist, "commands", `${skill.command}.md`), wrapper);
  }

  for (const agent of agents) {
    const file = [
      "---",
      `name: ${agent.id}`,
      `description: ${JSON.stringify(agent.description || agent.role)}`,
      "---",
      "",
      subagentBody(agent),
    ].join("\n");
    write(join(dist, "agents", `${agent.id}.md`), file);
  }

  copyHooks(ctx, join(dist, "hooks", "hooks.json"));
  copyResources(ctx, join(dist, "resources"));
  write(join(dist, "README.md"), claudeReadme(ctx));
}

export function buildCursor(ctx: BuildContext, dist: string): void {
  const { cfg, skills, agents } = ctx;
  const repo = cfg.repository;
  resetDir(dist);

  write(join(dist, ".cursor-plugin", "plugin.json"), pluginJson(ctx, {}));
  write(join(dist, "rules", "velocity.mdc"), cursorRule(cfg));

  for (const skill of skills) {
    write(
      join(dist, "skills", skill.dir, "SKILL.md"),
      skillContent(skill, "cursor", repo),
    );
  }

  for (const agent of agents) {
    const file = [
      "---",
      `name: ${agent.role}`,
      `description: ${JSON.stringify(agent.description || agent.role)}`,
      "---",
      "",
      subagentBody(agent),
    ].join("\n");
    write(join(dist, "agents", `${agent.id}.md`), file);
  }

  copyHooks(ctx, join(dist, "hooks", "hooks.json"));
  copyResources(ctx, join(dist, "resources"));
  writeExecutable(join(dist, "install.sh"), cursorInstallScript(ctx));
  write(join(dist, "README.md"), cursorReadme(ctx));
}

export function buildCopilot(ctx: BuildContext, dist: string): void {
  const { cfg, skills, agents } = ctx;
  const repo = cfg.repository;
  resetDir(dist);

  const gh = join(dist, ".github");
  const instructions = copilotInstructionsFile(cfg);
  write(join(gh, "copilot-instructions.md"), copilotInstructions(cfg));
  write(join(gh, "instructions", "velocity.instructions.md"), instructions);
  // Also write instructions at plugin root so VS Code plugin manager picks them
  // up natively without requiring chat.promptFiles to be set by the user.
  write(join(dist, "instructions", "velocity.instructions.md"), instructions);

  for (const skill of skills) {
    const full = skillContent(skill, "copilot", repo);
    const prompt = [
      "---",
      "mode: agent",
      `description: ${JSON.stringify(skill.description || skill.command)}`,
      "---",
      "",
      stripLeadingFrontmatter(full),
    ].join("\n");
    // Write under .github/ for workspace-copy install (install.sh / manual).
    write(join(gh, "prompts", `${skill.command}.prompt.md`), prompt);
    // Write at plugin root so VS Code plugin manager serves #skill-name natively.
    write(join(dist, "prompts", `${skill.command}.prompt.md`), prompt);
    // Native Copilot skills keep their own frontmatter.
    write(join(gh, "skills", skill.dir, "SKILL.md"), full);
  }

  for (const agent of agents) {
    const file = [
      "---",
      "mode: agent",
      `description: ${JSON.stringify(agent.description || agent.role)}`,
      "---",
      "",
      subagentBody(agent),
    ].join("\n");
    // Write under .github/ for workspace-copy install.
    write(join(gh, "agents", `${agent.id}.agent.md`), file);
    // Write at plugin root for native plugin manager.
    write(join(dist, "agents", `${agent.id}.agent.md`), file);
  }

  // Copilot prompts are self-contained, but init/sync still reference templates/
  // schemas; bundle them into .github so they travel with the copied directory.
  copyResources(ctx, join(gh, "velocity-resources"));
  write(
    join(dist, "AGENTS.md"),
    read(join(ctx.repoRoot, "templates", "copilot", "AGENTS.md")),
  );
  writeExecutable(join(dist, "install.sh"), copilotInstallScript(ctx));
  write(join(dist, "README.md"), copilotReadme(ctx));
}

function cursorInstallScript(ctx: BuildContext): string {
  const slug = degitSlug(ctx.cfg.repository);
  return [
    "#!/usr/bin/env bash",
    "# Install the Velocity Cursor plugin from GitHub into Cursor's local plugins dir.",
    "# Usage: ./install.sh [dest]   (default: ~/.cursor/plugins/local/velocity)",
    "set -euo pipefail",
    "",
    `SRC="${slug}/${ctx.cfg.targets.cursor.dist}"`,
    'DEST="${1:-$HOME/.cursor/plugins/local/velocity}"',
    "",
    'echo "Fetching Velocity Cursor plugin from $SRC ..."',
    'npx --yes degit --force "$SRC" "$DEST"',
    "",
    'echo "Installed to $DEST"',
    'echo "Restart Cursor, then run /velocity-init in any repository."',
    "",
  ].join("\n");
}

function copilotInstallScript(ctx: BuildContext): string {
  const slug = degitSlug(ctx.cfg.repository);
  return [
    "#!/usr/bin/env bash",
    "# Install the Velocity Copilot bundle from GitHub into the current repository.",
    "# Run from your repository root.",
    "set -euo pipefail",
    "",
    `SRC="${slug}/${ctx.cfg.targets.copilot.dist}"`,
    'TMP="$(mktemp -d)"',
    "",
    'echo "Fetching Velocity Copilot bundle from $SRC ..."',
    'npx --yes degit --force "$SRC" "$TMP"',
    "",
    "mkdir -p .github",
    'cp -R "$TMP/.github/." .github/',
    'cp "$TMP/AGENTS.md" ./AGENTS.md',
    'rm -rf "$TMP"',
    "",
    'echo "Installed .github/ bundle and AGENTS.md into $(pwd)"',
    'echo "Reload VS Code, then run #velocity-init in Copilot Chat."',
    "",
  ].join("\n");
}

function claudeReadme(ctx: BuildContext): string {
  return [
    `# Velocity — Claude Code plugin`,
    "",
    ctx.cfg.description.replace(/\s+/g, " ").trim(),
    "",
    "## Install",
    "",
    "```",
    `/plugin marketplace add ${ctx.cfg.repository}`,
    "/plugin install velocity",
    "```",
    "",
    "Then run `/velocity-init` in any repository to set up project context and intelligence.",
    "",
    "> Generated by tools/plugin-builder. Do not edit by hand.",
    "",
  ].join("\n");
}

function cursorReadme(ctx: BuildContext): string {
  const slug = degitSlug(ctx.cfg.repository);
  return [
    `# Velocity — Cursor plugin`,
    "",
    ctx.cfg.description.replace(/\s+/g, " ").trim(),
    "",
    "## Install",
    "",
    "From the Cursor Marketplace panel (Settings -> Plugins), search for `velocity`.",
    "",
    "Or install from the GitHub source with one command (pulls into Cursor's local plugins dir):",
    "",
    "```bash",
    `npx degit ${slug}/${ctx.cfg.targets.cursor.dist} ~/.cursor/plugins/local/velocity`,
    "```",
    "",
    "Or, from a clone of this bundle, run `./install.sh`.",
    "",
    "Then restart Cursor and run `/velocity-init` in any repository.",
    "",
    "> Generated by tools/plugin-builder. Do not edit by hand.",
    "",
  ].join("\n");
}

function copilotReadme(ctx: BuildContext): string {
  return [
    `# Velocity — GitHub Copilot bundle`,
    "",
    ctx.cfg.description.replace(/\s+/g, " ").trim(),
    "",
    "VS Code Copilot has no plugin manager, so Velocity ships as a `.github/` customization bundle.",
    "",
    "## Install",
    "",
    "From your repository root, install directly from the GitHub source with one command:",
    "",
    "```bash",
    `npx degit ${degitSlug(ctx.cfg.repository)}/${ctx.cfg.targets.copilot.dist} /tmp/velocity-copilot \\`,
    "  && cp -R /tmp/velocity-copilot/.github/. .github/ \\",
    "  && cp /tmp/velocity-copilot/AGENTS.md ./AGENTS.md \\",
    "  && rm -rf /tmp/velocity-copilot",
    "```",
    "",
    "Or, from a clone of this bundle, run `./install.sh`.",
    "",
    "Then in VS Code settings ensure `chat.promptFiles` and `chat.instructionsFilesLocations`",
    "are enabled, reload VS Code, and run `#velocity-init` in Copilot Chat.",
    "",
    "Manual alternative: copy the `.github/` directory and `AGENTS.md` into your repository root.",
    "",
    "> Generated by tools/plugin-builder. Do not edit by hand.",
    "",
  ].join("\n");
}
