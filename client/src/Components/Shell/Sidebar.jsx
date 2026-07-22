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
  PiFolderOpen,
  PiGenderIntersex,
  PiGitBranch,
  PiGlobeHemisphereWest,
  PiHeartbeat,
  PiLightning,
  PiMagnifyingGlass,
  PiMapTrifold,
  PiMicrophone,
  PiShieldCheck,
  PiSquaresFour,
  PiTimer,
  PiUserFocus,
  PiUsersThree,
  PiX,
} from 'react-icons/pi';
import { useAuth } from '../../AuthContext';
import logo from '../../LoginAssets/logo.png';
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
      { to: 'veracity', icon: PiShieldCheck, label: 'FIR veracity' },
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
    id: 'admin',
    label: 'Public intelligence',
    collapsible: true,
    items: [{ to: 'deterrence', icon: PiGlobeHemisphereWest, label: 'Deterrence portal' }],
  },
];

function NavigationItems({ items, basePath, collapsed, onNavigate }) {
  return (
    <ul className="menuLists">
      {items.map(({ to, icon: Icon, label }) => (
        <li className="listItem" key={to}>
          <NavLink
            to={`${basePath}/${to}`}
            className={({ isActive }) => `menuLink${isActive ? ' active' : ''}`}
            title={collapsed ? label : undefined}
            onClick={onNavigate}
          >
            <Icon className="icon" weight="regular" aria-hidden="true" />
            {!collapsed && <span className="smallText">{label}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar({ basePath, sidebarOpen, setSidebarOpen, userRole, isCollapsed, setIsCollapsed }) {
  const sidebar = useRef(null);
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

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
          {!isCollapsed && <h2 className="divTitle">Workspace</h2>}
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
              <span className="divTitle">{section.label}</span>
              <PiCaretDown aria-hidden="true" />
            </summary>
            <NavigationItems items={section.items} basePath={basePath} collapsed={false} onNavigate={closeOnMobile} />
          </details>
        ) : (
          <section className="menuDiv" key={section.id}>
            {!isCollapsed && <h2 className="divTitle">{section.label}</h2>}
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
