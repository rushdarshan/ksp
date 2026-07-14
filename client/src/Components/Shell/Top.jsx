import React from "react";
import "./top.scss";
import DropdownMenu from "../../ui/Dropdown/Dropdown";
import { IoMdMenu } from "react-icons/io";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const CRUMB_MAP = {
  'home': 'My Day',
  'firdetails': 'FIR Cases',
  'veracity': 'FIR Veracity',
  'chargesheet-clock': 'Chargesheet Clock',
  'accused-at-large': 'Accused at Large',
  'arrest-vector': 'Arrest Vector',
  'predictive': 'Predictive Intel',
  'beat-optimizer': 'Beat Optimizer',
  'gbv': 'Gender Violence',
  'victim-risk': 'Victim Risk',
  'retraction-rate': 'Retraction Rate',
  'co-accused': 'Crime Network',
  'location': 'Command Map',
  'officers': 'Officer Roster',
  'deterrence': 'Public Portal',
  'notifications': 'Notifications',
  'voice': 'ZIA Voice',
  'countercrime': 'Counter Crime',
  'fir-quality': 'FIR Quality',
  'fairness-audit': 'Fairness Audit',
  'agent': 'Agent',
  'case': 'Case',
};

const Top = ({ setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = CRUMB_MAP[seg] || seg;
    return { label, path };
  });

  return (
    <div className="topBar">
      <div className="topBar-left">
        <button
          className="topBar-menu"
          onClick={(e) => { e.stopPropagation(); setSidebarOpen(prev => !prev); }}
        >
          <IoMdMenu />
        </button>
        <nav className="topBar-breadcrumb">
          <Link to="/dashboard" className="topBar-crumb-link">Dashboard</Link>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb.path}>
              <span className="topBar-crumb-sep">/</span>
              {i === crumbs.length - 1 ? (
                <span className="topBar-crumb-current">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="topBar-crumb-link">{crumb.label}</Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
      <div className="topBar-right">
        <DropdownMenu />
      </div>
    </div>
  );
};

export default Top;
