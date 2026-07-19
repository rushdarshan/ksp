import React from "react"
import { Link } from 'react-router-dom'

var WORKFLOW_STEPS = [
  { phase: '01', title: 'My Day', desc: 'Prioritized case queue. Urgency-ranked. Zero friction.', tag: 'DASHBOARD' },
  { phase: '02', title: 'ZIA Intelligence Brief', desc: 'Multi-agent AI synthesis — solvability, veracity, network analysis in seconds.', tag: 'AI ENGINE' },
  { phase: '03', title: 'Theory Board', desc: 'Prosecution-ready hypothesis tracking. Evidence classified automatically.', tag: 'INVESTIGATION' },
  { phase: '04', title: 'Entity Graph', desc: 'Co-offender networks. Cross-case links. Force-directed visualization.', tag: 'NETWORK' },
  { phase: '05', title: 'Chargesheet', desc: 'Auto-generated chargesheets with BNS sections and evidence chain validation.', tag: 'OUTPUT' },
];

var CAPABILITIES = [
  { icon: 'A', title: '15 Analytics Panels', desc: 'Veracity, topology, predictive, fairness, counter-crime, and more.' },
  { icon: 'I', title: 'ZIA Investigator', desc: 'Not a chatbot. A senior investigator that explains why, evidence, and next action.' },
  { icon: 'D', title: '27 CCTNS Tables', desc: 'Real Karnataka police data schema. FIRs, accused, witnesses, chargesheets.' },
  { icon: 'V', title: 'Voice in Kannada', desc: 'Natural language voice search with BNS section lookup.' },
];

var HeroSection = function () {
  return React.createElement('main', { className: 'hero-new' },
    React.createElement('section', { className: 'hero-section' },
      React.createElement('div', { className: 'hero-inner' },
        React.createElement('div', { className: 'hero-narrative' },
          React.createElement('div', { className: 'hero-tag' }, 'KARNATAKA STATE POLICE \u00b7 DATATHON 2026'),
          React.createElement('h1', { className: 'hero-headline' },
            'The Investigation',
            React.createElement('br'),
            'Operating System'
          ),
          React.createElement('p', { className: 'hero-sub' },
            'Crime Genome replaces dashboard chaos with investigation clarity. ',
            'One workflow. One interface. From FIR to chargesheet.'
          ),
          React.createElement('div', { className: 'hero-actions' },
            React.createElement(Link, { to: '/login', className: 'hero-cta-primary' }, 'Open Dashboard'),
            React.createElement(Link, { to: '/public/deterrence', className: 'hero-cta-secondary' }, 'Public Portal \u2192')
          )
        ),
        React.createElement('div', { className: 'hero-workflow' },
          WORKFLOW_STEPS.map(function (step, i) {
            return React.createElement('div', { className: 'workflow-step', key: i },
              React.createElement('div', { className: 'workflow-phase' }, step.phase),
              React.createElement('div', { className: 'workflow-content' },
                React.createElement('div', { className: 'workflow-header' },
                  React.createElement('span', { className: 'workflow-title' }, step.title),
                  React.createElement('span', { className: 'workflow-tag' }, step.tag)
                ),
                React.createElement('p', { className: 'workflow-desc' }, step.desc)
              ),
              i < WORKFLOW_STEPS.length - 1 && React.createElement('div', { className: 'workflow-connector' })
            );
          })
        )
      )
    ),
    React.createElement('section', { className: 'capabilities-section' },
      React.createElement('div', { className: 'capabilities-inner' },
        React.createElement('div', { className: 'capabilities-header' },
          React.createElement('span', { className: 'capabilities-label' }, 'PLATFORM'),
          React.createElement('h2', { className: 'capabilities-title' }, 'Built for Investigation')
        ),
        React.createElement('div', { className: 'capabilities-grid' },
          CAPABILITIES.map(function (c, i) {
            return React.createElement('div', { className: 'capability-card', key: i },
              React.createElement('span', { className: 'capability-icon-bg' }, c.icon),
              React.createElement('h3', { className: 'capability-title' }, c.title),
              React.createElement('p', { className: 'capability-desc' }, c.desc)
            );
          })
        )
      )
    ),
    React.createElement('section', { className: 'cta-section' },
      React.createElement('div', { className: 'cta-inner' },
        React.createElement('h2', { className: 'cta-headline' }, 'Start investigating.'),
        React.createElement('p', { className: 'cta-sub' }, 'Three roles. One interface. Zero training.'),
        React.createElement(Link, { to: '/login', className: 'hero-cta-secondary' }, 'Learn more \u2192')
      )
    ),
    React.createElement('footer', { className: 'landing-footer' },
      React.createElement('div', { className: 'footer-inner' },
        React.createElement('div', { className: 'footer-left' },
          React.createElement('span', { className: 'footer-brand' }, 'KSP Crime Genome'),
          React.createElement('span', { className: 'footer-copy' }, '\u00a9 2026 Karnataka State Police')
        ),
        React.createElement('div', { className: 'footer-right' },
          React.createElement('a', { href: '/public/deterrence', className: 'footer-link' }, 'Public Data'),
          React.createElement('a', { href: '/login', className: 'footer-link' }, 'Dashboard'),
          React.createElement('span', { className: 'footer-tech' }, 'Powered by Zoho Catalyst')
        )
      )
    )
  );
}

export default HeroSection
