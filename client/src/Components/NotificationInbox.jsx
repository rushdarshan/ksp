import { useEffect, useState } from 'react';
import { PiArrowLeft, PiArrowRight, PiBellRinging, PiCheckCircle, PiPhoneCall } from 'react-icons/pi';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

export default function NotificationInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [caseDetail, setCaseDetail] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/case_management/case-management/notifications`)
      .then((response) => response.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const viewCase = async (caseId) => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/case_management/case-management/notifications?caseId=${caseId}`);
      setCaseDetail(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="notificationLedger">
      <header className="ledgerIntro">
        <div className="ledgerIntroIcon"><PiBellRinging weight="duotone" /></div>
        <div>
          <span>Communication control</span>
          <h2>Victim-notified justice</h2>
          <p>Automated stage updates keep complainants informed without adding administrative work to active investigations.</p>
        </div>
        <div className="ledgerMetric"><strong>{notifications.length}</strong><span>Active records</span></div>
      </header>

      {error && <div className="ledgerError">Unable to load the ledger: {error}</div>}

      {loading ? (
        <div className="ledgerLoading"><span /><span /><span /></div>
      ) : !caseDetail ? (
        <div className="ledgerList">
          <div className="ledgerListHeader"><span>Case and current stage</span><span>Dispatches</span><span>Status</span><span /></div>
          {notifications.map((notification) => (
            <button className="ledgerRow" key={notification.caseId} onClick={() => viewCase(notification.caseId)}>
              <span className="ledgerCase"><strong>{notification.firNo}</strong><small>Case #{notification.caseId}</small></span>
              <span className="ledgerCount">{notification.notificationCount}</span>
              <span className={`ledgerStatus${notification.unread ? ' ledgerStatus--unread' : ''}`}>
                {notification.unread ? 'Action needed' : 'Delivered'}
              </span>
              <PiArrowRight aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <div className="ledgerDetail">
          <button className="ledgerBack" onClick={() => setCaseDetail(null)}><PiArrowLeft /> All notifications</button>
          <div className="ledgerDetailHeader">
            <div><span>Current case</span><h3>{caseDetail.firNo}</h3></div>
            <div><span>Stage</span><strong>{caseDetail.currentStage}</strong></div>
            <div><span>Last updated</span><strong>{new Date(caseDetail.lastUpdated).toLocaleDateString()}</strong></div>
          </div>
          <div className="ledgerTimeline">
            {(caseDetail.notifications || []).map((notification, index) => (
              <article key={`${notification.timestamp}-${index}`}>
                <span className="ledgerTimelineIcon"><PiCheckCircle weight="fill" /></span>
                <div><strong>{notification.message}</strong><time>{new Date(notification.timestamp).toLocaleString()}</time></div>
              </article>
            ))}
          </div>
          <aside className="ledgerChannel"><PiPhoneCall /><div><strong>Connected delivery channel</strong><span>SMS and WhatsApp dispatches follow the same audited case timeline.</span></div></aside>
        </div>
      )}
    </section>
  );
}
