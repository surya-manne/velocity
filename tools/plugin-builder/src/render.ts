import type { PluginConfig, TargetId } from "./config.ts";
import type { AgentSource, SkillSource } from "./discover.ts";

/** Where the bundled templates/ and schemas/ resolve, per target. */
export function resourceRoot(target: TargetId): string {
  switch (target) {
    case "claude-code":
      return "${CLAUDE_PLUGIN_ROOT}/resources";
    case "copilot":
      return ".github/velocity-resources";
    case "cursor":
      return "the Velocity plugin's bundled `resources/` directory";
  }
}

/**
 * Banner injected at the top of resource-consuming skills (init/sync) so the
 * agent resolves repo-relative `templates/...` and `schemas/...` references
 * against the bundled resources instead of the (nonexistent) repo root.
 */
export function resourceBanner(target: TargetId, repo: string): string {
  const root = resourceRoot(target);
  return [
    "<!-- velocity-plugin: resource resolution -->",
    "> **Plugin resources.** This skill references files under `templates/...` and",
    `> \`schemas/...\`. These are bundled with the Velocity plugin at ${root}.`,
    "> When this skill says to read or copy a `templates/...` or `schemas/...` file,",
    `> resolve it from there. If a file cannot be found locally, fetch it from the`,
    `> Velocity repository: ${repo}.`,
    "",
    "---",
    "",
  ].join("\n");
}

/** Inject the resource banner just after a skill's frontmatter block. */
export function withResourceBanner(
  content: string,
  target: TargetId,
  repo: string,
): string {
  const banner = resourceBanner(target, repo);
  const match = content.match(/^(---\n[\s\S]*?\n---\n)/);
  if (match) {
    return match[1] + "\n" + banner + content.slice(match[1].length);
  }
  return banner + content;
}

/** Generate a sub-agent definition body shared by Claude Code / Cursor / Copilot. */
export function subagentBody(agent: AgentSource): string {
  const lines: string[] = [];
  lines.push(`# ${agent.role}`, "");
  if (agent.description) lines.push(agent.description, "");
  lines.push(
    "## Operating context",
    "",
    "- Domain language: read `.velocity/artifacts/context/CONTEXT.md` before any work; all names must match its glossary.",
    "- Standards: `.velocity/project-context/` (engineering, testing, security, api).",
    "- Architecture decisions: `.velocity/knowledge-base/adrs/index.md`.",
    "",
  );
  if (agent.skills.length) {
    lines.push("## Skills you use", "");
    for (const skill of agent.skills) lines.push(`- \`${skill}\``);
    lines.push("");
  }
  lines.push(
    "## Guardrails you enforce",
    "",
    "- Vertical slices only. No horizontal-layer changes.",
    "- TDD loop: failing test -> implement -> verify before moving on.",
    "- No secrets in source. No force push to main. No pipe-to-shell.",
  );
  for (const g of agent.guardrails) lines.push(`- ${g.replace(/_/g, " ")}`);
  lines.push("");
  return lines.join("\n");
}

/** featured command list rendered with the platform-correct invocation prefix. */
export function featuredCommandLines(
  cfg: PluginConfig,
  prefix: "/" | "#",
): string[] {
  return cfg.featured_commands.map((c) => `${prefix}${c}`);
}

/** Render the always-on Cursor rule (rules/velocity.mdc). */
export function cursorRule(cfg: PluginConfig): string {
  return [
    "---",
    "description: Velocity — AI acceleration layer (project intelligence + domain context)",
    "alwaysApply: true",
    "---",
    "",
    "# Velocity",
    "",
    cfg.description.replace(/\s+/g, " ").trim(),
    "",
    "## First run",
    "",
    "If `.velocity/` does not exist: run `/velocity-init` to set up project context and intelligence.",
    "",
    "## Domain language",
    "",
    "Before feature work: read `.velocity/artifacts/context/CONTEXT.md`.",
    "All names (variables, files, API terms) must match the CONTEXT.md glossary.",
    "",
    "## Standards",
    "",
    "- Engineering: `.velocity/project-context/engineering.md`",
    "- Testing: `.velocity/project-context/testing.md`",
    "- Security: `.velocity/project-context/security.md`",
    "",
    "## ADRs",
    "",
    "Before designing: read `.velocity/knowledge-base/adrs/index.md`.",
    "",
    "## Skills",
    "",
    ...featuredCommandLines(cfg, "/"),
    "",
    "## Guardrails",
    "",
    "Vertical slices only. No horizontal layers.",
    "Tests required for changed behavior. Secrets never in source.",
    "",
    "## Session start",
    "",
    "Check `.velocity/project-intelligence/stack.md` detected_at. If over 7 days old: run `/sync`.",
    "",
  ].join("\n");
}

/** Render the always-on Copilot instructions (.github/copilot-instructions.md). */
export function copilotInstructions(cfg: PluginConfig): string {
  return [
    "# Velocity",
    "",
    cfg.description.replace(/\s+/g, " ").trim(),
    "",
    "## First run",
    "",
    "If `.velocity/` does not exist: run `#velocity-init` to set up project context and intelligence.",
    "",
    "## Domain language",
    "",
    "Before feature work: read `.velocity/artifacts/context/CONTEXT.md`.",
    "All names (variables, files, API terms) must match the CONTEXT.md glossary.",
    "",
    "## Standards",
    "",
    "- Engineering: `.velocity/project-context/engineering.md`",
    "- Testing: `.velocity/project-context/testing.md`",
    "- Security: `.velocity/project-context/security.md`",
    "",
    "## ADRs",
    "",
    "Before designing: read `.velocity/knowledge-base/adrs/index.md`.",
    "",
    "## Prompts",
    "",
    ...featuredCommandLines(cfg, "#"),
    "",
    "## Guardrails",
    "",
    "Vertical slices only. No horizontal layers.",
    "Tests required for changed behavior. Secrets never in source. No force push to main.",
    "",
  ].join("\n");
}

/** Render a workspace-wide Copilot instructions file (applyTo all). */
export function copilotInstructionsFile(cfg: PluginConfig): string {
  return ["---", "applyTo: '**'", "---", "", copilotInstructions(cfg)].join(
    "\n",
  );
}
