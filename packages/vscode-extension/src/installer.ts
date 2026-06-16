import * as fs from 'fs';
import * as path from 'path';

export type IdeTarget = 'copilot' | 'cursor';

interface InstallResult {
  ok: true;
  files: string[];
}
interface InstallError {
  ok: false;
  error: string;
}
type Result = InstallResult | InstallError;

// ---------------------------------------------------------------------------
// detectIde
// Returns 'cursor' when running inside Cursor, 'copilot' otherwise.
// Cursor sets CURSOR_TRACE_ID or exposes its own appName.
// ---------------------------------------------------------------------------
export function detectIde(): IdeTarget {
  // vscode.env.appName is 'Cursor' inside Cursor, 'Visual Studio Code' in VS Code.
  // We import vscode lazily to allow unit testing without the extension host.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vscode = require('vscode');
    if (vscode.env.appName?.toLowerCase().includes('cursor')) {
      return 'cursor';
    }
  } catch {
    // Not in extension host – fall through
  }
  return 'copilot';
}

// ---------------------------------------------------------------------------
// COPY MAP
// extensionPath is the directory where the extension is installed.
// The SKILL.md files are bundled under extensionPath/skills/.
// ---------------------------------------------------------------------------
const COPY_MAP: Record<IdeTarget, Array<{ src: string; dest: string }>> = {
  copilot: [
    { src: 'skills/init/SKILL.md',      dest: '.github/prompts/velocity-init.prompt.md' },
    { src: 'skills/sync/SKILL.md',      dest: '.github/prompts/velocity-sync.prompt.md' },
    { src: 'skills/validate/SKILL.md',  dest: '.github/prompts/velocity-validate.prompt.md' },
  ],
  cursor: [
    { src: 'skills/init/SKILL.md',      dest: '.cursor/skills/velocity-init.md' },
    { src: 'skills/sync/SKILL.md',      dest: '.cursor/skills/velocity-sync.md' },
    { src: 'skills/validate/SKILL.md',  dest: '.cursor/skills/velocity-validate.md' },
  ],
};

// ---------------------------------------------------------------------------
// installPluginFiles
// Copies init, sync, and validate entry files into the workspace.
// Skips files that already exist and look customized (differ from source by
// more than 20% of lines); replaces files that are identical or near-identical.
// ---------------------------------------------------------------------------
export async function installPluginFiles(
  extensionPath: string,
  workspaceRoot: string,
  ide: IdeTarget
): Promise<Result> {
  const entries = COPY_MAP[ide];
  const written: string[] = [];

  for (const { src, dest } of entries) {
    const srcPath  = path.join(extensionPath, src);
    const destPath = path.join(workspaceRoot, dest);

    if (!fs.existsSync(srcPath)) {
      return { ok: false, error: `Bundled skill not found: ${src}` };
    }

    const srcContent = fs.readFileSync(srcPath, 'utf8');

    if (fs.existsSync(destPath)) {
      const existing = fs.readFileSync(destPath, 'utf8');
      if (isCustomized(existing, srcContent)) {
        // Preserve intentionally modified file
        continue;
      }
    }

    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, srcContent, 'utf8');
    written.push(dest);
  }

  writeInstallMarker(workspaceRoot, ide, written);

  return { ok: true, files: written.length > 0 ? written : ['All files already up to date'] };
}

// ---------------------------------------------------------------------------
// generateLocalBundle
// Writes the five-file velocity-local-install/ folder.
// ---------------------------------------------------------------------------
export async function generateLocalBundle(
  extensionPath: string,
  outputDir: string
): Promise<Result> {
  const bundleFiles: Array<{ src: string; dest: string; transform?: (s: string) => string }> = [
    {
      src: 'templates/local-install/README.md',
      dest: 'README.md',
      transform: injectBundleMetadata,
    },
    {
      src: 'templates/local-install/manifest.yml',
      dest: 'manifest.yml',
      transform: injectBundleMetadata,
    },
    { src: 'skills/init/SKILL.md',     dest: 'velocity-init.md' },
    { src: 'skills/sync/SKILL.md',     dest: 'velocity-sync.md' },
    { src: 'skills/validate/SKILL.md', dest: 'velocity-validate.md' },
  ];

  ensureDir(outputDir);
  const written: string[] = [];

  for (const { src, dest, transform } of bundleFiles) {
    const srcPath  = path.join(extensionPath, src);
    const destPath = path.join(outputDir, dest);

    if (!fs.existsSync(srcPath)) {
      return { ok: false, error: `Bundled file not found: ${src}` };
    }

    let content = fs.readFileSync(srcPath, 'utf8');
    if (transform) {
      content = transform(content);
    }

    fs.writeFileSync(destPath, content, 'utf8');
    written.push(dest);
  }

  return { ok: true, files: written };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Returns true when the existing file differs from the source by more than 20%
 * of lines — treat that as intentional customization and skip overwrite.
 */
function isCustomized(existing: string, source: string): boolean {
  const a = existing.split('\n');
  const b = source.split('\n');
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) { return false; }
  let diffLines = 0;
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) { diffLines++; }
  }
  return diffLines / maxLen > 0.20;
}

function injectBundleMetadata(content: string): string {
  const now = new Date().toISOString();
  return content
    .replace(/\{\{VELOCITY_VERSION\}\}/g, '2.0')
    .replace(/\{\{GENERATED_AT\}\}/g, now)
    .replace(/\{\{TARGET_ASSISTANTS\}\}/g, 'vscode_copilot, cursor');
}

function writeInstallMarker(
  workspaceRoot: string,
  ide: IdeTarget,
  files: string[]
): void {
  const velocityDir = path.join(workspaceRoot, '.velocity', 'install');
  const markerPath  = path.join(velocityDir, 'plugin.yml');

  // Only write marker if .velocity/ already exists (created by /velocity-init).
  const velocityExists = fs.existsSync(path.join(workspaceRoot, '.velocity'));
  if (!velocityExists) { return; }

  ensureDir(velocityDir);

  const marker = [
    `version: "2.0"`,
    `install_method: plugin`,
    `target: ${ide}`,
    `installed_at: "${new Date().toISOString()}"`,
    `files:`,
    ...files.map(f => `  - ${f}`),
    '',
  ].join('\n');

  fs.writeFileSync(markerPath, marker, 'utf8');
}
