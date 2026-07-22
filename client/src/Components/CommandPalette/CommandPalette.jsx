import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiBell,
  PiBrain,
  PiCrosshair,
  PiFilePlus,
  PiFolderOpen,
  PiGenderIntersex,
  PiGitBranch,
  PiGlobeHemisphereWest,
  PiHeartbeat,
  PiIdentificationCard,
  PiLightning,
  PiMagnifyingGlass,
  PiMapTrifold,
  PiMicrophone,
  PiShieldCheck,
  PiSquaresFour,
  PiTimer,
  PiUser,
  PiUserFocus,
  PiUsersThree,
} from 'react-icons/pi';
import './CommandPalette.scss';

const STATIC_ITEMS = [
  { id: 'nav-home', type: 'workspace', label: 'My day', icon: PiSquaresFour, path: '/dashboard/home', desc: 'Daily work queue and priority cases' },
  { id: 'nav-notifications', type: 'workspace', label: 'Notifications', icon: PiBell, path: '/dashboard/notifications', desc: 'Victim communications and case alerts' },
  { id: 'nav-fir', type: 'workspace', label: 'FIR cases', icon: PiFolderOpen, path: '/dashboard/firdetails', desc: 'Registered FIR case ledger' },
  { id: 'nav-case', type: 'case', label: 'Active workspace', icon: PiGitBranch, path: '/dashboard/case/KSP-2026-0142', desc: 'Open the active investigation workspace' },
  { id: 'nav-network', type: 'workspace', label: 'Crime network', icon: PiUsersThree, path: '/dashboard/co-accused', desc: 'Cross-case accused relationships' },
  { id: 'nav-voice', type: 'workspace', label: 'ZIA voice query', icon: PiMicrophone, path: '/dashboard/voice', desc: 'Query legal intelligence in natural language' },
  { id: 'nav-map', type: 'workspace', label: 'Command map', icon: PiMapTrifold, path: '/dashboard/location', desc: 'Live district hotspots and navigation' },
  { id: 'nav-officers', type: 'workspace', label: 'Officer roster', icon: PiIdentificationCard, path: '/dashboard/officers', desc: 'Personnel and assignment directory' },
  { id: 'nav-veracity', type: 'intelligence', label: 'FIR veracity', icon: PiShieldCheck, path: '/dashboard/veracity', desc: 'Narrative quality assessment' },
  { id: 'nav-chargesheet', type: 'intelligence', label: 'Chargesheet clock', icon: PiTimer, path: '/dashboard/chargesheet-clock', desc: 'Statutory deadline control' },
  { id: 'nav-accused', type: 'intelligence', label: 'Accused at large', icon: PiUserFocus, path: '/dashboard/accused-at-large', desc: 'Warrant and fugitive ledger' },
  { id: 'nav-arrest', type: 'intelligence', label: 'Arrest vector', icon: PiLightning, path: '/dashboard/arrest-vector', desc: 'Cross-district arrest intelligence' },
  { id: 'nav-predictive', type: 'intelligence', label: 'Predictive intelligence', icon: PiBrain, path: '/dashboard/predictive', desc: 'Pattern-led deployment signals' },
  { id: 'nav-beat', type: 'intelligence', label: 'Beat optimizer', icon: PiCrosshair, path: '/dashboard/beat-optimizer', desc: 'Patrol coverage planning' },
  { id: 'nav-gbv', type: 'intelligence', label: 'Gender violence', icon: PiGenderIntersex, path: '/dashboard/gbv', desc: 'Protection and response analytics' },
  { id: 'nav-victim', type: 'intelligence', label: 'Victim risk', icon: PiHeartbeat, path: '/dashboard/victim-risk', desc: 'Repeat harm prevention' },
  { id: 'nav-retraction', type: 'intelligence', label: 'Retraction rate', icon: PiGitBranch, path: '/dashboard/retraction-rate', desc: 'Investigation quality signals' },
  { id: 'nav-deterrence', type: 'public', label: 'Deterrence portal', icon: PiGlobeHemisphereWest, path: '/dashboard/deterrence', desc: 'Public crime intelligence' },
  { id: 'nav-addfir', type: 'action', label: 'Register new FIR', icon: PiFilePlus, path: '/dashboard/addfir', desc: 'Open a new FIR registration form' },
  { id: 'case-142', type: 'case', label: 'FIR KSP-2026-0142', icon: PiFolderOpen, path: '/dashboard/case/KSP-2026-0142', desc: 'Robbery, Brigade Road, under investigation' },
  { id: 'case-089', type: 'case', label: 'FIR KSP-2026-0089', icon: PiFolderOpen, path: '/dashboard/case/KSP-2026-0089', desc: 'Burglary, chargesheet review' },
  { id: 'person-mohan', type: 'person', label: 'Mohan Kumar', icon: PiUser, path: '/dashboard/person/Mohan_Kumar', desc: 'Accused linked to FIR-0142 and FIR-0330' },
  { id: 'person-arun', type: 'person', label: 'Arun Nair', icon: PiUser, path: '/dashboard/person/Arun_Nair', desc: 'Accused at large, high risk' },
];

const TYPE_LABELS = {
  workspace: 'Workspace',
  intelligence: 'Intelligence',
  case: 'Case',
  person: 'Person',
  action: 'Action',
  public: 'Public',
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
        setQuery('');
        setSelectedIndex(0);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery
      ? STATIC_ITEMS.filter((item) => `${item.label} ${item.desc}`.toLowerCase().includes(normalizedQuery))
      : STATIC_ITEMS.slice(0, 9);

    if (/^\d{1,4}$/.test(normalizedQuery)) {
      const firId = normalizedQuery.padStart(4, '0');
      matches.unshift({
        id: `fir-${firId}`,
        type: 'case',
        label: `Open FIR KSP-2026-${firId}`,
        icon: PiFolderOpen,
        path: `/dashboard/case/KSP-2026-${firId}`,
        desc: 'Open case directly by FIR number',
      });
    }

    return matches.slice(0, 12);
  }, [query]);

  useEffect(() => setSelectedIndex(0), [query]);

  const openItem = useCallback((item) => {
    if (!item) return;
    navigate(item.path);
    setOpen(false);
  }, [navigate]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      openItem(results[selectedIndex]);
    }
  }, [openItem, results, selectedIndex]);

  if (!open) return null;

  return (
    <div className="commandOverlay" onMouseDown={() => setOpen(false)}>
      <section
        className="commandPalette"
        role="dialog"
        aria-modal="true"
        aria-label="Search workspace"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <label className="commandSearch">
          <PiMagnifyingGlass aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, people, officers, or tools"
            aria-label="Search workspace"
          />
          <kbd>Esc</kbd>
        </label>

        <div className="commandResults" role="listbox" aria-label="Workspace results">
          {results.length ? results.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`commandResult${index === selectedIndex ? ' is-selected' : ''}`}
                onClick={() => openItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className={`commandResultIcon commandResultIcon--${item.type}`}><Icon aria-hidden="true" /></span>
                <span className="commandResultCopy">
                  <span className="commandResultTitle">
                    <strong>{item.label}</strong>
                    <small>{TYPE_LABELS[item.type]}</small>
                  </span>
                  <span>{item.desc}</span>
                </span>
                {index === selectedIndex && <kbd>Enter</kbd>}
              </button>
            );
          }) : (
            <div className="commandEmpty">
              <PiMagnifyingGlass aria-hidden="true" />
              <strong>No matching workspace item</strong>
              <span>Try a FIR number, person, or tool name.</span>
            </div>
          )}
        </div>

        <footer className="commandFooter">
          <span><kbd>Up/Down</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <strong>ZIA workspace search</strong>
        </footer>
      </section>
    </div>
  );
}
