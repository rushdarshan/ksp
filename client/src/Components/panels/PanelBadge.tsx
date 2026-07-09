import React from 'react';

type BadgeStatus = 'low' | 'medium' | 'high' | 'critical';

interface PanelBadgeProps {
  status: BadgeStatus;
  label: string;
}

const STATUS_STYLES: Record<BadgeStatus, { bg: string; color: string }> = {
  low: { bg: 'var(--pastel-green)', color: 'var(--pastel-green-text)' },
  medium: { bg: 'var(--pastel-yellow)', color: 'var(--pastel-yellow-text)' },
  high: { bg: 'var(--pastel-red)', color: 'var(--pastel-red-text)' },
  critical: { bg: 'var(--pastel-red)', color: 'var(--pastel-red-text)' },
};

const PanelBadge: React.FC<PanelBadgeProps> = ({ status, label }) => {
  const styles = STATUS_STYLES[status];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: styles.bg,
        color: styles.color,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-body)',
        borderRadius: 9999,
      }}
    >
      {label}
    </span>
  );
};

export default PanelBadge;
