import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PiArrowRight, PiBellRinging, PiShieldWarning } from 'react-icons/pi';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const LoadingBlock = () => (
  <div className="railSkeleton" aria-hidden="true">
    <span /><span /><span />
  </div>
);

export default function RightSidebar() {
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const workspaceBase = `/${location.pathname.split('/').filter(Boolean)[0] || 'dashboard'}`;

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${apiUrl}/fir_api/alerts`).then((response) => response.ok ? response.json() : []),
      fetch(`${apiUrl}/case_management/case-management/notifications`).then((response) => response.ok ? response.json() : { notifications: [] }),
    ]).then(([alertData, notificationData]) => {
      if (!active) return;
      setAlerts((Array.isArray(alertData) ? alertData : []).slice(0, 3));
      setNotifications((Array.isArray(notificationData) ? notificationData : notificationData.notifications || []).slice(0, 3));
    }).catch(() => {}).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <aside className="insightRail" aria-label="Operational updates">
      <div className="railHeader">
        <div>
          <span>Live desk</span>
          <h2>Operational pulse</h2>
        </div>
        <div className="railLive"><span /> Live</div>
      </div>

      <section className="railSection">
        <div className="railSectionTitle"><PiShieldWarning weight="fill" /><h3>Proactive alerts</h3><span>{alerts.length}</span></div>
        {loading ? <><LoadingBlock /><LoadingBlock /></> : alerts.length ? alerts.map((alert) => (
          <article className="railItem" key={alert.id}>
            <div className="railItemTop">
              <strong>{alert.title}</strong>
              <span className={`railSeverity railSeverity--${String(alert.severity || 'watch').toLowerCase()}`}>{alert.severity || 'Watch'}</span>
            </div>
            <p>{alert.description}</p>
            <time>{new Date(alert.created_at || alert.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          </article>
        )) : <div className="railEmpty">No active threat alerts</div>}
      </section>

      <section className="railSection">
        <div className="railSectionTitle"><PiBellRinging weight="fill" /><h3>Victim notifications</h3><span>{notifications.length}</span></div>
        {loading ? <LoadingBlock /> : notifications.length ? notifications.map((notification) => (
          <article className="railItem railItem--notification" key={notification.caseId}>
            <div className="railItemTop"><strong>{notification.firNo}</strong>{notification.unread && <i />}</div>
            <p>Stage: <b>{notification.currentStage}</b></p>
            <time>{notification.notificationCount} dispatches</time>
          </article>
        )) : <div className="railEmpty">No recent dispatches</div>}
        <Link className="railLink" to={`${workspaceBase}/notifications`}>Open dispatch ledger <PiArrowRight /></Link>
      </section>
    </aside>
  );
}
