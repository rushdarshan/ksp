import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_TIMELINE } from './caseFacts';

const typeColors = {
  report: 'var(--color-red-soft)',
  evidence: '#60a5fa',
  analysis: '#a78bfa',
  action: 'var(--color-green-alt)',
};

export default function CaseTimeline() {
  const { firId } = useCaseContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Case Timeline — {firId}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 20 }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 7, top: 8, bottom: 8, width: 2,
          background: 'var(--border-light)',
        }} />
        {ACTIVE_CASE_TIMELINE.map((e) => (
          <div key={`${e.date}-${e.label}`} className="case-timeline__event">
            {/* Dot */}
            <div style={{
              position: 'absolute', left: -20, top: 16,
              width: 12, height: 12, borderRadius: '50%',
              background: typeColors[e.type] || 'var(--text-secondary)',
              border: '2px solid var(--surface)',
            }} />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 100, fontFamily: 'monospace', paddingTop: 2 }}>
              {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              <br />
              {new Date(e.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{e.detail}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: `${typeColors[e.type]}20`, color: typeColors[e.type],
              alignSelf: 'flex-start', marginTop: 2,
            }}>{e.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
