import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// All searchable items — FIRs, officers, panels, persons
const STATIC_ITEMS = [
  // Quick Nav — Panels
  { id: 'nav-home', type: 'panel', label: 'My Day', icon: '🌅', path: '/dashboard/home', desc: 'Your daily work queue and priority cases' },
  { id: 'nav-fir', type: 'panel', label: 'Cases / FIR List', icon: '📋', path: '/dashboard/firdetails', desc: 'All registered FIRs' },
  { id: 'nav-officers', type: 'panel', label: 'Officers', icon: '👮', path: '/dashboard/officers', desc: 'Officer roster and career spine' },
  { id: 'nav-map', type: 'panel', label: 'Command Map', icon: '🗺️', path: '/dashboard/map', desc: 'Crime hotspots and predictive intelligence' },
  { id: 'nav-network', type: 'panel', label: 'Co-Accused Network', icon: '🕸️', path: '/dashboard/co-accused-network', desc: 'Gang and co-accused relationship graph' },
  { id: 'nav-voice', type: 'panel', label: 'ZIA Voice Query', icon: '🎙️', path: '/dashboard/voice', desc: 'Ask ZIA a question in natural language' },
  { id: 'nav-veracity', type: 'panel', label: 'FIR Veracity', icon: '✔️', path: '/dashboard/veracity', desc: 'AI-powered case veracity analysis' },
  { id: 'nav-chargesheet', type: 'panel', label: 'Chargesheet Clock', icon: '⏰', path: '/dashboard/chargesheet-clock', desc: 'Deadlines and SLA breach tracker' },
  { id: 'nav-beat', type: 'panel', label: 'Beat Optimizer', icon: '🚔', path: '/dashboard/beat-optimizer', desc: 'Patrol route optimization' },
  { id: 'nav-arrest', type: 'panel', label: 'Arrest Vector', icon: '🎯', path: '/dashboard/arrest-vector', desc: 'Most wanted and arrest intelligence' },
  { id: 'nav-predictive', type: 'panel', label: 'Predictive Intel', icon: '🔮', path: '/dashboard/predictive', desc: 'Crime prediction and hotspot analysis' },
  { id: 'nav-gbv', type: 'panel', label: 'Gender Violence', icon: '♀️', path: '/dashboard/gender-violence', desc: 'GBV analytics and victim support index' },
  { id: 'nav-victim', type: 'panel', label: 'Victim Risk', icon: '🛡️', path: '/dashboard/victim-risk', desc: 'Victim vulnerability and risk scoring' },
  { id: 'nav-retraction', type: 'panel', label: 'Retraction Rate', icon: '📉', path: '/dashboard/retraction', desc: 'False case and retraction analytics' },
  { id: 'nav-addfir', type: 'action', label: 'Register New FIR', icon: '➕', path: '/dashboard/addfir', desc: 'Open a new FIR registration form' },
  { id: 'nav-notifications', type: 'panel', label: 'Notifications', icon: '🔔', path: '/dashboard/notifications', desc: 'Alerts and case updates' },
  // Demo FIR cases
  { id: 'case-142', type: 'case', label: 'FIR KSP-2026-0142', icon: '🔴', path: '/dashboard/case/KSP-2026-0142', desc: 'Robbery · Malleshwaram · Under Investigation · PI Dharmendra' },
  { id: 'case-089', type: 'case', label: 'FIR KSP-2026-0089', icon: '🟡', path: '/dashboard/case/KSP-2026-0089', desc: 'Burglary · Brigade Road · Chargesheet · PI Maruti' },
  { id: 'case-201', type: 'case', label: 'FIR KSP-2026-0201', icon: '🟢', path: '/dashboard/case/KSP-2026-0201', desc: 'Assault · Mysuru North · Case Closed · PI Anjumala' },
  { id: 'case-156', type: 'case', label: 'FIR KSP-2026-0156', icon: '🔴', path: '/dashboard/case/KSP-2026-0156', desc: 'Theft · Mangaluru · Under Investigation · SI Ramesh' },
  // Demo persons
  { id: 'person-mohan', type: 'person', label: 'Mohan Kumar', icon: '🧑', path: '/dashboard/person/Mohan_Kumar', desc: 'Accused · FIR-0142, FIR-0330 · M G Road Snatchers' },
  { id: 'person-arun', type: 'person', label: 'Arun Nair', icon: '🧑', path: '/dashboard/person/Arun_Nair', desc: 'Accused at large · FIR-0142, FIR-0089 · High risk' },
  { id: 'person-kiran', type: 'person', label: 'Kiran Joseph', icon: '🧑', path: '/dashboard/person/Kiran_Joseph', desc: 'Accused · FIR-0142 · Bailable warrant' },
  // Officers
  { id: 'officer-dharmendra', type: 'officer', label: 'PI Dharmendra (KG1841136)', icon: '👮', path: '/dashboard/officers', desc: 'Inspector · Brigade Road PS · 3 active cases' },
  { id: 'officer-ramesh', type: 'officer', label: 'SI Ramesh (KG2241178)', icon: '👮', path: '/dashboard/officers', desc: 'Sub-Inspector · Malleshwaram PS · 2 active cases' },
];

const TYPE_COLOR = {
  panel: '#60a5fa',
  case: 'var(--color-red-soft)',
  person: '#a78bfa',
  officer: 'var(--color-green-alt)',
  action: '#facc15',
};

const TYPE_LABEL = {
  panel: 'Panel',
  case: 'Case',
  person: 'Person',
  officer: 'Officer',
  action: 'Action',
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Open on Cmd+K or Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelectedIdx(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  // Filter — static + dynamic FIR stub + server search stub
  const buildResults = () => {
    const q = query.trim().toLowerCase();
    const items = [];

    // Static matches
    if (q.length === 0) {
      items.push(...STATIC_ITEMS.slice(0, 8));
    } else {
      items.push(
        ...STATIC_ITEMS.filter(item =>
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
        ).slice(0, 10)
      );
    }

    // Case-scoped: digits → FIR shorthand (e.g. "142" → FIR KSP-2026-0142)
    if (/^\d{1,4}$/.test(q)) {
      const firId = q.padStart(4, '0');
      const firPath = `/dashboard/case/KSP-2026-${firId}`;
      items.unshift({
        id: `fir-${firId}`,
        type: 'case',
        label: `Open Case FIR ${firId}/2026`,
        icon: '📁',
        path: firPath,
        desc: `Navigate to FIR KSP-2026-${firId}`,
      });
    }

    // Server search stub: 3+ chars
    if (q.length >= 3) {
      items.push({
        id: 'server-search',
        type: 'action',
        label: `Search server for "${query.trim()}"`,
        icon: '🔍',
        path: `/server/search?q=${encodeURIComponent(query.trim())}`,
        desc: `Full-text server search (API stub — not yet live)`,
      });
    }

    return items.slice(0, 14);
  };

  const results = buildResults();

  // Keyboard nav
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectedIdx];
      if (item) { navigate(item.path); setOpen(false); }
    }
  }, [results, selectedIdx, navigate]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '640px', maxWidth: '95vw',
          background: 'var(--surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <span style={{ fontSize: '20px', opacity: 0.5 }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search cases, persons, officers, panels…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '16px', fontFamily: 'var(--font)',
            }}
          />
          <kbd style={{
            padding: '2px 8px', fontSize: '11px',
            background: 'var(--surface-alt)', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text-secondary)', fontFamily: 'monospace',
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No results for "{query}"
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {results.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.path); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: i === selectedIdx ? 'var(--surface-alt)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</span>
                      <span style={{
                        fontSize: '10px', padding: '1px 7px', borderRadius: '4px', fontWeight: 600,
                        background: `${TYPE_COLOR[item.type]}20`, color: TYPE_COLOR[item.type],
                      }}>{TYPE_LABEL[item.type]}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </p>
                  </div>
                  {i === selectedIdx && (
                    <kbd style={{
                      padding: '2px 8px', fontSize: '11px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '6px', color: 'var(--text-secondary)', fontFamily: 'monospace',
                    }}>↵</kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid var(--border-light)',
          display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)',
        }}>
          <span><kbd style={{ padding: '1px 5px', background: 'var(--surface-alt)', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ padding: '1px 5px', background: 'var(--surface-alt)', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>↵</kbd> open</span>
          <span><kbd style={{ padding: '1px 5px', background: 'var(--surface-alt)', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>Esc</kbd> close</span>
          <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600 }}>ZIA Command Palette</span>
        </div>
      </div>
    </div>
  );
}
