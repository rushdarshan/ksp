import React, { useState } from 'react'
import './ChargesheetReview.scss'

const MOCK_CHARGESHEETS = [
  { id: 'KSP-2026-0142', ioName: 'SI Ramesh K.', csmScore: 82, submittedDate: '2026-07-01', status: 'pending' },
  { id: 'KSP-2026-0105', ioName: 'Inspector Priya M.', csmScore: 71, submittedDate: '2026-06-28', status: 'approved' },
  { id: 'KSP-2026-0133', ioName: 'ASI Ganesh B.', csmScore: 58, submittedDate: '2026-06-25', status: 'returned', feedback: 'Witness statements missing for accused #2. Re-examine and resubmit.' },
]

function statusConfig(status) {
  switch (status) {
    case 'approved': return { label: 'Approved', color: '#4ade80', bg: '#4ade8018' }
    case 'returned': return { label: 'Returned', color: '#f87171', bg: '#f8717118' }
    default: return { label: 'Pending', color: '#facc15', bg: '#facc1518' }
  }
}

const ChargesheetReview = () => {
  const [sheets, setSheets] = useState(MOCK_CHARGESHEETS)
  const [returningId, setReturningId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const handleApprove = (id) => {
    setSheets(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s))
  }

  const handleReturn = (id) => {
    if (!feedback.trim()) return
    setSheets(prev => prev.map(s => s.id === id ? { ...s, status: 'returned', supervisorFeedback: feedback.trim() } : s))
    setReturningId(null)
    setFeedback('')
  }

  return (
    <div className="chargesheet-review">
      <div className="chargesheet-review__header">
        <h2>Chargesheet Review</h2>
        <p className="chargesheet-review__subtitle">
          {sheets.filter(s => s.status === 'pending').length} pending review
        </p>
      </div>

      <div className="chargesheet-review__list">
        {sheets.map(s => {
          const cfg = statusConfig(s.status)
          return (
            <div key={s.id} className="chargesheet-review__card">
              <div className="chargesheet-review__card-top">
                <span className="chargesheet-review__id">{s.id}</span>
                <span className="chargesheet-review__status" style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </span>
              </div>

              <div className="chargesheet-review__card-mid">
                <div className="chargesheet-review__field">
                  <span className="chargesheet-review__label">IO</span>
                  <span className="chargesheet-review__value">{s.ioName}</span>
                </div>
                <div className="chargesheet-review__field">
                  <span className="chargesheet-review__label">CSM</span>
                  <span className="chargesheet-review__value">{s.csmScore}</span>
                </div>
                <div className="chargesheet-review__field">
                  <span className="chargesheet-review__label">Submitted</span>
                  <span className="chargesheet-review__value">{s.submittedDate}</span>
                </div>
              </div>

              {s.feedback && (
                <div className="chargesheet-review__feedback-display">
                  <span className="chargesheet-review__label">Supervisor Feedback</span>
                  <p>{s.feedback}</p>
                </div>
              )}

              {s.status === 'pending' && (
                <div className="chargesheet-review__actions">
                  {returningId === s.id ? (
                    <div className="chargesheet-review__return-form">
                      <textarea
                        placeholder="Feedback for IO…"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        rows={3}
                      />
                      <div className="chargesheet-review__return-btns">
                        <button className="chargesheet-review__btn chargesheet-review__btn--return" onClick={() => handleReturn(s.id)}>
                          Confirm Return
                        </button>
                        <button className="chargesheet-review__btn chargesheet-review__btn--cancel" onClick={() => { setReturningId(null); setFeedback('') }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="chargesheet-review__action-btns">
                      <button className="chargesheet-review__btn chargesheet-review__btn--approve" onClick={() => handleApprove(s.id)}>
                        ✓ Approve
                      </button>
                      <button className="chargesheet-review__btn chargesheet-review__btn--return-init" onClick={() => setReturningId(s.id)}>
                        ↩ Return with Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChargesheetReview
