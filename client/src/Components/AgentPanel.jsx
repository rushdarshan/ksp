import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable } from './panels';

const MOCK_CROSS_CHECKS = [
  {
    firId: 'KSP-2026-0142',
    crossCheckId: 'cc_2026_001',
    status: 'completed',
    findingsCount: 3,
    findings: [
      { dimension: 'evidence-gap', severity: 'high', description: 'Junction CCTV is identified, but acquisition, hash registration, and the electronic-record certificate remain pending.', matchedFirs: [], confidence: 0.94 },
      { dimension: 'modus-operandi', severity: 'medium', description: 'Recorded chain-snatching attributes overlap with two open Bengaluru robbery reports. This is a lead, not an identity match.', matchedFirs: ['KSP-2026-0089', 'KSP-2026-0301'], confidence: 0.72 },
      { dimension: 'person-link', severity: 'medium', description: 'Kiran Joseph is named in this FIR and remains at large; the available records do not establish current location.', matchedFirs: ['KSP-2026-0142'], confidence: 0.98 },
    ],
    recommendations: [
      'Acquire the SH-9 junction recording and record its hash before making any visual comparison.',
      'Have the investigating officer review the two MO similarities and document reasons before linking cases.',
    ],
  },
  {
    firId: 'KSP-2026-0089',
    crossCheckId: 'cc_2026_002',
    status: 'completed',
    findingsCount: 2,
    findings: [
      { dimension: 'timeline-review', severity: 'high', description: 'The recorded complaint date is three days after the incident date; the file does not state a reason.', matchedFirs: [], confidence: 0.93 },
      { dimension: 'evidence-gap', severity: 'medium', description: 'The record says the scene was secured but contains no evidence-ledger entry.', matchedFirs: ['KSP-2026-0201'], confidence: 0.68 },
    ],
    recommendations: [
      'Record the complainant explanation for the reporting interval.',
      'Confirm whether an evidence ledger exists outside the imported dataset.',
    ],
  },
  {
    firId: 'KSP-2026-0201',
    crossCheckId: 'cc_2026_003',
    status: 'running',
    findingsCount: 1,
    findings: [
      { dimension: 'documentation-gap', severity: 'critical', description: 'Multiple required fields are blank in the imported record; legal sufficiency requires officer review.', matchedFirs: [], confidence: 0.95 },
    ],
    recommendations: ['Route the record to the responsible officer for completion and preserve the original audit history.'],
  },
  {
    firId: 'KSP-2026-0301',
    crossCheckId: 'cc_2026_004',
    status: 'pending',
    findingsCount: 0,
    findings: [],
    recommendations: [],
  },
];

const STATUS_CONFIG = {
  completed: { label: 'COMPLETED', status: 'low', color: 'var(--pastel-green-text)' },
  running: { label: 'RUNNING', status: 'medium', color: 'var(--pastel-yellow-text)' },
  pending: { label: 'PENDING', status: 'high', color: 'var(--muted)' },
};

const AgentPanel = () => {
  const [selected, setSelected] = useState(0);
  const task = MOCK_CROSS_CHECKS[selected];
  const cfg = STATUS_CONFIG[task.status];

  return (
    <PanelCard title="Cross-case Review" badge="HUMAN REVIEW">
      <PanelHeader
        subtitle="Surfaces record links, modus-operandi similarities, and documentation gaps for investigator review"
        action={
          <select
            value={selected}
            onChange={e => setSelected(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            {MOCK_CROSS_CHECKS.map((t, i) => (
              <option key={i} value={i}>{t.firId} — {STATUS_CONFIG[t.status].label}</option>
            ))}
          </select>
        }
      />

      {/* task header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cross-Check ID</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{task.crossCheckId}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target FIR</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{task.firId}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
          <PanelBadge status={cfg.status} label={cfg.label} />
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Findings</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>{task.findingsCount}</div>
        </div>
      </div>

      {/* findings */}
      {task.findings.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Findings
          </div>
          <PanelTable headers={['Dimension', 'Severity', 'Finding', 'Linked FIRs', 'Confidence']}>
            {task.findings.map((f, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{f.dimension}</td>
                <td style={{ padding: '8px 14px' }}>
                  <PanelBadge
                    status={f.severity === 'critical' ? 'critical' : f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'medium' : 'low'}
                    label={f.severity.toUpperCase()}
                  />
                </td>
                <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300 }}>{f.description}</td>
                <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--muted)' }}>
                  {f.matchedFirs.length > 0 ? f.matchedFirs.join(', ') : '—'}
                </td>
                <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: f.confidence > 0.8 ? 'var(--pastel-green-text)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(f.confidence * 100)}%
                </td>
              </tr>
            ))}
          </PanelTable>
        </div>
      ) : task.status === 'pending' ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Cross-check queued — waiting to start
        </div>
      ) : null}

      {/* recommendations */}
      {task.recommendations.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Follow-up Checks
          </div>
          {task.recommendations.map((r, i) => (
            <div key={i} style={{ padding: '8px 14px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
              {r}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
        Deterministic demo analysis. Match strength describes record similarity, not guilt or identity; an authorized officer must verify every lead.
      </div>
    </PanelCard>
  );
};

export default AgentPanel;
