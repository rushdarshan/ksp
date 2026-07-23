import { useLocation, useNavigate } from 'react-router-dom';
import { PiBell, PiList, PiMagnifyingGlass } from 'react-icons/pi';
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
  veracity: ['Narrative quality', 'Documentation completeness review'],
  'chargesheet-clock': ['Chargesheet clock', 'Statutory deadline control'],
  'accused-at-large': ['Accused at large', 'Warrant and fugitive ledger'],
  'arrest-vector': ['Arrest vector', 'Cross-district arrest intelligence'],
  predictive: ['Predictive intelligence', 'Pattern-led planning signals'],
  'beat-optimizer': ['Beat optimizer', 'Patrol coverage planning'],
  gbv: ['Gender violence', 'Protection and response analytics'],
  'victim-risk': ['Victim risk', 'Repeat harm prevention'],
  'retraction-rate': ['Retraction rate', 'Investigation quality signals'],
  deterrence: ['Deterrence portal', 'Public crime intelligence'],
};

export default function Top({ setSidebarOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
        <button className="topBar-search" type="button" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
          <PiMagnifyingGlass aria-hidden="true" />
          <span>Search intelligence</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button
          className="topBar-icon topBar-notification"
          type="button"
          title="Open notifications"
          aria-label="Open notifications"
          onClick={() => navigate('/dashboard/notifications')}
        >
          <PiBell />
          <span />
        </button>
        <DropdownMenu />
      </div>
    </header>
  );
}
