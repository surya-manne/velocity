<template>
  <div class="vfd-wrap">
    <div class="vfd-diagram">

      <!-- Node: IDE -->
      <div class="vfd-node vfd-node--ide">
        <div class="vfd-eyebrow">INPUT</div>
        <div class="vfd-title">Your IDE</div>
        <div class="vfd-tags">
          <span>Cursor</span><span>Claude Code</span><span>VS Code</span><span>Copilot</span>
        </div>
      </div>

      <!-- Arrow 1 -->
      <div class="vfd-arrow">
        <div class="vfd-arrow-label">user request</div>
        <div class="vfd-arrow-line"><span class="vfd-arrow-head">→</span></div>
      </div>

      <!-- Node: Smart Router -->
      <div class="vfd-node vfd-node--router">
        <div class="vfd-eyebrow">CLASSIFY</div>
        <div class="vfd-title">Smart Router</div>
        <div class="vfd-detail">feature · bug · refactor<br/>extend · research</div>
      </div>

      <!-- Arrow 2 -->
      <div class="vfd-arrow">
        <div class="vfd-arrow-label">classified intent</div>
        <div class="vfd-arrow-line"><span class="vfd-arrow-head">→</span></div>
      </div>

      <!-- Node: Project Intelligence -->
      <div class="vfd-node vfd-node--intel">
        <div class="vfd-eyebrow">LOAD</div>
        <div class="vfd-title">Project Intelligence</div>
        <div class="vfd-detail">CONTEXT.md · stack fingerprint<br/>ADRs · guardrails · patterns</div>
      </div>

      <!-- Arrow 3 -->
      <div class="vfd-arrow">
        <div class="vfd-arrow-label">context bundle</div>
        <div class="vfd-arrow-line"><span class="vfd-arrow-head">→</span></div>
      </div>

      <!-- Node: Skill Chain -->
      <div class="vfd-node vfd-node--skills">
        <div class="vfd-eyebrow">EXECUTE</div>
        <div class="vfd-title">Skill Chain</div>
        <div class="vfd-detail">PRD → features → tasks<br/>TDD → validate → handoff</div>
      </div>

      <!-- Arrow 4 -->
      <div class="vfd-arrow">
        <div class="vfd-arrow-label">validated artifacts</div>
        <div class="vfd-arrow-line"><span class="vfd-arrow-head">→</span></div>
      </div>

      <!-- Node: Output -->
      <div class="vfd-node vfd-node--output">
        <div class="vfd-eyebrow">OUTPUT</div>
        <div class="vfd-title">PR Ready</div>
        <div class="vfd-detail">tests passing · docs updated<br/>guardrails cleared</div>
      </div>

    </div>

    <!-- RALPH feedback bar -->
    <div class="vfd-feedback">
      <div class="vfd-feedback-line" />
      <div class="vfd-feedback-label">⟳ RALPH Loop — annotates outputs · learns patterns · hardens skills</div>
      <div class="vfd-feedback-line" />
    </div>
  </div>
</template>

<style scoped>
.vfd-wrap {
  margin: 2.5rem 0;
}

.vfd-diagram {
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

/* Nodes */
.vfd-node {
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

.vfd-node--ide {
  border-color: rgba(255,192,2,0.35);
  background: rgba(255,192,2,0.06);
}

.vfd-node--router {
  border-color: rgba(74,158,255,0.35);
  background: rgba(74,158,255,0.05);
}

.vfd-node--intel {
  border-color: rgba(255,192,2,0.35);
  background: rgba(255,192,2,0.05);
  min-width: 168px;
}

.vfd-node--skills {
  border-color: rgba(255,192,2,0.45);
  background: rgba(255,192,2,0.07);
  min-width: 160px;
}

.vfd-node--output {
  border-color: rgba(74,158,255,0.45);
  background: rgba(74,158,255,0.07);
}

.vfd-eyebrow {
  font-family: "Fira Mono", monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8ba5c0;
}

.vfd-node--ide .vfd-eyebrow,
.vfd-node--intel .vfd-eyebrow,
.vfd-node--skills .vfd-eyebrow { color: #c89a00; }

.vfd-title {
  font-size: 1rem;
  font-weight: 800;
  color: #eaf0f8;
  line-height: 1.2;
}

.vfd-detail {
  font-size: 0.72rem;
  color: #6a8aaa;
  line-height: 1.55;
}

.vfd-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.vfd-tags span {
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
.vfd-arrow {
  flex: 1 1 auto;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.25rem;
}

.vfd-arrow-label {
  font-size: 0.64rem;
  color: #4a6a8a;
  font-family: "Fira Mono", monospace;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.vfd-arrow-line {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vfd-arrow-line::before {
  content: '';
  position: absolute;
  left: 0;
  right: 16px;
  top: 50%;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,192,2,0.3), rgba(74,158,255,0.3));
}

.vfd-arrow-head {
  position: relative;
  color: rgba(74,158,255,0.7);
  font-size: 1.1rem;
  line-height: 1;
  margin-left: auto;
}

/* RALPH feedback bar */
.vfd-feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(252,129,74,0.2);
  background: rgba(252,129,74,0.04);
}

.vfd-feedback-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(252,129,74,0.35), transparent);
}

.vfd-feedback-label {
  font-size: 0.78rem;
  font-family: "Fira Mono", monospace;
  color: #c06030;
  white-space: nowrap;
  letter-spacing: 0.03em;
}
</style>
