import { useState, useEffect } from 'react'

export default function RetractionRatePanel() {
  const [summary, setSummary] = useState(null)
  const [stations, setStations] = useState([])
  const [officers, setOfficers] = useState([])
  const [trend, setTrend] = useState([])
  const [view, setView] = useState('stations')

  useEffect(() => {
    Promise.all([
      fetch('/server/retraction_rate/summary').then(r => r.json()),
      fetch('/server/retraction_rate/by_station').then(r => r.json()),
      fetch('/server/retraction_rate/by_io').then(r => r.json()),
      fetch('/server/retraction_rate/trend').then(r => r.json()),
    ]).then(([s, st, o, t]) => {
      setSummary(s)
      setStations(st.stations)
      setOfficers(o.officers)
      setTrend(t.months)
    }).catch(() => {})
  }, [])

  if (!summary) return <div className="panel"><div className="panel-box"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>

  const retractionRate = Math.round(summary.retractionRate * 100)

  return (
    <div className="panel">
      <div className="panel-box">
        <h2 style={{ marginBottom: 4 }}>Chargesheet Disposition Review</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', marginBottom: 20, maxWidth: 600 }}>
          Source-system Type A, B, and C dispositions shown as quality-review signals. A Type C label does not by itself prove a false complaint, officer error, or misconduct.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <KpiBox label="Total Chargesheets" value={summary.totalChargesheets} />
          <KpiBox label="Retraction Rate" value={`${retractionRate}%`} color={retractionRate > 25 ? 'var(--color-red)' : retractionRate > 15 ? '#d97706' : 'var(--color-green)'} />
          <KpiBox label="Type B (Mistake)" value={summary.typeB} color="var(--color-amber)" />
          <KpiBox label="Type C (Review)" value={summary.typeC} color="var(--color-red)" />
          <KpiBox label="Normal (Type A)" value={summary.typeA} color="var(--color-green)" />
        </div>

        <div style={{ marginBottom: 20, height: 80, display: 'flex', alignItems: 'end', gap: 8 }}>
          {trend.map(m => {
            const pct = m.retracted / m.total
            return (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, color: pct > 0.2 ? 'var(--color-red)' : 'var(--text-secondary)', fontWeight: 600 }}>{Math.round(pct * 100)}%</div>
                <div style={{
                  width: '100%', maxWidth: 40, height: `${pct * 100}%`, minHeight: 4,
                  borderRadius: 'var(--radius-sm)', background: pct > 0.2 ? '#dc2626' : 'var(--color-amber)',
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{m.month.slice(5)}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setView('stations')}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${view === 'stations' ? 'var(--accent)' : 'var(--border)'}`,
              background: view === 'stations' ? 'var(--accent)' : 'transparent',
              color: view === 'stations' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--size-caption)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >By Station</button>
          <button onClick={() => setView('officers')}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${view === 'officers' ? 'var(--accent)' : 'var(--border)'}`,
              background: view === 'officers' ? 'var(--accent)' : 'transparent',
              color: view === 'officers' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--size-caption)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >By Officer</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(view === 'stations' ? stations : officers).map(item => {
            const name = item.station || item.officer
            const subtitle = item.district || item.station
            const pct = item.retractionPct
            const barColor = pct > 30 ? 'var(--color-red)' : pct > 20 ? '#d97706' : '#22c55e'
            return (
              <div key={name} style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 'var(--size-sub)' }}>{name}</strong>
                    {subtitle && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{subtitle}</span>}
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: barColor }}>{pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: barColor }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>A: {item.A}</span>
                  <span>B: {item.B}</span>
                  <span>C: {item.C}</span>
                  <span>Total: {item.total}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function KpiBox({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 20px', borderRadius: 'var(--radius-md)', border: `1px solid ${color || 'var(--border)'}40`,
      background: color ? `${color}08` : 'var(--surface)', minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}
