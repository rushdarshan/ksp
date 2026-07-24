import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiCommand,
  FiLink2,
  FiMapPin,
  FiShield,
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './landingpage.css';

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    className: 'feature-card feature-card--intelligence',
    eyebrow: '01 / Case intelligence',
    title: 'See the next useful move.',
    copy: 'Case readiness, evidence gaps, and deadline risk stay attached to the case instead of living in separate reports.',
    icon: FiActivity,
    illustration: '/assets/landing/case-intelligence.webp',
    alt: 'Case evidence converging into a single prioritized action',
  },
  {
    className: 'feature-card feature-card--field',
    eyebrow: '02 / Field context',
    title: 'Built around the officer.',
    copy: 'Fast summaries and clear priorities keep the interface useful between the station and the field.',
    icon: FiMapPin,
    illustration: '/assets/landing/field-coordination.webp',
    alt: 'Two police officers coordinating around a digital case map',
  },
  {
    className: 'feature-card feature-card--network',
    eyebrow: '03 / Connected evidence',
    title: 'Relationships become visible.',
    copy: 'People, vehicles, phones, locations, and earlier FIRs resolve into one working graph.',
    icon: FiLink2,
    illustration: '/assets/landing/connected-evidence.webp',
    alt: 'Case entities linked through a shared evidence network',
  },
  {
    className: 'feature-card feature-card--readiness',
    eyebrow: '04 / Prosecution readiness',
    title: 'Deadlines stop hiding.',
    copy: 'The chargesheet clock keeps missing documents and legal milestones in the same view.',
    icon: FiClock,
    illustration: '/assets/landing/prosecution-readiness.webp',
    alt: 'Case documents moving through checks toward court readiness',
  },
];

const workflow = [
  ['01', 'Record', 'Bring the FIR, people, evidence, and locations into one structured case.'],
  ['02', 'Connect', 'Surface contradictions, cross-case entities, and emerging patterns.'],
  ['03', 'Decide', 'Turn the evidence into ranked actions with a clear reason for each.'],
  ['04', 'Prepare', 'Track legal readiness until the case narrative is prosecution-ready.'],
];

const LandingPage = () => {
  const root = useRef(null);
  const [demoStep, setDemoStep] = useState('idle');

  const runLiveDemo = () => {
    setDemoStep('fir');
    setTimeout(() => {
      setDemoStep('entities');
      setTimeout(() => {
        setDemoStep('graph');
        setTimeout(() => {
          setDemoStep('score');
          setTimeout(() => {
            setDemoStep('evidence');
            setTimeout(() => {
              setDemoStep('clock');
              setTimeout(() => {
                setDemoStep('done');
              }, 1800);
            }, 1800);
          }, 1800);
        }, 1800);
      }, 1800);
    }, 2200);
  };

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set('.landing-nav, .hero-reveal, .hero-console, .feature-card, .workflow-step, .closing-copy', {
        opacity: 1,
        clearProps: 'transform',
      });
      return;
    }

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('.landing-nav', { y: -24, opacity: 0, duration: 0.7 })
      .from('.hero-reveal', { y: 36, opacity: 0, duration: 0.85, stagger: 0.09 }, '-=0.35')
      .from('.hero-console', { y: 56, rotate: 1.2, opacity: 0, duration: 1 }, '-=0.45')
      .from('.hero-primary', { scale: 0.92, opacity: 0, duration: 0.5 }, '-=0.3')
      .to('.hero-primary', { scale: 1.04, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }, '+=1.5');

    gsap.from('.feature-card', {
      y: 48,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.feature-grid', start: 'top 78%' },
    });

    gsap.from('.workflow-step', {
      x: -28,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.workflow-list', start: 'top 78%' },
    });

    gsap.from('.closing-copy', {
      y: 32,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.landing-closing', start: 'top 72%' },
    });
  }, { scope: root });

  return (
    <main ref={root} className="landing-page">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <section className="landing-hero" id="main-content">
        <nav className="landing-nav" aria-label="Primary navigation">
          <Link to="/" className="landing-brand" aria-label="Crime Genome home">
            <span className="landing-brand__mark"><FiCommand /></span>
            <span>Crime Genome</span>
          </Link>
          <div className="landing-nav__links">
            <a href="#capabilities">Capabilities</a>
            <a href="#workflow">Workflow</a>
            <Link to="/public/deterrence">Public data</Link>
          </div>
          <Link to="/login" className="landing-nav__action">
            Open dashboard <FiArrowUpRight aria-hidden="true" />
          </Link>
        </nav>

        <div className="hero-copy">
          <p className="hero-kicker hero-reveal">Karnataka State Police intelligence platform</p>
          <h1 className="hero-reveal">Crime Genome</h1>
          <div className="hero-summary hero-reveal">
            <p>Case intelligence, built for the next decision.</p>
            <div className="hero-actions">
              <Link to="/login" className="hero-primary">
                Open command center <FiArrowRight aria-hidden="true" />
              </Link>
              <a href="#capabilities" className="hero-text-link">Explore the platform</a>
            </div>
          </div>
        </div>

        <div className="hero-console" aria-label="Crime Genome command center preview">
          <div className="console-toolbar">
            <div className="console-brand"><FiCommand /> Command center</div>
            <div className="console-status"><span /> Live district view</div>
            <div className="console-time">05:42 IST</div>
          </div>
          <div className="console-layout">
            <div className="console-rail" aria-hidden="true">
              <FiCommand /><FiActivity /><FiMapPin /><FiShield />
            </div>
            
            {demoStep === 'idle' ? (
              <>
                <div className="console-map" aria-hidden="true">
                  <span className="map-label">Bengaluru South</span>
                  <span className="map-route map-route--one" />
                  <span className="map-route map-route--two" />
                  <span className="map-node map-node--one">01</span>
                  <span className="map-node map-node--two">02</span>
                  <span className="map-node map-node--three">03</span>
                  <div className="map-case-card">
                    <span>Priority case</span>
                    <strong>KSP-2026-0142</strong>
                    <small>2 cross-case links found</small>
                  </div>
                </div>
                <div className="console-metrics">
                  <div className="console-metric console-metric--focus">
                    <span>Case readiness</span><strong>67</strong><small>3 evidence tasks open</small>
                  </div>
                  <div className="console-metric">
                    <span>Evidence ready</span><strong>18/23</strong><small>5 items pending</small>
                  </div>
                  <div className="console-alert" onClick={runLiveDemo} style={{ cursor: 'pointer', background: 'var(--landing-orange)' }} title="Click to run live pipeline demo">
                    <FiClock /> <span><strong>ಕನ್ನಡದಲ್ಲಿ ರನ್ ಮಾಡಿ</strong> | Run Live Demo</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="demo-stage-container" style={{ flex: 1, display: 'flex', width: '100%', background: '#0b0f19', color: '#fff', position: 'relative' }}>
                {demoStep === 'fir' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--landing-orange)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                      [01 / Ingesting Kannada FIR Source]
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: 1.6, fontFamily: 'monospace', color: '#34d399', background: 'rgba(5, 150, 105, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid #059669' }}>
                      "ದೂರುದಾರರಾದ ಶ್ರೀಮತಿ ಸುನಿತಾ ಅವರು ತಮ್ಮ ಮನೆಯ ಮುಂದೆ ನಿಲ್ಲಿಸಿದ್ದ ದ್ವಿಚಕ್ರ ವಾಹನ ಕಳುವಾಗಿರುವುದಾಗಿ ದೂರು ನೀಡಿದ್ದಾರೆ. ಆರೋಪಿ ಕಿರಣ್ ಜೋಸೆಫ್ (Kiran Joseph) ತಲೆಮರೆಸಿಕೊಂಡಿದ್ದಾನೆ..."
                    </div>
                    <div style={{ marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      ⚡ Translating dialects and code-mixed terms using Sarvam AI model integrations...
                    </div>
                  </div>
                )}

                {demoStep === 'entities' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--landing-orange)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                      [02 / Entity Extraction & Translation]
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div style={{ padding: '12px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>SUSPECT / ಆರೋಪಿ</span>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>Kiran Joseph (ಕಿರಣ್ ಜೋಸೆಫ್)</div>
                      </div>
                      <div style={{ padding: '12px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>VEHICLE / ವಾಹನ</span>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>KA-01-HE-4321</div>
                      </div>
                      <div style={{ padding: '12px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>JURISDICTION / ಪೊಲೀಸ್ ಠಾಣೆ</span>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>Brigade Road PS (ಬ್ರಿಗೇಡ್ ರಸ್ತೆ)</div>
                      </div>
                    </div>
                  </div>
                )}

                {demoStep === 'graph' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--landing-orange)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                      [03 / Cross-Case Graph Match Linkage]
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fd670320', border: '2px solid var(--landing-orange)', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, zIndex: 5 }}>
                        KSP-2026-0142
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '100px', width: '56px', height: '56px', borderRadius: '50%', background: '#1f2937', border: '1px solid #374151', display: 'grid', placeItems: 'center', fontSize: '9px', fontWeight: 600 }}>
                        FIR-2025-081
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px', right: '100px', width: '56px', height: '56px', borderRadius: '50%', background: '#1f2937', border: '1px solid #374151', display: 'grid', placeItems: 'center', fontSize: '9px', fontWeight: 600 }}>
                        FIR-2026-302
                      </div>
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <line x1="160" y1="20" x2="250" y2="70" stroke="var(--landing-orange)" strokeWidth="2" strokeDasharray="5,5" />
                        <line x1="360" y1="120" x2="250" y2="70" stroke="var(--landing-orange)" strokeWidth="2" strokeDasharray="5,5" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '13px', textAlign: 'center', color: '#34d399', fontWeight: 600 }}>
                      ✓ Identified 2 previous theft cases with matching Modus Operandi (MO) in Bengaluru!
                    </div>
                  </div>
                )}

                {demoStep === 'score' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--landing-orange)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
                      [04 / Prosecution Readiness Score]
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '64px', fontWeight: 800, color: 'var(--landing-orange)', fontFamily: 'monospace' }}>67%</span>
                      <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Readiness Index</span>
                    </div>
                    <div style={{ width: '80%', height: '12px', background: '#1f2937', borderRadius: '6px', marginTop: '16px', overflow: 'hidden', border: '1px solid #374151' }}>
                      <div style={{ width: '67%', height: '100%', background: 'var(--landing-orange)', borderRadius: '6px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                )}

                {demoStep === 'evidence' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', background: 'rgba(239, 68, 68, 0.05)', justifyContent: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#ef4444', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                      [05 / Critical Evidence Gap Warning]
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️ Missing: CCTV Video Evidence Hashing</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '6px', lineHeight: 1.5 }}>
                        CCTV footage of Brigade Road intersection missing hash verification. BSA Section 63 electronic signature certificate is pending upload.
                      </p>
                    </div>
                  </div>
                )}

                {demoStep === 'clock' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', justifyContent: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--landing-orange)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                      [06 / Legal Chargesheet Deadline Clock]
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: '#1f2937', padding: '18px', borderRadius: '8px', border: '1px solid #374151' }}>
                      <div style={{ fontSize: '36px', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>23 Days Left</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                        <strong>60-Day Chargesheet Filing Limit</strong><br />
                        Accused in custody since 37 days. Urgent evidence collection required.
                      </div>
                    </div>
                  </div>
                )}

                {demoStep === 'done' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px', textAlign: 'center', background: 'rgba(6, 95, 70, 0.95)', zIndex: 10 }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>✓ End-to-End Pipeline Complete!</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', maxWidth: '520px', lineHeight: 1.5 }}>
                      ZIA has analyzed the FIR, extracted entities, matched case history, computed case readiness, and flagged gaps automatically.
                    </p>
                    <Link 
                      to="/login" 
                      style={{ padding: '12px 36px', background: 'var(--landing-orange)', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(253, 103, 3, 0.3)' }}
                    >
                      Open Live Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="capabilities-section" id="capabilities">
        <header className="section-heading">
          <p>One operating picture</p>
          <h2>Everything important stays close to the case.</h2>
        </header>

        <div className="feature-grid">
          {capabilities.map(({ className, eyebrow, title, copy, icon: Icon, illustration, alt }) => (
            <article className={className} key={title}>
              <div className="feature-card__top">
                <span>{eyebrow}</span>
                <Icon aria-hidden="true" />
              </div>
              <div className="feature-card__visual">
                <img
                  src={illustration}
                  alt={alt}
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="feature-card__copy">
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-heading">
          <p>From report to readiness</p>
          <h2>One record.<br />A clearer path.</h2>
          <Link to="/login" className="workflow-link">
            Start with a case <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <div className="workflow-list">
          {workflow.map(([number, title, copy]) => (
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
          <p>Built for the work between the alerts.</p>
          <h2>Read the case.<br />Move with confidence.</h2>
          <Link to="/login" className="closing-action">
            Enter Crime Genome <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <footer className="landing-footer">
          <span>Crime Genome / Karnataka State Police</span>
          <div><a href="#capabilities">Capabilities</a><a href="#workflow">Workflow</a><Link to="/public/deterrence">Public data</Link></div>
          <span>Powered by Zoho Catalyst</span>
        </footer>
      </section>
    </main>
  );
};

export default LandingPage;
