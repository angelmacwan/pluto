import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../components/auth/AuthProvider';
import { useAppStore } from '../store/appStore';
import {
  ArrowRight,
  Layers,
  ChevronRight,
  Terminal
} from 'lucide-react';

const NODE_PREVIEW = [
  { label: 'CSV Loader',       cat: 'data',      x: 60,  y: 80  },
  { label: 'DataFrame Filter', cat: 'data',      x: 280, y: 40  },
  { label: 'Scaler',           cat: 'data',      x: 280, y: 160 },
  { label: 'Random Forest',    cat: 'ml',        x: 500, y: 80  },
  { label: 'Model Trainer',    cat: 'ml',        x: 500, y: 200 },
];

const CAT_COLOR: Record<string, string> = {
  data:   'hsl(142, 71%, 52%)',
  ml:     'hsl(258, 90%, 66%)',
  custom: 'hsl(328, 85%, 58%)',
};

export function LandingPage() {
  const navigate  = useNavigate();
  const { user }  = useAppStore();

  const handleCTA = () => {
    if (user) { navigate('/app'); return; }
    signInWithGoogle();
  };

  return (
    <div className="landing">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <img src="/logo.png" alt="Pluto" className="landing-nav-logo" />
          <span className="landing-nav-name">Pluto</span>
        </div>
        <button className="landing-nav-cta" onClick={handleCTA}>
          {user ? 'Open App' : 'Get Started'}
          <ChevronRight size={15} />
        </button>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero animate-fade-in">
        <div className="landing-hero-orb landing-hero-orb-1" />
        <div className="landing-hero-orb landing-hero-orb-2" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Layers size={13} />
            Visual · Python · ML
          </div>

          <h1 className="landing-hero-title">
            Build ML pipelines<br />
            <span className="landing-hero-title-accent">without the friction</span>
          </h1>

          <p className="landing-hero-subtitle">
            Pluto is a visual Python editor for data science and AI. Wire nodes together,
            watch real code appear, run it instantly — no setup, no boilerplate.
          </p>

          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={handleCTA}>
              {user ? 'Open App' : 'Start for free'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Outcrowd-style Features ──────────────────────────────────────── */}
      <section className="landing-features">
        
        {/* Row 1 */}
        <div className="landing-feature-row">
          <div className="landing-feature-text">
            <h2>Code visually,<br/>compile instantly.</h2>
            <p>
              Drag, drop and wire nodes together to compose full Python ML pipelines. 
              Every connection you make instantly compiles to clean, runnable Python code behind the scenes.
            </p>
          </div>
          <div className="landing-feature-visual">
            <div className="landing-canvas-preview" aria-hidden="true" style={{ marginTop: 0, height: 260 }}>
              <div className="landing-canvas-inner">
                {/* Connector lines (SVG) */}
                <svg className="landing-canvas-svg" viewBox="0 0 800 260" preserveAspectRatio="none">
                  <path d="M 195 100 C 240 100 240 60 280 60"  stroke="#c4c6cd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                  <path d="M 195 100 C 240 100 240 180 280 180" stroke="#c4c6cd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                  <path d="M 415 60 C 460 60 460 100 500 100"  stroke="#c4c6cd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                  <path d="M 415 180 C 460 180 460 220 500 220" stroke="#c4c6cd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
                </svg>

                {NODE_PREVIEW.map((node) => (
                  <div
                    key={node.label}
                    className="landing-canvas-node"
                    style={{ left: node.x, top: node.y }}
                  >
                    <div
                      className="landing-canvas-node-bar"
                      style={{ background: CAT_COLOR[node.cat] }}
                    />
                    <span className="landing-canvas-node-label">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="landing-feature-row">
          <div className="landing-feature-text">
            <h2>Run locally,<br/>iterate fast.</h2>
            <p>
              Connect to the Pluto Bridge to execute your pipelines directly on your machine. 
              See logs, outputs, and errors instantly. Undo, redo, and remix node groups without losing work.
            </p>
          </div>
          <div className="landing-feature-visual landing-feature-visual-dark">
             <div className="landing-fake-terminal">
               <div className="landing-fake-terminal-header">
                 <Terminal size={14} /> Pluto Bridge
               </div>
               <div className="landing-fake-terminal-body">
                 <span>[info] Connecting to kernel...</span>
                 <span>[info] Kernel ready (Python 3.11)</span>
                 <span style={{ color: 'var(--category-data)' }}>[data] Loading CSV (24,500 rows)...</span>
                 <span style={{ color: 'var(--category-ml)' }}>[ml] Training Random Forest...</span>
                 <span style={{ color: 'var(--success-color)' }}>[success] Accuracy: 0.94</span>
               </div>
             </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="landing-feature-row">
          <div className="landing-feature-text">
            <h2>Batteries included.<br/>Extend with Python.</h2>
            <p>
              Scikit-learn, PyTorch, and XGBoost are ready out of the box. 
              Need something custom? Write your own Python function once and it becomes a first-class node you can reuse anywhere.
            </p>
          </div>
          <div className="landing-feature-visual">
            <div className="landing-fake-code">
              <pre>
                <code style={{ color: '#c678dd' }}>def</code> <code style={{ color: '#61afef' }}>evaluate_model</code>(model, data):{'\n'}
                {'    '}<code style={{ color: '#5c6370' }}># Your custom evaluation logic</code>{'\n'}
                {'    '}preds = model.predict(data){'\n'}
                {'    '}<code style={{ color: '#c678dd' }}>return</code> accuracy_score(data.y, preds)
              </pre>
            </div>
          </div>
        </div>

      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="landing-cta-banner">
        <div className="landing-cta-banner-orb" />
        <h2 className="landing-cta-title">Ready to build?</h2>
        <p className="landing-cta-sub">Sign in with Google and your first pipeline is one drag away.</p>
        <button className="landing-btn-primary landing-btn-primary--light" onClick={handleCTA}>
          {user ? 'Open App' : 'Get started free'}
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <img src="/logo.png" alt="Pluto" className="landing-nav-logo" style={{ width: 22, height: 22 }} />
          <span>Pluto</span>
        </div>
        <p className="landing-footer-copy">© {new Date().getFullYear()} Pluto. All rights reserved.</p>
      </footer>
    </div>
  );
}
