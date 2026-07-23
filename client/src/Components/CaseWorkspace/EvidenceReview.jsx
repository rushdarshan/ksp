import { useState } from 'react';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_EVIDENCE } from './caseFacts';

const statusClass = { intact: 'badge--clear', pending: 'badge--warning', gap: 'badge--critical' };
const statusLabel = { intact: 'Intact', pending: 'Pending', gap: 'Gap / Missing' };
export default function EvidenceReview() {
  const { firId } = useCaseContext();
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div className="panel-header">
        <h3 className="panel-title" style={{ margin: 0, fontSize: '16px' }}>Evidence Locker — {firId}</h3>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {['intact', 'pending', 'gap'].map(s => (
            <span key={s} className={`badge ${statusClass[s]}`}>{statusLabel[s]}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {ACTIVE_CASE_EVIDENCE.map(e => (
          <div key={e.id}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="panel-shell panel-shell--compact case-evidence__row"
              aria-expanded={expanded === e.id}
            >
              <span style={{ fontSize: 'var(--size-label)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', minWidth: 28 }}>{e.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--size-sub)', fontWeight: 600, color: 'var(--text)' }}>{e.desc}</div>
                <div style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)', marginTop: 3 }}>
                  {e.type} {e.date ? `· Recorded ${e.date}` : ''} {e.officer ? `· ${e.officer}` : ''}
                </div>
              </div>
              <span className={`badge ${statusClass[e.status]}`}>{statusLabel[e.status]}</span>
              <span className="case-evidence__caret" aria-hidden="true">{expanded === e.id ? <PiCaretUp /> : <PiCaretDown />}</span>
            </button>
            {expanded === e.id && (
              <div style={{
                padding: 'var(--space-sm) var(--space-md) var(--space-sm) 44px',
                background: 'var(--surface-alt)',
                borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                border: '1px solid var(--border-light)',
                borderTop: 'none',
                fontSize: 'var(--size-sub)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--text)' }}>ZIA Analysis:</strong> {e.aiAnalysis}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="badge badge--critical" style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--size-sub)', lineHeight: 1.5, textAlign: 'left' }}>
        <strong>Evidence gap:</strong> The CCTV source is identified, but acquisition, hash verification, and the BSA Section 63 certificate remain pending. These records require officer verification before statutory filing in 18 days.
      </div>
    </div>
  );
}
