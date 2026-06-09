<template>
  <div class="vh-page">

    <!-- ── Hero ── -->
    <section class="vh-hero">
      <div class="vh-hero-glow" aria-hidden="true" />
      <div class="vh-container" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
        <div class="vh-logo-wrap">
          <img src="/logo.png" alt="Velocity logo" class="vh-logo" />
        </div>
        <h1 class="vh-title">VELOCITY</h1>
        <p class="vh-subtitle">An AI acceleration layer for Coding Assistants.</p>
        <p class="vh-desc">An engineering harness for AI coding assistants - unifying project intelligence, agent roles, an AI-native SDLC, deterministic guardrails, and a self-improving RALPH loop into one shared foundation.</p>
        <div class="vh-cta-row">
          <a href="/guide/overview" class="vh-btn vh-btn--primary">Quick Start →</a>
          <a href="/skills/" class="vh-btn vh-btn--ghost">Browse Skills</a>
          <a href="https://github.com/surya-manne/velocity" class="vh-btn vh-btn--ghost" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </div>
      </div>
      <button class="vh-scroll-hint" aria-label="Scroll down" @click="scrollToFeatures">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </section>

    <!-- ── Feature cards ── -->
    <section class="vh-features">
      <div class="vh-container">
        <div class="vh-feature-grid">
          <div class="vh-card">
            <div class="vh-card-icon vh-card-icon--gold">⚙</div>
            <h3 class="vh-card-title vh-card-title--gold">AI-Native SDLC</h3>
            <p>End-to-end engineering pipelines for every motion — features, bug fixes, refactors, and extensions — driven by deterministic skill chains from intent to merged code.</p>
          </div>
          <div class="vh-card">
            <div class="vh-card-icon vh-card-icon--brand">Λ</div>
            <h3 class="vh-card-title vh-card-title--brand">Project Intelligence</h3>
            <p>Deep semantic awareness of your stack, architecture, and domain language — injected into every session so assistants stop guessing and start knowing.</p>
          </div>
          <div class="vh-card">
            <div class="vh-card-icon vh-card-icon--red">⟳</div>
            <h3 class="vh-card-title vh-card-title--red">RALPH Loop</h3>
            <p>A self-improving feedback engine that annotates skill outputs, extracts failure patterns, and continuously hardens prompts - so every run leaves the system more learned than before.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Canonical Skill Chain ── -->
    <section class="vh-chain-section">
      <div class="vh-container">
        <h2 class="vh-section-title">The Canonical Skill Chain</h2>
        <p class="vh-section-sub">A deterministic workflow for non-deterministic agents.</p>
        <div class="vh-chain">
          <div class="vh-chain-step vh-chain-step--first">
            <div class="vh-chain-eyebrow">STEP 01</div>
            <div class="vh-chain-name">Grill with Docs</div>
          </div>
          <div class="vh-chain-conn" aria-hidden="true" />
          <div class="vh-chain-step">
            <div class="vh-chain-eyebrow">STEP 02</div>
            <div class="vh-chain-name">To PRD</div>
          </div>
          <div class="vh-chain-conn" aria-hidden="true" />
          <div class="vh-chain-step">
            <div class="vh-chain-eyebrow">STEP 03</div>
            <div class="vh-chain-name">To Features</div>
          </div>
          <div class="vh-chain-conn" aria-hidden="true" />
          <div class="vh-chain-step">
            <div class="vh-chain-eyebrow">STEP 04</div>
            <div class="vh-chain-name">To Tasks</div>
          </div>
          <div class="vh-chain-conn" aria-hidden="true" />
          <div class="vh-chain-step">
            <div class="vh-chain-eyebrow">STEP 05</div>
            <div class="vh-chain-name">TDD</div>
          </div>
          <div class="vh-chain-conn" aria-hidden="true" />
          <div class="vh-chain-step vh-chain-step--finish">
            <div class="vh-chain-eyebrow">FINISH</div>
            <div class="vh-chain-name">Handoff</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Loop callout ── -->
    <section class="vh-loop-callout">
      <div class="vh-container vh-loop-inner">
        <div class="vh-loop-badge">⟳ AUTONOMOUS</div>
        <h2 class="vh-loop-title">Run the entire chain with <code>/loop</code></h2>
        <p class="vh-loop-desc">One command executes every step of the skill chain autonomously — task by task, in isolated context windows, with automatic human-in-the-loop pauses for high-risk decisions. The loop state is saved to disk so it can resume after any interruption.</p>
        <a href="/guide/loop" class="vh-btn vh-btn--primary">Learn about /loop →</a>
      </div>
    </section>

    <!-- ── Agent Context Protocol ── -->
    <section class="vh-protocol">
      <div class="vh-container vh-protocol-inner">
        <div class="vh-proto-copy">
          <h2>Agent Context Protocol</h2>
          <p>Velocity eliminates context bloat through token-optimized, progressive disclosure — surfacing only what the active skill needs, when it needs it, without overwhelming the model window.</p>
          <ul class="vh-proto-list">
            <li>
              <span class="vh-proto-icon">⚡</span>
              <div>
                <strong>Always-On Context</strong>
                <span>Lean, persistent metadata — architecture rules, domain glossary, and project constraints loaded every session.</span>
              </div>
            </li>
            <li>
              <span class="vh-proto-icon">◈</span>
              <div>
                <strong>Progressive Disclosure</strong>
                <span>Context expands incrementally per skill step — only the files and patterns relevant to the current phase are injected.</span>
              </div>
            </li>
            <li>
              <span class="vh-proto-icon">⌘</span>
              <div>
                <strong>Token Budget Enforcement</strong>
                <span>Caveats and scope boundaries are explicitly declared, keeping the model focused and output deterministic.</span>
              </div>
            </li>
          </ul>
        </div>
        <div class="vh-terminal">
          <div class="vh-terminal-chrome">
            <span class="vh-dot vh-dot--r" /><span class="vh-dot vh-dot--g" /><span class="vh-dot vh-dot--b" />
          </div>
          <div class="vh-terminal-body">
            <p class="t-gold"># context injection: to-features</p>
            <p class="t-dim">// Always-On (312 tokens)</p>
            <p>✓ CONTEXT.md, ARCHITECTURE.md loaded</p>
            <p class="t-dim">// Skill-Level (progressive disclosure)</p>
            <p class="t-blue">+ docs/REQUIREMENTS/feature-auth.md</p>
            <p class="t-blue">+ agents/MEMORY.md</p>
            <p class="t-dim">// Caveats applied</p>
            <div class="vh-guard">[SCOPE] Out-of-scope: DB migrations, auth config. Use dedicated skills.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── AI-Native SDLC ── -->
    <section class="vh-sdlc">
      <div class="vh-container">
        <div class="vh-sdlc-header">
          <div>
            <h2>AI-Native SDLC</h2>
            <p>Optimized pipelines for every engineering motion. Stop generic chatting and start high-velocity engineering.</p>
          </div>
          <div class="vh-badges">
            <span>Claude Code</span>
            <span>Cursor</span>
            <span>GitHub Copilot</span>
            <span>Gemini</span>
          </div>
        </div>
        <div class="vh-sdlc-grid">
          <div class="vh-sdlc-card">
            <div class="vh-sdlc-label vh-sdlc-label--gold">Feature</div>
            <p>End-to-end implementation from PRD to type-safe code.</p>
          </div>
          <div class="vh-sdlc-card">
            <div class="vh-sdlc-label vh-sdlc-label--red">Bug Fix</div>
            <p>Auto-repro, isolation, and regression test generation.</p>
          </div>
          <div class="vh-sdlc-card">
            <div class="vh-sdlc-label vh-sdlc-label--blue">Extend</div>
            <p>Pattern matching for seamless logic duplication.</p>
          </div>
          <div class="vh-sdlc-card">
            <div class="vh-sdlc-label vh-sdlc-label--gold">Refactor</div>
            <p>Code quality improvement with strict lint/test loops.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="vh-footer">
      <div class="vh-footer-showcase" aria-hidden="true">
        <span class="vh-footer-wordmark">VELOCITY</span>
      </div>
      <div class="vh-footer-bottom">
        <p class="vh-footer-status">
          <span class="vh-status-dot"></span> Active Development
        </p>
        <p class="vh-footer-bottom-links">
          <a href="/guide/overview">Docs</a>
          <a href="/guide/installation">Quick Start</a>
          <a href="https://github.com/surya-manne/velocity" target="_blank" rel="noopener">GitHub</a>
          <a href="https://github.com/surya-manne/velocity/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup>
function scrollToFeatures() {
  const el = document.querySelector('.vh-features');
  if (!el) return;
  const navHeight = document.querySelector('.VPNav')?.offsetHeight ?? 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 24;
  window.scrollTo({ top, behavior: 'smooth' });
}
</script>

<style scoped>
/* ── Reset / base ── */
.vh-page {
  width: 100%;
  background: #020810;
  color: #eaf0f8;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
  line-height: 1.65;
}

.vh-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Hero ── */
.vh-hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 1.5rem 6rem;
  overflow: hidden;
}

.vh-hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255,192,2,0.11) 0%, transparent 65%);
  pointer-events: none;
}

.vh-logo-wrap {
  margin-bottom: 2.25rem;
}

.vh-logo {
  width: 110px;
  height: 110px;
  filter: drop-shadow(0 0 36px rgba(255,192,2,0.26));
}

.vh-title {
  font-size: clamp(3.6rem, 10vw, 5.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.125;
  background: linear-gradient(160deg, #ffffff 0%, #ffe066 45%, #ffc002 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem;
  filter: drop-shadow(0 0 28px rgba(255,192,2,0.22));
}

.vh-subtitle {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #d4c5ab;
  max-width: 42ch;
  margin: 0 auto 1.25rem;
  line-height: 1.2;
}

.vh-desc {
  max-width: 62ch;
  margin: 0 auto 2.75rem;
  color: #8ba5c0;
  font-size: 1.125rem;
  line-height: 1.8;
}

.vh-tags-gone {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 3rem;
}

.vh-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.42rem 0.9rem;
  border: 1px solid rgba(232,160,32,0.4);
  border-radius: 999px;
  background: rgba(7,18,32,0.84);
  color: #dce8f5;
  font-size: 0.84rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.vh-tag--gold {
  border-color: rgba(255,192,2,0.55);
  background: rgba(255,192,2,0.09);
  color: #fff0b8;
}

.vh-cta-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.vh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.85rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.98rem;
  text-decoration: none !important;
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;
  cursor: pointer;
}

.vh-btn--primary {
  background: #ffc002;
  color: #261a00 !important;
}
.vh-btn--primary:hover {
  background: #e6a800;
  transform: translateY(-2px);
  box-shadow: 0 0 24px rgba(255,192,2,0.38);
}

.vh-btn--ghost {
  background: rgba(10,26,46,0.72);
  border: 1px solid rgba(255,255,255,0.13);
  color: #eaf0f8 !important;
  backdrop-filter: blur(8px);
}
.vh-btn--ghost:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-1px);
}

.vh-scroll-hint {
  position: absolute;
  bottom: 2.25rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(139, 165, 192, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  animation: vh-bounce 2s ease-in-out infinite;
  transition: color 0.2s;
}
.vh-scroll-hint:hover {
  color: rgba(255, 192, 2, 0.75);
}

@keyframes vh-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
}

/* ── Features ── */
.vh-features {
  padding: 2rem 0 4rem;
}

.vh-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.vh-card {
  padding: 2rem;
  background: rgba(10,26,46,0.80);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  transition: border-color 0.2s, transform 0.2s;
}
.vh-card:hover {
  border-color: rgba(255,192,2,0.22);
  transform: translateY(-2px);
}

.vh-card-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.15rem;
  margin-bottom: 1.25rem;
}
.vh-card-icon--gold  { background: rgba(255,192,2,0.12); color: #ffc002; border: 1px solid rgba(255,192,2,0.28); }
.vh-card-icon--brand { background: rgba(232,160,32,0.12); color: #e8a020; border: 1px solid rgba(232,160,32,0.28); }
.vh-card-icon--red   { background: rgba(255,90,90,0.12);  color: #ff6b6b; border: 1px solid rgba(255,90,90,0.28); }

.vh-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}
.vh-card-title--gold  { color: #ffc002; }
.vh-card-title--brand { color: #e8a020; }
.vh-card-title--red   { color: #ff6b6b; }

.vh-card p {
  color: #8ba5c0;
  font-size: 0.93rem;
  line-height: 1.7;
  margin: 0;
}

/* ── Data Flow Diagram ── */
.vh-flow-section {
  padding: 6rem 0 5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.vh-flow-diagram {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 3.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

/* Nodes */
.vh-flow-node {
  flex: 0 0 auto;
  min-width: 148px;
  padding: 1.25rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: #05111f;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.vh-flow-node--ide {
  border-color: rgba(255,192,2,0.35);
  background: rgba(255,192,2,0.06);
}

.vh-flow-node--router {
  border-color: rgba(74,158,255,0.35);
  background: rgba(74,158,255,0.05);
}

.vh-flow-node--intel {
  border-color: rgba(255,192,2,0.35);
  background: rgba(255,192,2,0.05);
  min-width: 168px;
}

.vh-flow-node--skills {
  border-color: rgba(255,192,2,0.45);
  background: rgba(255,192,2,0.07);
  min-width: 160px;
}

.vh-flow-node--output {
  border-color: rgba(74,158,255,0.45);
  background: rgba(74,158,255,0.07);
}

.vh-flow-node-eyebrow {
  font-family: "Fira Mono", monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8ba5c0;
}

.vh-flow-node--ide .vh-flow-node-eyebrow,
.vh-flow-node--intel .vh-flow-node-eyebrow,
.vh-flow-node--skills .vh-flow-node-eyebrow { color: #c89a00; }

.vh-flow-node-title {
  font-size: 1rem;
  font-weight: 800;
  color: #eaf0f8;
  line-height: 1.2;
}

.vh-flow-node-detail {
  font-size: 0.72rem;
  color: #6a8aaa;
  line-height: 1.55;
}

.vh-flow-node-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.vh-flow-node-tags span {
  font-size: 0.65rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(255,192,2,0.12);
  color: #fff0b8;
  font-weight: 600;
  border: 1px solid rgba(255,192,2,0.2);
  white-space: nowrap;
}

/* Arrows */
.vh-flow-arrow {
  flex: 1 1 auto;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.25rem;
}

.vh-flow-arrow-label {
  font-size: 0.64rem;
  color: #4a6a8a;
  font-family: "Fira Mono", monospace;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.vh-flow-arrow-line {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vh-flow-arrow-line::before {
  content: '';
  position: absolute;
  left: 0;
  right: 16px;
  top: 50%;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,192,2,0.3), rgba(74,158,255,0.3));
}

.vh-flow-arrow-head {
  position: relative;
  color: rgba(74,158,255,0.7);
  font-size: 1.1rem;
  line-height: 1;
  margin-left: auto;
}

/* RALPH feedback bar */
.vh-flow-feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(252,129,74,0.2);
  background: rgba(252,129,74,0.04);
}

.vh-flow-feedback-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(252,129,74,0.35), transparent);
}

.vh-flow-feedback-label {
  font-size: 0.78rem;
  font-family: "Fira Mono", monospace;
  color: #c06030;
  white-space: nowrap;
  letter-spacing: 0.03em;
}

/* ── Skill Chain ── */
.vh-chain-section {
  padding: 5.5rem 0 5rem;
  background: linear-gradient(180deg, rgba(5,17,31,0.55) 0%, rgba(5,17,31,0.96) 100%);
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.vh-section-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  text-align: center;
  color: #eaf0f8;
  margin: 0 0 0.55rem;
}

.vh-section-sub {
  text-align: center;
  color: #8ba5c0;
  font-size: 1rem;
  margin: 0 0 3rem;
}

.vh-chain {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.vh-chain-step {
  flex: 1;
  min-width: 140px;
  max-width: 220px;
  padding: 1.2rem 1rem;
  background: rgba(10,26,46,0.72);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 14px;
  text-align: center;
}

.vh-chain-step--first {
  border-left: 4px solid #ffc002;
}

.vh-chain-step--finish {
  background: #ffc002;
  border-color: transparent;
}
.vh-chain-step--finish .vh-chain-eyebrow,
.vh-chain-step--finish .vh-chain-name { color: #261a00; }

.vh-chain-eyebrow {
  font-family: "Fira Mono", monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8ba5c0;
  margin-bottom: 0.5rem;
}

.vh-chain-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #eaf0f8;
  line-height: 1.25;
}

.vh-chain-conn {
  flex: 0 0 2rem;
  height: 1px;
  align-self: center;
  background: linear-gradient(90deg, rgba(255,192,2,0.28) 0%, rgba(232,160,32,0.28) 100%);
}

/* ── Loop Callout ── */
.vh-loop-callout {
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(255,192,2,0.07) 0%, rgba(10,26,46,0.6) 60%);
  border-top: 1px solid rgba(255,192,2,0.18);
  border-bottom: 1px solid rgba(255,192,2,0.18);
  text-align: center;
}

.vh-loop-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.vh-loop-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255,192,2,0.55);
  background: rgba(255,192,2,0.09);
  color: #fff0b8;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: "Fira Mono", monospace;
}

.vh-loop-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #eaf0f8;
  margin: 0;
}

.vh-loop-title code {
  color: #ffc002;
  background: rgba(255,192,2,0.10);
  padding: 0.1em 0.45em;
  border-radius: 6px;
  font-size: 0.9em;
}

.vh-loop-desc {
  max-width: 600px;
  color: #8ba5c0;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

/* ── Agent Context Protocol ── */
.vh-protocol {
  padding: 6.5rem 0;
}

.vh-protocol-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4.5rem;
  align-items: center;
}

.vh-proto-copy h2 {
  font-size: clamp(1.9rem, 3.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #eaf0f8;
  margin: 0 0 1rem;
}

.vh-proto-copy > p {
  color: #8ba5c0;
  font-size: 0.98rem;
  line-height: 1.8;
  max-width: 52ch;
  margin: 0 0 2rem;
}

.vh-proto-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.vh-proto-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.vh-proto-icon {
  flex: 0 0 auto;
  font-size: 1.1rem;
  color: #ffc002;
  margin-top: 0.05rem;
}

.vh-proto-list strong {
  display: block;
  color: #eaf0f8;
  font-size: 0.94rem;
  margin-bottom: 0.18rem;
}

.vh-proto-list span {
  color: #8ba5c0;
  font-size: 0.87rem;
  line-height: 1.55;
}

/* Terminal */
.vh-terminal {
  border-radius: 18px;
  background: rgba(10,26,46,0.85);
  border: 1px solid rgba(232,160,32,0.18);
  box-shadow: 0 22px 60px rgba(0,0,0,0.38);
  overflow: hidden;
}

.vh-terminal-chrome {
  display: flex;
  gap: 0.45rem;
  padding: 0.8rem 1.2rem;
  background: rgba(5,10,20,0.6);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.vh-dot { width: 0.62rem; height: 0.62rem; border-radius: 50%; }
.vh-dot--r { background: rgba(255,90,90,0.72); }
.vh-dot--g { background: rgba(255,192,2,0.65); }
.vh-dot--b { background: rgba(232,160,32,0.62); }

.vh-terminal-body {
  padding: 1.5rem 1.6rem 1.8rem;
  font-family: "Fira Mono", "Consolas", monospace;
  font-size: 0.84rem;
  line-height: 1.75;
}

.vh-terminal-body p {
  margin: 0 0 0.3rem;
  color: #c7d4e2;
}

.t-gold { color: #ffc002 !important; }
.t-blue { color: #e8a020 !important; }
.t-dim  { color: #5a7a99 !important; font-style: italic; }

.vh-guard {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-left: 2px solid rgba(255,192,2,0.75);
  background: rgba(255,255,255,0.03);
  border-radius: 0 8px 8px 0;
  color: #c7d4e2;
  font-size: 0.78rem;
  line-height: 1.55;
}

/* ── AI-Native SDLC ── */
.vh-sdlc {
  padding: 5.5rem 0;
  background: rgba(5,17,31,0.42);
  border-top: 1px solid rgba(255,255,255,0.06);
}

.vh-sdlc-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.vh-sdlc-header h2 {
  font-size: clamp(1.9rem, 3.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #eaf0f8;
  margin: 0 0 0.5rem;
}

.vh-sdlc-header p {
  color: #8ba5c0;
  font-size: 0.94rem;
  max-width: 46ch;
  margin: 0;
  line-height: 1.65;
}

.vh-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vh-badges span {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.78rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  color: #8ba5c0;
  font-size: 0.82rem;
  font-weight: 600;
}

.vh-sdlc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.vh-sdlc-card {
  padding: 1.4rem 1.3rem;
  background: rgba(255,255,255,0.028);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  min-height: 10rem;
  transition: background 0.2s;
}
.vh-sdlc-card:hover {
  background: rgba(255,255,255,0.05);
}

.vh-sdlc-label {
  font-weight: 700;
  font-size: 0.97rem;
  margin-bottom: 0.65rem;
}
.vh-sdlc-label--gold { color: #ffc002; }
.vh-sdlc-label--red  { color: #ff6b6b; }
.vh-sdlc-label--blue { color: #e8a020; }

.vh-sdlc-card p {
  color: #8ba5c0;
  font-size: 0.88rem;
  line-height: 1.65;
  margin: 0;
}

/* ── Footer ── */
.vh-footer {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 1.5rem clamp(1.25rem, 5vw, 4rem) 1.5rem;
  background: color-mix(in srgb, #020810 92%, #000 8%);
  overflow: hidden;
  box-sizing: border-box;
}

.vh-footer-showcase {
  position: relative;
  width: calc(100% + (2 * clamp(1.25rem, 5vw, 4rem)));
  margin: 0 calc(-1 * clamp(1.25rem, 5vw, 4rem)) 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}

.vh-footer-wordmark {
  display: inline-block;
  font-size: clamp(4rem, 21vw, 999rem);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 192, 2, 0.28);
  text-shadow: rgba(255, 192, 2, 0.05) 0px 0px 60px;
  white-space: nowrap;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}

.vh-footer-bottom {
  max-width: min(1180px, 100%);
  margin: 1.5rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  justify-content: space-between;
  align-items: center;
}

.vh-footer-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  font-size: 0.82rem;
  color: #8ba5c0;
  letter-spacing: 0.01em;
}

.vh-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(74, 222, 128);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18), 0 0 12px rgba(74, 222, 128, 0.45);
  animation: vh-status-pulse 2.4s ease-in-out infinite;
}

@keyframes vh-status-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18), 0 0 12px rgba(74, 222, 128, 0.45); }
  50%       { box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.08), 0 0 20px rgba(74, 222, 128, 0.25); }
}

.vh-footer-bottom-links {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.2rem;
}

.vh-footer-bottom-links a {
  font-size: 0.82rem;
  color: rgba(139, 165, 192, 0.7);
  text-decoration: none;
  transition: color 0.15s;
}
.vh-footer-bottom-links a:hover {
  color: #ffc002;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .vh-feature-grid   { grid-template-columns: 1fr; }
  .vh-protocol-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .vh-sdlc-header    { flex-direction: column; align-items: flex-start; }
  .vh-badges         { justify-content: flex-start; }
  .vh-sdlc-grid      { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .vh-title          { font-size: 3.4rem; }
  .vh-chain          { flex-direction: column; align-items: stretch; }
  .vh-chain-step     { max-width: none; }
  .vh-chain-conn     {
    width: 1px; height: 1.5rem; min-width: 0; flex: 0 0 1.5rem;
    align-self: center;
    background: linear-gradient(180deg, rgba(255,192,2,0.3) 0%, rgba(232,160,32,0.3) 100%);
  }
  .vh-sdlc-grid    { grid-template-columns: 1fr 1fr; }
}
</style>
