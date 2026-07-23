
const RISK_METRICS = [
  { label: 'Recidivism Risk', value: 84, level: 'High', color: 'var(--color-red-soft)' },
  { label: 'Flight Risk', value: 62, level: 'Medium', color: 'var(--color-amber-alt)' },
  { label: 'Victim Retaliation', value: 28, level: 'Low', color: 'var(--color-green-alt)' },
];

export default function RiskScores() {
  return (
    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>ZIA Risk Metrics</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {RISK_METRICS.map((m) => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>{m.label}</span>
              <span style={{ color: m.color }}>{m.value}% ({m.level})</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{
        fontSize: '12.5px', color: 'var(--accent)', background: 'rgba(201, 162, 75, 0.05)',
        border: '1px solid rgba(201, 162, 75, 0.2)', padding: '10px 12px', borderRadius: '8px',
      }}>
        <strong>Intelligence Alert:</strong> Recidivism Index elevated due to multiple matches across Malleshwaram and Brigade Road sectors within a 30-day window.
      </div>
    </div>
  );
}
