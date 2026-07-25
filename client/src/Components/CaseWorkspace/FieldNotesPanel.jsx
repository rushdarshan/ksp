import { useState, useEffect, useRef } from 'react';
import {
  PiNotePencil, PiTrash, PiCircleNotch, PiWarning,
  PiCheckCircle, PiTag, PiClock
} from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import './FieldNotesPanel.scss';

const PRIORITY_COLORS = { High: '#ef4444', Normal: '#6366f1', Low: '#64748b' };

export default function FieldNotesPanel({ firNo = 'KSP-2026-0142' }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [tags, setTags] = useState('');
  const [toast, setToast] = useState(null);
  const textRef = useRef(null);

  const loadNotes = () => {
    setLoading(true);
    apiFetch(`/field_notes/list?firNo=${firNo}`)
      .then(r => r ? r.json() : null)
      .then(d => { if (d?.notes) setNotes(d.notes); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadNotes(); }, [firNo]);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/field_notes/save', {
        method: 'POST',
        body: JSON.stringify({
          firNo,
          officerId: 'IO-1042',
          noteText: text.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          priority
        })
      });
      const data = res ? await res.json() : null;
      if (data?.success) {
        setNotes(prev => [data.note, ...prev]);
        setText('');
        setTags('');
        setPriority('Normal');
        showToast('📝 Note saved — Catalyst NoSQL (TTL: 30 days)');
        if (textRef.current) textRef.current.focus();
      }
    } catch {
      showToast('⚠️ Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (docId) => {
    try {
      await apiFetch(`/field_notes/${docId}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.documentId !== docId));
      showToast('🗑 Note deleted');
    } catch {
      showToast('⚠️ Delete failed');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const daysLeft = (expireAt) => {
    if (!expireAt) return null;
    const diff = Math.ceil((new Date(expireAt) - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="fnp-shell">
      <div className="fnp-header">
        <h3 className="fnp-title">Field Notes</h3>
        <span className="fnp-badge">Catalyst NoSQL · TTL 30d</span>
      </div>

      {/* Composer */}
      <div className="fnp-composer">
        <textarea
          ref={textRef}
          className="fnp-textarea"
          placeholder="Add field note… (auto-expires in 30 days via NoSQL TTL)"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) save(); }}
        />
        <div className="fnp-composer-footer">
          <input
            className="fnp-tags-input"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          <select
            className="fnp-priority-select"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option>Normal</option>
            <option>High</option>
            <option>Low</option>
          </select>
          <button className="fnp-save-btn" onClick={save} disabled={saving || !text.trim()}>
            {saving ? <PiCircleNotch className="spin" /> : <PiNotePencil />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="fnp-loading"><PiCircleNotch className="spin" /> Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="fnp-empty">No field notes yet. Start adding investigation notes above.</div>
      ) : (
        <div className="fnp-list">
          {notes.map(note => {
            const days = daysLeft(note.expireAt);
            return (
              <div key={note.documentId} className="fnp-note">
                <div className="fnp-note-header">
                  <span
                    className="fnp-priority-dot"
                    style={{ background: PRIORITY_COLORS[note.priority] || '#6366f1' }}
                    title={`${note.priority} priority`}
                  />
                  <span className="fnp-officer">{note.officerId}</span>
                  <span className="fnp-timestamp">
                    {new Date(note.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="fnp-delete-btn" onClick={() => deleteNote(note.documentId)} title="Delete note">
                    <PiTrash />
                  </button>
                </div>
                <p className="fnp-note-text">{note.noteText}</p>
                <div className="fnp-note-footer">
                  {(note.tags || []).map(tag => (
                    <span key={tag} className="fnp-tag"><PiTag /> {tag}</span>
                  ))}
                  {days !== null && (
                    <span className={`fnp-ttl ${days <= 3 ? 'fnp-ttl--warn' : ''}`}>
                      <PiClock /> expires in {days}d
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="fnp-toast">{toast}</div>}
    </div>
  );
}
