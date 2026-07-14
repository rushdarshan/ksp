import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable } from './panels';

// ponytail: mock data matching POST /agentic/cross-check/:firId response schema
const MOCK_CROSS_CHECKS = [
  {
    firId: 'FIR-2026-142',
    crossCheckId: 'cc_2026_001',
    status: 'completed',
    findingsCount: 3,
    findings: [
      { dimension: 'witness-consistency', severity: 'high', description: 'Witness timelines in FIR-142 and FIR-087 overlap at同一个地点 — possible linked incidents', matchedFirs: ['FIR-2026-087'], confidence: 0.87 },
      { dimension: 'modus-operandi', severity: 'medium', description: 'MO pattern matches 2 prior unsolved cases from HSR Layout cluster', matchedFirs: ['FIR-2025-891', 'FIR-2025-904'], confidence: 0.72 },
      { dimension: 'suspect-network', severity: 'low', description: 'No co-accused links detected across linked FIRs', matchedFirs: [], confidence: 0.91 },
    ],
    recommendations: [
      'Investigate shared MO between FIR-142 and FIR-087 — same suspect may be active across zones',
      'Pull CCTV from Koramangala and HSR Layout overlap corridor',
    ],
  },
  {
    firId: 'FIR-2026-087',
    crossCheckId: 'cc_2026_002',
    status: 'completed',
    findingsCount: 2,
    findings: [
      { dimension: 'timeline-anomaly', severity: 'high', description: 'FIR filed 3 days after incident — delay unusual for cognizable offense', matchedFirs: [], confidence: 0.93 },
      { dimension: 'evidence-gap', severity: 'medium', description: 'No physical evidence collected despite scene being secured', matchedFirs: ['FIR-2026-201'], confidence: 0.68 },
    ],
    recommendations: [
      'Interview complainant on reason for 3-day delay',
      'Check if scene was released before evidence collection',
    ],
  },
  {
    firId: 'FIR-2026-201',
    crossCheckId: 'cc_2026_003',
    status: 'running',
    findingsCount: 1,
    findings: [
      { dimension: 'filing-quality', severity: 'critical', description: 'Multiple required fields blank — FIR may not sustain in court', matchedFirs: [], confidence: 0.95 },
    ],
    recommendations: ['Initiate FIR rewriting protocol — return to complainant for补充 statement'],
  },
  {
    firId: 'FIR-2026-310',
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

const SEVERITY_COLOR = {
  critical: 'var(--pastel-red-text)',
  high: '#d97706',
  medium: 'var(--pastel-yellow-text)',
  low: 'var(--pastel-green-text)',
};

const AgentPanel = () => {
  const [selected, setSelected] = useState(0);
  const task = MOCK_CROSS_CHECKS[selected];
  const cfg = STATUS_CONFIG[task.status];

  return (
    <PanelCard title="Agentic Cross-Check" badge="AUTO INVESTIGATE">
      <PanelHeader
        subtitle="Autonomous cross-referencing engine — links FIRs, detects MO patterns, flags evidence gaps and filing anomalies"
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
            Agent Recommendations
          </div>
          {task.recommendations.map((r, i) => (
            <div key={i} style={{ padding: '8px 14px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
              {r}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
        Agent cross-check engine v1.0 · Automated analysis — verify findings before acting on recommendations.
      </div>
    </PanelCard>
  );
};

export default AgentPanel;
