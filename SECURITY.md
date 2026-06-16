# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Velocity, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainers directly or use GitHub's private vulnerability reporting feature on this repository.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Scope

Velocity is a prompt-driven platform — it generates configuration files, not executable server code. The primary security concerns are:

- **Secrets in generated files**: Velocity guardrails prevent secrets from appearing in skill files or plugin bundles.
- **Prompt injection**: Skills and agents must not be vulnerable to prompt injection from untrusted input.
- **Supply chain**: Plugin bundles are generated from canonical sources and validated by CI.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
