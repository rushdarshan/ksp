import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    const fetchAlerts = () => {
      fetch('/server/fir_api/alerts')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setAlerts(data.slice(0, 4));
          setLoadingAlerts(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingAlerts(false);
        });
    };

    const fetchNotifications = () => {
      fetch('/server/case_management/case-management/notifications')
        .then(res => res.ok ? res.json() : { notifications: [] })
        .then(data => {
          setNotifications((Array.isArray(data) ? data : data.notifications || []).slice(0, 4));
          setLoadingNotifs(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingNotifs(false);
        });
    };

    fetchAlerts();
    fetchNotifications();
    const alertInterval = setInterval(fetchAlerts, 5000);
    const notifInterval = setInterval(fetchNotifications, 15000);
    return () => {
      clearInterval(alertInterval);
      clearInterval(notifInterval);
    };
  }, []);

  const renderSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
      <div className="skeleton-bar" style={{ width: '40%' }}></div>
      <div className="skeleton-bar" style={{ width: '90%' }}></div>
      <div className="skeleton-bar" style={{ width: '70%' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Proactive Alerts Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-body)'
          }}>
            Proactive Alerts
          </h4>
          <span className="pulsing-dot" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-red-text)',
            boxShadow: '0 0 8px var(--pastel-red-text)',
            display: 'inline-block'
          }}></span>
        </div>

        {loadingAlerts ? (
          <>
            {renderSkeleton()}
            {renderSkeleton()}
          </>
        ) : alerts.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border)',
            borderRadius: '12px'
          }}>
            No active threat alerts
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--surface-alt)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)'
                  }}>
                    {alert.title}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: alert.severity === 'CRITICAL' ? 'var(--pastel-red)' : 'var(--pastel-amber)',
                    color: alert.severity === 'CRITICAL' ? 'var(--pastel-red-text)' : 'var(--pastel-amber-text)',
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {alert.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {new Date(alert.created_at || alert.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {alert.recommendation && (
                    <span style={{
                      fontSize: '10px',
                      color: 'var(--accent)',
                      fontWeight: 500,
                      cursor: 'help'
                    }} title={alert.recommendation}>
                      View Action
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Victim Notifications Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-body)'
          }}>
            Victim Notifications
          </h4>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-blue-text)',
            display: 'inline-block'
          }}></span>
        </div>

        {loadingNotifs ? (
          <>
            {renderSkeleton()}
            {renderSkeleton()}
          </>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border)',
            borderRadius: '12px'
          }}>
            No recent notification dispatches
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(notif => (
              <div
                key={notif.caseId}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {notif.firNo}
                  </span>
                  {notif.unread && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)'
                    }}></span>
                  )}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Stage: <strong style={{ color: 'var(--text)' }}>{notif.currentStage}</strong></span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--pastel-blue)',
                    color: 'var(--pastel-blue-text)',
                    fontFamily: 'var(--font-body)'
                  }}>
                    {notif.notificationCount} sent
                  </span>
                </div>
              </div>
            ))}
            <Link
              to="notifications"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--accent)',
                marginTop: '4px',
                textDecoration: 'none'
              }}
            >
              View Dispatch Ledger →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
