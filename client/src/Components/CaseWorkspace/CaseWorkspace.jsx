import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  PiArrowLeft, PiCalendar, PiClipboardText, PiFlask, PiGraph,
  PiNotePencil, PiRobot, PiScales, PiTarget
} from 'react-icons/pi';
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
import InvestigationCopilot from './InvestigationCopilot';
import InvestigationReportButton from './InvestigationReportButton';
import { CaseContext } from './caseContext';
import { ACTIVE_CASE_FACTS, getActiveCaseData } from './caseFacts';
import { buildCaseWorkspaceSearch, getRouteTab } from './caseWorkspaceRouting';
import './CaseWorkspace.scss';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const TABS = [
  { id: 'overview', label: 'Overview', icon: PiClipboardText },
  { id: 'brief', label: 'AI Brief', icon: PiRobot },
  { id: 'theory', label: 'Theory Board', icon: PiTarget },
  { id: 'evidence', label: 'Evidence', icon: PiFlask },
  { id: 'network', label: 'Entity Graph', icon: PiGraph },
  { id: 'timeline', label: 'Timeline', icon: PiCalendar },
  { id: 'notes', label: 'Notes', icon: PiNotePencil },
  { id: 'chargesheet', label: 'Chargesheet', icon: PiScales },
];

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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => getRouteTab(location.search));
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState({ from: null, to: null });

  const firId = caseId || 'KSP-2026-0142';
  const initialCopilotAction = new URLSearchParams(location.search).get('copilot');

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    navigate(`${location.pathname}${buildCaseWorkspaceSearch(location.search, tabId)}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    setActiveTab(getRouteTab(location.search));
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/fir_api/firs?year=2026`)
      .then(r => r.json())
      .then(data => {
        const firs = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const found = firs.find(f => f.FIRNo === firId || f.FirNo === firId);
        setCaseData(
          firId === ACTIVE_CASE_FACTS.firId
            ? getActiveCaseData(found)
            : found || { FIRNo: firId, UnitName: 'Brigade Road PS', DistrictName: 'Bengaluru', CrimeGroup_Name: 'Robbery', fir_stage: 'Under Investigation' },
        );
      })
      .catch(() => setCaseData(
        firId === ACTIVE_CASE_FACTS.firId
          ? getActiveCaseData()
          : { FIRNo: firId, UnitName: 'Brigade Road PS', DistrictName: 'Bengaluru', CrimeGroup_Name: 'Robbery', fir_stage: 'Under Investigation' },
      ))
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

          <div className="case-header-main">
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
                <>
                  <p className="case-meta">
                    {caseData.CrimeGroup_Name || 'Robbery'} · {caseData.UnitName} · {caseData.DistrictName}
                  </p>
                  {firId === ACTIVE_CASE_FACTS.firId && (
                    <dl className="case-facts" aria-label="Active case facts">
                      <div><dt>Incident</dt><dd>{ACTIVE_CASE_FACTS.incidentDateLabel}</dd></div>
                      <div><dt>Location</dt><dd>{ACTIVE_CASE_FACTS.location}</dd></div>
                      <div><dt>IO</dt><dd>{ACTIVE_CASE_FACTS.investigatingOfficer}</dd></div>
                      <div><dt>Filing</dt><dd>Due in {ACTIVE_CASE_FACTS.filingDueDays} days</dd></div>
                    </dl>
                  )}
                </>
              )}
            </div>

            <div className="case-header-actions">
              <CaseStrengthMeter firId={firId} />
              <InvestigationReportButton />
              <button className="case-back" onClick={() => navigate(-1)}><PiArrowLeft /> Back</button>
            </div>
          </div>
        </div>

        <div className="case-tabs">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`case-tab ${activeTab === tab.id ? 'case-tab--active' : ''}`}
            >
              <span className="case-tab-icon"><TabIcon /></span>
              <span>{tab.label}</span>
            </button>
            );
          })}
        </div>

        <InvestigationCopilot initialAction={initialCopilotAction} />

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
