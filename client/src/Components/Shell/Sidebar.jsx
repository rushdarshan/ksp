import React, { useEffect, useRef, useState } from 'react'
import './sidebar.scss'

import logo from '../../LoginAssets/logo.png'

import { IoMdSpeedometer } from "react-icons/io";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { PiTrendUp } from "react-icons/pi";
import { GrUserPolice } from "react-icons/gr";
import { BsQuestionCircle, BsSearch } from "react-icons/bs";
import { FaWpforms } from "react-icons/fa";
import { RiShieldCheckLine } from "react-icons/ri";
import { TbGraphFilled } from "react-icons/tb";
import { FaShieldHeart } from "react-icons/fa6";
import { MdFemale } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaBrain } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useAuth } from '../../AuthContext';

const SECTIONS = [
  {
    id: 'my-work',
    label: 'My Work',
    items: [
      { to: 'notifications', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: 'Notifications' }
    ]
  },
  {
    id: 'investigate',
    label: 'Investigate',
    items: [
      { to: 'firdetails', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, label: 'Cases (FIR List)' },
      { to: 'case/KSP-2026-0142', icon: <span className="icon" style={{ fontSize: '13px', lineHeight: 1 }}>🧬</span>, label: 'Active Case Workspace' },
      { to: 'co-accused', icon: <TbGraphFilled className="icon" />, label: 'Crime Network' },
      { to: 'voice', icon: <BsQuestionCircle className="icon" />, label: 'ZIA Voice Query' }
    ]
  },
  {
    id: 'command',
    label: 'Command & Staff',
    items: [
      { to: 'location', icon: <FaLocationCrosshairs className="icon" />, label: 'Command Map' },
      { to: 'officers', icon: <GrUserPolice className="icon" />, label: 'Officer Roster' }
    ]
  },
  {
    id: 'insights',
    label: 'Analytical Catalog',
    items: [
      { to: 'veracity', icon: <RiShieldCheckLine className="icon" />, label: 'FIR Veracity' },
      { to: 'chargesheet-clock', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Chargesheet Clock' },
      { to: 'accused-at-large', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Accused at Large' },
      { to: 'arrest-vector', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, label: 'Arrest Vector' },
      { to: 'predictive', icon: <FaBrain className="icon" />, label: 'Predictive Intel' },
      { to: 'beat-optimizer', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, label: 'Beat Optimizer' },
      { to: 'gbv', icon: <MdFemale className="icon" />, label: 'Gender Violence' },
      { to: 'victim-risk', icon: <FaShieldHeart className="icon" />, label: 'Victim Risk' },
      { to: 'retraction-rate', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: 'Retraction Rate' }
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { to: 'deterrence', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Public Portal' }
    ]
  }
];

const Sidebar = ({ basePath, sidebarOpen, setSidebarOpen, userRole, isCollapsed, setIsCollapsed }) => {
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || !sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
      if (e.key === '/' && !sidebarOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSidebarOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  const linkClass = ({ isActive }) =>
    isActive ? "active menuLink flex" : "menuLink flex";

  const filteredSections = SECTIONS.reduce((acc, s) => {
    const items = s.items.filter(i => !search.trim() || i.label.toLowerCase().includes(search.toLowerCase()));
    if (items.length) acc.push({ ...s, items });
    return acc;
  }, []);  const quickMenuItems = [
    { to: `${basePath}/home`, icon: <IoMdSpeedometer className="icon" />, label: 'My Day' },
  ];

  return (
    <div 
      className={`sideBar grid ${sidebarOpen ? "open" : ""}`} 
      ref={sidebar}
      style={{ 
        width: isCollapsed ? '76px' : '240px',
        minWidth: isCollapsed ? '76px' : '240px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s var(--easing), min-width 0.2s var(--easing)',
        overflowX: 'hidden'
      }}
    >
      {/* Logo Div */}
      <div className="logoDiv flex" style={{ padding: '24px 20px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <img src={logo} alt="KSP" style={{ width: '28px', height: '28px' }} />
        {!isCollapsed && <h2 style={{ marginLeft: '10px' }}>KSP</h2>}
        <div className="menu_close_wrapper">
          <button className='menu_close_btn'
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(prev => !prev); }}
            ref={trigger}
          >
            <BiLeftArrowAlt/>
          </button>
        </div>
      </div>

      {/* Search Div */}
      {!isCollapsed ? (
        <div className="searchDiv" style={{ padding: '0 20px 16px' }}>
          <BsSearch className="searchIcon" style={{ left: '32px' }} />
          <input
            type="text"
            placeholder="Search... ( / )"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="searchInput"
            ref={searchRef}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '16px', color: 'var(--text-secondary)' }}>
          <BsSearch style={{ cursor: 'pointer' }} onClick={() => setIsCollapsed(false)} />
        </div>
      )}

      {/* Quick Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="menuDiv" style={{ padding: '0 12px' }}>
          {!isCollapsed && <h3 className="divTitle">Home</h3>}
          <ul className="menuLists grid" style={{ gap: '4px' }}>
            {quickMenuItems.map(item => (
              <li className="listItem" key={item.to}>
                <NavLink 
                  to={item.to} 
                  className={linkClass}
                  style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: '10px' }}
                  title={isCollapsed ? item.label : ""}
                >
                  {item.icon}
                  {!isCollapsed && <span className="smallText" style={{ marginLeft: '8px' }}>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Sections */}
        {filteredSections.map(section => {
          const isCollapsible = section.id === 'insights' || section.id === 'admin';

          if (isCollapsible && !isCollapsed) {
            return (
              <details className="menuDiv sidebar-section" key={section.id} style={{ padding: '0 12px', marginTop: '16px' }}>
                <summary className="sidebar-section-header">
                  <h3 className="divTitle" style={{ margin: 0, fontSize: '11px' }}>{section.label}</h3>
                </summary>
                <ul className="menuLists grid" style={{ gap: '4px', marginTop: '4px' }}>
                  {section.items.map(item => (
                    <li className="listItem" key={item.to}>
                      <NavLink 
                        to={item.to} 
                        className={linkClass}
                        style={{ justifyContent: 'flex-start', padding: '10px' }}
                      >
                        {item.icon}
                        <span className="smallText" style={{ marginLeft: '8px' }}>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </details>
            );
          }

          return (
            <div className="menuDiv" key={section.id} style={{ padding: '0 12px', marginTop: '16px' }}>
              {!isCollapsed && <h3 className="divTitle">{section.label}</h3>}
              <ul className="menuLists grid" style={{ gap: '4px', marginTop: '0' }}>
                {section.items.map(item => (
                  <li className="listItem" key={item.to}>
                    <NavLink 
                      to={item.to} 
                      className={linkClass}
                      style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: '10px' }}
                      title={isCollapsed ? item.label : ""}
                    >
                      {item.icon}
                      {!isCollapsed && <span className="smallText" style={{ marginLeft: '8px' }}>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* User profile pinned at the bottom */}
      {/* User profile pinned at the bottom */}
      <div style={{ 
        padding: isCollapsed ? '16px 8px' : '20px 24px', 
        borderTop: '1px solid var(--border-light)', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCollapsed ? 'center' : 'flex-start',
        gap: '16px',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--surface-alt)',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'KSP Officer'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {userRole || 'On Duty'}
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-body)'
          }}
          onMouseEnter={e => { e.target.style.backgroundColor = 'var(--bg)'; e.target.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
