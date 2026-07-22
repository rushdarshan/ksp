import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable } from './panels';

// ponytail: mock data matching POST /fir-quality/score/:firId response schema
const MOCK_FIRS = [
  {
    firNo: 'FIR-2026-142',
    station: 'Koramangala PS',
    date: '2026-03-12',
    overallScore: 91,
    status: 'good',
    dimensions: {
      completeness: { score: 95, suggestion: 'Narrative includes all essential elements' },
      consistency: { score: 92, suggestion: 'Details align across sections' },
      timeliness: { score: 88, suggestion: 'Filed within 24 hours — acceptable' },
      specificity: { score: 90, suggestion: 'Specific locations, times, and descriptions provided' },
      evidenceChain: { score: 85, suggestion: 'CCTV footage referenced; chain of custody documented' },
      legalCompliance: { score: 94, suggestion: 'BNS sections correctly cited' },
      witnessDetail: { score: 88, suggestion: 'Two witnesses named with contact details' },
      locationDetail: { score: 93, suggestion: 'GPS coordinates and landmark references included' },
      temporalDetail: { score: 91, suggestion: 'Precise time windows with corroborating evidence' },
      modusOperandi: { score: 86, suggestion: 'Modus operandi pattern matches known MO database' },
    },
  },
  {
    firNo: 'FIR-2026-087',
    station: 'HSR Layout PS',
    date: '2026-02-28',
    overallScore: 58,
    status: 'fair',
    dimensions: {
      completeness: { score: 62, suggestion: 'Missing victim contact information' },
      consistency: { score: 55, suggestion: 'Timeline contradictions between para 3 and 5' },
      timeliness: { score: 70, suggestion: 'Filed 3 days after incident — acceptable for non-cognizable' },
      specificity: { score: 48, suggestion: 'Location described as "near the park" — needs exact address' },
      evidenceChain: { score: 40, suggestion: 'No physical evidence documented' },
      legalCompliance: { score: 72, suggestion: 'Section cited is cognizable but procedure followed non-cognizable path' },
      witnessDetail: { score: 50, suggestion: 'Witness mentioned by name only — no address or contact' },
      locationDetail: { score: 52, suggestion: 'No map reference or GPS coordinates' },
      temporalDetail: { score: 65, suggestion: 'Time given as "evening" — narrow to hour range' },
      modusOperandi: { score: 58, suggestion: 'No MO analysis attempted' },
    },
  },
  {
    firNo: 'FIR-2026-201',
    station: 'Indiranagar PS',
    date: '2026-04-05',
    overallScore: 34,
    status: 'poor',
    dimensions: {
      completeness: { score: 28, suggestion: 'Multiple required fields left blank' },
      consistency: { score: 32, suggestion: 'Contradictory statements about accused identity' },
      timeliness: { score: 45, suggestion: 'Filed 7 days late without explanation' },
      specificity: { score: 22, suggestion: 'Vague descriptions throughout — "some people", "a vehicle"' },
      evidenceChain: { score: 18, suggestion: 'No evidence collected or documented' },
      legalCompliance: { score: 40, suggestion: 'Wrong BNS section — should be 303 not 304' },
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
    <PanelCard title="FIR Quality Scorer" badge="10-DIMENSION">
      <PanelHeader
        subtitle="Automated quality audit of FIR narratives — scores 10 dimensions and suggests improvements"
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
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Quality Score</div>
          <PanelBadge
            status={fir.status === 'good' ? 'low' : fir.status === 'fair' ? 'medium' : 'high'}
            label={fir.status.toUpperCase()}
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
        Scores generated by FIR Quality Engine v2.1 · Use as guidance for FIR improvement — not a legal assessment.
      </div>
    </PanelCard>
  );
};

export default FirQualityPanel;
