import React from 'react';
import { PiBellSimpleRinging, PiWarningCircle } from 'react-icons/pi';

function AlertsFeedSkeleton() {
  const pulse = {
    background: 'var(--surface-alt)',
    borderRadius: '6px',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{ ...pulse, width: '140px', height: '15px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ ...pulse, width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ ...pulse, width: '80%', height: '13px' }} />
              <div style={{ ...pulse, width: '60%', height: '11px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsFeedEmpty() {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <PiWarningCircle size={24} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>No overnight alerts</div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7 }}>You're all caught up</div>
    </div>
  );
}

export function AlertsFeedSkeletonBlock() {
  return <AlertsFeedSkeleton />;
}

export default function AlertsFeed({ alerts, loading }) {
  if (loading) return <AlertsFeedSkeleton />;
  if (!alerts?.length) return <AlertsFeedEmpty />;

  const statusColor = { match: 'var(--color-blue-400)', breach: '#e0b23a', new: 'var(--color-green-alt)' };

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <h3 className="alerts-feed__title"><PiBellSimpleRinging /> Overnight alerts</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: statusColor[a.type] || 'var(--border)',
              marginTop: '5px', flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{a.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.time} · {a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
