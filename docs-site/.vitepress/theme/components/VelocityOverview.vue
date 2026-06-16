<template>
  <div class="vo-page">
    <div class="vo-container">

      <!-- Header -->
      <div class="vo-header">
        <h1 class="vo-title">How Velocity Works</h1>
        <p class="vo-subtitle">Every request flows through the same governed pipeline — from IDE to merged, validated code.</p>
      </div>

      <!-- Data Flow Diagram -->
      <div class="vo-diagram-wrap">
        <div class="vo-diagram">

          <div class="vo-node vo-node--ide vo-node--anim" style="--i:0">
            <div class="vo-eyebrow">INPUT</div>
            <div class="vo-node-title">Your IDE</div>
            <div class="vo-tags">
              <span>Cursor</span><span>Claude Code</span><span>VS Code</span><span>Copilot</span>
            </div>
          </div>

          <div class="vo-arrow vo-arrow--anim" style="--i:1">
            <div class="vo-arrow-label">user request</div>
            <div class="vo-arrow-line"><span class="vo-arrow-head">→</span></div>
          </div>

          <div class="vo-node vo-node--router vo-node--anim" style="--i:2">
            <div class="vo-eyebrow">CLASSIFY</div>
            <div class="vo-node-title">Smart Router</div>
            <div class="vo-detail">feature · bug · refactor<br/>extend · research</div>
          </div>

          <div class="vo-arrow vo-arrow--anim" style="--i:3">
            <div class="vo-arrow-label">classified intent</div>
            <div class="vo-arrow-line"><span class="vo-arrow-head">→</span></div>
          </div>

          <div class="vo-node vo-node--intel vo-node--anim" style="--i:4">
            <div class="vo-eyebrow">LOAD</div>
            <div class="vo-node-title">Project Intelligence</div>
            <div class="vo-detail">CONTEXT.md · stack fingerprint<br/>ADRs · guardrails · patterns</div>
          </div>

          <div class="vo-arrow vo-arrow--anim" style="--i:5">
            <div class="vo-arrow-label">context bundle</div>
            <div class="vo-arrow-line"><span class="vo-arrow-head">→</span></div>
          </div>

          <div class="vo-node vo-node--skills vo-node--anim" style="--i:6">
            <div class="vo-eyebrow">EXECUTE</div>
            <div class="vo-node-title">Skill Chain</div>
            <div class="vo-detail">PRD → features → tasks<br/>TDD → validate → handoff</div>
          </div>

          <div class="vo-arrow vo-arrow--anim" style="--i:7">
            <div class="vo-arrow-label">validated artifacts</div>
            <div class="vo-arrow-line"><span class="vo-arrow-head">→</span></div>
          </div>

          <div class="vo-node vo-node--output vo-node--anim" style="--i:8">
            <div class="vo-eyebrow">OUTPUT</div>
            <div class="vo-node-title">Handoff Ready</div>
            <div class="vo-detail">tests passing · docs updated<br/>guardrails cleared</div>
          </div>

        </div>

        <!-- RALPH feedback bar -->
        <div class="vo-feedback vo-feedback--anim">
          <div class="vo-feedback-line" />
          <div class="vo-feedback-label">⟳ RALPH Loop — annotates outputs · learns patterns · hardens skills</div>
          <div class="vo-feedback-line" />
        </div>
      </div>

      <!-- Five Stages -->
      <div class="vo-stages">
        <h2 class="vo-section-title">The Five Stages</h2>
        <div class="vo-stage-grid">

          <div class="vo-stage vo-stage--ide">
            <div class="vo-stage-num">01</div>
            <div class="vo-stage-body">
              <h3>Your IDE — Input</h3>
              <p>You type a request in Cursor, Claude Code, VS Code Copilot, or Gemini. Velocity is assistant-agnostic — the same pipeline runs regardless of which tool you use.</p>
            </div>
          </div>

          <div class="vo-stage vo-stage--router">
            <div class="vo-stage-num">02</div>
            <div class="vo-stage-body">
              <h3>Smart Router — Classify</h3>
              <p>Before any work begins, the router classifies your request into a work type. Classification drives which context, phases, and checks load. The assistant never guesses.</p>
              <div class="vo-work-types">
                <div><span class="vo-tag vo-tag--gold">Feature</span> Discovery → Design → Build → Validate → Release</div>
                <div><span class="vo-tag vo-tag--red">Bug Fix</span> Reproduce → Root Cause → Fix → Validate → Release</div>
                <div><span class="vo-tag vo-tag--blue">Extend</span> Context Load → Impact Analysis → Build → Validate</div>
                <div><span class="vo-tag vo-tag--gold">Refactor</span> Analysis → Proposal → Refactor → Validate</div>
              </div>
            </div>
          </div>

          <div class="vo-stage vo-stage--intel">
            <div class="vo-stage-num">03</div>
            <div class="vo-stage-body">
              <h3>Project Intelligence — Load</h3>
              <p>Velocity loads exactly the context that phase needs — nothing more. Context loads in three tiers: always-on metadata (80 lines), skill-level files (on demand), and full agent system prompt (at agent spawn).</p>
              <ul>
                <li><strong>CONTEXT.md</strong> — domain language, bounded contexts, architectural constraints</li>
                <li><strong>Stack fingerprint</strong> — detected framework, test runner, linter, build tool</li>
                <li><strong>Relevant ADRs</strong> — only decisions that affect the current phase</li>
                <li><strong>Guardrail rules</strong> — active hooks and compliance checks</li>
              </ul>
            </div>
          </div>

          <div class="vo-stage vo-stage--skills">
            <div class="vo-stage-num">04</div>
            <div class="vo-stage-body">
              <h3>Skill Chain — Execute</h3>
              <p>The classified intent and loaded context feed into the matching skill chain. Each skill produces one artifact that gates the next step. Human review gates sit between phases.</p>
              <div class="vo-chain-list">
                <div class="vo-chain-item"><code>/grill-me</code><span>→ discovery summary</span></div>
                <div class="vo-chain-item"><code>/to-prd</code><span>→ structured PRD</span></div>
                <div class="vo-chain-item"><code>/to-features</code><span>→ vertical slice board</span></div>
                <div class="vo-chain-item"><code>/to-tasks</code><span>→ task queue with risk scores</span></div>
                <div class="vo-chain-item"><code>/tdd</code><span>→ implemented + tested code</span></div>
                <div class="vo-chain-item"><code>/validate</code><span>→ 12-point quality gate</span></div>
                <div class="vo-chain-item"><code>/handoff</code><span>→ context reset artifact</span></div>
              </div>
            </div>
          </div>

          <div class="vo-stage vo-stage--output">
            <div class="vo-stage-num">05</div>
            <div class="vo-stage-body">
              <h3>Handoff Ready — Output</h3>
              <p>After <code>/validate</code> clears all 12 checks, <code>/handoff</code> produces a compact context reset artifact. The next session can pick up with full context — and the branch is ready for PR once the team is satisfied.</p>
            </div>
          </div>

        </div>
      </div>

      <!-- RALPH section -->
      <div class="vo-ralph">
        <div class="vo-ralph-inner">
          <div class="vo-ralph-icon">⟳</div>
          <div>
            <h2>RALPH Loop</h2>
            <p>Cutting across all five stages, the RALPH Loop continuously improves the local skill setup. It runs entirely inside the repository — nothing leaves automatically.</p>
            <div class="vo-ralph-steps">
              <div class="vo-ralph-step"><span>Annotate</span>Rate the output at each review gate</div>
              <div class="vo-ralph-step"><span>Learn</span>After 5+ ratings, patterns are identified</div>
              <div class="vo-ralph-step"><span>Propose</span>Targeted improvements to local skill files</div>
              <div class="vo-ralph-step"><span>Harden</span>Apply approved proposals</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related links -->
      <div class="vo-related">
        <h2 class="vo-section-title">Dig Deeper</h2>
        <div class="vo-related-grid">
          <a :href="withBase('/guide/smart-router')" class="vo-related-link">
            <div class="vo-related-label">Smart Router →</div>
            <div class="vo-related-desc">How requests are classified and routed to the right workflow</div>
          </a>
          <a :href="withBase('/guide/project-intelligence')" class="vo-related-link">
            <div class="vo-related-label">Project Intelligence →</div>
            <div class="vo-related-desc">Stack fingerprinting, CONTEXT.md, and progressive context loading</div>
          </a>
          <a :href="withBase('/guide/skill-chain')" class="vo-related-link">
            <div class="vo-related-label">Canonical Skill Chain →</div>
            <div class="vo-related-desc">The full end-to-end workflow from idea to PR</div>
          </a>
          <a :href="withBase('/guide/loop')" class="vo-related-link">
            <div class="vo-related-label">Autonomous Loop →</div>
            <div class="vo-related-desc">Run the entire chain autonomously with /loop</div>
          </a>
          <a :href="withBase('/guide/consumer-ralph')" class="vo-related-link">
            <div class="vo-related-label">RALPH Loop →</div>
            <div class="vo-related-desc">How the feedback cycle improves your local skills</div>
          </a>
          <a :href="withBase('/guide/installation')" class="vo-related-link vo-related-link--cta">
            <div class="vo-related-label">Get Started →</div>
            <div class="vo-related-desc">Install Velocity in your repository in minutes</div>
          </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { withBase } from 'vitepress';
</script>

<style scoped>
.vo-page {
  width: 100%;
  min-height: 100vh;
  background: #020810;
  color: #eaf0f8;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  padding: 4rem 0 6rem;
}

.vo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.vo-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.vo-title {
  font-size: 2.75rem;
  font-weight: 900;
  color: #eaf0f8;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
}

.vo-subtitle {
  font-size: 1.1rem;
  color: #8ba5c0;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.65;
}

/* Diagram */
.vo-diagram-wrap {
  margin-bottom: 4.5rem;
}

.vo-diagram {
  display: grid;
  grid-template-columns: 1fr 48px 1fr 48px 1fr 48px 1fr 48px 1fr;
  align-items: center;
  gap: 0;
  padding-bottom: 0.5rem;
  min-width: 0;
}

.vo-node {
  min-width: 0;
  padding: 1.4rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: #05111f;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vo-node--ide    { border-color: rgba(255,192,2,0.4);  background: rgba(255,192,2,0.06); }
.vo-node--router { border-color: rgba(255,192,2,0.25); background: rgba(255,192,2,0.03); }
.vo-node--intel  { border-color: rgba(255,192,2,0.4);  background: rgba(255,192,2,0.06); }
.vo-node--skills { border-color: rgba(255,192,2,0.5);  background: rgba(255,192,2,0.08); }
.vo-node--output { border-color: rgba(255,192,2,0.35); background: rgba(255,192,2,0.04); }

.vo-eyebrow {
  font-family: "Fira Mono", monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8ba5c0;
}
.vo-node--ide .vo-eyebrow,
.vo-node--router .vo-eyebrow,
.vo-node--intel .vo-eyebrow,
.vo-node--skills .vo-eyebrow,
.vo-node--output .vo-eyebrow { color: #c89a00; }

.vo-node-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #eaf0f8;
  line-height: 1.25;
}

.vo-detail {
  font-size: 0.7rem;
  color: #6a8aaa;
  line-height: 1.55;
}

.vo-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}
.vo-tags span {
  font-size: 0.62rem;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: rgba(255,192,2,0.12);
  color: #fff0b8;
  font-weight: 600;
  border: 1px solid rgba(255,192,2,0.2);
  white-space: nowrap;
}

/* Animations */
@keyframes vo-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes vo-pulse-dot {
  0%, 100% { opacity: 0.35; transform: translateX(0); }
  50%       { opacity: 1;    transform: translateX(4px); }
}

@keyframes vo-ralph-slide {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.vo-node--anim {
  animation: vo-fade-up 0.5s ease both;
  animation-delay: calc(var(--i) * 0.1s);
}

.vo-arrow--anim {
  animation: vo-fade-up 0.4s ease both;
  animation-delay: calc(var(--i) * 0.1s);
}

.vo-arrow--anim .vo-arrow-head {
  animation: vo-pulse-dot 1.8s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.35s);
}

.vo-feedback--anim .vo-feedback-label {
  background: linear-gradient(
    90deg,
    rgba(252,129,74,0.55) 0%,
    rgba(255,192,2,0.9) 40%,
    rgba(252,129,74,0.55) 80%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: vo-ralph-slide 3s linear infinite;
}

/* Arrows */
.vo-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0 0.2rem;
}
.vo-arrow-label {
  display: none;
}
.vo-arrow-line {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.vo-arrow-line::before {
  content: '';
  position: absolute;
  left: 0; right: 14px; top: 50%;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,192,2,0.2), rgba(255,192,2,0.35));
}
.vo-arrow-head {
  position: relative;
  color: rgba(255,192,2,0.55);
  font-size: 1rem;
  line-height: 1;
}

/* RALPH bar */
.vo-feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(252,129,74,0.2);
  background: rgba(252,129,74,0.04);
}
.vo-feedback-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(252,129,74,0.35), transparent);
}
.vo-feedback-label {
  font-size: 0.75rem;
  font-family: "Fira Mono", monospace;
  color: #c06030;
  white-space: nowrap;
}

/* Stages */
.vo-section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #eaf0f8;
  margin: 0 0 2rem;
  letter-spacing: -0.01em;
}

.vo-stages {
  margin-bottom: 4rem;
}

.vo-stage-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.vo-stage {
  display: flex;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  background: #05111f;
}

.vo-stage--ide    { border-left: 3px solid #ffc002; }
.vo-stage--router { border-left: 3px solid #ffc002; }
.vo-stage--intel  { border-left: 3px solid #ffc002; }
.vo-stage--skills { border-left: 3px solid #ffc002; }
.vo-stage--output { border-left: 3px solid rgba(255,192,2,0.4); }

.vo-stage-num {
  flex: 0 0 auto;
  font-family: "Fira Mono", monospace;
  font-size: 2rem;
  font-weight: 900;
  color: rgba(255,192,2,0.2);
  line-height: 1;
  padding-top: 0.15rem;
  min-width: 2.5rem;
}

.vo-stage-body h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #eaf0f8;
  margin: 0 0 0.5rem;
}

.vo-stage-body p {
  font-size: 0.9rem;
  color: #8ba5c0;
  margin: 0 0 0.75rem;
  line-height: 1.65;
}

.vo-stage-body ul {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.88rem;
  color: #8ba5c0;
  line-height: 1.7;
}

.vo-stage-body ul strong { color: #eaf0f8; }

/* Work types */
.vo-work-types {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: #8ba5c0;
}
.vo-tag {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-right: 0.4rem;
}
.vo-tag--gold { background: rgba(255,192,2,0.12); color: #fff0b8; border: 1px solid rgba(255,192,2,0.2); }
.vo-tag--red  { background: rgba(252,129,74,0.12); color: #ffd0b0; border: 1px solid rgba(252,129,74,0.2); }
.vo-tag--blue { background: rgba(74,158,255,0.12); color: #b0d4ff; border: 1px solid rgba(74,158,255,0.2); }

/* Chain list */
.vo-chain-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem 1.5rem;
  font-size: 0.83rem;
}
.vo-chain-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.vo-chain-item code {
  font-family: "Fira Mono", monospace;
  font-size: 0.8rem;
  color: #ffc002;
  background: rgba(255,192,2,0.08);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  white-space: nowrap;
}
.vo-chain-item span { color: #6a8aaa; }

/* RALPH section */
.vo-ralph {
  margin-bottom: 4rem;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  border: 1px solid rgba(252,129,74,0.2);
  background: rgba(252,129,74,0.04);
}
.vo-ralph-inner {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.vo-ralph-icon {
  font-size: 2.5rem;
  color: #fc814a;
  flex: 0 0 auto;
  line-height: 1;
}
.vo-ralph h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #eaf0f8;
  margin: 0 0 0.5rem;
}
.vo-ralph p {
  font-size: 0.9rem;
  color: #8ba5c0;
  margin: 0 0 1rem;
  line-height: 1.65;
}
.vo-ralph-steps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
}
.vo-ralph-step {
  font-size: 0.84rem;
  color: #8ba5c0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.vo-ralph-step span {
  font-weight: 700;
  color: #fc814a;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Related */
.vo-related {
  margin-top: 1rem;
}
.vo-related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.vo-related-link {
  display: block;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
  background: #05111f;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.vo-related-link:hover {
  border-color: rgba(255,192,2,0.3);
  background: rgba(255,192,2,0.04);
}
.vo-related-link--cta {
  border-color: rgba(255,192,2,0.3);
  background: rgba(255,192,2,0.06);
}
.vo-related-label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffc002;
  margin-bottom: 0.35rem;
}
.vo-related-desc {
  font-size: 0.8rem;
  color: #6a8aaa;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 900px) {
  .vo-related-grid { grid-template-columns: 1fr 1fr; }
  .vo-chain-list { grid-template-columns: 1fr; }
  .vo-ralph-steps { grid-template-columns: 1fr; }
  .vo-ralph-inner { flex-direction: column; gap: 1rem; }
}
@media (max-width: 640px) {
  .vo-title { font-size: 2rem; }
  .vo-related-grid { grid-template-columns: 1fr; }
  .vo-stage { flex-direction: column; gap: 0.75rem; }
  .vo-stage-num { font-size: 1.5rem; }
}
</style>
