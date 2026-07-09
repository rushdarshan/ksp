import React from 'react';
import './redaction-skeleton.css';

const RedactionSkeleton = ({ lines = 6, label = 'Declassifying records' }) => {
  return (
    <div className="redaction-skeleton" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bar"
          style={{ width: `${[100, 75, 90, 60, 85, 70][i % 6]}%` }}
        />
      ))}
    </div>
  );
};

export default RedactionSkeleton;
