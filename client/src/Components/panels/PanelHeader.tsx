import React from 'react';

interface PanelHeaderProps {
  subtitle?: string;
  action?: React.ReactNode;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ subtitle, action }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
          {subtitle}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default PanelHeader;
