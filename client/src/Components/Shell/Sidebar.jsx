import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  PiBell,
  PiBrain,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiChartLineDown,
  PiCrosshair,
  PiFaceMask,
  PiFolderOpen,
  PiGenderIntersex,
  PiGitBranch,
  PiGlobeHemisphereWest,
  PiHeartbeat,
  PiLightning,
  PiMagnifyingGlass,
  PiMapTrifold,
  PiMicrophone,
  PiScan,
  PiShieldCheck,
  PiSquaresFour,
  PiTextAa,
  PiTimer,
  PiUserFocus,
  PiUsersThree,
  PiX,
} from 'react-icons/pi';
import { useAuth } from '../../AuthContext';
import logo from '../../LoginAssets/logo.png';
import { useI18n } from '../../utils/i18n';
import './sidebar.scss';

const SECTIONS = [
  {
    id: 'my-work',
    label: 'My work',
    items: [{ to: 'notifications', icon: PiBell, label: 'Notifications' }],
  },
  {
    id: 'investigate',
    label: 'Investigate',
    items: [
      { to: 'firdetails', icon: PiFolderOpen, label: 'FIR cases' },
      { to: 'case/KSP-2026-0142', icon: PiGitBranch, label: 'Active workspace' },
      { to: 'co-accused', icon: PiUsersThree, label: 'Crime network' },
      { to: 'voice', icon: PiMicrophone, label: 'ZIA voice query' },
      { to: 'face-analytics', icon: PiFaceMask, label: 'Face analytics' },
      { to: 'text-analytics', icon: PiTextAa, label: 'Text analytics' },
      { to: 'object-recognition', icon: PiScan, label: 'Object recognition' },
    ],
  },
  {
    id: 'command',
    label: 'Command & staff',
    items: [
      { to: 'location', icon: PiMapTrifold, label: 'Command map' },
      { to: 'officers', icon: PiUsersThree, label: 'Officer roster' },
    ],
  },
  {
    id: 'insights',
    label: 'Intelligence',
    collapsible: true,
    items: [
      { to: 'veracity', icon: PiShieldCheck, label: 'Narrative quality' },
      { to: 'chargesheet-clock', icon: PiTimer, label: 'Chargesheet clock' },
      { to: 'accused-at-large', icon: PiUserFocus, label: 'Accused at large' },
      { to: 'arrest-vector', icon: PiLightning, label: 'Arrest vector' },
      { to: 'predictive', icon: PiBrain, label: 'Predictive intel' },
      { to: 'beat-optimizer', icon: PiCrosshair, label: 'Beat optimizer' },
      { to: 'gbv', icon: PiGenderIntersex, label: 'Gender violence' },
      { to: 'victim-risk', icon: PiHeartbeat, label: 'Victim risk' },
      { to: 'retraction-rate', icon: PiChartLineDown, label: 'Retraction rate' },
    ],
  },
  {
    id: 'demo-hub',
    label: 'Demo',
    collapsible: false,
    items: [{ to: '/demo', icon: PiLightning, label: 'Demo pipeline' }],
  },
  {
    id: 'admin',
    label: 'Public intelligence',
    collapsible: true,
    items: [{ to: 'deterrence', icon: PiGlobeHemisphereWest, label: 'Deterrence portal' }],
  },
];

const routeToKey = (to) => {
  if (to === 'home') return 'home';
  if (to === 'notifications') return 'notifications';
  if (to === 'firdetails') return 'cases';
  if (to.startsWith('case/')) return 'cases';
  if (to === 'co-accused') return 'coAccused';
  if (to === 'voice') return 'voice';
  if (to === 'face-analytics') return 'faceAnalytics';
  if (to === 'location') return 'map';
  if (to === 'officers') return 'officers';
  if (to === 'veracity') return 'veracity';
  if (to === 'chargesheet-clock') return 'chargesheetClock';
  if (to === 'accused-at-large') return 'accusedLarge';
  if (to === 'arrest-vector') return 'arrestVector';
  if (to === 'predictive') return 'predictive';
  if (to === 'beat-optimizer') return 'beatOpt';
  if (to === 'gbv') return 'gbv';
  if (to === 'victim-risk') return 'victimRisk';
  if (to === 'retraction-rate') return 'retraction';
  if (to === 'deterrence') return 'deterrence';
  if (to === 'text-analytics') return 'textAnalytics';
  if (to === 'object-recognition') return 'objectRecognition';
  return to;
};

function NavigationItems({ items, basePath, collapsed, onNavigate }) {
  const { t } = useI18n();
  return (
    <ul className="menuLists">
      {items.map(({ to, icon: Icon, label }) => {
        const i18nKey = routeToKey(to);
        const translatedLabel = t(i18nKey) !== i18nKey ? t(i18nKey) : label;
        return (
          <li className="listItem" key={to}>
            <NavLink
              to={to.startsWith('/') ? to : `${basePath}/${to}`}
              className={({ isActive }) => `menuLink${isActive ? ' active' : ''}`}
              title={collapsed ? translatedLabel : undefined}
              onClick={onNavigate}
            >
              <Icon className="icon" weight="regular" aria-hidden="true" />
              {!collapsed && <span className="smallText">{translatedLabel}</span>}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar({ basePath, sidebarOpen, setSidebarOpen, userRole, isCollapsed, setIsCollapsed }) {
  const sidebar = useRef(null);
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { t } = useI18n();

  const sectionIdToKey = (id) => {
    if (id === 'my-work') return 'myWork';
    if (id === 'investigate') return 'investigate';
    if (id === 'command') return 'commandStaff';
    if (id === 'insights') return 'intelligence';
    if (id === 'admin') return 'publicIntel';
    return id;
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        setSidebarOpen(true);
        setIsCollapsed(false);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setIsCollapsed, setSidebarOpen]);

  const query = search.trim().toLowerCase();
  const filteredSections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !query || item.label.toLowerCase().includes(query)),
  })).filter((section) => section.items.length);

  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 1050px)').matches) setSidebarOpen(false);
  };

  return (
    <aside
      className={`sideBar${sidebarOpen ? ' open' : ''}${isCollapsed ? ' sideBar--collapsed' : ''}`}
      ref={sidebar}
      aria-label="Primary navigation"
    >
      <div className="logoDiv">
        <div className="brandMark"><img src={logo} alt="" /></div>
        {!isCollapsed && (
          <div className="brandCopy">
            <strong>KSP Genome</strong>
            <span>Investigation OS</span>
          </div>
        )}
        <button className="menu_close_btn" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
          <PiX aria-hidden="true" />
        </button>
      </div>

      {!isCollapsed ? (
        <label className="searchDiv">
          <PiMagnifyingGlass className="searchIcon" aria-hidden="true" />
          <input
            ref={searchRef}
            className="searchInput"
            type="search"
            placeholder="Search workspace"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>/</kbd>
        </label>
      ) : (
        <button className="sidebarIconButton" onClick={() => setIsCollapsed(false)} aria-label="Open navigation search">
          <PiMagnifyingGlass aria-hidden="true" />
        </button>
      )}

      <nav className="sidebarNav">
        <section className="menuDiv">
          {!isCollapsed && <h2 className="divTitle">{t('workspace')}</h2>}
          <NavigationItems
            items={[{ to: 'home', icon: PiSquaresFour, label: 'My day' }]}
            basePath={basePath}
            collapsed={isCollapsed}
            onNavigate={closeOnMobile}
          />
        </section>

        {filteredSections.map((section) => section.collapsible && !isCollapsed ? (
          <details className="menuDiv sidebar-section" key={section.id} open={section.id === 'insights'}>
            <summary className="sidebar-section-header">
              <span className="divTitle">{t(sectionIdToKey(section.id))}</span>
              <PiCaretDown aria-hidden="true" />
            </summary>
            <NavigationItems items={section.items} basePath={basePath} collapsed={false} onNavigate={closeOnMobile} />
          </details>
        ) : (
          <section className="menuDiv" key={section.id}>
            {!isCollapsed && <h2 className="divTitle">{t(sectionIdToKey(section.id))}</h2>}
            <NavigationItems items={section.items} basePath={basePath} collapsed={isCollapsed} onNavigate={closeOnMobile} />
          </section>
        ))}
      </nav>

      <div className="sidebarProfile">
        <div className="sidebarAvatar">{user?.name?.charAt(0).toUpperCase() || 'K'}</div>
        {!isCollapsed && (
          <div className="sidebarProfileCopy">
            <strong>{user?.name || 'KSP Officer'}</strong>
            <span>{userRole || user?.rank || 'On duty'}</span>
          </div>
        )}
        <button
          className="sidebarCollapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <PiCaretRight /> : <PiCaretLeft />}
        </button>
      </div>
    </aside>
  );
}
