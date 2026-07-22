import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable } from './panels';

// ponytail: mock data matching POST /countercrime/simulate response schema
const MOCK_SIMULATIONS = [
  {
    simulationId: 'sim_2026_001',
    params: { crimeType: 'theft', location: 'Bangalore Urban', timeRange: '2026-Q1', intensity: 1.5 },
    results: {
      projectedIncidents: 245,
      confidenceInterval: { lower: 198, upper: 292 },
      riskLevel: 'high',
      resourceRecommendation: 'Deploy 3 additional patrol units to Zone 4 during peak hours (6 PM – 10 PM)',
      hotspotAreas: [
        { name: 'MG Road', risk: 0.87 },
        { name: 'Commercial Street', risk: 0.72 },
        { name: 'Koramangala 5th Block', risk: 0.65 },
      ],
      interventions: [
        'Increase night patrols in hotspot areas',
        'Install CCTV at 5 key intersections',
        'Launch community watch program in Ward 12',
      ],
      topFactor: 'Seasonal spike in property crimes during festival season',
    },
  },
  {
    simulationId: 'sim_2026_002',
    params: { crimeType: 'robbery', location: 'Mysuru', timeRange: '2026-Q2', intensity: 2.0 },
    results: {
      projectedIncidents: 89,
      confidenceInterval: { lower: 67, upper: 111 },
      riskLevel: 'medium',
      resourceRecommendation: 'Establish fixed pickets at 2 highway entry points',
      hotspotAreas: [
        { name: 'Devaraja Mohalla', risk: 0.78 },
        { name: 'Mandakalli', risk: 0.61 },
      ],
      interventions: [
        'Highway patrol reinforcement',
        'Night patrol coverage on NH-275',
        'Coordinate with railway police',
      ],
      topFactor: 'Highway proximity enabling quick escape routes',
    },
  },
  {
    simulationId: 'sim_2026_003',
    params: { crimeType: 'cyber_fraud', location: 'Statewide', timeRange: '2026-Q3', intensity: 1.8 },
    results: {
      projectedIncidents: 156,
      confidenceInterval: { lower: 121, upper: 191 },
      riskLevel: 'critical',
      resourceRecommendation: 'Expand cyber cell by 5 officers; partner with banks for real-time alerts',
      hotspotAreas: [
        { name: 'Online — UPI fraud', risk: 0.91 },
        { name: 'Online — phishing', risk: 0.84 },
        { name: 'ATM skimming', risk: 0.55 },
      ],
      interventions: [
        'Public awareness campaign on UPI fraud',
        'Mandatory bank cooperation protocol',
        'Track IMEI of reported stolen devices',
      ],
      topFactor: 'Rapid adoption of digital payments outpacing fraud prevention',
    },
  },
];

const RISK_COLORS = {
  low: 'var(--pastel-green-text)',
  medium: 'var(--pastel-yellow-text)',
  high: '#d97706',
  critical: 'var(--pastel-red-text)',
};

const CounterCrimePanel = () => {
  const [simIndex, setSimIndex] = useState(0);
  const sim = MOCK_SIMULATIONS[simIndex];
  const r = sim.results;
  const riskStatus = r.riskLevel === 'critical' ? 'critical' : r.riskLevel === 'high' ? 'high' : r.riskLevel === 'medium' ? 'medium' : 'low';

  return (
    <PanelCard title="CounterCrime Simulator" badge="PREDICTIVE">
      <PanelHeader
        subtitle="What-if crime simulation — adjust parameters and see projected incident counts, hotspot shifts, and resource recommendations"
        action={
          <select
            value={simIndex}
            onChange={e => setSimIndex(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            {MOCK_SIMULATIONS.map((s, i) => (
              <option key={i} value={i}>{s.params.crimeType} — {s.params.location}</option>
            ))}
          </select>
        }
      />

      {/* params bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
        <ParamChip label="Crime" value={sim.params.crimeType} />
        <ParamChip label="Location" value={sim.params.location} />
        <ParamChip label="Period" value={sim.params.timeRange} />
        <ParamChip label="Intensity" value={`${sim.params.intensity}×`} />
      </div>

      {/* headline stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="Projected Incidents" value={r.projectedIncidents} sub={`${r.confidenceInterval.lower}–${r.confidenceInterval.upper} CI`} color={RISK_COLORS[r.riskLevel]} />
        <StatCard label="Risk Level" value={r.riskLevel.toUpperCase()} badge={<PanelBadge status={riskStatus} label={r.riskLevel.toUpperCase()} />} />
        <StatCard label="Top Factor" value={r.topFactor} small />
      </div>

      {/* hotspot areas */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Hotspot Areas</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {r.hotspotAreas.map((h, i) => (
            <div key={i} style={{ flex: '1 1 180px', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{h.name}</div>
              <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${h.risk * 100}%`, background: RISK_COLORS[r.riskLevel], borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Risk: {Math.round(h.risk * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* resource recommendation */}
      <div style={{ padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Resource Recommendation</div>
        <div style={{ fontSize: 14, color: 'var(--text)' }}>{r.resourceRecommendation}</div>
      </div>

      {/* interventions */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Suggested Interventions</div>
        <PanelTable headers={['#', 'Intervention']}>
          {r.interventions.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '8px 14px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12, width: 40 }}>{i + 1}</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text)' }}>{item}</td>
            </tr>
          ))}
        </PanelTable>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
        Simulation {sim.simulationId} · Projections are illustrative — use as decision support only.
      </div>
    </PanelCard>
  );
};

const ParamChip = ({ label, value }) => (
  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
    <span style={{ fontWeight: 600 }}>{label}:</span>{' '}
    <span style={{ color: 'var(--text)' }}>{value}</span>
  </div>
);

const StatCard = ({ label, value, sub, badge, color, small }) => (
  <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
    {badge || (
      <div style={{ fontSize: small ? 13 : 22, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
        {value}
      </div>
    )}
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

export default CounterCrimePanel;
