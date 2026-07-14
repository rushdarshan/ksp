import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

function CaseCardSkeleton() {
  const pulse = {
    background: 'var(--surface-alt)',
    borderRadius: '6px',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ ...pulse, width: '120px', height: '16px' }} />
          <div style={{ ...pulse, width: '200px', height: '12px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...pulse, width: '50px', height: '14px' }} />
          <div style={{ ...pulse, width: 28, height: 28, borderRadius: '50%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ ...pulse, width: '80px', height: '22px', borderRadius: '6px' }} />
        <div style={{ ...pulse, width: '100px', height: '22px', borderRadius: '6px' }} />
        <div style={{ ...pulse, width: '70px', height: '22px', borderRadius: '6px' }} />
      </div>
      <div style={{ ...pulse, width: '100%', height: '48px', borderRadius: '8px' }} />
      <div style={{ ...pulse, width: '80%', height: '14px', paddingTop: '8px', borderTop: 'none' }} />
    </div>
  );
}

export function CaseCardSkeletonRow() {
  return (
    <>
      <CaseCardSkeleton />
      <CaseCardSkeleton />
      <CaseCardSkeleton />
    </>
  );
}

export default function CaseCard({ c }) {
  const navigate = useNavigate();
  const color = c.csmScore >= 70 ? 'var(--color-green-alt)' : c.csmScore >= 40 ? '#facc15' : 'var(--color-red-soft)';

  return (
    <div
      onClick={() => navigate(`/dashboard/case/${c.firNo}`)}
      style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-light)';
      }}
    >
      {/* Top row: FIR info & Status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{c.firNo}</span>
            {c.hasNewMatch && (
              <span style={{
                padding: '2px 8px', fontSize: '9px', fontWeight: 800,
                background: 'var(--color-red-soft)20', color: '#f87171', borderRadius: '4px',
                border: '1px solid var(--color-red-soft)40', textTransform: 'uppercase',
              }}>New Match</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {c.crimeType} · Registered {c.dateRegistered} · IO: {c.io}
          </div>
        </div>

        {/* Case Strength Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1 }}>Case Strength</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color }}>{c.csmScore}/100</div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `conic-gradient(${color} ${c.csmScore * 3.6}deg, var(--border) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface)' }} />
          </div>
        </div>
      </div>

      {/* Suspect Network (top 3) */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {c.entities.slice(0, 3).map((ent, idx) => (
          <span key={idx} style={{
            padding: '3px 8px', fontSize: '11px', background: 'var(--surface-alt)',
            border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)',
          }}>
            {ent.icon} {ent.label}
          </span>
        ))}
      </div>

      {/* Crime Timeline (last 5 events) */}
      <div style={{
        padding: '10px 12px', background: 'var(--surface-alt)', borderRadius: '8px',
        fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {c.timeline.slice(0, 5).map((t, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• {t.event}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>{t.date}</span>
          </div>
        ))}
      </div>

      {/* CSM score explanation + recommended action */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '12.5px', color: 'var(--accent)', fontWeight: 600,
        paddingTop: '8px', borderTop: '1px solid var(--border-light)',
      }}>
        <span style={{ fontSize: '14px' }}>💡</span>
        <span style={{ flex: 1 }}>{c.recommendation}</span>
        <FiChevronRight />
      </div>
    </div>
  );
}
