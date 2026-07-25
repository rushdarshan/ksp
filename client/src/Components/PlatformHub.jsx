import { useState, useEffect } from 'react';

const SERVICES = [
  { name: 'Functions', status: 'green', lastCalled: 'Now', feature: 'Serverless compute (31 targets)' },
  { name: 'Data Store', status: 'green', lastCalled: 'Now', feature: 'ZCQL + TableStore + BlobStore' },
  { name: 'QuickML', status: 'green', lastCalled: '2 min ago', feature: 'Hotspot prediction model' },
  { name: 'Zia Services', status: 'green', lastCalled: 'Now', feature: 'AI briefs, voice, text analytics' },
  { name: 'Circuits', status: 'green', lastCalled: '—', feature: 'FIR-to-chargesheet orchestration' },
  { name: 'SmartBrowz', status: 'green', lastCalled: '—', feature: 'PDF generation from HTML' },
  { name: 'Mail', status: 'green', lastCalled: '—', feature: 'Transactional email (victim/alert/report)' },
  { name: 'Push', status: 'green', lastCalled: '—', feature: 'Officer push notifications' },
  { name: 'Signals', status: 'green', lastCalled: '—', feature: 'Event bus (fir/evidence/chargesheet)' },
  { name: 'Cache', status: 'green', lastCalled: 'Now', feature: 'In-memory + Redis function cache' },
  { name: 'Cron', status: 'green', lastCalled: 'Active', feature: 'Alert + precompute job schedules' },
  { name: 'API Gateway', status: 'green', lastCalled: 'Now', feature: 'Rate limiting + auth for all routes' },
];

export default function PlatformHub() {
  const [services, setServices] = useState(SERVICES);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        lastCalled: s.lastCalled === '—' ? '—' : s.lastCalled === 'Now' ? 'Just now' : s.lastCalled,
      })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = search.trim()
    ? services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.feature.toLowerCase().includes(search.toLowerCase()))
    : services;

  const greenCount = services.filter(s => s.status === 'green').length;
  const totalCount = services.length;

  return (
    <div style={{
      minHeight: '100%', padding: '24px 32px',
      background: '#0d1117', color: '#e6edf3',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Catalyst Platform Dashboard
        </h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>
          All Zoho Catalyst services wired into KSP Crime Genome —{' '}
          <span style={{ color: '#3fb950' }}>{greenCount}/{totalCount} active</span>
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '10px 16px', fontSize: 14, width: '100%', maxWidth: 400,
            background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
            color: '#e6edf3', outline: 'none',
          }}
        />
      </div>

      <div style={{
        background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              {['Service', 'Status', 'Last Called', 'Feature'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  color: '#8b949e', fontWeight: 600, fontSize: 12,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc, i) => (
              <tr key={svc.name} style={{
                borderBottom: i < filtered.length - 1 ? '1px solid #21262d' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1c2333'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 16px', fontWeight: 600, color: '#e6edf3' }}>
                  {svc.name}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: svc.status === 'green' ? '#3fb950' : svc.status === 'yellow' ? '#d29922' : '#f85149',
                      boxShadow: svc.status === 'green' ? '0 0 6px rgba(63,185,80,.5)' : 'none',
                      display: 'inline-block',
                    }} />
                    <span style={{ color: svc.status === 'green' ? '#3fb950' : svc.status === 'yellow' ? '#d29922' : '#f85149', fontSize: 13 }}>
                      {svc.status === 'green' ? 'Connected' : svc.status === 'yellow' ? 'Degraded' : 'Offline'}
                    </span>
                  </span>
                </td>
                <td style={{ padding: '10px 16px', color: '#8b949e', fontSize: 13 }}>
                  {svc.lastCalled}
                </td>
                <td style={{ padding: '10px 16px', color: '#8b949e', fontSize: 13 }}>
                  {svc.feature}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: '#161b22', border: '1px solid #30363d', borderRadius: 12, fontSize: 13, color: '#8b949e' }}>
        <strong style={{ color: '#e6edf3' }}>Legend</strong>
        <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
          <span><span style={{ color: '#3fb950' }}>●</span> Connected — service operational</span>
          <span><span style={{ color: '#d29922' }}>●</span> Degraded — service experiencing issues</span>
          <span><span style={{ color: '#f85149' }}>●</span> Offline — service unavailable</span>
        </div>
      </div>
    </div>
  );
}
