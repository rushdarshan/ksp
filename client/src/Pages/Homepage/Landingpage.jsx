import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCommand, FiArrowRight, FiShield } from 'react-icons/fi';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../../AuthContext';
import './landingpage.css';

const DEMO_SCREENS = [
  { src: '/assets/landing/case-intelligence.webp', label: 'Case Intelligence', desc: 'AI-powered evidence analysis' },
  { src: '/assets/landing/field-coordination.webp', label: 'ZIA Copilot', desc: 'Kannada/English voice AI' },
  { src: '/assets/landing/connected-evidence.webp', label: 'Entity Graph', desc: 'Cross-FIR connection mapping' },
];

const LandingPage = () => {
  const root = useRef(null);
  const navigate = useNavigate();
  const { authenticate } = useAuth();

  const enterCommandCenter = () => {
    authenticate('mock-jwt-demo-acp', { rank: 'ACP', name: 'Demo Officer' });
    navigate('/demo');
  };

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set('.landing-nav, .hero-reveal, .demo-screenshot', { opacity: 1, clearProps: 'transform' });
      return;
    }

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('.landing-nav', { y: -24, opacity: 0, duration: 0.7 })
      .from('.hero-reveal', { y: 36, opacity: 0, duration: 0.85, stagger: 0.09 }, '-=0.35')
      .from('.hero-cta', { scale: 0.92, opacity: 0, duration: 0.5 }, '-=0.3')
      .to('.hero-cta', { scale: 1.04, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }, '+=1.5');

    gsap.from('.demo-screenshot', {
      y: 48, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.demo-screenshots', start: 'top 82%' },
    });
  }, { scope: root });

  return (
    <main ref={root} className="landing-page">
      <section className="landing-hero" id="main-content">
        <nav className="landing-nav" aria-label="Primary navigation">
          <div className="landing-brand">
            <span className="landing-brand__mark"><FiCommand /></span>
            <span>Crime Genome</span>
          </div>
          <div className="landing-nav__links">
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', color: 'var(--landing-muted)' }}>
              Datathon 2026
            </span>
          </div>
        </nav>

        <div className="hero-copy">
          <p className="hero-kicker hero-reveal">Karnataka State Police — AI-Powered Investigation OS</p>
          <h1 className="hero-reveal">KSP Crime Genome</h1>
          <div className="hero-summary hero-reveal">
            <p>From FIR to chargesheet. One platform, zero missed evidence.</p>
            <div className="hero-actions">
              <button onClick={enterCommandCenter} className="hero-primary hero-cta">
                Enter the Command Center <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="hero-console" aria-label="KSP Crime Genome preview">
          <div className="console-toolbar">
            <div className="console-brand"><FiCommand /> Crime Genome</div>
            <div className="console-status"><span /> 27 Catalyst modules active</div>
            <div className="console-time">Live Demo</div>
          </div>
          <div className="console-layout">
            <div className="console-rail" aria-hidden="true">
              <FiCommand /><FiShield />
            </div>
            <div className="console-map">
              <span className="map-label">Bengaluru Urban — Live Simulation</span>
              <span className="map-route map-route--one" />
              <span className="map-route map-route--two" />
              <span className="map-node map-node--one">01</span>
              <span className="map-node map-node--two">02</span>
              <span className="map-node map-node--three">03</span>
              <div className="map-case-card">
                <span>Priority case</span>
                <strong>KSP-2026-0142</strong>
                <small>AI brief ready • 2 cross-case links</small>
              </div>
            </div>
            <div className="console-metrics">
              <div className="console-metric console-metric--focus">
                <span>Pipeline status</span><strong>27</strong><small>Modules operational</small>
              </div>
              <div className="console-metric">
                <span>Cases analyzed</span><strong>1,247</strong><small>Synthetic dataset</small>
              </div>
              <div className="console-alert">
                <FiShield /> <span><strong>ಹ್ಯಾಕಥಾನ್ ಸಿದ್ಧ</strong> | Hackathon Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="capabilities-section" id="capabilities">
        <header className="section-heading">
          <p>One-click demo</p>
          <h2>Three screens that show the entire system.</h2>
        </header>

        <div className="demo-screenshots feature-grid">
          {DEMO_SCREENS.map(({ src, label, desc }) => (
            <article className="feature-card feature-card--intelligence" key={label} style={{ gridRow: 'span 1' }}>
              <div className="feature-card__top">
                <span>{label}</span>
              </div>
              <div className="feature-card__visual" style={{ height: 200 }}>
                <img src={src} alt={label} width="1536" height="1024" loading="lazy" decoding="async" />
              </div>
              <div className="feature-card__copy">
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-heading">
          <p>From report to readiness</p>
          <h2>FIR → chargesheet.<br />4 stages.</h2>
          <button onClick={enterCommandCenter} className="workflow-link" style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#fff' }}>
            Enter the Command Center <FiArrowRight aria-hidden="true" />
          </button>
        </div>
        <div className="workflow-list">
          {[
            ['01', 'Ingest', 'FIR entered — ZIA extracts entities in Kannada/English'],
            ['02', 'Analyze', 'Cross-match evidence across 1,200+ synthetic cases'],
            ['03', 'Score', 'Readiness scored, gaps flagged, deadlines tracked'],
            ['04', 'Prepare', 'Chargesheet drafted with BNS section mapping'],
          ].map(([number, title, copy]) => (
            <article className="workflow-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <FiArrowRight aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="landing-closing">
        <div className="closing-copy">
          <p>Winner — Karnataka State Police Datathon 2026</p>
          <h2>See it in action.<br />One click.</h2>
          <button onClick={enterCommandCenter} className="closing-action" style={{ border: 'none', cursor: 'pointer' }}>
            Enter the Command Center <FiArrowRight aria-hidden="true" />
          </button>
        </div>
        <footer className="landing-footer">
          <span>KSP Crime Genome / Karnataka State Police</span>
          <div><a href="#capabilities">Screens</a><a href="#workflow">Pipeline</a></div>
          <span>Powered by Zoho Catalyst + Sarvam AI</span>
        </footer>
      </section>
    </main>
  );
};

export default LandingPage;
