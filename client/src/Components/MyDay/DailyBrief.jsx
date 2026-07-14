import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

function DailyBriefSkeleton() {
  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="redaction-bar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        <div>
          <div className="redaction-bar" style={{ width: '160px', height: '18px', marginBottom: '6px' }} />
          <div className="redaction-bar" style={{ width: '120px', height: '11px' }} />
        </div>
      </div>
      <div className="redaction-bar" style={{ width: '100%', height: '48px' }} />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
        <div className="redaction-bar" style={{ width: '120px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
        <div className="redaction-bar" style={{ width: '100px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function DailyBriefError({ onRetry }) {
  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
      <FiAlertCircle size={28} color="var(--pastel-red-text)" />
      <div style={{ color: 'var(--pastel-red-text)', fontSize: 'var(--size-sub)', fontWeight: 700 }}>Failed to load daily brief</div>
      <button onClick={onRetry} className="btn btn-secondary" style={{ fontSize: 'var(--size-caption)', padding: '6px 16px' }}>
        Retry
      </button>
    </div>
  );
}

export function DailyBriefSkeletonBlock() {
  return <DailyBriefSkeleton />;
}

export default function DailyBrief({ brief, loading, error, onRetry }) {
  if (loading) return <DailyBriefSkeleton />;
  if (error) return <DailyBriefError onRetry={onRetry} />;
  if (!brief) return null;

  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '28px' }}>🤖</span>
        <div>
          <h2 className="panel-title" style={{ margin: 0, fontSize: '18px' }}>ZIA Morning Brief</h2>
          <div style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{brief.timestamp}</div>
        </div>
      </div>
      <p style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--size-sub)', lineHeight: 1.6 }}>
        {brief.message}
      </p>
      {brief.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {brief.tags.map((tag, i) => (
            <span key={i} className={`badge badge--${tag.color === 'red' ? 'critical' : tag.color === 'amber' ? 'warning' : 'info'}`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
