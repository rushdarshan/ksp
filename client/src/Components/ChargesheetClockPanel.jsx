import { useState, useEffect } from 'react'
import { useFilter } from '../FilterContext';
import apiFetch from '../utils/apiFetch';

const STATUS_COLORS = { overdue: 'var(--color-red)', at_risk: '#d97706', safe: '#22c55e' }
const STATUS_LABELS = { overdue: 'OVERDUE', at_risk: 'AT RISK', safe: 'ON TRACK' }

export default function ChargesheetClockPanel() {
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('all')
  const { station, dateFrom, dateTo, crimeType } = useFilter();

  useEffect(() => {
    const p = new URLSearchParams();
    if (station) p.set('station', station);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    if (crimeType) p.set('crimeType', crimeType);
    apiFetch('/chargesheet_clock/stats?' + p)
      .then(r => r ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
  }, [station, dateFrom, dateTo, crimeType])

  if (!data) return <div className="panel"><div className="panel-box"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>

  const filtered = filter === 'all' ? data.cases : data.cases.filter(c => c.status === filter)

  return (
    <div className="panel">
      <div className="panel-box">
        <h2 style={{ marginBottom: 4 }}>Chargesheet Clock</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', marginBottom: 20, maxWidth: 600 }}>
          Investigation milestone tracker using a configured 90-day review target. Verify the applicable
          BNSS provision and custody status before treating any date as a statutory deadline.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatBox label="Overdue" value={data.overdueCount} color="var(--color-red)" />
          <StatBox label="At Risk" value={data.atRiskCount} color="var(--color-amber)" />
          <StatBox label="On Track" value={data.safeCount} color="var(--color-green)" />
          <StatBox label="Avg Overdue" value={`${data.averageOverdueDays}d`} color="var(--color-red)" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'overdue', 'at_risk', 'safe'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
                background: filter === s ? 'var(--accent)' : 'transparent',
                color: filter === s ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--size-caption)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >{s === 'all' ? 'All' : STATUS_LABELS[s]}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => {
            return (
              <div key={c.caseId} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 'var(--size-sub)', fontFamily: 'var(--font-mono)' }}>{c.firNo}</strong>
                    <span style={{ fontSize: 'var(--size-caption)', color: STATUS_COLORS[c.status], fontWeight: 700 }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>
                    {c.crimeType.charAt(0).toUpperCase() + c.crimeType.slice(1)} · {c.officer} · District {c.districtId}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 100 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: STATUS_COLORS[c.status] }}>
                    {c.status === 'overdue' ? `+${c.daysOverdue}` : `${c.daysRemaining}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {c.status === 'overdue' ? 'days overdue' : 'days left'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No cases in this category.</p>}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 20px', borderRadius: 'var(--radius-md)', border: `1px solid ${color}40`,
      background: `${color}08`, minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}
