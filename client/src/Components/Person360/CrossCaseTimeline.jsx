import { Link } from 'react-router-dom';

const MOCK_TIMELINE = [
  { firNo: 'KSP-2026-0142', date: '2026-03-15', crimeType: 'Robbery', role: 'Named accused', stage: 'Under investigation', sector: 'Brigade Road' },
  { firNo: 'KSP-2026-0301', date: '2026-05-10', crimeType: 'Robbery', role: 'Record similarity only', stage: 'Under investigation', sector: 'Cubbon Park' },
];

export default function CrossCaseTimeline({ firList = [] }) {
  const events = firList.length ? firList : MOCK_TIMELINE;

  return (
    <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Cross-Case Temporal Timeline</h3>
      <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map((ev, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '-26px', top: '4px',
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--accent)', border: '2px solid var(--surface)',
            }} />
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{ev.date}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
              Involved in {ev.crimeType} (
              <Link to={`/dashboard/case/${ev.firNo}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{ev.firNo}</Link>
              ) - {ev.sector}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Stage: {ev.stage} | Role: {ev.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
