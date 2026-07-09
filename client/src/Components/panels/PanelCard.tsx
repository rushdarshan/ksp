import React from 'react';

interface PanelCardProps {
  title?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
}

const PanelCard: React.FC<PanelCardProps> = ({ title, badge, children, className = '', loading, empty, emptyMessage }) => {
  return (
    <div
      className={`panel ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-xl)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text)',
      }}
    >
      {(title || badge) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
          {title && (
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)', letterSpacing: '-0.01em' }}>
              {title}
            </h3>
          )}
          {badge && (
            <span style={{ fontSize: 11, padding: '3px 10px', background: 'var(--pastel-blue)', color: 'var(--pastel-blue-text)', borderRadius: 'var(--radius-full)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {badge}
            </span>
          )}
        </div>
      )}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 12, background: 'var(--border-light)', borderRadius: 4, width: `${70 + i * 10}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : empty ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          {emptyMessage || 'No data available'}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default PanelCard;
