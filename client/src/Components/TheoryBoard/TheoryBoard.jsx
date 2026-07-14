import React, { useState } from 'react';
import { PanelCard, PanelHeader } from '../panels';
import './theoryboard.scss';

const STATUS_STYLES = {
  Active: { background: '#334e68', color: '#fff' },
  Proven: { background: '#38a169', color: '#fff' },
  Dismissed: { background: '#6c757d', color: '#fff' },
};

const mockHypotheses = [
  {
    id: 'TH-001',
    title: 'Organized Gold Smuggling Ring',
    description: 'Multiple FIRs across Bangalore rural point to coordinated gold smuggling through agricultural cover loads. Common modus operandi and vehicle patterns suggest a single syndicate operating across three districts.',
    status: 'Active',
    confidence: 78,
    linkedEntities: ['VEH-2847', 'PER-1192', 'FIR-2024-0847'],
    createdAt: '2024-07-10',
  },
  {
    id: 'TH-002',
    title: 'Hawala Route via Textile Exports',
    description: 'Unexplained cash deposits traced to textile export units in Hubli. Invoices inflated by 40-60% over market rate, funneling illicit funds through SEZ customs clearance.',
    status: 'Active',
    confidence: 62,
    linkedEntities: ['FIR-2024-0912', 'PER-0451', 'LOC-HBL-003'],
    createdAt: '2024-07-08',
  },
  {
    id: 'TH-003',
    title: 'Vehicle Theft-to-Chop Shop Pipeline',
    description: 'Stolen two-wheelers from Mysuru city being rerouted to unregistered garages in Kollegal for parts extraction. VIN tampering patterns match across 12 reported thefts.',
    status: 'Proven',
    confidence: 91,
    linkedEntities: ['FIR-2024-0723', 'VEH-1123', 'VEH-1129', 'PER-2034'],
    createdAt: '2024-06-28',
  },
  {
    id: 'TH-004',
    title: 'Cyber Blackmail Targeting Govt Employees',
    description: 'Recent spate of sextortion cases against Karnataka government clerks share a single Telegram handler and identical payment demand scripts. Perpetrator uses VoIP numbers registered outside India.',
    status: 'Active',
    confidence: 55,
    linkedEntities: ['PER-3301', 'PER-3302', 'CYB-2024-014'],
    createdAt: '2024-07-12',
  },
  {
    id: 'TH-005',
    title: 'Land Grab through Forged Succession Deeds',
    description: 'Three separate complaints in Dakshina Kannada allege property transfers using forged death certificates and fake legal heir affidavits. All notarized by the same two sub-registrars.',
    status: 'Dismissed',
    confidence: 23,
    linkedEntities: ['FIR-2024-0501', 'FIR-2024-0522', 'PER-7841'],
    createdAt: '2024-06-15',
  },
];

const FILTERS = ['All', 'Active', 'Proven', 'Dismissed'];

function TheoryBoard() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHypotheses = activeFilter === 'All'
    ? mockHypotheses
    : mockHypotheses.filter(h => h.status === activeFilter);

  return (
    <div className="theory-board">
      <PanelHeader
        subtitle="Track and manage investigation hypotheses across active cases."
        action={
          <div className="theory-filter">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`theory-filter__btn ${activeFilter === f ? 'theory-filter__btn--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <PanelCard title="Theory Board">
        {filteredHypotheses.length === 0 ? (
          <div className="theory-empty">No active theories</div>
        ) : (
          <div className="theory-grid">
            {filteredHypotheses.map(h => (
              <div key={h.id} className="theory-card">
                <div className="theory-card__header">
                  <span className="theory-card__id">{h.id}</span>
                  <span
                    className="theory-status"
                    style={{ background: STATUS_STYLES[h.status].background, color: STATUS_STYLES[h.status].color }}
                  >
                    {h.status}
                  </span>
                </div>
                <h3 className="theory-card__title">{h.title}</h3>
                <p className="theory-card__desc">{h.description}</p>
                <div className="theory-card__meta">
                  <div className="theory-card__confidence">
                    <span className="theory-card__label">Confidence</span>
                    <div className="theory-card__bar">
                      <div className="theory-card__bar-fill" style={{ width: `${h.confidence}%` }} />
                    </div>
                    <span className="theory-card__pct">{h.confidence}%</span>
                  </div>
                  <div className="theory-card__entities">
                    <span className="theory-card__label">Linked Entities</span>
                    <div className="theory-card__tags">
                      {h.linkedEntities.map(e => (
                        <span key={e} className="theory-card__tag">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="theory-card__footer">
                  <span className="theory-card__date">Created {h.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}

export default TheoryBoard;
