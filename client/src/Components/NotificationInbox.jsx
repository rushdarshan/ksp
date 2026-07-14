import React, { useState, useEffect } from 'react';

const NotificationInbox = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);
    const [caseDetail, setCaseDetail] = useState(null);

    useEffect(() => {
        fetch('/server/case_management/case-management/notifications')
            .then(r => r.json())
            .then(d => { setNotifications(d.notifications); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    const viewCase = async (caseId) => {
        setSelectedCase(caseId);
        try {
            const res = await fetch(`/server/case_management/case-management/notifications?caseId=${caseId}`);
            setCaseDetail(await res.json());
        } catch (err) { setError(err.message); }
    };

    return (
        <div className="panel" style={{ padding: '20px', maxWidth: '900px' }}>
            <h2>Victim-Notified Justice</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Automated case stage notifications. Every time a case transitions stage, complainants are notified — no per-case police effort required.
            </p>
            {error && <div style={{ color: 'var(--color-red)', marginBottom: '16px' }}>Error: {error}</div>}
            {loading && <div style={{ color: '#666' }}>Loading...</div>}
            {!loading && !selectedCase && (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {notifications.map(n => (
                        <div key={n.caseId} onClick={() => viewCase(n.caseId)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viewCase(n.caseId); } }} role="button" tabIndex={0}
                            style={{ padding: '16px', background: n.unread ? '#f0f7ff' : 'var(--color-surface-50)', borderRadius: '10px', border: `1px solid ${n.unread ? '#93c5fd' : 'var(--color-border-200)'}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{n.firNo}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Stage: {n.currentStage} · {n.notificationCount} notifications</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {n.unread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d6efd' }} />}
                                <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {caseDetail && (
                <div>
                    <button onClick={() => { setSelectedCase(null); setCaseDetail(null); }}
                        style={{ padding: '6px 14px', background: 'var(--color-border-200)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', marginBottom: '16px' }}>
                        ← Back to all notifications
                    </button>
                    <div style={{ padding: '20px', background: 'var(--color-surface-50)', borderRadius: '10px', border: '1px solid var(--color-border-200)' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{caseDetail.firNo}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
                            Current Stage: <strong>{caseDetail.currentStage}</strong> · Last Updated: {new Date(caseDetail.lastUpdated).toLocaleDateString()}
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Notification History</h3>
                        {caseDetail.notifications.map((notif, i) => (
                            <div key={i} style={{ padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--color-border-200)' }}>
                                <div style={{ fontSize: '13px', fontWeight: 500 }}>{notif.message}</div>
                                <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '4px' }}>{new Date(notif.timestamp).toLocaleString()}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: '16px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-amber)' }}>📱 Production Path</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                                Integrate with SMS gateway or WhatsApp Business API. This inbox is the demo interface — same data model.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationInbox;
