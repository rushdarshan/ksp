import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { FiClock } from 'react-icons/fi';
import DailyBrief from './MyDay/DailyBrief';
import AlertsFeed from './MyDay/AlertsFeed';
import PanelCard from './panels/PanelCard';
import PanelBadge from './panels/PanelBadge';
import './MyDay/myday.scss';

// ponytail: mock data for priority queue — replace with fetch(`${apiUrl}/my-day/queue`)
const PRIORITY_MOCK = [
  { firNo: 'KSP-2026-0142', crimeType: 'Robbery', status: 'investigation', priority: 'critical', updatedAt: '02:15 AM', location: 'Jayanagar 4th Block' },
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
          Investigator Workspace — {user?.name || 'SI Ramesh'}
        </h1>
        <p className="panel-subtitle">
          Crime Genome Platform · {formattedDate}
        </p>
      </div>
      <div className="badge badge--clear myday-welcome__status">
        <span className="myday-welcome__dot" />
        Session Active · {user?.role || 'Sub-Inspector'}
      </div>
    </div>
  );
}

function ShortcutsWidget() {
  return (
    <div className="panel-shell panel-shell--compact myday-shortcuts">
      <div className="myday-shortcuts__title">Keyboard Shortcuts</div>
      <div className="myday-shortcuts__list">
        <div className="myday-shortcuts__row">
          <span>Open Command Palette</span>
          <kbd className="myday-shortcuts__kbd">Ctrl+K</kbd>
        </div>
        <div className="myday-shortcuts__row">
          <span>Close active overlays</span>
          <kbd className="myday-shortcuts__kbd">Esc</kbd>
        </div>
      </div>
    </div>
  );
}

export default function MyDayDashboard() {
  const { user } = useAuth();

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
          message: "Good morning, Officer. ZIA has analyzed the district active queue. \u200b**3 cases need attention today.**\u200b FIR \u200b**KSP-2026-0142**\u200b has a critical development: the suspect's phone number was matched in 2 other active robbery cases. We recommend requesting immediate CDR logs and assigning a warrant officer to track \u0905\u0930\u0941\u0923 \u0928\u093e\u092f\u0930 (Arun Nair) who remains at large.",
          tags: [
            { label: '\ud83d\udea8 1 CRITICAL MATCH', color: 'red' },
            { label: '\u23f0 2 SLA BREACHES', color: 'amber' },
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
          { id: 1, type: 'match', title: 'Cross-Case Entity Match', desc: 'Phone 98450XXXXX matched in 2 other robberies', time: '02:15 AM' },
          { id: 2, type: 'breach', title: 'Chargesheet Deadline Approaching', desc: 'FIR KSP-2026-0089 expires in 6 days', time: '03:00 AM' },
          { id: 3, type: 'new', title: 'New Warrant Appended', desc: 'Arrest vector issued for Arun Nair', time: '04:10 AM' },
        ],
      });
    }, 500);
  };

  useEffect(() => {
    fetchBrief();
    fetchAlerts();
  }, []);

  return (
    <div className="myday">
      <WelcomeWidget user={user} formattedDate={formattedDate} />

      <DailyBrief
        brief={briefState.data}
        loading={briefState.loading}
        error={briefState.error}
        onRetry={fetchBrief}
      />

      <div className="myday-queue">
        <PanelCard
          title={`Priority Cases (${PRIORITY_MOCK.length})`}
          badge="Top 5"
        >
          <div className="myday-queue-list">
            {PRIORITY_MOCK.map((c, i) => (
              <div key={c.firNo} className="queue-item">
                <span className="queue-item-rank">{i + 1}</span>
                <div className="queue-item-main">
                  <div className="queue-item-top">
                    <span className="queue-item-fir">{c.firNo}</span>
                    <span className="queue-item-crime">{c.crimeType}</span>
                  </div>
                  <div className="queue-item-bottom">
                    <PanelBadge status={PRIORITY_BADGE[c.priority]} label={STATUS_LABELS[c.status]} />
                    <span className="queue-item-meta">
                      <FiClock size={11} /> {c.updatedAt} · {c.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <div className="myday-grid">
        <div className="myday-sidebar myday-sidebar--full">
          <AlertsFeed alerts={alertsState.data} loading={alertsState.loading} />
          <ShortcutsWidget />
        </div>
      </div>
    </div>
  );
}
