import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable, PanelChart } from './panels';

// ponytail: mock data matching POST /fairness/predictions/:model response schema
const MOCK_MODELS = [
  {
    model: 'patrol_demand_forecast_demo',
    overallFairnessScore: 0.82,
    demographicParity: {
      'Bengaluru core': { positiveRate: 0.45, falsePositiveRate: 0.12, falseNegativeRate: 0.08, sampleSize: 4200 },
      'Bengaluru periphery': { positiveRate: 0.38, falsePositiveRate: 0.18, falseNegativeRate: 0.11, sampleSize: 2800 },
      'Tier-2 cities': { positiveRate: 0.41, falsePositiveRate: 0.14, falseNegativeRate: 0.09, sampleSize: 1900 },
      'Rural stations': { positiveRate: 0.33, falsePositiveRate: 0.22, falseNegativeRate: 0.15, sampleSize: 850 },
    },
    disparateImpactRatios: [
      { group: 'Periphery vs core', ratio: 0.84, threshold: 0.8, status: 'pass' },
      { group: 'Rural stations vs core', ratio: 0.73, threshold: 0.8, status: 'fail' },
      { group: 'Rural stations vs periphery', ratio: 0.87, threshold: 0.8, status: 'pass' },
    ],
    flags: [
      'Rural-station holdout shows elevated miss rate (15%); deployment threshold requires review',
      'Periphery false-alert rate (18%) exceeds the core holdout (12%); inspect reporting-volume features',
    ],
  },
  {
    model: 'case_readiness_triage_demo',
    overallFairnessScore: 0.68,
    demographicParity: {
      'Kannada records': { positiveRate: 0.62, falsePositiveRate: 0.09, falseNegativeRate: 0.06, sampleSize: 3500 },
      'English records': { positiveRate: 0.48, falsePositiveRate: 0.16, falseNegativeRate: 0.14, sampleSize: 1200 },
      'Bilingual records': { positiveRate: 0.55, falsePositiveRate: 0.11, falseNegativeRate: 0.10, sampleSize: 1800 },
      'Translated records': { positiveRate: 0.51, falsePositiveRate: 0.13, falseNegativeRate: 0.12, sampleSize: 950 },
    },
    disparateImpactRatios: [
      { group: 'Kannada vs English', ratio: 0.77, threshold: 0.8, status: 'fail' },
      { group: 'Kannada vs translated', ratio: 0.82, threshold: 0.8, status: 'pass' },
      { group: 'Bilingual vs English', ratio: 0.88, threshold: 0.8, status: 'pass' },
    ],
    flags: [
      'English-record flag ratio (0.77) is below the demonstration threshold',
      'English-record miss rate (14%) is materially above the Kannada holdout (6%)',
      'Do not deploy until language-balanced validation and error review are complete',
    ],
  },
];

const FairnessAuditPanel = () => {
  const [modelIndex, setModelIndex] = useState(0);
  const data = MOCK_MODELS[modelIndex];
  const groups = Object.entries(data.demographicParity);
  const overallStatus = data.overallFairnessScore >= 0.8 ? 'low' : data.overallFairnessScore >= 0.7 ? 'medium' : 'high';

  const chartSeries = [
    { name: 'Flag Rate', data: groups.map(([, g]) => +(g.positiveRate * 100).toFixed(1)) },
    { name: 'False Positive Rate', data: groups.map(([, g]) => +(g.falsePositiveRate * 100).toFixed(1)) },
    { name: 'False Negative Rate', data: groups.map(([, g]) => +(g.falseNegativeRate * 100).toFixed(1)) },
  ];

  const chartOptions = {
    xaxis: { categories: groups.map(([name]) => name) },
    yaxis: { title: { text: 'Rate (%)' } },
    colors: ['var(--accent)', 'var(--color-amber)', 'var(--color-red)'],
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
  };

  return (
    <PanelCard title="Model Parity Review" badge="SYNTHETIC HOLDOUT">
      <PanelHeader
        subtitle="Post-hoc error analysis across geography and language cohorts. Cohort labels are audit attributes, not model inputs."
        action={
          <select
            value={modelIndex}
            onChange={e => setModelIndex(Number(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            {MOCK_MODELS.map((m, i) => (
              <option key={i} value={i}>{m.model}</option>
            ))}
          </select>
        }
      />

      {/* overall score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '14px 18px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: `3px solid ${overallStatus === 'low' ? 'var(--pastel-green-text)' : overallStatus === 'medium' ? 'var(--pastel-yellow-text)' : 'var(--pastel-red-text)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: overallStatus === 'low' ? 'var(--pastel-green-text)' : overallStatus === 'medium' ? 'var(--pastel-yellow-text)' : 'var(--pastel-red-text)',
        }}>
          {Math.round(data.overallFairnessScore * 100)}%
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Parity review score</div>
          <PanelBadge status={overallStatus} label="REVIEW REQUIRED" />
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{data.model}</div>
        </div>
      </div>

      {/* chart */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          Rates by Demographic Group
        </div>
        <PanelChart type="bar" series={chartSeries} options={chartOptions} height={280} />
      </div>

      {/* demographic parity table */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Demographic Parity Metrics
        </div>
        <PanelTable headers={['Audit cohort', 'Flag Rate', 'False Alert', 'Miss Rate', 'Sample Size']}>
          {groups.map(([name, g]) => (
            <tr key={name}>
              <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{name}</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{(g.positiveRate * 100).toFixed(1)}%</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: g.falsePositiveRate > 0.15 ? 'var(--pastel-red-text)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{(g.falsePositiveRate * 100).toFixed(1)}%</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: g.falseNegativeRate > 0.12 ? 'var(--pastel-red-text)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{(g.falseNegativeRate * 100).toFixed(1)}%</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{g.sampleSize.toLocaleString()}</td>
            </tr>
          ))}
        </PanelTable>
      </div>

      {/* disparate impact ratios */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Disparate Impact Ratios
        </div>
        <PanelTable headers={['Comparison', 'Ratio', 'Threshold', 'Status']}>
          {data.disparateImpactRatios.map((d, i) => (
            <tr key={i}>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text)' }}>{d.group}</td>
              <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: d.status === 'fail' ? 'var(--pastel-red-text)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{d.ratio.toFixed(2)}</td>
              <td style={{ padding: '8px 14px', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.threshold}</td>
              <td style={{ padding: '8px 14px' }}>
                <PanelBadge status={d.status === 'pass' ? 'low' : 'high'} label={d.status.toUpperCase()} />
              </td>
            </tr>
          ))}
        </PanelTable>
      </div>

      {/* flags */}
      {data.flags.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pastel-red-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Flags ({data.flags.length})
          </div>
          {data.flags.map((f, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {f}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
        Synthetic 30-day holdout · Thresholds are demonstration controls, not proof of fairness · Audit snapshot 22 Jul 2026.
      </div>
    </PanelCard>
  );
};

export default FairnessAuditPanel;
