import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StationOverview.scss'

const MOCK_CASES = [
  { firNo: 'KSP-2026-0142', crimeType: 'Robbery', csmScore: 82, stage: 'Under Investigation', flagged: true, date: '2026-06-10' },
  { firNo: 'KSP-2026-0138', crimeType: 'Assault', csmScore: 65, stage: 'Evidence Collection', flagged: false, date: '2026-06-08' },
  { firNo: 'KSP-2026-0155', crimeType: 'Cyber Fraud', csmScore: 91, stage: 'Chargesheet Ready', flagged: true, date: '2026-07-02' },
  { firNo: 'KSP-2026-0120', crimeType: 'Burglary', csmScore: 44, stage: 'Under Investigation', flagged: false, date: '2026-05-22' },
  { firNo: 'KSP-2026-0161', crimeType: 'Missing Person', csmScore: 28, stage: 'First Information', flagged: false, date: '2026-07-12' },
].sort((a, b) => b.csmScore - a.csmScore)

function csmColor(score) {
  if (score >= 80) return 'var(--color-red-soft)'
  if (score >= 60) return 'var(--color-amber-alt)'
  return 'var(--color-green-alt)'
}

const StationOverview = () => {
  const navigate = useNavigate()
  const [cases] = useState(MOCK_CASES)

  return (
    <div className="station-overview">
      <div className="station-overview__header">
        <div>
          <h2>Station Overview</h2>
          <p className="station-overview__subtitle">Brigade Road Police Station · {cases.length} active cases</p>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="station-overview__empty">No cases in your station</div>
      ) : (
        <div className="station-overview__list">
          {cases.map(c => (
            <button
              key={c.firNo}
              className="station-overview__card"
              onClick={() => navigate(`/dashboard/case/${c.firNo}`)}
            >
              <div className="station-overview__card-top">
                <span className="station-overview__fir">{c.firNo}</span>
                {c.flagged && <span className="station-overview__flag">⚠ Flagged</span>}
              </div>
              <div className="station-overview__card-mid">
                <span className="station-overview__crime">{c.crimeType}</span>
                <span className="station-overview__stage">{c.stage}</span>
              </div>
              <div className="station-overview__card-bottom">
                <span className="station-overview__csm" style={{ color: csmColor(c.csmScore) }}>
                  CSM {c.csmScore}
                </span>
                <span className="station-overview__date">{c.date}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StationOverview
