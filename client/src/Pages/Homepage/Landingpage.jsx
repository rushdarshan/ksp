import { useRef } from 'react';
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
              <div className="console-alert">
                <FiClock /> <span><strong>6 days</strong> to chargesheet review</span>
              </div>
            </div>
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
