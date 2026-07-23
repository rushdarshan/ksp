import { useState } from 'react';
import { PanelCard, PanelHeader } from '../panels';
import './theoryboard.scss';

const STATUS_STYLES = {
  Active: { background: '#334e68', color: '#fff' },
  Supported: { background: '#2f6f4e', color: '#fff' },
  Closed: { background: '#6c757d', color: '#fff' },
};

const mockHypotheses = [
  {
    id: 'TH-001',
    title: 'Two-person chain-snatching team',
    description: 'Working hypothesis for KSP-2026-0142: witness descriptions and the recorded escape pattern may indicate coordinated roles. CCTV acquisition and officer review are still required.',
    status: 'Active',
    confidence: 67,
    linkedEntities: ['KSP-2026-0142', 'Mohan Kumar', 'Kiran Joseph'],
    createdAt: '2026-03-16',
  },
  {
    id: 'TH-002',
    title: 'Shared robbery modus operandi',
    description: 'Recorded approach, property target, and escape descriptors overlap with KSP-2026-0301. The similarity is a review lead and does not establish common offenders.',
    status: 'Active',
    confidence: 58,
    linkedEntities: ['KSP-2026-0142', 'KSP-2026-0301', 'Brigade Road corridor'],
    createdAt: '2026-03-18',
  },
  {
    id: 'TH-003',
    title: 'SH-9 junction camera coverage',
    description: 'The camera inventory confirms a likely field of view for the reported junction. This support is limited to coverage; the recording has not yet been acquired or authenticated.',
    status: 'Supported',
    confidence: 84,
    linkedEntities: ['KSP-2026-0142', 'SH-9 junction camera'],
    createdAt: '2026-03-17',
  },
  {
    id: 'TH-004',
    title: 'Initial single-offender account',
    description: 'The initial account treated the incident as a single-offender robbery. Later person records indicate a possible second role, so this hypothesis was closed without deletion.',
    status: 'Closed',
    confidence: 24,
    linkedEntities: ['KSP-2026-0142', 'Audit event 2026-03-18'],
    createdAt: '2026-03-15',
  },
];

const FILTERS = ['All', 'Active', 'Supported', 'Closed'];

function TheoryBoard() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredHypotheses = activeFilter === 'All'
    ? mockHypotheses
    : mockHypotheses.filter(h => h.status === activeFilter);

  return (
    <div className="theory-board">
      <PanelHeader
        subtitle="Track working hypotheses with linked evidence, uncertainty, and an auditable review status."
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
                    <span className="theory-card__label">Evidence fit</span>
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
