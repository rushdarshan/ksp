import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable } from './panels';

const MOCK_FIRS = [
  {
    firNo: 'KSP-2026-0142',
    station: 'Brigade Road PS',
    date: '2026-03-15',
    overallScore: 84,
    status: 'reviewed',
    dimensions: {
      completeness: { score: 88, suggestion: 'Core incident, people, and location fields are present' },
      consistency: { score: 91, suggestion: 'Recorded date and location fields align with the narrative' },
      timeliness: { score: 86, suggestion: 'Registration interval is documented in the case record' },
      specificity: { score: 87, suggestion: 'The SH-9 junction and stolen property are specifically described' },
      evidenceChain: { score: 54, suggestion: 'Record CCTV acquisition, hash, custody transfer, and certificate status' },
      legalReferences: { score: 82, suggestion: 'Have the investigating officer verify cited BNS and BNSS provisions' },
      witnessDetail: { score: 78, suggestion: 'Complete the pending witness examination record' },
      locationDetail: { score: 92, suggestion: 'Station, corridor, and junction references are present' },
      temporalDetail: { score: 90, suggestion: 'Incident and registration dates are present' },
      modusOperandi: { score: 76, suggestion: 'Review the chain-snatching descriptors before linking other FIRs' },
    },
  },
  {
    firNo: 'KSP-2026-0089',
    station: 'Brigade Road PS',
    date: '2026-02-28',
    overallScore: 58,
    status: 'fair',
    dimensions: {
      completeness: { score: 62, suggestion: 'Missing victim contact information' },
      consistency: { score: 55, suggestion: 'Timeline contradictions between para 3 and 5' },
      timeliness: { score: 70, suggestion: 'Filed 3 days after incident — acceptable for non-cognizable' },
      specificity: { score: 48, suggestion: 'Location described as "near the park" — needs exact address' },
      evidenceChain: { score: 40, suggestion: 'No physical evidence documented' },
      legalReferences: { score: 72, suggestion: 'Officer review is required to confirm the cited provisions and procedure' },
      witnessDetail: { score: 50, suggestion: 'Witness mentioned by name only — no address or contact' },
      locationDetail: { score: 52, suggestion: 'No map reference or GPS coordinates' },
      temporalDetail: { score: 65, suggestion: 'Time given as "evening" — narrow to hour range' },
      modusOperandi: { score: 58, suggestion: 'No MO analysis attempted' },
    },
  },
  {
    firNo: 'KSP-2026-0201',
    station: 'Mysuru North PS',
    date: '2026-04-05',
    overallScore: 34,
    status: 'poor',
    dimensions: {
      completeness: { score: 28, suggestion: 'Multiple required fields left blank' },
      consistency: { score: 32, suggestion: 'Contradictory statements about accused identity' },
      timeliness: { score: 45, suggestion: 'Filed 7 days late without explanation' },
      specificity: { score: 22, suggestion: 'Vague descriptions throughout — "some people", "a vehicle"' },
      evidenceChain: { score: 18, suggestion: 'No evidence collected or documented' },
      legalReferences: { score: 40, suggestion: 'The imported provision fields conflict and require officer review' },
      witnessDetail: { score: 25, suggestion: 'Witness name is "unknown person"' },
      locationDetail: { score: 30, suggestion: 'No identifiable location details' },
      temporalDetail: { score: 38, suggestion: 'Date approximate, no time reference' },
      modusOperandi: { score: 35, suggestion: 'No MO analysis' },
    },
  },
];

const scoreColor = (s) => {
  if (s >= 80) return 'var(--pastel-green-text)';
  if (s >= 50) return 'var(--pastel-yellow-text)';
  return 'var(--pastel-red-text)';
};

const FirQualityPanel = () => {
  const [selected, setSelected] = useState(0);
  const fir = MOCK_FIRS[selected];
  const dims = Object.entries(fir.dimensions);

  return (
    <PanelCard title="FIR Documentation Review" badge="HEURISTIC">
      <PanelHeader
        subtitle="Checks documentation completeness and consistency without assessing truth, guilt, or legal sufficiency"
        action={
          <select
            value={selected}
            onChange={e => setSelected(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            {MOCK_FIRS.map((f, i) => (
              <option key={i} value={i}>{f.firNo} — {f.station}</option>
            ))}
          </select>
        }
      />

      {/* overall score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '14px 18px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: `3px solid ${scoreColor(fir.overallScore)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: scoreColor(fir.overallScore),
        }}>
          {fir.overallScore}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Documentation Signal</div>
          <PanelBadge
            status={fir.overallScore >= 80 ? 'low' : fir.overallScore >= 50 ? 'medium' : 'high'}
            label={fir.overallScore >= 80 ? 'DOCUMENTED' : fir.overallScore >= 50 ? 'REVIEW' : 'INCOMPLETE'}
          />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{fir.firNo} · {fir.station} · {fir.date}</div>
        </div>
      </div>

      {/* dimension bars */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Dimension Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
          {dims.map(([key, d]) => (
            <div key={key} style={{ padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(d.score), fontFamily: 'var(--font-mono)' }}>{d.score}</span>
              </div>
              <div style={{ height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.score}%`, background: scoreColor(d.score), borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* suggestions table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Improvement Suggestions
        </div>
        <PanelTable headers={['Dimension', 'Score', 'Suggestion']}>
          {dims.map(([key, d]) => (
            <tr key={key}>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
              <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: scoreColor(d.score), fontFamily: 'var(--font-mono)' }}>{d.score}</td>
              <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{d.suggestion}</td>
            </tr>
          ))}
        </PanelTable>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
        Deterministic demo heuristic. Scores describe record quality only and are not findings of truth, guilt, or legal compliance.
      </div>
    </PanelCard>
  );
};

export default FirQualityPanel;
