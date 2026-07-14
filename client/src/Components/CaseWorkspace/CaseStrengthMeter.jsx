import React, { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

export default function CaseStrengthMeter({ firId, expanded: controlledExpanded, onToggle }) {
  const [score, setScore] = useState(null);
  const [expanded, setExpanded] = useState(controlledExpanded ?? false);

  useEffect(() => {
    if (!firId) return;
    fetch(`${apiUrl}/zia/case_strength/${firId}`)
      .then(r => r.json())
      .then(d => setScore(d))
      .catch(() => {});
  }, [firId]);

  const toggle = onToggle ?? (() => setExpanded(e => !e));

  if (!score) return null;

  const color = score.overallScore >= 70 ? 'var(--color-green-alt)' : score.overallScore >= 40 ? '#facc15' : 'var(--color-red-soft)';
  const factors = score.factors || score.weightedFactors || [];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 16px', background: `${color}15`,
          border: `1px solid ${color}40`, borderRadius: '999px',
          cursor: 'pointer', color: 'inherit',
        }}
        title="Case Strength Meter — click for full breakdown"
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `conic-gradient(${color} ${score.overallScore * 3.6}deg, var(--border) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 800, color,
          }}>{score.overallScore}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1 }}>Case Strength</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color, lineHeight: 1.3 }}>Grade {score.grade}</div>
        </div>
      </button>

      {expanded && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 340, padding: '16px', background: 'var(--surface)',
          border: '1px solid var(--border-light)', borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.06)', zIndex: 50,
        }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
            Case Strength Breakdown
          </div>
          {score.explanation && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              {score.explanation}
            </div>
          )}
          {factors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {factors.map((f, i) => {
                const fColor = f.score >= 70 ? 'var(--color-green-alt)' : f.score >= 40 ? '#facc15' : 'var(--color-red-soft)';
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
