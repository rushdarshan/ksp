import { useLocation } from 'react-router-dom';
import { PiBell, PiFunnel, PiList, PiMagnifyingGlass, PiSlidersHorizontal } from 'react-icons/pi';
import DropdownMenu from '../../ui/Dropdown/Dropdown';
import './top.scss';

const TITLES = {
  home: ['My day', 'Daily operational picture'],
  notifications: ['Notifications', 'Victim communication ledger'],
  firdetails: ['FIR cases', 'Case management ledger'],
  case: ['Active case', 'Investigation workspace'],
  'co-accused': ['Crime network', 'Cross-case relationships'],
  voice: ['ZIA voice', 'Ask the intelligence workspace'],
  location: ['Command map', 'Live district picture'],
  officers: ['Officer roster', 'People and assignments'],
  veracity: ['FIR veracity', 'Narrative quality assessment'],
  'chargesheet-clock': ['Chargesheet clock', 'Statutory deadline control'],
  'accused-at-large': ['Accused at large', 'Warrant and fugitive ledger'],
  predictive: ['Predictive intelligence', 'Pattern-led deployment signals'],
  'beat-optimizer': ['Beat optimizer', 'Patrol coverage planning'],
  gbv: ['Gender violence', 'Protection and response analytics'],
  'victim-risk': ['Victim risk', 'Repeat harm prevention'],
  'retraction-rate': ['Retraction rate', 'Investigation quality signals'],
  deterrence: ['Deterrence portal', 'Public crime intelligence'],
};

export default function Top({ setSidebarOpen }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const routeKey = segments[1] || 'home';
  const [title, subtitle] = TITLES[routeKey] || [routeKey.replace(/-/g, ' '), 'Karnataka State Police'];

  return (
    <header className="topBar">
      <div className="topBar-left">
        <button className="topBar-menu" onClick={() => setSidebarOpen((open) => !open)} aria-label="Open navigation">
          <PiList aria-hidden="true" />
        </button>
        <div className="topBar-title">
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </div>

      <div className="topBar-right">
        <button className="topBar-search" type="button" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
          <PiMagnifyingGlass aria-hidden="true" />
          <span>Search intelligence</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button className="topBar-icon" type="button" title="Filter current view" aria-label="Filter current view"><PiFunnel /></button>
        <button className="topBar-icon topBar-icon--desktop" type="button" title="View settings" aria-label="View settings"><PiSlidersHorizontal /></button>
        <button className="topBar-icon topBar-notification" type="button" title="Notifications" aria-label="Notifications"><PiBell /><span /></button>
        <DropdownMenu />
      </div>
    </header>
  );
}
