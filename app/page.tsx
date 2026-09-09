import VortexDemoLazy from '@/components/vortex-demo-lazy';
import Guide from './guide.mdx';

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="topbar" aria-label="Page navigation">
          <a className="wordmark" href="#top">NS / 2026</a>
          <div className="nav-links">
            <a href="#result">Result</a>
            <a href="#mechanism">Mechanism</a>
            <a href="#distance">What remains</a>
          </div>
        </nav>

        <div id="top" className="hero-copy">
          <p className="eyebrow">A rigorous interactive guide</p>
          <h1>What OpenAI’s Navier–Stokes result actually proves</h1>
          <p className="dek">
            A finite-energy velocity field can become unbounded in finite time—even with
            positive viscosity and a smooth force. That would settle Clay’s written problem,
            but it is not a general fluid solver and it does not settle the unforced case.
          </p>
        </div>

        <div className="verdict-grid" aria-label="Scope summary">
          <article className="verdict-card verdict-yes">
            <span>Claimed complete</span>
            <strong>Clay alternatives C and D</strong>
            <p>One engineered smooth force produces finite-time blowup on ℝ³ and 𝕋³.</p>
          </article>
          <article className="verdict-card verdict-open">
            <span>Still open</span>
            <strong>The unforced 3D problem</strong>
            <p>The construction requires a nonzero external force; it proves nothing direct for f = 0.</p>
          </article>
          <article className="verdict-card verdict-status">
            <span>Status today</span>
            <strong>Released, not yet accepted</strong>
            <p>Analytic and Lean proofs are public; independent and Clay review are not mature.</p>
          </article>
        </div>
      </section>

      <section className="demo-section" aria-labelledby="demo-title">
        <div className="section-kicker">Reduced scaling model</div>
        <h2 id="demo-title">Enter the contracting vortex core</h2>
        <p className="section-lead">
          Scrub toward the singular time. The core shrinks while velocity grows, yet its
          energy falls because the active volume collapses faster. This visualizes the paper’s
          asymptotic scaling laws; it is not a numerical solution of the PDE.
        </p>
        <VortexDemoLazy />
      </section>

      <section className="article-shell" id="result">
        <article className="guide">
          <Guide />
        </article>
      </section>
    </main>
  );
}
