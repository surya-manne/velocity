import { load } from "js-yaml";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { read } from "./fsutil.ts";
import type { PluginConfig } from "./config.ts";

export interface Frontmatter {
  data: Record<string, unknown>;
  body: string;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(FRONTMATTER);
  if (!match) return { data: {}, body: content };
  let data: Record<string, unknown>;
  try {
    data = (load(match[1]) as Record<string, unknown>) ?? {};
  } catch {
    // Some canonical sources contain YAML that strict parsers reject (the
    // platform never strictly parses them). Fall back to extracting the
    // top-level fields the builder actually needs.
    data = miniParseFrontmatter(match[1]);
  }
  return { data, body: content.slice(match[0].length) };
}

const unquote = (s: string): string => s.replace(/^['"]|['"]$/g, "").trim();

/** Tolerant extractor for top-level scalar, folded-scalar, and block-list keys. */
function miniParseFrontmatter(fm: string): Record<string, unknown> {
  const lines = fm.split("\n");
  const data: Record<string, unknown> = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^([A-Za-z_][\w-]*):\s?(.*)$/.exec(line);
    if (!m || /^\s/.test(line)) continue;
    const key = m[1];
    const rest = m[2].trim();

    if (rest === ">" || rest === ">-" || rest === "|" || rest === "|-") {
      const collected: string[] = [];
      while (
        i + 1 < lines.length &&
        (/^\s+\S/.test(lines[i + 1]) || lines[i + 1] === "")
      ) {
        i++;
        if (lines[i].trim()) collected.push(lines[i].trim());
      }
      const joiner = rest.startsWith("|") ? "\n" : " ";
      data[key] = collected.join(joiner);
    } else if (rest === "") {
      if (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        const items: string[] = [];
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
          i++;
          items.push(unquote(lines[i].replace(/^\s*-\s+/, "")));
        }
        data[key] = items;
      }
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      data[key] = rest
        .slice(1, -1)
        .split(",")
        .map((x) => unquote(x))
        .filter(Boolean);
    } else {
      data[key] = unquote(rest);
    }
  }
  return data;
}

export interface SkillSource {
  /** Slash/# command name (skill frontmatter `name`, override, or directory). */
  command: string;
  /** Directory name under skills/ (used for skills/<dir>/SKILL.md layout). */
  dir: string;
  description: string;
  /** Absolute path to the source SKILL.md. */
  srcPath: string;
  /** Full source contents. */
  content: string;
  /** True if this skill reads bundled templates/schemas (init/sync). */
  resourceConsuming: boolean;
}

export interface AgentSource {
  id: string;
  role: string;
  description: string;
  skills: string[];
  guardrails: string[];
  isSubagent: boolean;
}

function findSkillFiles(skillsRoot: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry === "SKILL.md") {
        out.push(full);
      }
    }
  };
  walk(skillsRoot);
  return out;
}

export function discoverSkills(
  repoRoot: string,
  cfg: PluginConfig,
): SkillSource[] {
  const skillsRoot = join(repoRoot, cfg.sources.skills);
  const excluded = new Set(cfg.exclude_skills);
  const resourceConsuming = new Set(cfg.resource_consuming_skills);

  const skills: SkillSource[] = [];
  for (const srcPath of findSkillFiles(skillsRoot)) {
    // Directory name relative to skills root, e.g. "init" or "ralph/annotate".
    const dir = relative(skillsRoot, dirname(srcPath)).split("/").join("-");
    const content = read(srcPath);
    const { data } = parseFrontmatter(content);
    const frontmatterName = typeof data.name === "string" ? data.name : "";
    const baseName = frontmatterName || basename(dirname(srcPath));

    if (excluded.has(baseName) || excluded.has(dir)) continue;

    const command = cfg.command_overrides[baseName] ?? baseName;
    const description =
      typeof data.description === "string"
        ? data.description.replace(/\s+/g, " ").trim()
        : "";

    skills.push({
      command,
      dir,
      description,
      srcPath,
      content,
      resourceConsuming:
        resourceConsuming.has(baseName) || resourceConsuming.has(command),
    });
  }

  // Deterministic order for reproducible builds.
  skills.sort((a, b) => a.command.localeCompare(b.command));

  const seen = new Set<string>();
  for (const skill of skills) {
    if (seen.has(skill.command)) {
      throw new Error(
        `Duplicate command name "${skill.command}" — set a command_overrides entry.`,
      );
    }
    seen.add(skill.command);
  }
  return skills;
}

function readAgentFile(srcPath: string, isSubagent: boolean): AgentSource {
  const { data } = parseFrontmatter(read(srcPath));
  const id = typeof data.id === "string" ? data.id : basename(srcPath, ".md");
  const role = typeof data.role === "string" ? data.role : id;
  const description =
    typeof data.description === "string"
      ? data.description.replace(/\s+/g, " ").trim()
      : "";
  const skills = Array.isArray(data.skills) ? (data.skills as string[]) : [];
  const guardrails = Array.isArray(data.guardrails)
    ? (data.guardrails as string[])
    : [];
  return { id, role, description, skills, guardrails, isSubagent };
}

export function discoverAgents(
  repoRoot: string,
  cfg: PluginConfig,
): AgentSource[] {
  const agentsRoot = join(repoRoot, cfg.sources.agents);
  const subagentsRoot = join(repoRoot, cfg.sources.subagents);
  const agents: AgentSource[] = [];

  for (const entry of readdirSync(agentsRoot)) {
    const full = join(agentsRoot, entry);
    if (statSync(full).isFile() && entry.endsWith(".md")) {
      agents.push(readAgentFile(full, false));
    }
  }
  if (existsSync(subagentsRoot)) {
    for (const entry of readdirSync(subagentsRoot)) {
      const full = join(subagentsRoot, entry);
      if (statSync(full).isFile() && entry.endsWith(".md")) {
        agents.push(readAgentFile(full, true));
      }
    }
  }

  agents.sort((a, b) => a.id.localeCompare(b.id));
  return agents;
}
