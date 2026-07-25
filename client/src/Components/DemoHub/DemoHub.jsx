import { useState, useMemo } from 'react'
import './DemoHub.scss'

const FIR_DB = {
  'KSP-2026-0142': {
    firNo: 'KSP-2026-0142',
    district: 'Bangalore Urban',
    station: 'Brigade Road PS',
    dateRegistered: '2026-03-15',
    crimeType: 'Robbery',
    complainant: 'Rajesh Kumar',
    io: 'PI Dharmendra',
    sections: ['BNS 304', 'BNS 309'],
    status: 'Under Investigation',
    narrative: 'Two-wheeler robbery near SH-9 junction. Complainant reported two persons using a sharp object. Two witnesses identified. CCTV referenced.',
    entities: {
      suspect: ['Mohan Kumar (in custody)', 'Kiran Joseph (at large)'],
      victim: 'Rajesh Kumar',
      phone: '9845012345',
      vehicle: 'Unregistered two-wheeler (dark)',
    },
    linkedCases: [
      { firNo: 'KSP-2026-0089', match: 78, crime: 'Burglary' },
      { firNo: 'KSP-2026-0301', match: 65, crime: 'Robbery' },
    ],
    evidenceCompleteness: 72,
    readinessScore: 67,
    daysRemaining: 18,
    deadlineDate: '2026-08-09',
  },
  'KSP-2026-0089': {
    firNo: 'KSP-2026-0089',
    district: 'Bangalore Urban',
    station: 'Brigade Road PS',
    dateRegistered: '2026-02-28',
    crimeType: 'Burglary',
    complainant: 'Sunil Verma',
    io: 'PI Maruti',
    sections: ['BNS 331'],
    status: 'Under Investigation',
    narrative: 'Night break-in at commercial property in Indiranagar. Entry through rear window. Cash and electronics stolen.',
    entities: {
      suspect: ['Ravi Shetty (absconding)', 'Unknown accomplice'],
      victim: 'Sunil Verma',
      phone: '9876543210',
      vehicle: 'Not recorded',
    },
    linkedCases: [
      { firNo: 'KSP-2026-0142', match: 72, crime: 'Robbery' },
      { firNo: 'KSP-2026-0267', match: 58, crime: 'Burglary' },
    ],
    evidenceCompleteness: 55,
    readinessScore: 42,
    daysRemaining: 6,
    deadlineDate: '2026-07-28',
  },
  'KSP-2026-0201': {
    firNo: 'KSP-2026-0201',
    district: 'Mysuru',
    station: 'Mysuru North PS',
    dateRegistered: '2026-01-10',
    crimeType: 'Assault',
    complainant: 'Venkatesh Gowda',
    io: 'PI Anjumala',
    sections: ['BNS 115', 'BNS 118'],
    status: 'Case Closed',
    narrative: 'Physical altercation in parking lot. Two groups clashed over property dispute. Chargesheet filed. Case closed.',
    entities: {
      suspect: ['Girish Poojary', 'Venkatesh Gowda'],
      victim: 'Venkatesh Gowda',
      phone: '9741122334',
      vehicle: 'KA-09-AB-1234',
    },
    linkedCases: [
      { firNo: 'KSP-2026-0198', match: 82, crime: 'Burglary' },
    ],
    evidenceCompleteness: 91,
    readinessScore: 100,
    daysRemaining: 0,
    deadlineDate: '2026-04-10',
    statusLabel: 'CHARGESHEET FILED',
  },
}

const DEFAULT_FIR = FIR_DB['KSP-2026-0142']

export default function DemoHub() {
  const [firInput, setFirInput] = useState('KSP-2026-0142')
  const fir = useMemo(() => {
    const key = firInput.trim().toUpperCase()
    return FIR_DB[key] || null
  }, [firInput])

  return (
    <div className="demo-hub">
      <div className="demo-hub-header">
        <h1>KSP Crime Genome Pipeline</h1>
        <p>End-to-end case intelligence — from FIR to chargesheet readiness</p>
      </div>

      <div className="demo-hub-search">
        <input
          type="text"
          placeholder="Enter FIR number (e.g. KSP-2026-0142)"
          value={firInput}
          onChange={e => setFirInput(e.target.value)}
        />
      </div>

      {!fir ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--dh-text-muted)', fontSize: 15, border: '1px dashed var(--dh-border)', borderRadius: 12 }}>
          No data for FIR "{firInput}". Try KSP-2026-0142, KSP-2026-0089, or KSP-2026-0201
        </div>
      ) : (
        <>
          <div className="demo-hub-pipeline">
            <Stage1FirDetails fir={fir} />
            <Stage2Entities fir={fir} />
            <Stage3Evidence fir={fir} />
            <Stage4Chargesheet fir={fir} />
          </div>

          <div className="demo-hub-actions">
            <button className="demo-hub-btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask ZIA
            </button>
            <button className="demo-hub-btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              View on Map
            </button>
            <button className="demo-hub-btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Export Brief
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function StatusDot(status) {
  if (status === 'active' || status === 'green') return <span className="status-dot dot-green" />
  if (status === 'at_risk' || status === 'yellow') return <span className="status-dot dot-yellow" />
  return <span className="status-dot dot-red" />
}

function Stage1FirDetails({ fir }) {
  const dot = fir.status === 'Case Closed' ? 'green' : 'yellow'
  return (
    <div className={`demo-hub-stage ${fir ? 'stage-active' : ''}`}>
      <div className="demo-hub-stage-header">
        <span className="stage-number">1</span>
        <h3>FIR Details</h3>
        {StatusDot(dot)}
      </div>
      {fir ? (
        <div className="stage-content">
          <div className="field-row"><span className="label">FIR No</span><span className="value">{fir.firNo}</span></div>
          <div className="field-row"><span className="label">Crime</span><span className="value">{fir.crimeType}</span></div>
          <div className="field-row"><span className="label">Station</span><span className="value">{fir.station}</span></div>
          <div className="field-row"><span className="label">IO</span><span className="value">{fir.io}</span></div>
          <div className="field-row"><span className="label">Date</span><span className="value">{fir.dateRegistered}</span></div>
          <div className="field-row"><span className="label">Sections</span><span className="value">{fir.sections.join(', ')}</span></div>
        </div>
      ) : <div className="stage-empty">Awaiting FIR lookup</div>}
    </div>
  )
}

function Stage2Entities({ fir }) {
  const e = fir.entities
  const dot = e.suspect.some(s => s.includes('at large')) ? 'red' : 'green'
  return (
    <div className="demo-hub-stage stage-active">
      <div className="demo-hub-stage-header">
        <span className="stage-number">2</span>
        <h3>Entities Extracted</h3>
        {StatusDot(dot)}
      </div>
      <div className="stage-content">
        <div className="entity-list">
          <div className="entity-item">
            <span className="entity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            <span className="entity-label">Suspect</span>
            <span className="entity-value">{e.suspect.join('; ')}</span>
          </div>
          <div className="entity-item">
            <span className="entity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            <span className="entity-label">Victim</span>
            <span className="entity-value">{e.victim}</span>
          </div>
          <div className="entity-item">
            <span className="entity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="6" y1="6" x2="18" y2="6"/><line x1="6" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/><line x1="6" y1="18" x2="14" y2="18"/></svg></span>
            <span className="entity-label">Phone</span>
            <span className="entity-value">{e.phone}</span>
          </div>
          <div className="entity-item">
            <span className="entity-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 10h20v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3z"/><path d="M12 15v4"/></svg></span>
            <span className="entity-label">Vehicle</span>
            <span className="entity-value">{e.vehicle}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stage3Evidence({ fir }) {
  const dot = fir.evidenceCompleteness >= 70 ? 'green' : 'yellow'
  return (
    <div className="demo-hub-stage stage-active">
      <div className="demo-hub-stage-header">
        <span className="stage-number">3</span>
        <h3>Evidence Cross-Match</h3>
        {StatusDot(dot)}
      </div>
      <div className="stage-content">
        <div className="cross-match-pairs">
          {fir.linkedCases.map(lc => (
            <div key={lc.firNo} className="match-pair">
              <span className="fir">{lc.firNo}</span>
              <span className="match-pct">{lc.match}% match</span>
            </div>
          ))}
        </div>
        <div className="completeness-bar">
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${fir.evidenceCompleteness}%` }} />
          </div>
          <span className="bar-label">{fir.evidenceCompleteness}%</span>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--dh-text-muted)', marginTop: 4 }}>
          evidence completeness
        </div>
      </div>
    </div>
  )
}

function Stage4Chargesheet({ fir }) {
  const isClosed = fir.status === 'Case Closed'
  const isOverdue = fir.daysRemaining === 0 && !isClosed
  const dot = isClosed ? 'green' : isOverdue ? 'red' : fir.daysRemaining <= 10 ? 'yellow' : 'green'
  return (
    <div className="demo-hub-stage stage-active">
      <div className="demo-hub-stage-header">
        <span className="stage-number">4</span>
        <h3>Chargesheet Readiness</h3>
        {StatusDot(dot)}
      </div>
      <div className="stage-content">
        <div className="readiness-score">
          <div className="score-value">{fir.readinessScore}%</div>
          <div className="score-label">Readiness Score</div>
        </div>
        {!isClosed && fir.daysRemaining > 0 && (
          <div className="deadline-clock">
            <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="clock-text">{fir.daysRemaining} days remaining</span>
          </div>
        )}
        {isClosed && (
          <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--dh-green)', fontSize: 14, fontWeight: 600 }}>
            Case Closed — Chargesheet Filed
          </div>
        )}
        {isOverdue && (
          <div className="deadline-clock" style={{ background: 'rgba(248,81,73,.1)', borderColor: 'rgba(248,81,73,.2)' }}>
            <svg className="clock-icon" style={{ color: 'var(--dh-red)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="clock-text" style={{ color: 'var(--dh-red)' }}>OVERDUE</span>
          </div>
        )}
      </div>
    </div>
  )
}
