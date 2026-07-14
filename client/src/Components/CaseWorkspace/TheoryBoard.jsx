import React, { useState, useCallback } from 'react';
import EvidenceClassification from './EvidenceClassification';
import './TheoryBoard.scss';

// ponytail: mock data for FIR 142/2026 — production fetches from /zia/theories/:firId
const MOCK_THEORIES = [
  {
    id: 'T1',
    title: 'Organized Robbery by Known Gang',
    description: 'Mohan and associates executed a pre-planned robbery targeting the jewelry transport route, using prior surveillance and local informant intelligence.',
    status: 'working',
    confidence: 0.78,
    evidence: [
      {
        id: 'E1',
        evidenceType: 'CCTV Footage',
        classification: 'Supports',
        confidence: 94,
        explanation: 'Jayanagar junction CCTV captured three individuals matching suspect descriptions at 14:22 — 8 minutes before the robbery. Gait analysis aligns with Mohan.',
        excerpts: ['Vehicle KB-01-M-4477 visible at junction 14:22', 'Three individuals exit vehicle, walk toward jewelry store'],
        entities: ['Mohan', 'KB-01-M-4477', 'Jayanagar Junction'],
      },
      {
        id: 'E2',
        evidenceType: 'Witness Statement',
        classification: 'Supports',
        confidence: 82,
        explanation: 'Complainant identified suspect build and height as consistent with Mohan from photo array. Auto-driver Raju confirms seeing three men near the store.',
        excerpts: ['Complainant: "The tall one — I\'d know those shoulders anywhere"', 'Raju: "They were checking phones, like waiting for a signal"'],
        entities: ['Complainant', 'Auto-driver Raju', 'Mohan'],
      },
      {
        id: 'E3',
        evidenceType: 'Phone CDR',
        classification: 'Contradicts',
        confidence: 71,
        explanation: 'Mohan\'s primary phone tower dump shows location 12km away at time of robbery. However, secondary phone not yet checked.',
        excerpts: ['Tower dump: Mohan\'s phone at Koramangala cell at 14:30'],
        entities: ['Mohan', 'Koramangala Tower'],
      },
      {
        id: 'E4',
        evidenceType: 'Pattern Analysis',
        classification: 'Supports',
        confidence: 91,
        explanation: 'Modus operandi matches four prior robberies in Jayanagar corridor — same time window, same vehicle type, same three-person formation.',
        excerpts: ['FIR 098/2026: identical MO, same corridor', 'FIR 112/2026: same vehicle type noted'],
        entities: ['FIR 098/2026', 'FIR 112/2026'],
      },
      {
        id: 'E5',
        evidenceType: 'Fingerprint Lift',
        classification: 'Insufficient',
        confidence: 45,
        explanation: 'Partial print recovered from getaway vehicle steering wheel. FSL analysis incomplete — ridge detail insufficient for ACE-V comparison.',
        excerpts: ['FSL Report: "Partial impression, 6 points — below 12-point threshold"'],
        entities: ['FSL Bengaluru'],
      },
    ],
  },
  {
    id: 'T2',
    title: 'Solo Opportunistic Actor',
    description: 'An unknown lone actor exploited an unguarded moment, with no pre-existing criminal network or prior surveillance involved.',
    status: 'working',
    confidence: 0.35,
    evidence: [
      {
        id: 'E1',
        evidenceType: 'CCTV Footage',
        classification: 'Contradicts',
        confidence: 93,
        explanation: 'CCTV clearly shows three individuals acting in coordination — timing, roles, and vehicle switches are incompatible with a solo actor.',
        excerpts: ['Three exits from vehicle, staggered formation', 'Driver remains with engine running'],
        entities: ['Jayanagar Junction CCTV'],
      },
      {
        id: 'E2',
        evidenceType: 'Witness Statement',
        classification: 'Contradicts',
        confidence: 78,
        explanation: 'Multiple witnesses describe coordinated movement — one person enters store, two maintain perimeter. Solo theory contradicted.',
        excerpts: ['Store owner: "One came in, the other two were watching the street"'],
        entities: ['Store owner', 'Witnesses'],
      },
      {
        id: 'E3',
        evidenceType: 'Phone CDR',
        classification: 'Neutral',
        confidence: 62,
        explanation: 'Phone records don\'t definitively confirm or rule out an accomplice network. Secondary phones remain unidentified.',
        excerpts: ['Multiple unknown numbers active near scene 14:15-14:40'],
        entities: ['Unknown phones'],
      },
      {
        id: 'E4',
        evidenceType: 'Pattern Analysis',
        classification: 'Contradicts',
        confidence: 88,
        explanation: 'Four prior robberies with identical MO involved organized groups. Solo opportunistic theory inconsistent with established pattern.',
        excerpts: ['All four prior cases involved 2-3 person teams', 'No solo-actor pattern in Jayanagar corridor'],
        entities: ['FIR 098/2026', 'FIR 112/2026', 'FIR 121/2026', 'FIR 134/2026'],
      },
      {
        id: 'E5',
        evidenceType: 'Intelligence Report',
        classification: 'Contradicts',
        confidence: 85,
        explanation: 'Local informant network confirms Mohan\'s gang was active and planning operations in Brigade Road area during the week of the robbery.',
        excerpts: ['Informant: "Mohan\'s crew was scouting Brigade Road shops for 3 days"'],
        entities: ['Informant Network', 'Mohan'],
      },
    ],
  },
];

export default function TheoryBoard({ firId }) {
  const [theories, setTheories] = useState(MOCK_THEORIES);
  const [activeTheory, setActiveTheory] = useState(MOCK_THEORIES[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [theoryNotes, setTheoryNotes] = useState({
    T1: [
      { author: 'PI Dharmendra', date: '2026-07-09 10:14', text: 'Verified getaway route with Jayanagar station CCTV. MO overlaps exactly with J-CEN robbery.' },
      { author: 'SI Ramesh', date: '2026-07-08 16:30', text: 'Complainant confirms height and build matches Mohan.' },
    ],
    T2: [
      { author: 'SI Ramesh', date: '2026-07-08 17:00', text: 'No local informants report solo actors on impulse. CCTV strongly contradicts.' },
    ],
  });
  const [noteText, setNoteText] = useState('');

  const current = theories.find(t => t.id === activeTheory);

  const addTheory = () => {
    if (!newTitle.trim()) return;
    if (theories.length >= 3) {
      console.warn('[TheoryBoard] Soft limit: 3 theories max');
    }
    const id = `T${theories.length + 1}`;
    const newTheory = {
      id,
      title: newTitle,
      description: newDesc,
      status: 'working',
      confidence: 0.5,
      evidence: [],
    };
    setTheories(prev => [...prev, newTheory]);
    setActiveTheory(id);
    setShowAddForm(false);
    setNewTitle('');
    setNewDesc('');
  };

  const adjustConfidence = (theoryId, amount) => {
    setTheories(prev => prev.map(t => {
      if (t.id === theoryId) {
        const val = Math.max(0, Math.min(1, t.confidence + amount));
        return { ...t, confidence: parseFloat(val.toFixed(2)) };
      }
      return t;
    }));
  };

  const confirmTheory = async (theory) => {
    setConfirming(theory.id);
    // ponytail: production POSTs to /zia/theories/:firId/confirm
    setTimeout(() => {
      setTheories(prev => prev.map(t =>
        t.id === theory.id ? { ...t, confirmedBy: 'PI Dharmendra' } : t
      ));
      setConfirming(null);
    }, 600);
  };

  const handleEvidenceAction = (evId, action) => {
    console.log(`[AUDIT] Evidence ${evId} ${action} on theory ${activeTheory}`, {
      firId,
      theoryId: activeTheory,
      evidenceId: evId,
      action,
      timestamp: new Date().toISOString(),
    });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setTheoryNotes(prev => ({
      ...prev,
      [activeTheory]: [
        ...(prev[activeTheory] || []),
        { author: 'SI Ramesh', date: new Date().toISOString().replace('T', ' ').slice(0, 16), text: noteText },
      ],
    }));
    setNoteText('');
  };

  const confPct = (v) => Math.round(v * 100);
  const confColor = (v) => v >= 0.75 ? '#4ade80' : v >= 0.5 ? '#facc15' : '#f87171';

  return (
    <div className="tb-section">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="tb-header">
        <div className="tb-header-left">
          <span className="tb-header-icon">🎯</span>
          <span className="tb-header-title">Theory Board</span>
        </div>
        <span className="tb-header-badge">{theories.length} theories</span>
      </div>

      <div className="tb-body">
        {/* Theory tabs */}
        <div className="tb-theory-tabs">
          {theories.map(t => (
            <button
              key={t.id}
              className={`tb-theory-tab ${activeTheory === t.id ? 'tb-theory-tab--active' : ''}`}
              onClick={() => setActiveTheory(t.id)}
            >
              <span className="tb-theory-dot" style={{ background: confColor(t.confidence) }} />
              {t.title}
              <span className="tb-conf-badge" style={{
                background: `${confColor(t.confidence)}20`,
                color: confColor(t.confidence),
              }}>
                {confPct(t.confidence)}%
              </span>
            </button>
          ))}
          <button className="tb-add-btn" onClick={() => setShowAddForm(s => !s)}>
            + Add Theory
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="tb-add-form">
            <h4>New Theory</h4>
            <input
              className="tb-input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Theory title…"
            />
            <textarea
              className="tb-textarea"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Description (optional)…"
              rows={3}
            />
            <div className="tb-form-actions">
              <button className="tb-btn-primary" onClick={addTheory}>Add</button>
              <button className="tb-btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Theory detail */}
        {current && (
          <div className="tb-theory-detail">
            <div className="tb-theory-header">
              <div>
                <h3 className="tb-theory-title">{current.title}</h3>
                <p className="tb-theory-desc">{current.description}</p>
              </div>
              <div className="tb-theory-actions">
                <div className="tb-conf-controls">
                  <button className="tb-conf-btn" onClick={() => adjustConfidence(current.id, -0.05)} title="Decrease confidence">-</button>
                  <span className="tb-conf-badge" style={{ background: `${confColor(current.confidence)}20`, color: confColor(current.confidence) }}>
                    {confPct(current.confidence)}% confidence
                  </span>
                  <button className="tb-conf-btn" onClick={() => adjustConfidence(current.id, 0.05)} title="Increase confidence">+</button>
                </div>
                {current.confirmedBy ? (
                  <span className="tb-confirmed-label">✓ Confirmed by {current.confirmedBy}</span>
                ) : (
                  <button
                    className="tb-confirm-btn"
                    onClick={() => confirmTheory(current)}
                    disabled={confirming === current.id}
                  >
                    {confirming === current.id ? 'Confirming…' : '✓ Confirm Theory'}
                  </button>
                )}
              </div>
            </div>

            {/* Evidence classification grid */}
            <div className="tb-ev-grid">
              <div>
                <p className="tb-ev-col-title" style={{ color: '#4ade80' }}>
                  ✅ Supporting Evidence ({current.evidence.filter(e => e.classification === 'Supports').length})
                </p>
                <div className="tb-ev-col">
                  {current.evidence.filter(e => e.classification === 'Supports').length === 0 ? (
                    <p className="tb-ev-empty">No supporting evidence yet</p>
                  ) : (
                    current.evidence
                      .filter(e => e.classification === 'Supports')
                      .map(e => <EvidenceClassification key={e.id} item={e} onAction={handleEvidenceAction} />)
                  )}
                </div>
              </div>
              <div>
                <p className="tb-ev-col-title" style={{ color: '#f87171' }}>
                  ❌ Contradicting Evidence ({current.evidence.filter(e => e.classification === 'Contradicts').length})
                </p>
                <div className="tb-ev-col">
                  {current.evidence.filter(e => e.classification === 'Contradicts').length === 0 ? (
                    <p className="tb-ev-empty">No contradicting evidence</p>
                  ) : (
                    current.evidence
                      .filter(e => e.classification === 'Contradicts')
                      .map(e => <EvidenceClassification key={e.id} item={e} onAction={handleEvidenceAction} />)
                  )}
                </div>
              </div>
            </div>

            {/* Neutral / Insufficient below the grid */}
            {(current.evidence.some(e => e.classification === 'Neutral') || current.evidence.some(e => e.classification === 'Insufficient')) && (
              <div style={{ display: 'flex', gap: 16 }}>
                {current.evidence.some(e => e.classification === 'Neutral') && (
                  <div style={{ flex: 1 }}>
                    <p className="tb-ev-col-title" style={{ color: '#9ca3af' }}>
                      ➖ Neutral ({current.evidence.filter(e => e.classification === 'Neutral').length})
                    </p>
                    <div className="tb-ev-col">
                      {current.evidence.filter(e => e.classification === 'Neutral').map(e => (
                        <EvidenceClassification key={e.id} item={e} onAction={handleEvidenceAction} />
                      ))}
                    </div>
                  </div>
                )}
                {current.evidence.some(e => e.classification === 'Insufficient') && (
                  <div style={{ flex: 1 }}>
                    <p className="tb-ev-col-title" style={{ color: '#6b7280' }}>
                      ⚠️ Insufficient ({current.evidence.filter(e => e.classification === 'Insufficient').length})
                    </p>
                    <div className="tb-ev-col">
                      {current.evidence.filter(e => e.classification === 'Insufficient').map(e => (
                        <EvidenceClassification key={e.id} item={e} onAction={handleEvidenceAction} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Officer notes */}
            <div className="tb-notes">
              <h4>💬 Officer Comment Log</h4>
              <div className="tb-notes-list">
                {(theoryNotes[current.id] || []).map((n, idx) => (
                  <div key={idx} className="tb-note-item">
                    <span className="tb-note-author">{n.author}</span>
                    <span className="tb-note-date">{n.date}</span>
                    <p className="tb-note-text">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="tb-notes-input-row">
                <input
                  className="tb-notes-input"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Leave an investigator note on this theory…"
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                />
                <button className="tb-notes-post-btn" onClick={addNote}>Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
