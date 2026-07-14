import { useState, useEffect } from 'react'
import { useFilter } from '../FilterContext';

const STATUS_BADGES = { absconding: { label: 'ABSCONDING', color: 'var(--color-red)' }, bailable_warrant: { label: 'BAILABLE WARRANT', color: 'var(--color-amber)' }, recent: { label: 'RECENT', color: 'var(--color-green)' } }

export default function AccusedAtLargePanel() {
  const [data, setData] = useState(null)
  const { station, dateFrom, dateTo, crimeType } = useFilter();

  useEffect(() => {
    const p = new URLSearchParams();
    if (station) p.set('station', station);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    if (crimeType) p.set('crimeType', crimeType);
    fetch('/server/accused-at-large/ledger?' + p)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [station, dateFrom, dateTo, crimeType])

  if (!data) return <div className="panel"><div className="panel-box"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>

  return (
    <div className="panel">
      <div className="panel-box">
        <h2 style={{ marginBottom: 4 }}>Accused-at-Large Ledger</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', marginBottom: 20, maxWidth: 600 }}>
          Persistent roll of every accused who evades process — absconders, bailable-warrant holders, and
          recently identified fugitives across Karnataka.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatBox label="Total Tracked" value={data.total} />
          <StatBox label="Absconding" value={data.abscondingCount} color="var(--color-red)" />
          <StatBox label="Bailable Warrant" value={data.bailableWarrantCount} color="var(--color-amber)" />
          <StatBox label="Avg Days at Large" value={`${data.averageDaysAtLarge}d`} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.entries.map(a => {
            const badge = STATUS_BADGES[a.status]
            return (
              <div key={a.id} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 'var(--size-sub)' }}>{a.name}</strong>
                    <span style={{ fontSize: 10, color: badge.color, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: `${badge.color}12`, border: `1px solid ${badge.color}30` }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>
                    {a.crimeType.charAt(0).toUpperCase() + a.crimeType.slice(1)} · {a.firNo} · {a.officer} · Dist {a.districtId} · {a.age}y
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Last seen: {a.lastKnownLocation} · {a.warrantsIssued} warrant(s) issued
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 100 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: a.daysAtLarge > 90 ? '#dc2626' : a.daysAtLarge > 30 ? 'var(--color-amber)' : 'var(--color-green)' }}>
                    {a.daysAtLarge}d
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>at large</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 20px', borderRadius: 'var(--radius-md)', border: `1px solid ${color || 'var(--border)'}40`,
      background: color ? `${color}08` : 'var(--surface)', minWidth: 120,
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}
