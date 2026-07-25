import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ACTIVE_CASE_FACTS } from './caseFacts';

import apiFetch from '../../utils/apiFetch';

const ACTIVE_CASE_READINESS = {
  overallScore: ACTIVE_CASE_FACTS.readiness,
  grade: 'Needs action',
  explanation: `Investigation readiness is ${ACTIVE_CASE_FACTS.readiness}%. CCTV acquisition and integrity documentation are the main blockers; statutory filing is due in ${ACTIVE_CASE_FACTS.filingDueDays} days.`,
  factors: [
    { name: 'Core case record', score: 100 },
    { name: 'Accused follow-up', score: 65 },
    { name: 'CCTV acquisition', score: 25 },
    { name: 'Digital integrity', score: 10 },
  ],
};

export default function CaseStrengthMeter({ firId, expanded: controlledExpanded, onToggle }) {
  const [score, setScore] = useState(() => firId === ACTIVE_CASE_FACTS.firId ? ACTIVE_CASE_READINESS : null);
  const [expanded, setExpanded] = useState(controlledExpanded ?? false);

  useEffect(() => {
    if (!firId) return;
    if (firId === ACTIVE_CASE_FACTS.firId) {
      setScore(ACTIVE_CASE_READINESS);
      return;
    }
    apiFetch(`/zia/case_strength/${firId}`)
      .then(r => r ? r.json() : null)
      .then(d => { if (d) setScore(d); })
      .catch(() => {});
  }, [firId]);

  const toggle = onToggle ?? (() => setExpanded(e => !e));

  if (!score) return null;

  const color = score.overallScore >= 70 ? 'var(--color-green-alt)' : score.overallScore >= 40 ? '#a76617' : 'var(--color-red-soft)';
  const factors = score.factors || score.weightedFactors || [];

  return (
    <div className="case-strength">
      <button
        className="case-strength__button"
        onClick={toggle}
        style={{ '--readiness-color': color }}
        title="Investigation readiness - click for the factor breakdown"
        aria-expanded={expanded}
      >
        <div className="case-strength__gauge" style={{ background: `conic-gradient(${color} ${score.overallScore * 3.6}deg, var(--border) 0deg)` }}>
          <div style={{ color }}>{score.overallScore}</div>
        </div>
        <div className="case-strength__summary">
          <span>Readiness</span>
          <strong style={{ color }}>{score.grade}</strong>
        </div>
      </button>

      {expanded && (
        <div className="case-strength__details">
          <div className="case-strength__details-title">
            Investigation readiness
          </div>
          {score.explanation && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              {score.explanation}
            </div>
          )}
          {factors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {factors.map((f, i) => {
                const fColor = f.score >= 70 ? 'var(--color-green-alt)' : f.score >= 40 ? '#a76617' : 'var(--color-red-soft)';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>{f.name || f.label}</div>
                    <div style={{
                      width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden',
                    }}>
                      <div style={{ width: `${f.score}%`, height: '100%', background: fColor, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: fColor, minWidth: 28, textAlign: 'right' }}>{f.score}</div>
                  </div>
                );
              })}
            </div>
          )}
          {factors.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No factor data available.</div>
          )}
        </div>
      )}
    </div>
  );
}

CaseStrengthMeter.propTypes = {
  firId: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
};
