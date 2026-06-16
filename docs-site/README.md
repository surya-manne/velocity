# Velocity Documentation Site

A complete VitePress documentation website for the Velocity AI Coding Acceleration Layer.

## Stack

- **Framework:** [VitePress 1.6](https://vitepress.dev) — Vue-powered static site generator
- **Theme:** Custom dark theme using the Rosetta color palette
- **Hosting:** Any static host (GitHub Pages, Vercel, Netlify, internal CDN)

## Color Palette

Sourced from [Rosetta (griddynamics.github.io/rosetta)](https://griddynamics.github.io/rosetta):

| Variable    | Value     | Usage                              |
| ----------- | --------- | ---------------------------------- |
| `--bg`      | `#020810` | Page background                    |
| `--bg-2`    | `#05111f` | Alternate background               |
| `--panel`   | `#0a1a2e` | Cards, code blocks                 |
| `--panel-2` | `#0e2038` | Elevated surfaces                  |
| `--text`    | `#eaf0f8` | Primary text                       |
| `--muted`   | `#8ba5c0` | Secondary text                     |
| `--brand`   | `#4a9eff` | Brand blue accent                  |
| `--gd-gold` | `#ffc002` | Primary accent (links, highlights) |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # Site config + navigation
│   └── theme/
│       ├── index.ts       # Theme entry
│       └── custom.css     # Rosetta color palette + overrides
├── index.md               # Homepage
├── guide/                 # Getting started + core concepts
├── skills/                # All 46 skills documented
├── adapters/              # Cursor, Claude Code, Copilot, Gemini
├── enterprise/            # Governance, compliance, workspace
└── reference/             # Agents, schemas, .velocity/ structure
```

## Deploying

### GitHub Pages

```yaml
# .github/workflows/docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
    paths: ["docs/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd docs && npm ci && npm run docs:build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### Vercel / Netlify

Set build command: `cd docs && npm run docs:build`
Set output directory: `docs/.vitepress/dist`
