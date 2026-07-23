import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { PiArrowUpRight, PiCaretRight, PiClock, PiShieldCheck, PiSiren, PiTimer } from 'react-icons/pi';
import DailyBrief from './MyDay/DailyBrief';
import AlertsFeed from './MyDay/AlertsFeed';
import { ACTIVE_CASE_FACTS } from './CaseWorkspace/caseFacts';
import PanelCard from './panels/PanelCard';
import PanelBadge from './panels/PanelBadge';
import './MyDay/myday.scss';

// ponytail: mock data for priority queue — replace with fetch(`${apiUrl}/my-day/queue`)
const PRIORITY_MOCK = [
  { firNo: ACTIVE_CASE_FACTS.firId, crimeType: ACTIVE_CASE_FACTS.crimeType, status: 'investigation', priority: 'critical', updatedAt: '02:15 AM', location: ACTIVE_CASE_FACTS.location },
  { firNo: 'KSP-2026-0234', crimeType: 'Theft', status: 'investigation', priority: 'high', updatedAt: '04:00 AM', location: 'Koramangala 1st Block' },
  { firNo: 'KSP-2026-0089', crimeType: 'Burglary', status: 'court', priority: 'medium', updatedAt: '03:00 AM', location: 'HSR Layout Sector 2' },
  { firNo: 'KSP-2026-0301', crimeType: 'Cyber Fraud', status: 'urgent', priority: 'critical', updatedAt: '05:10 AM', location: 'Whitefield Main Road' },
  { firNo: 'KSP-2026-0187', crimeType: 'Assault', status: 'investigation', priority: 'medium', updatedAt: '01:45 AM', location: 'Banashankari 2nd Stage' },
];

const STATUS_LABELS = { investigation: 'Investigation', court: 'In Court', closed: 'Closed', urgent: 'Urgent' };
const PRIORITY_BADGE = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };

function WelcomeWidget({ user, formattedDate }) {
  return (
    <div className="panel-shell myday-welcome">
      <div>
        <h1 className="myday-welcome__title">
          Investigator Workspace — {user?.name || 'KSP Officer'}
        </h1>
        <p className="panel-subtitle">
          Crime Genome Platform · {formattedDate}
        </p>
      </div>
      <div className="badge badge--clear myday-welcome__status">
        <span className="myday-welcome__dot" />
        Session Active · {user?.role || user?.rank || 'Officer'}
      </div>
    </div>
  );
}

WelcomeWidget.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    rank: PropTypes.string,
  }),
  formattedDate: PropTypes.string.isRequired,
};

const SUMMARY = [
  { label: 'Priority cases', value: '05', note: '+2 since yesterday', icon: PiSiren, tone: 'plum', to: '/dashboard/firdetails' },
  { label: 'Case readiness', value: `${ACTIVE_CASE_FACTS.readiness}%`, note: '3 CCTV tasks open', icon: PiShieldCheck, tone: 'peach', to: `/dashboard/case/${ACTIVE_CASE_FACTS.firId}` },
  { label: 'Filing window', value: `${ACTIVE_CASE_FACTS.filingDueDays}d`, note: 'Active case is not overdue', icon: PiTimer, tone: 'blue', to: '/dashboard/chargesheet-clock' },
];

export default function MyDayDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [briefState, setBriefState] = useState({ data: null, loading: true, error: false });
  const [alertsState, setAlertsState] = useState({ data: [], loading: true, error: false });

  const fetchBrief = () => {
    setBriefState(s => ({ ...s, loading: true, error: false }));
    // ponytail: demo data — replace with fetch(`${apiUrl}/my-day/brief`)
    setTimeout(() => {
      setBriefState({
        loading: false,
        error: false,
        data: {
          timestamp: 'COMPLETED OVERNIGHT RUN · 05:30 AM',
          message: `Good morning, Officer. ZIA has analysed the district active queue. \u200b**3 cases need attention today.**\u200b FIR \u200b**${ACTIVE_CASE_FACTS.firId}**\u200b is ${ACTIVE_CASE_FACTS.readiness}% ready. The SH-9 CCTV source is identified, but acquisition, hash verification, and the BSA Section 63 certificate remain pending. Kiran Joseph remains at large, and statutory filing is due in ${ACTIVE_CASE_FACTS.filingDueDays} days.`,
          tags: [
            { label: '3 CCTV tasks open', color: 'red' },
            { label: 'Filing due in 18 days', color: 'amber' },
          ],
        },
      });
    }, 400);
  };

  const fetchAlerts = () => {
    setAlertsState(s => ({ ...s, loading: true, error: false }));
    // ponytail: demo data — replace with fetch(`${apiUrl}/my-day/alerts`)
    setTimeout(() => {
      setAlertsState({
        loading: false,
        error: false,
        data: [
          { id: 1, type: 'match', title: 'CCTV acquisition pending', desc: `${ACTIVE_CASE_FACTS.firId} source identified; footage and hash not recorded`, time: '02:15 AM' },
          { id: 2, type: 'breach', title: 'Statutory filing approaching', desc: `${ACTIVE_CASE_FACTS.firId} is due in ${ACTIVE_CASE_FACTS.filingDueDays} days`, time: '03:00 AM' },
          { id: 3, type: 'new', title: 'At-large follow-up active', desc: 'Kiran Joseph remains at large', time: '04:10 AM' },
        ],
      });
    }, 500);
  };

  const openBriefAction = (action) => {
    const destinations = {
      explain: 'tab=brief&copilot=explain',
      evidence: 'tab=evidence&copilot=evidence_gaps',
      similar: 'tab=network&copilot=similar_cases',
      assign: 'tab=notes&copilot=next_lead',
      predict: 'tab=brief&copilot=outcome',
    };
    navigate(`/dashboard/case/${ACTIVE_CASE_FACTS.firId}?${destinations[action] || destinations.explain}`);
  };

  useEffect(() => {
    fetchBrief();
    fetchAlerts();
  }, []);

  return (
    <div className="myday">
      <WelcomeWidget user={user} formattedDate={formattedDate} />

      <div className="myday-summary" aria-label="Daily case summary">
        {SUMMARY.map(({ label, value, note, icon: Icon, tone, to }) => (
          <article className={`myday-stat myday-stat--${tone}`} key={label}>
            <div className="myday-stat__top">
              <span><Icon weight="bold" /> {label}</span>
              <button type="button" aria-label={`View ${label.toLowerCase()}`} onClick={() => navigate(to)}>
                <PiArrowUpRight aria-hidden="true" />
              </button>
            </div>
            <div className="myday-stat__value">{value}</div>
            <p>{note}</p>
          </article>
        ))}
      </div>

      <DailyBrief
        brief={briefState.data}
        loading={briefState.loading}
        error={briefState.error}
        onRetry={fetchBrief}
        onAction={openBriefAction}
      />

      <div className="myday-queue">
        <PanelCard
          title={`Priority Cases (${PRIORITY_MOCK.length})`}
          badge="Top 5"
        >
          <div className="myday-queue-list">
            {PRIORITY_MOCK.map((c, i) => (
              <button
                key={c.firNo}
                type="button"
                className="queue-item"
                onClick={() => navigate(`/dashboard/case/${c.firNo}`)}
                aria-label={`Open ${c.firNo}, ${c.crimeType}`}
              >
                <span className="queue-item-rank">{i + 1}</span>
                <div className="queue-item-main">
                  <div className="queue-item-top">
                    <span className="queue-item-fir">{c.firNo}</span>
                    <span className="queue-item-crime">{c.crimeType}</span>
                  </div>
                  <div className="queue-item-bottom">
                    <PanelBadge status={PRIORITY_BADGE[c.priority]} label={STATUS_LABELS[c.status]} />
                    <span className="queue-item-meta">
                      <PiClock size={12} /> {c.updatedAt} · {c.location}
                    </span>
                  </div>
                </div>
                <PiCaretRight className="queue-item-caret" aria-hidden="true" />
              </button>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="myday-grid">
        <div className="myday-sidebar myday-sidebar--full">
          <AlertsFeed alerts={alertsState.data} loading={alertsState.loading} />
        </div>
      </div>
    </div>
  );
}
