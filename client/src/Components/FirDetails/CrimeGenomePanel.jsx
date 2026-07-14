import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

// ──────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────

function ConfidenceBadge({ value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#facc15' : '#f87171';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
      background: `${color}20`, color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {pct}% confidence
    </span>
  );
}

function Section({ title, icon, children, badge }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: '12px',
      border: '1px solid var(--border-light)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)',
        background: 'var(--surface-alt)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{title}</span>
        </div>
        {badge}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// 1. ZIA Case Intelligence Brief
// ──────────────────────────────────────────────────────

function ZIABrief({ firId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/zia/case_brief/${firId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [firId]);

  if (loading) return (
    <Section title="ZIA Case Intelligence Brief" icon="🤖">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
        <div style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ZIA orchestrating agents…
      </div>
    </Section>
  );

  if (!data) return null;

  const priorityColor = { HIGH: '#f87171', MEDIUM: '#facc15', LOW: '#4ade80' };

  return (
    <Section
      title="ZIA Case Intelligence Brief"
      icon="🤖"
      badge={<ConfidenceBadge value={data.confidence} />}
    >
      {/* Orchestration pipeline */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agent Pipeline
          </span>
          <button
            onClick={() => setShowSteps(s => !s)}
            style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {showSteps ? 'Hide' : 'Show'} steps
          </button>
        </div>
        {showSteps && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {data.orchestrationSteps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', background: 'var(--bg)', borderRadius: '999px',
                border: '1px solid var(--border-light)', fontSize: '12px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                <span style={{ fontWeight: 600 }}>Step {s.step}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.agent}</span>
                <span style={{ color: 'var(--text-secondary)' }}>→ {s.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{
        background: 'var(--bg)', borderRadius: '10px', padding: '16px', marginBottom: '20px',
        borderLeft: '3px solid var(--accent)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text)',
      }}>
        {data.summary}
      </div>

      {/* Key findings */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Key Findings</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.keyFindings.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px', background: 'var(--bg)', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, minWidth: '20px' }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>{f.finding}</p>
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Source: {f.source}</p>
              </div>
              <ConfidenceBadge value={f.confidence} />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Recommendations</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.recommendations.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', background: 'var(--bg)', borderRadius: '8px',
              borderLeft: `3px solid ${priorityColor[r.priority] || '#888'}`,
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '4px', background: `${priorityColor[r.priority]}20`,
                color: priorityColor[r.priority], minWidth: '50px', textAlign: 'center',
              }}>{r.priority}</span>
              <span style={{ fontSize: '13px', color: 'var(--text)', flex: 1 }}>{r.action}</span>
              {r.deadline && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  by {new Date(r.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'center' }}>Sources:</span>
        {data.sources.map((s, i) => (
          <span key={i} style={{
            fontSize: '11px', padding: '3px 10px', background: 'var(--surface-alt)',
            borderRadius: '999px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)',
          }}>{s}</span>
        ))}
      </div>
    </Section>
  );
}

// ──────────────────────────────────────────────────────
// 2. Theory Board
// ──────────────────────────────────────────────────────

const evidenceTypeIcon = { digital: '📹', intelligence: '🔍', pattern: '📊', spatial: '📍', absence: '❌' };
const evidenceTypeColor = { digital: '#60a5fa', intelligence: '#a78bfa', pattern: '#34d399', spatial: '#f97316', absence: '#94a3b8' };

function TheoryBoard({ firId }) {
  const [theories, setTheories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTheory, setActiveTheory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [theoryNotes, setTheoryNotes] = useState({
    T1: [
      { author: 'PI Dharmendra', date: '2026-07-09 10:14', text: 'Verified getaway route with Jayanagar station CCTV. MO overlaps exactly with J-CEN robbery.' },
      { author: 'SI Ramesh', date: '2026-07-08 16:30', text: 'Complainant confirms height and build matches Mohan.' }
    ],
    T2: [
      { author: 'SI Ramesh', date: '2026-07-08 17:00', text: 'No local informants report solo actors on impulse. CCTV strongly contradicts.' }
    ]
  });
  const [noteText, setNoteText] = useState('');

  const fetchTheories = useCallback(() => {
    setLoading(true);
    fetch(`${apiUrl}/zia/theories/${firId}`)
      .then(r => r.json())
      .then(d => {
        setTheories(d.theories);
        setActiveTheory(d.theories[0]?.id || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [firId]);

  useEffect(() => { fetchTheories(); }, [fetchTheories]);

  const confirmTheory = async (theory) => {
    setConfirming(theory.id);
    try {
      const res = await fetch(`${apiUrl}/zia/theories/${firId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theoryId: theory.id, currentConfidence: theory.confidence }),
      });
      const data = await res.json();
      if (data.success) {
        setTheories(prev => prev.map(t =>
          t.id === theory.id
            ? { ...t, confirmedBy: data.confirmedBy, confidence: data.newConfidence }
            : t
        ));
        toast.success(`Theory confirmed by ${data.confirmedBy}`);
      }
    } catch {
      toast.error('Failed to confirm theory');
    }
    setConfirming(null);
  };

  const adjustConfidence = (theoryId, amount) => {
    setTheories(prev => prev.map(t => {
      if (t.id === theoryId) {
        const val = Math.max(0, Math.min(1, t.confidence + amount));
        toast.success(`Confidence overridden to ${Math.round(val * 100)}%`);
        return { ...t, confidence: parseFloat(val.toFixed(2)) };
      }
      return t;
    }));
  };

  const addTheory = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`${apiUrl}/zia/theories/${firId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setTheories(prev => [...prev, data.theory]);
        setActiveTheory(data.theory.id);
        setShowAddForm(false);
        setNewTitle('');
        setNewDesc('');
        toast.success('Theory added to board');
      }
    } catch {
      toast.error('Failed to add theory');
    }
  };

  const addNote = (theoryId) => {
    if (!noteText.trim()) return;
    const newNote = {
      author: 'SI Ramesh',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      text: noteText
    };
    setTheoryNotes(prev => ({
      ...prev,
      [theoryId]: [...(prev[theoryId] || []), newNote]
    }));
    setNoteText('');
    toast.success('Officer note appended');
  };

  const setEvidenceOverride = (evId, status) => {
    setOverrides(prev => ({ ...prev, [evId]: status }));
    toast.success(`Classification updated to: ${status.toUpperCase()}`);
  };

  if (loading) return (
    <Section title="Theory Board" icon="🎯">
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading theories…</div>
    </Section>
  );

  const current = theories?.find(t => t.id === activeTheory);
  const statusStyle = {
    working: { bg: '#60a5fa20', color: '#60a5fa', label: 'Working Theory' },
    weak: { bg: '#f8717120', color: '#f87171', label: 'Weak' },
    confirmed: { bg: '#4ade8020', color: '#4ade80', label: 'Confirmed' },
  };

  return (
    <Section title="Theory Board" icon="🎯"
      badge={<span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{theories?.length} theories</span>}
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {theories?.map(t => {
          const ss = statusStyle[t.status] || statusStyle.working;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTheory(t.id)}
              style={{
                padding: '8px 16px', borderRadius: '999px', border: '2px solid',
                borderColor: activeTheory === t.id ? 'var(--accent)' : 'var(--border-light)',
                background: activeTheory === t.id ? 'var(--accent)' : 'var(--bg)',
                color: activeTheory === t.id ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ss.color }} />
              {t.title}
              <ConfidenceBadge value={t.confidence} />
            </button>
          );
        })}
        <button
          onClick={() => setShowAddForm(s => !s)}
          style={{
            padding: '8px 14px', borderRadius: '999px',
            border: '2px dashed var(--border)', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
          }}
        >+ Add Theory</button>
      </div>

      {showAddForm && (
        <div style={{
          padding: '16px', background: 'var(--bg)', borderRadius: '10px',
          border: '1px solid var(--border-light)', marginBottom: '20px',
        }}>
          <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 12px 0' }}>New Theory</p>
          <input
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Theory title…"
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
              fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box',
            }}
          />
          <textarea
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)…"
            rows={3}
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
              fontSize: '13px', marginBottom: '10px', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={addTheory} style={{
              padding: '8px 20px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            }}>Add</button>
            <button onClick={() => setShowAddForm(false)} style={{
              padding: '8px 20px', background: 'var(--surface-alt)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {current && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{current.title}</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '600px' }}>{current.description}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => adjustConfidence(current.id, -0.05)}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                  title="Decrease confidence score"
                >-</button>
                <ConfidenceBadge value={current.confidence} />
                <button
                  onClick={() => adjustConfidence(current.id, 0.05)}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                  title="Increase confidence score"
                >+</button>
              </div>
              {current.confirmedBy ? (
                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>✓ Confirmed by {current.confirmedBy}</span>
              ) : (
                <button
                  onClick={() => confirmTheory(current)}
                  disabled={confirming === current.id}
                  style={{
                    padding: '6px 14px', fontSize: '12px', fontWeight: 700,
                    background: '#4ade8020', color: '#4ade80', border: '1px solid #4ade8060',
                    borderRadius: '8px', cursor: 'pointer',
                  }}
                >{confirming === current.id ? 'Confirming…' : '✓ Confirm Theory'}</button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{
                margin: '0 0 10px 0', fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4ade80',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span>✅</span> Supporting Evidence ({current.supporting.length})
              </p>
              {current.supporting.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>No supporting evidence yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {current.supporting.map(e => {
                    const status = overrides[e.id] || 'suggested';
                    return (
                      <div key={e.id} style={{
                        padding: '10px 14px', background: '#4ade8008',
                        border: '1px solid #4ade8030', borderRadius: '8px',
                        borderLeft: '3px solid #4ade80',
                        opacity: status === 'reject' ? 0.4 : 1,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{evidenceTypeIcon[e.type] || '📌'}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: evidenceTypeColor[e.type] || '#888', textTransform: 'capitalize' }}>{e.type}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setEvidenceOverride(e.id, 'accept')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'accept' ? '#4ade8030' : 'var(--surface-alt)', color: status === 'accept' ? '#4ade80' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                            <button onClick={() => setEvidenceOverride(e.id, 'reject')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'reject' ? '#f8717130' : 'var(--surface-alt)', color: status === 'reject' ? '#f87171' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                            <button onClick={() => setEvidenceOverride(e.id, 'neutral')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'neutral' ? '#94a3b830' : 'var(--surface-alt)', color: status === 'neutral' ? '#94a3b8' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Neutral</button>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>{e.text}</p>
                        {status !== 'suggested' && (
                          <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>Officer Action: {status.toUpperCase()}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <p style={{
                margin: '0 0 10px 0', fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span>❌</span> Contradicting Evidence ({current.contradicting.length})
              </p>
              {current.contradicting.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>No contradicting evidence</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {current.contradicting.map(e => {
                    const status = overrides[e.id] || 'suggested';
                    return (
                      <div key={e.id} style={{
                        padding: '10px 14px', background: '#f8717108',
                        border: '1px solid #f8717130', borderRadius: '8px',
                        borderLeft: '3px solid #f87171',
                        opacity: status === 'reject' ? 0.4 : 1,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{evidenceTypeIcon[e.type] || '📌'}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: evidenceTypeColor[e.type] || '#888', textTransform: 'capitalize' }}>{e.type}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setEvidenceOverride(e.id, 'accept')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'accept' ? '#4ade8030' : 'var(--surface-alt)', color: status === 'accept' ? '#4ade80' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                            <button onClick={() => setEvidenceOverride(e.id, 'reject')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'reject' ? '#f8717130' : 'var(--surface-alt)', color: status === 'reject' ? '#f87171' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                            <button onClick={() => setEvidenceOverride(e.id, 'neutral')} style={{ padding: '2px 6px', fontSize: '9px', background: status === 'neutral' ? '#94a3b830' : 'var(--surface-alt)', color: status === 'neutral' ? '#94a3b8' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Neutral</button>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>{e.text}</p>
                        {status !== 'suggested' && (
                          <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>Officer Action: {status.toUpperCase()}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '10px', marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>💬 Officer Comment Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {(theoryNotes[current.id] || []).map((n, idx) => (
                <div key={idx} style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{n.author}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{n.date}</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.text}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Leave an investigator note on this theory…"
                style={{ flex: 1, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px' }}
                onKeyDown={e => e.key === 'Enter' && addNote(current.id)}
              />
              <button onClick={() => addNote(current.id)} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ──────────────────────────────────────────────────────
// 3. Case Strength Meter
// ──────────────────────────────────────────────────────

function CaseStrengthMeter({ firId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/zia/case_strength/${firId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [firId]);

  if (loading) return (
    <Section title="Case Strength Meter" icon="⚖️">
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Analysing case strength…</div>
    </Section>
  );
  if (!data) return null;

  const gradeColor = { A: '#4ade80', B: '#60a5fa', C: '#facc15', D: '#f97316', F: '#f87171' };
  const scoreColor = data.overallScore >= 75 ? '#4ade80' : data.overallScore >= 50 ? '#facc15' : '#f87171';
  const checklists = [
    { label: 'CCTV Evidence Intact', check: true, details: 'Verified from junction SH-9 logs' },
    { label: 'Witness Statements Corroborated', check: true, details: 'Complainant and auto-driver Raju statements match' },
    { label: 'Modus Operandi Consistent', check: true, details: 'Corresponds with 4 Jayanagar corridor robberies' },
    { label: 'Forensic Reports / prints', check: false, details: 'FSL fingerprint lift analysis pending' },
    { label: 'Weapon / Property Recovery', check: false, details: 'Gold chain and getaway vehicle not recovered' },
    { label: 'Financial / CDR Trail', check: false, details: 'CDR logs for suspect phone pending telecom request' },
  ];

  return (
    <Section title="Case Strength Meter" icon="⚖️"
      badge={
        <span style={{
          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px', fontWeight: 800,
          background: `${gradeColor[data.grade] || '#888'}20`, color: gradeColor[data.grade] || '#888',
          border: `2px solid ${gradeColor[data.grade] || '#888'}60`,
        }}>{data.grade}</span>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${data.overallScore * 3.6}deg, var(--border) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${scoreColor}40`,
          }}>
            <div style={{
              width: 75, height: 75, borderRadius: '50%', background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: scoreColor }}>{data.overallScore}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>/100</span>
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Overall Score</p>
          
          <div style={{ marginTop: '16px', width: '100%' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chargeable Sections</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
              {data.chargeableSections.map((s, i) => (
                <span key={i} style={{
                  padding: '2px 8px', background: '#60a5fa20', color: '#60a5fa',
                  borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  border: '1px solid #60a5fa40',
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px', background: 'var(--surface-alt)', border: '1px solid var(--border)',
          borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>🧩 Case Sufficiency Checklist</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {checklists.map((c, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border-light)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', color: c.check ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{c.check ? '✓' : '✗'}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: c.check ? 'var(--text)' : 'var(--text-secondary)' }}>{c.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.details}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px', fontWeight: 600 }}>
            ⚠️ Missing weapon recovery & telephone logs drops case score. Grade: {data.grade}
          </div>
        </div>
      </div>

      <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Factor Breakdown (click to expand)
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.factors.map((f, i) => {
          const fc = f.score >= 75 ? '#4ade80' : f.score >= 50 ? '#facc15' : '#f87171';
          const isExpanded = expanded === i;
          return (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                style={{
                  width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600, minWidth: '140px' }}>{f.factor}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${f.score}%`, background: fc,
                    borderRadius: '4px', transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: fc, minWidth: '36px', textAlign: 'right' }}>{f.score}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '60px' }}>×{Math.round(f.weight * 100)}% weight</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div style={{ padding: '0 14px 14px 14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {f.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ──────────────────────────────────────────────────────
// 4. Ambient Memory (Memory Not Search)
// ──────────────────────────────────────────────────────

const suggestionIcon = { related_case: '🔗', wanted: '🚨', deadline: '⏰', alert: '🔔', evidence_gap: '⚠️' };
const suggestionColor = { related_case: '#60a5fa', wanted: '#f87171', deadline: '#facc15', alert: '#f97316', evidence_gap: '#a78bfa' };

function AmbientMemory({ firId }) {
  const [data, setData] = useState(null);
  const [context, setContext] = useState('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/zia/memory?context=${context}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [context, firId]);

  return (
    <Section title="ZIA Memory" icon="🧠"
      badge={
        <div style={{ display: 'flex', gap: '4px' }}>
          {['general', 'investigation'].map(c => (
            <button key={c} onClick={() => setContext(c)} style={{
              padding: '4px 12px', fontSize: '12px', borderRadius: '999px', cursor: 'pointer',
              background: context === c ? 'var(--accent)' : 'transparent',
              color: context === c ? '#fff' : 'var(--text-secondary)',
              border: context === c ? 'none' : '1px solid var(--border)',
              fontWeight: 600, textTransform: 'capitalize',
            }}>{c}</button>
          ))}
        </div>
      }
    >
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
        ZIA surfaces relevant context automatically — no search needed. Updated at {data ? new Date(data.generatedAt).toLocaleTimeString('en-IN') : '…'}
      </p>
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fetching contextual memory…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data?.suggestions.map((s, i) => {
            const ic = suggestionIcon[s.type] || '💡';
            const col = suggestionColor[s.type] || '#888';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '14px 16px', background: 'var(--bg)', borderRadius: '10px',
                border: '1px solid var(--border-light)', borderLeft: `3px solid ${col}`,
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{ic}</span>
                <div style={{ flex: 1 }}>
                  {s.firNo && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: col }}>
                      {s.firNo}
                    </p>
                  )}
                  {s.name && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                      {s.name}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
                    {s.summary || s.reason || s.event || s.text}
                  </p>
                  {s.daysRemaining !== undefined && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#facc15', fontWeight: 600 }}>
                      {s.daysRemaining} days remaining
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
                  background: `${col}20`, color: col, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {Math.round(s.relevance * 100)}% relevant
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ──────────────────────────────────────────────────────
// Main export: Crime Genome Panel
// ──────────────────────────────────────────────────────

export default function CrimeGenomePanel({ firId = 'KSP-2026-0142', briefOnly = false, theoryOnly = false }) {
  if (briefOnly) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <ZIABrief firId={firId} />
      <AmbientMemory firId={firId} />
    </div>
  );

  if (theoryOnly) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <TheoryBoard firId={firId} />
      <CaseStrengthMeter firId={firId} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Inline spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Banner */}
      <div className="panel-shell" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '32px' }}>🧬</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            Crime Genome Intelligence
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            ZIA multi-agent analysis for {firId} — AI brief, working theories, case strength, and ambient memory
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ZIA Brief', 'Theory Board', 'Strength Meter', 'Memory'].map(f => (
            <span key={f} className="badge badge--info">{f}</span>
          ))}
        </div>
      </div>

      <ZIABrief firId={firId} />
      <TheoryBoard firId={firId} />
      <CaseStrengthMeter firId={firId} />
      <AmbientMemory firId={firId} />
    </div>
  );
}

