import React, { useState } from 'react';
import { useCaseContext } from './caseContext';

const MOCK_NOTES = [
  { id: 'n1', author: 'PI Dharmendra', timestamp: '2026-07-09T14:30:00', text: 'CDR analysis initiated for suspect phone 98450XXXXX. Awaiting Telecom Nodal response.', linkedEntity: 'E6' },
  { id: 'n2', author: 'SI Ramesh', timestamp: '2026-07-08T11:15:00', text: 'FSL confirmed fingerprint match with Ravi Kumar. 10-point match. Formal certification pending.', linkedEntity: 'E2' },
  { id: 'n3', author: 'PI Dharmendra', timestamp: '2026-07-07T16:45:00', text: 'Vehicle KA-01-AB-1234 registered to Ravi Kumar, S/O Rajesh Kumar, 4th Cross, Indiranagar.', linkedEntity: null },
];

export default function CaseNotes() {
  const { firId } = useCaseContext();
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [newNote, setNewNote] = useState('');
  const [linkedEntity, setLinkedEntity] = useState('');

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `n${Date.now()}`,
      author: 'Current Officer',
      timestamp: new Date().toISOString(),
      text: newNote.trim(),
      linkedEntity: linkedEntity || null,
    };
    setNotes([note, ...notes]);
    setNewNote('');
    setLinkedEntity('');
    console.log('[AUDIT] Note created:', note);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h3 className="panel-title" style={{ margin: 0, fontSize: '16px' }}>Case Notes — {firId}</h3>

      <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Add a note about this case…"
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--surface-alt)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-sub)',
            color: 'var(--text)', resize: 'vertical', fontFamily: 'var(--font-body)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <input
            value={linkedEntity}
            onChange={e => setLinkedEntity(e.target.value)}
            placeholder="Link to evidence (optional, e.g. E1)"
            style={{
              flex: 1, padding: '8px 12px', background: 'var(--surface-alt)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-caption)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 'var(--size-sub)', opacity: newNote.trim() ? 1 : 0.42 }}
          >Add Note</button>
        </div>
        <div style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)' }}>{newNote.length}/2000</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {notes.map(n => (
          <div key={n.id} className="panel-shell panel-shell--compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--size-caption)', fontWeight: 700, color: 'var(--text)' }}>{n.author}</span>
                {n.linkedEntity && (
                  <span className="badge badge--info" style={{ fontSize: '11px', padding: '2px 8px' }}>{n.linkedEntity}</span>
                )}
              </div>
              <span style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)' }}>
                {new Date(n.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ fontSize: 'var(--size-sub)', color: 'var(--text)', lineHeight: 1.6 }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
