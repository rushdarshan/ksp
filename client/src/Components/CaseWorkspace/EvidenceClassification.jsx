import React, { useState } from 'react';
import './TheoryBoard.scss';

const CLASS_COLORS = {
  Supports: { bg: 'var(--color-green-alt)10', border: '#4ade80', text: '#4ade80', label: '✅ Supports' },
  Contradicts: { bg: 'var(--color-red-soft)10', border: '#f87171', text: '#f87171', label: '❌ Contradicts' },
  Neutral: { bg: '#9ca3af10', border: '#9ca3af', text: '#9ca3af', label: '➖ Neutral' },
  Insufficient: { bg: 'var(--color-gray-500)10', border: '#6b7280', text: '#6b7280', label: '⚠️ Insufficient' },
};

function ThresholdBadge({ confidence }) {
  if (confidence >= 90) {
    return <span className="tb-badge tb-badge--auto">Auto-suggest</span>;
  }
  if (confidence >= 70) {
    return <span className="tb-badge tb-badge--review">Needs Review</span>;
  }
  return null;
}

export default function EvidenceClassification({ item, onAction }) {
  const [officerAction, setOfficerAction] = useState(null);
  const cls = CLASS_COLORS[item.classification] || CLASS_COLORS.Neutral;

  const handleAction = (action) => {
    setOfficerAction(action);
    console.log(`[AUDIT] Evidence classification ${action}`, {
      evidenceId: item.id,
      classification: item.classification,
      confidence: item.confidence,
      officerAction: action,
      timestamp: new Date().toISOString(),
    });
    onAction?.(item.id, action);
  };

  return (
    <div
      className="tb-ev-card"
      style={{
        borderLeftColor: cls.border,
        background: cls.bg,
        opacity: officerAction === 'reject' ? 0.4 : 1,
      }}
    >
      <div className="tb-ev-header">
        <div className="tb-ev-meta">
          <span className="tb-ev-type" style={{ color: cls.text }}>{item.evidenceType}</span>
          <span className="tb-ev-class">{cls.label}</span>
        </div>
        <div className="tb-ev-right">
          <span className="tb-ev-conf">{item.confidence}%</span>
          <ThresholdBadge confidence={item.confidence} />
        </div>
      </div>

      <p className="tb-ev-explanation">{item.explanation}</p>

      {item.excerpts?.length > 0 && (
        <div className="tb-ev-excerpts">
          {item.excerpts.map((ex, i) => (
            <div key={i} className="tb-ev-excerpt">"{ex}"</div>
          ))}
        </div>
      )}

      {item.entities?.length > 0 && (
        <div className="tb-ev-entities">
          {item.entities.map((e, i) => (
            <span key={i} className="tb-ev-entity">{e}</span>
          ))}
        </div>
      )}

      <div className="tb-ev-actions">
        {['Accept', 'Change', 'Reject'].map((a) => (
          <button
            key={a}
            className={`tb-ev-btn ${officerAction === a.toLowerCase() ? `tb-ev-btn--${a.toLowerCase()}` : ''}`}
            onClick={() => handleAction(a.toLowerCase())}
          >
            {a}
          </button>
        ))}
        {officerAction && (
          <span className="tb-ev-officer-label">Officer: {officerAction.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}
