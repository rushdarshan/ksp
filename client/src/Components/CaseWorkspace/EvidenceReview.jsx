import React from 'react';
import { useCaseContext } from './CaseWorkspace';

const MOCK_EVIDENCE = [
  { id: 'E1', type: 'Digital', desc: 'CCTV footage — SH-9 junction camera', status: 'intact', date: '2026-07-08', officer: 'PI Dharmendra', aiAnalysis: 'Vehicle KA-01-AB-1234 visible at 14:32. Two individuals exit vehicle. No section 65B certificate filed.' },
  { id: 'E2', type: 'Forensic', desc: 'Fingerprint lift from suspect vehicle', status: 'pending', date: '2026-07-07', officer: 'FSL Bangalore', aiAnalysis: 'Prints match Ravi Kumar (10-point match). Awaiting formal certification.' },
  { id: 'E3', type: 'Witness', desc: 'Victim statement — S/O Lakshmi Devi', status: 'intact', date: '2026-07-06', officer: 'PI Dharmendra', aiAnalysis: 'Consistent with CCTV timeline. Suspect description matches Ravi Kumar.' },
  { id: 'E4', type: 'Witness', desc: 'Bystander witness — auto-driver Raju', status: 'intact', date: '2026-07-06', officer: 'SI Ramesh', aiAnalysis: 'Corroborates victim account. Vehicle plate partially visible — matches KA-01-AB-1234.' },
  { id: 'E5', type: 'Physical', desc: 'Gold chain (stolen) — not recovered', status: 'gap', date: null, officer: null, aiAnalysis: 'Critical gap. Stolen item not recovered weakens physical evidence chain. Recommend search of suspect premises.' },
  { id: 'E6', type: 'Digital', desc: 'Mobile CDR — suspect number 98450XXXXX', status: 'pending', date: '2026-07-09', officer: 'Telecom Nodal', aiAnalysis: 'CDR shows location ping near crime scene at time of offence. Awaiting full call detail records.' },
];

const statusClass = { intact: 'badge--clear', pending: 'badge--warning', gap: 'badge--critical' };
const statusLabel = { intact: 'Intact', pending: 'Pending', gap: 'Gap / Missing' };
const statusBorder = { intact: 'var(--pastel-green-text)', pending: 'var(--pastel-amber-text)', gap: 'var(--pastel-red-text)' };

export default function EvidenceReview() {
  const { firId } = useCaseContext();
  const [expanded, setExpanded] = React.useState(null);

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
        {MOCK_EVIDENCE.map(e => (
          <div key={e.id}>
            <div
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="panel-shell panel-shell--compact"
              style={{ border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 'var(--size-label)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', minWidth: 28 }}>{e.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--size-sub)', fontWeight: 600, color: 'var(--text)' }}>{e.desc}</div>
                <div style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)', marginTop: 3 }}>
                  {e.type} {e.date ? `· Collected ${e.date}` : ''} {e.officer ? `· ${e.officer}` : ''}
                </div>
              </div>
              <span className={`badge ${statusClass[e.status]}`}>{statusLabel[e.status]}</span>
              <span style={{ fontSize: 'var(--size-sub)', color: 'var(--text-secondary)' }}>{expanded === e.id ? '▲' : '▼'}</span>
            </div>
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
        <strong>ZIA Gap Detection:</strong> No section 65B certificate filed for CCTV evidence (E1). CDR analysis pending for 3 days (E6). Stolen item not recovered — weakens physical evidence chain.
      </div>
    </div>
  );
}
