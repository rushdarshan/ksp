import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import CrimeGenomePanel from '../FirDetails/CrimeGenomePanel';
import CoAccusedNetworkPanel from '../CoAccusedNetworkPanel';
import EntityGraphPanel from './EntityGraphPanel';
import MemoryNotSearch from './MemoryNotSearch';
import CaseStrengthMeter from './CaseStrengthMeter';
import CaseOverview from './CaseOverview';
import CaseTimeline from './CaseTimeline';
import AIIntelligenceBrief from './AIIntelligenceBrief';
import TheoryBoard from './TheoryBoard';
import EvidenceReview from './EvidenceReview';
import CaseNotes from './CaseNotes';
import ChargesheetIntelligence from './ChargesheetIntelligence';
import './CaseWorkspace.scss';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

export const CaseContext = createContext(null);
export const useCaseContext = () => useContext(CaseContext);

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'brief', label: 'AI Brief', icon: '🤖' },
  { id: 'theory', label: 'Theory Board', icon: '🎯' },
  { id: 'evidence', label: 'Evidence', icon: '🔬' },
  { id: 'network', label: 'Entity Graph', icon: '🕸️' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'chargesheet', label: 'Chargesheet', icon: '⚖️' },
];

function getHashTab() {
  const hash = window.location.hash.replace('#', '');
  return TABS.some(t => t.id === hash) ? hash : 'overview';
}

function statusClass(stage) {
  if (!stage) return 'case-status case-status--investigation';
  const s = stage.toLowerCase();
  if (s.includes('charge')) return 'case-status case-status--chargesheet';
  if (s.includes('closed')) return 'case-status case-status--closed';
  return 'case-status case-status--investigation';
}

export default function CaseWorkspace() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(getHashTab);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState({ from: null, to: null });

  const firId = caseId || 'KSP-2026-0142';

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(getHashTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/fir_api/firs?year=2026`)
      .then(r => r.json())
      .then(data => {
        const firs = Array.isArray(data) ? data : [];
        const found = firs.find(f => f.FIRNo === firId || f.FirNo === firId);
        setCaseData(found || { FIRNo: firId, UnitName: 'Brigade Road PS', DistrictName: 'Bengaluru', CrimeGroup_Name: 'robbery', fir_stage: 'Under Investigation' });
      })
      .catch(() => setCaseData({ FIRNo: firId, UnitName: 'Brigade Road PS', DistrictName: 'Bengaluru', CrimeGroup_Name: 'Robbery', fir_stage: 'Under Investigation' }))
      .finally(() => setLoading(false));
  }, [firId]);

  const contextValue = {
    firId, caseData, loading, error,
    timeRange, setTimeRange,
    switchTab, activeTab,
  };

  if (error) {
    return (
      <div className="case-error">
        <div className="case-error-title">Failed to load case</div>
        <div className="case-error-msg">{error}</div>
        <button className="case-back" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  return (
    <CaseContext.Provider value={contextValue}>
      <div className="case-workspace">
        <div className="case-header">
          <div className="case-breadcrumb">
            <Link to="/dashboard/firdetails">Cases</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{firId}</span>
          </div>

          <div className="case-info">
            <div className="case-title-row">
              <h1 className="case-title">Case {firId}</h1>
              {caseData && (
                <span className={statusClass(caseData.fir_stage)}>
                  {caseData.fir_stage || 'Under Investigation'}
                </span>
              )}
            </div>
            {caseData && (
              <p className="case-meta">
                {caseData.CrimeGroup_Name || 'Robbery'} · {caseData.UnitName} · {caseData.DistrictName}
              </p>
            )}
          </div>

          <CaseStrengthMeter firId={firId} />
          <button className="case-back" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="case-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`case-tab ${activeTab === tab.id ? 'case-tab--active' : ''}`}
            >
              <span className="case-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="case-content">
          {loading ? (
            <div className="case-loading">Loading case data…</div>
          ) : (
            <div key={activeTab} className="page-enter stagger">
              {activeTab === 'overview' && <CaseOverview />}
              {activeTab === 'brief' && <AIIntelligenceBrief />}
              {activeTab === 'theory' && <TheoryBoard firId={firId} />}
              {activeTab === 'evidence' && <EvidenceReview />}
              {activeTab === 'network' && (
                <div className="case-network-grid">
                  <EntityGraphPanel firId={firId} />
                  <MemoryNotSearch firId={firId} />
                </div>
              )}
              {activeTab === 'timeline' && <CaseTimeline />}
              {activeTab === 'notes' && <CaseNotes />}
              {activeTab === 'chargesheet' && <ChargesheetIntelligence />}
            </div>
          )}
        </div>
      </div>
    </CaseContext.Provider>
  );
}
