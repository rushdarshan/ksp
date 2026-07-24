import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  PiChatCircleDots,
  PiCheck,
  PiCheckCircle,
  PiMinusCircle,
  PiTarget,
  PiWarningCircle,
  PiXCircle,
} from 'react-icons/pi';
import EvidenceClassification from './EvidenceClassification';
import './TheoryBoard.scss';

const INITIAL_THEORIES = [
  {
    id: 'T1',
    title: 'Coordinated robbery involving listed accused',
    description: 'Working hypothesis to test whether Mohan Kumar and Kiran Joseph acted together in the Brigade Road / SH-9 junction robbery. This remains subject to evidence acquisition and officer verification.',
    status: 'working',
    confidence: 0.58,
    evidence: [
      {
        id: 'E1',
        evidenceType: 'Case Record',
        classification: 'Supports',
        confidence: 76,
        explanation: 'The investigation record lists Mohan Kumar and Kiran Joseph as accused. The linkage prioritises verification but does not establish the hypothesis by itself.',
        excerpts: ['Accused record: Mohan Kumar', 'Accused record: Kiran Joseph'],
        entities: ['Mohan Kumar', 'Kiran Joseph', 'KSP-2026-0142'],
      },
      {
        id: 'E2',
        evidenceType: 'CCTV Source',
        classification: 'Insufficient',
        confidence: 95,
        explanation: 'The SH-9 junction camera is identified and referenced, but footage has not been acquired or hashed and no BSA Section 63 certificate is recorded.',
        excerpts: ['Source identified; acquisition pending', 'Hash and BSA Section 63 certificate pending'],
        entities: ['SH-9 junction camera'],
      },
      {
        id: 'E3',
        evidenceType: 'Operational Status',
        classification: 'Neutral',
        confidence: 90,
        explanation: 'Kiran Joseph remains at large. This is an operational status and does not independently support or contradict the working hypothesis.',
        excerpts: ['Status: at large'],
        entities: ['Kiran Joseph'],
      },
    ],
  },
  {
    id: 'T2',
    title: 'Accused linkage is incomplete',
    description: 'Alternative hypothesis that the current accused linkage is incomplete or requires revision. It remains open until the referenced CCTV and supporting records are reviewed.',
    status: 'working',
    confidence: 0.42,
    evidence: [
      {
        id: 'E1',
        evidenceType: 'CCTV Source',
        classification: 'Insufficient',
        confidence: 95,
        explanation: 'The most relevant referenced source has not been acquired, so it cannot presently corroborate or challenge the accused linkage.',
        excerpts: ['Acquisition pending', 'Integrity record pending'],
        entities: ['SH-9 junction camera'],
      },
      {
        id: 'E2',
        evidenceType: 'Case Record',
        classification: 'Neutral',
        confidence: 74,
        explanation: 'Named accused records establish the current investigative scope, but independent corroboration still requires officer review.',
        excerpts: ['Mohan Kumar and Kiran Joseph listed in the active record'],
        entities: ['Mohan Kumar', 'Kiran Joseph'],
      },
    ],
  },
];

const INITIAL_NOTES = {
  T1: [
    { author: 'PI Dharmendra', date: '2026-03-18 10:00', text: 'Acquire the identified CCTV source before increasing support for this hypothesis.' },
  ],
  T2: [
    { author: 'PI Dharmendra', date: '2026-03-18 10:05', text: 'Keep the alternative open until CCTV integrity and legal documentation are complete.' },
  ],
};

const confidenceColor = value => value >= 0.75 ? 'var(--color-green-alt)' : value >= 0.5 ? '#a76617' : 'var(--color-red-soft)';

export default function TheoryBoard({ firId, onLinkEvidence }) {
  const [theories, setTheories] = useState(INITIAL_THEORIES);
  const [activeTheory, setActiveTheory] = useState(INITIAL_THEORIES[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [theoryNotes, setTheoryNotes] = useState(INITIAL_NOTES);
  const [noteText, setNoteText] = useState('');
  const [draggedEvidenceId, setDraggedEvidenceId] = useState(null);
  const [dragOverTheoryId, setDragOverTheoryId] = useState(null);

  const current = theories.find(theory => theory.id === activeTheory);

  const addTheory = () => {
    if (!newTitle.trim()) return;
    const id = `T${theories.length + 1}`;
    setTheories(previous => [...previous, {
      id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: 'working',
      confidence: 0.5,
      evidence: [],
    }]);
    setActiveTheory(id);
    setShowAddForm(false);
    setNewTitle('');
    setNewDesc('');
  };

  const adjustConfidence = (theoryId, amount) => {
    setTheories(previous => previous.map(theory => theory.id === theoryId
      ? { ...theory, confidence: Number(Math.max(0, Math.min(1, theory.confidence + amount)).toFixed(2)) }
      : theory));
  };

  const confirmTheory = (theory) => {
    setConfirming(theory.id);
    setTimeout(() => {
      setTheories(previous => previous.map(item => item.id === theory.id
        ? { ...item, confirmedBy: 'PI Dharmendra' }
        : item));
      setConfirming(null);
    }, 600);
  };

  const handleEvidenceAction = (evidenceId, action) => {
    console.log('[AUDIT] Theory evidence review', { firId, theoryId: activeTheory, evidenceId, action, timestamp: new Date().toISOString() });
  };

  const moveEvidence = (targetTheoryId, evidenceId) => {
    if (!evidenceId) return;
    setTheories(prev => {
      const sourceTheory = prev.find(t => t.evidence.some(e => e.id === evidenceId));
      if (!sourceTheory || sourceTheory.id === targetTheoryId) return prev;
      const evItem = sourceTheory.evidence.find(e => e.id === evidenceId);
      return prev.map(t => {
        if (t.id === sourceTheory.id) return { ...t, evidence: t.evidence.filter(e => e.id !== evidenceId) };
        if (t.id === targetTheoryId) return { ...t, evidence: [...t.evidence, { ...evItem }] };
        return t;
      });
    });
  };

  const handleDrop = (theoryId) => {
    if (!draggedEvidenceId) return;
    moveEvidence(theoryId, draggedEvidenceId);
    onLinkEvidence?.(theoryId, draggedEvidenceId);
    setDraggedEvidenceId(null);
    setDragOverTheoryId(null);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setTheoryNotes(previous => ({
      ...previous,
      [activeTheory]: [
        ...(previous[activeTheory] || []),
        { author: 'Current Officer', date: new Date().toISOString().replace('T', ' ').slice(0, 16), text: noteText.trim() },
      ],
    }));
    setNoteText('');
  };

  const renderEvidenceColumn = (classification, title, Icon, color) => {
    const evidence = current.evidence.filter(item => item.classification === classification);
    return (
      <div
        className={`tb-ev-col-wrapper ${dragOverTheoryId === current.id ? 'tb-ev-col-wrapper--drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); }}
        onDragEnter={() => setDragOverTheoryId(current.id)}
        onDragLeave={() => setDragOverTheoryId(null)}
        onDrop={() => handleDrop(current.id)}
      >
        <p className="tb-ev-col-title" style={{ color }}><Icon aria-hidden="true" /> {title} ({evidence.length})</p>
        <div className="tb-ev-col">
          {evidence.length
            ? evidence.map(item => (
              <div
                key={item.id}
                draggable="true"
                className={`tb-ev-card-wrapper ${draggedEvidenceId === item.id ? 'tb-ev-card-wrapper--dragging' : ''}`}
                onDragStart={() => setDraggedEvidenceId(item.id)}
                onDragEnd={() => setDraggedEvidenceId(null)}
              >
                <EvidenceClassification item={item} onAction={handleEvidenceAction} />
              </div>
            ))
            : <p className="tb-ev-empty">No {title.toLowerCase()} records</p>}
        </div>
      </div>
    );
  };

  return (
    <section className="tb-section">
      <div className="tb-header">
        <div className="tb-header-left"><span className="tb-header-icon"><PiTarget weight="duotone" /></span><span className="tb-header-title">Theory Board</span></div>
        <span className="tb-header-badge">{theories.length} working hypotheses</span>
      </div>

      <div className="tb-body">
        <div className="tb-theory-tabs">
          {theories.map(theory => (
            <button
              key={theory.id}
              className={`tb-theory-tab ${activeTheory === theory.id ? 'tb-theory-tab--active' : ''} ${dragOverTheoryId === theory.id ? 'tb-theory-tab--drag-over' : ''}`}
              onClick={() => setActiveTheory(theory.id)}
              onDragOver={e => { e.preventDefault(); }}
              onDragEnter={() => setDragOverTheoryId(theory.id)}
              onDragLeave={() => setDragOverTheoryId(null)}
              onDrop={() => handleDrop(theory.id)}
            >
              <span className="tb-theory-dot" style={{ background: confidenceColor(theory.confidence) }} />
              {theory.title}
              <span className="tb-conf-badge" style={{ background: `${confidenceColor(theory.confidence)}20`, color: confidenceColor(theory.confidence) }}>{Math.round(theory.confidence * 100)}%</span>
            </button>
          ))}
          <button className="tb-add-btn" onClick={() => setShowAddForm(value => !value)}>+ Add hypothesis</button>
        </div>

        {showAddForm && (
          <div className="tb-add-form">
            <h4>New working hypothesis</h4>
            <input className="tb-input" value={newTitle} onChange={event => setNewTitle(event.target.value)} placeholder="Hypothesis title" />
            <textarea className="tb-textarea" value={newDesc} onChange={event => setNewDesc(event.target.value)} placeholder="What should investigators test?" rows={3} />
            <div className="tb-form-actions"><button className="tb-btn-primary" onClick={addTheory}>Add</button><button className="tb-btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button></div>
          </div>
        )}

        {current && (
          <div className="tb-theory-detail">
            <div className="tb-theory-header">
              <div><h3 className="tb-theory-title">{current.title}</h3><p className="tb-theory-desc">{current.description}</p></div>
              <div className="tb-theory-actions">
                <div className="tb-conf-controls">
                  <button className="tb-conf-btn" onClick={() => adjustConfidence(current.id, -0.05)} title="Decrease working support">-</button>
                  <span className="tb-conf-badge" style={{ background: `${confidenceColor(current.confidence)}20`, color: confidenceColor(current.confidence) }}>{Math.round(current.confidence * 100)}% working support</span>
                  <button className="tb-conf-btn" onClick={() => adjustConfidence(current.id, 0.05)} title="Increase working support">+</button>
                </div>
                {current.confirmedBy
                  ? <span className="tb-confirmed-label"><PiCheck aria-hidden="true" /> Recorded by {current.confirmedBy}</span>
                  : <button className="tb-confirm-btn" onClick={() => confirmTheory(current)} disabled={confirming === current.id}><PiCheck aria-hidden="true" /> {confirming === current.id ? 'Recording...' : 'Record as working'}</button>}
              </div>
            </div>

            <div className="tb-ev-grid">
              {renderEvidenceColumn('Supports', 'Supporting', PiCheckCircle, 'var(--color-green-alt)')}
              {renderEvidenceColumn('Contradicts', 'Contradicting', PiXCircle, 'var(--color-red-soft)')}
            </div>

            <div className="tb-ev-grid">
              {renderEvidenceColumn('Neutral', 'Neutral', PiMinusCircle, 'var(--text-secondary)')}
              {renderEvidenceColumn('Insufficient', 'Insufficient', PiWarningCircle, '#a76617')}
            </div>

            <div className="tb-notes">
              <h4><PiChatCircleDots aria-hidden="true" /> Officer comment log</h4>
              <div className="tb-notes-list">
                {(theoryNotes[current.id] || []).map((note, index) => (
                  <div key={`${note.date}-${index}`} className="tb-note-item"><span className="tb-note-author">{note.author}</span><span className="tb-note-date">{note.date}</span><p className="tb-note-text">{note.text}</p></div>
                ))}
              </div>
              <div className="tb-notes-input-row">
                <input className="tb-notes-input" value={noteText} onChange={event => setNoteText(event.target.value)} placeholder="Leave an investigator note" onKeyDown={event => event.key === 'Enter' && addNote()} />
                <button className="tb-notes-post-btn" onClick={addNote}>Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

TheoryBoard.propTypes = {
  firId: PropTypes.string.isRequired,
  onLinkEvidence: PropTypes.func,
};
