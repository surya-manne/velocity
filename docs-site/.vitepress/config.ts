import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: "/velocity/",
    title: "Velocity",
    description:
      "The Acceleration Layer for AI Coding Assistants — project intelligence, guardrails, and skills for Cursor, Claude Code, Copilot, and Gemini.",
    ignoreDeadLinks: true,
    srcDir: ".",
    head: [
      ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
      [
        "link",
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
      ],
      [
        "link",
        {
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
          rel: "stylesheet",
        },
      ],
      ["link", { rel: "icon", type: "image/png", href: "/velocity/logo.png" }],
      ["meta", { name: "theme-color", content: "#ffc002" }],
      ["meta", { property: "og:type", content: "website" }],
      [
        "meta",
        {
          property: "og:title",
          content: "Velocity — AI Coding Acceleration Layer",
        },
      ],
      [
        "meta",
        {
          property: "og:description",
          content:
            "Transform any AI coding assistant into a project-aware engineering organization.",
        },
      ],
    ],
    themeConfig: {
      siteTitle: "Velocity",
      logo: "/logo.png",

      outline: {
        level: [2, 3],
        label: "On this page",
      },

      nav: [
        { text: "Overview", link: "/guide/how-it-works" },
        { text: "Guide", link: "/guide/overview" },
        { text: "Skills", link: "/skills/" },
        { text: "Adapters", link: "/adapters/" },
        { text: "Enterprise", link: "/enterprise/governance" },
        { text: "Reference", link: "/reference/agents" },
      ],

      sidebar: {
        "/guide/": [
          {
            text: "Introduction",
            items: [
              { text: "What is Velocity?", link: "/guide/overview" },
              { text: "Key Concepts", link: "/guide/concepts" },
              { text: "Smart Router", link: "/guide/smart-router" },
              { text: "SDLC Pipeline", link: "/guide/sdlc-pipeline" },
              { text: "Installation", link: "/guide/installation" },
              { text: "Quickstart", link: "/guide/quickstart" },
            ],
          },
          {
            text: "Core Workflow",
            items: [
              {
                text: "Project Intelligence",
                link: "/guide/project-intelligence",
              },
              { text: "RALPH Loop", link: "/guide/consumer-ralph" },
              { text: "Canonical Skill Chain", link: "/guide/skill-chain" },
              { text: "Guardrails & Hooks", link: "/guide/guardrails" },
              { text: "Autonomous Loop", link: "/guide/loop" },
            ],
          },
          {
            text: "Architecture",
            items: [
              { text: "CONTEXT.md", link: "/guide/context" },
              { text: "Agents & Subagents", link: "/guide/agents" },
              { text: "Token Optimization", link: "/guide/token-optimization" },
              { text: "Knowledge Base", link: "/guide/knowledge-base" },
            ],
          },
        ],
        "/skills/": [
          {
            text: "Skills Overview",
            items: [{ text: "All Skills", link: "/skills/" }],
          },
          {
            text: "Bootstrap",
            items: [
              { text: "/init", link: "/skills/init" },
              { text: "/plugin-installer", link: "/skills/plugin-installer" },
              { text: "/local-installer", link: "/skills/local-installer" },
              { text: "/sync", link: "/skills/sync" },
              { text: "/validate", link: "/skills/validate" },
            ],
          },
          {
            text: "Discovery & Product",
            items: [
              { text: "/grill-me", link: "/skills/grill-me" },
              { text: "/grill-with-docs", link: "/skills/grill-with-docs" },
              { text: "/to-prd", link: "/skills/to-prd" },
              { text: "/to-features", link: "/skills/to-features" },
              { text: "/to-tasks", link: "/skills/to-tasks" },
            ],
          },
          {
            text: "Engineering",
            items: [
              { text: "/tdd", link: "/skills/tdd" },
              { text: "/loop", link: "/skills/loop" },
              { text: "/handoff", link: "/skills/handoff" },
            ],
          },
          {
            text: "Standards",
            items: [
              { text: "/rule-pack-engine", link: "/skills/rule-pack-engine" },
              { text: "/marketplace", link: "/skills/marketplace" },
            ],
          },
          {
            text: "Governance",
            items: [
              { text: "/audit-trail", link: "/skills/audit-trail" },
              { text: "/approval-workflow", link: "/skills/approval-workflow" },
              { text: "/risk-score", link: "/skills/risk-score" },
            ],
          },
        ],
        "/adapters/": [
          {
            text: "Adapters",
            items: [
              { text: "Overview", link: "/adapters/" },
              { text: "Installable Plugins", link: "/adapters/plugins" },
              { text: "Cursor", link: "/adapters/cursor" },
              { text: "Claude Code", link: "/adapters/claude-code" },
              { text: "GitHub Copilot", link: "/adapters/copilot" },
              { text: "Gemini", link: "/adapters/gemini" },
            ],
          },
        ],
        "/enterprise/": [
          {
            text: "Enterprise",
            items: [
              { text: "Governance", link: "/enterprise/governance" },
              { text: "Compliance Packs", link: "/enterprise/compliance" },
              { text: "Workspace Intelligence", link: "/enterprise/workspace" },
              { text: "Audit Trail", link: "/enterprise/audit" },
            ],
          },
        ],
        "/reference/": [
          {
            text: "Reference",
            items: [
              { text: "Agents Roster", link: "/reference/agents" },
              { text: "Rule Packs", link: "/reference/rule-packs" },
              { text: "Schemas", link: "/reference/schemas" },
              {
                text: ".velocity/ Structure",
                link: "/reference/velocity-structure",
              },
            ],
          },
        ],
      },

      socialLinks: [
        { icon: "github", link: "https://github.com/surya-manne/velocity" },
      ],

      search: {
        provider: "local",
      },

      editLink: {
        pattern: "https://github.com/surya-manne/velocity/edit/main/docs/:path",
        text: "Edit this page",
      },
    },

    markdown: {
      theme: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      math: false,
    },

    mermaid: {
      theme: "dark",
    },
  }),
);
