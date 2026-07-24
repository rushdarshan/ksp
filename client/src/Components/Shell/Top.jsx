import { useLocation, useNavigate } from 'react-router-dom';
import { PiBell, PiList, PiMagnifyingGlass } from 'react-icons/pi';
import DropdownMenu from '../../ui/Dropdown/Dropdown';
import { useI18n } from '../../utils/i18n';
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
  const { lang, toggleLang, persona, togglePersona, t } = useI18n();
  const [engTitle, subtitle] = TITLES[routeKey] || [routeKey.replace(/-/g, ' '), 'Karnataka State Police'];
  
  // Try translating routeKey if defined in i18n
  const translatedTitle = t(routeKey);
  const title = translatedTitle !== routeKey ? translatedTitle : engTitle;

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

        {/* Language selector toggle */}
        <button 
          onClick={toggleLang}
          title={t('switchLang')}
          style={{
            fontSize: '13px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-light)',
            background: 'var(--surface-alt)',
            color: 'var(--text)',
            cursor: 'pointer',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
        >
          {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        {/* Persona toggle */}
        <button 
          onClick={togglePersona}
          title={persona === 'desktop' ? t('personaField') : t('personaDemo')}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-light)',
            background: persona === 'phone' ? 'var(--color-blue-400)' : 'var(--surface-alt)',
            color: persona === 'phone' ? '#fff' : 'var(--text)',
            cursor: 'pointer',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (persona !== 'phone') e.currentTarget.style.background = 'var(--border-light)';
          }}
          onMouseLeave={(e) => {
            if (persona !== 'phone') e.currentTarget.style.background = 'var(--surface-alt)';
          }}
        >
          {persona === 'desktop' ? 'Desktop' : '2AM Phone'}
        </button>

        <DropdownMenu />
      </div>
    </header>
  );
}
