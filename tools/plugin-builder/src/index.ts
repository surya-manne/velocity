import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { rmSync } from "node:fs";
import { loadConfig, type PluginConfig, type TargetId } from "./config.ts";
import { discoverAgents, discoverSkills } from "./discover.ts";
import { existsSync, listFiles, read, sha256 } from "./fsutil.ts";
import { writeMarketplaces } from "./marketplaces.ts";
import {
  buildClaudeCode,
  buildCopilot,
  buildCursor,
  type BuildContext,
} from "./targets.ts";
import { validate } from "./validate.ts";

const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

function buildContext(): BuildContext {
  const cfg = loadConfig(REPO_ROOT);
  const skills = discoverSkills(REPO_ROOT, cfg);
  const agents = discoverAgents(REPO_ROOT, cfg);
  return { repoRoot: REPO_ROOT, cfg, skills, agents };
}

/** Run the full build, staging all outputs under `outBase`. Returns the list of output dirs/files. */
function runBuild(
  ctx: BuildContext,
  outBase: string,
): { dists: string[]; marketplaces: string[] } {
  const { cfg } = ctx;
  const dists: string[] = [];
  const builders: Record<TargetId, (c: BuildContext, d: string) => void> = {
    "claude-code": buildClaudeCode,
    cursor: buildCursor,
    copilot: buildCopilot,
  };

  for (const target of Object.keys(builders) as TargetId[]) {
    if (!cfg.targets[target]?.enabled) continue;
    const dist = join(outBase, cfg.targets[target].dist);
    builders[target](ctx, dist);
    dists.push(dist);
  }

  const marketplaces = writeMarketplaces(cfg, outBase);
  return { dists, marketplaces };
}

function trackedPaths(cfg: PluginConfig): string[] {
  const paths: string[] = [];
  for (const target of Object.values(cfg.targets)) {
    if (target.enabled) paths.push(target.dist);
  }
  if (cfg.targets["claude-code"]?.enabled)
    paths.push(".claude-plugin/marketplace.json");
  if (cfg.targets.cursor?.enabled)
    paths.push(".cursor-plugin/marketplace.json");
  return paths;
}

/** Build a {relpath -> sha256} map for every file under the given paths within base. */
function snapshot(base: string, relPaths: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const rel of relPaths) {
    const abs = join(base, rel);
    if (!existsSync(abs)) continue;
    if (rel.endsWith(".json")) {
      map.set(rel, sha256(read(abs)));
    } else {
      for (const file of listFiles(abs))
        map.set(join(rel, file), sha256(read(join(abs, file))));
    }
  }
  return map;
}

function reportAndValidate(ctx: BuildContext, outBase: string): boolean {
  const { cfg, skills, agents } = ctx;
  console.log(`Velocity plugin build — v${cfg.version}`);
  console.log(`  skills:   ${skills.length}`);
  console.log(`  agents:   ${agents.length}`);
  for (const [id, t] of Object.entries(cfg.targets)) {
    if (t.enabled) console.log(`  target:   ${id} -> ${t.dist}`);
  }
  const errors = validate(cfg, skills, outBase);
  if (errors.length) {
    console.error("\nValidation failed:");
    for (const e of errors) console.error(`  - ${e}`);
    return false;
  }
  console.log("Validation passed.");
  return true;
}

function cmdBuild(): number {
  const ctx = buildContext();
  runBuild(ctx, REPO_ROOT);
  const ok = reportAndValidate(ctx, REPO_ROOT);
  return ok ? 0 : 1;
}

function cmdCheck(): number {
  const ctx = buildContext();
  const rels = trackedPaths(ctx.cfg);
  const tmp = join(REPO_ROOT, ".plugin-build-check");
  rmSync(tmp, { recursive: true, force: true });
  try {
    runBuild(ctx, tmp);
    if (!reportAndValidate(ctx, tmp)) return 1;

    const committed = snapshot(REPO_ROOT, rels);
    const fresh = snapshot(tmp, rels);
    const drift: string[] = [];
    for (const [rel, hash] of fresh) {
      if (committed.get(rel) !== hash) drift.push(rel);
    }
    for (const rel of committed.keys()) {
      if (!fresh.has(rel)) drift.push(`${rel} (stale; not regenerated)`);
    }
    if (drift.length) {
      console.error(
        "\nplugins/dist is out of date. Run `npm run build:plugins` and commit:",
      );
      for (const d of drift.sort()) console.error(`  - ${d}`);
      return 1;
    }
    console.log("Committed plugin bundles are up to date.");
    return 0;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const command = process.argv[2] ?? "build";
let code = 0;
if (command === "build") code = cmdBuild();
else if (command === "check") code = cmdCheck();
else {
  console.error(`Unknown command "${command}". Use "build" or "check".`);
  code = 2;
}
process.exit(code);
