# Local Installer

Generate a small copy-pasteable source bundle for client repositories when plugin installation is unavailable or a team wants a fully reviewable local integration path.

## What It Generates

```text
velocity-local-install/
├── README.md
├── manifest.yml
├── velocity-init.md
├── velocity-sync.md
└── velocity-validate.md
```

The bundle is plain text. It includes no archive, binary, package manager dependency, daemon, CLI, or remote fetch.

## Copy Targets

| Assistant | Copy `velocity-init.md` to | Invoke |
| --------- | -------------------------- | ------ |
| VS Code / GitHub Copilot | `.github/prompts/velocity-init.prompt.md` | `#velocity-init` |
| Cursor | `.cursor/skills/velocity-init.md` | `/velocity-init` |
| Claude Code | `commands/velocity-init.md` | `/velocity-init` |

Optional sync and validate files can be copied to the matching prompt, skill, or command directories listed in the generated bundle README.

## Verification

Check the bundle contains all five files and each Markdown file is non-empty before sharing it with a client repository.