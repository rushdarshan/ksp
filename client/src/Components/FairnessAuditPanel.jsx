import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge, PanelTable, PanelChart } from './panels';

// ponytail: mock data matching POST /fairness/predictions/:model response schema
const MOCK_MODELS = [
  {
    model: 'arrest_prediction_v1',
    overallFairnessScore: 0.82,
    demographicParity: {
      'Urban': { positiveRate: 0.45, falsePositiveRate: 0.12, falseNegativeRate: 0.08, sampleSize: 4200 },
      'Rural': { positiveRate: 0.38, falsePositiveRate: 0.18, falseNegativeRate: 0.11, sampleSize: 2800 },
      'Semi-Urban': { positiveRate: 0.41, falsePositiveRate: 0.14, falseNegativeRate: 0.09, sampleSize: 1900 },
      'Tribal': { positiveRate: 0.33, falsePositiveRate: 0.22, falseNegativeRate: 0.15, sampleSize: 850 },
    },
    disparateImpactRatios: [
      { group: 'Urban vs Rural', ratio: 1.18, threshold: 0.8, status: 'pass' },
      { group: 'Urban vs Tribal', ratio: 1.36, threshold: 0.8, status: 'pass' },
      { group: 'Rural vs Tribal', ratio: 1.15, threshold: 0.8, status: 'pass' },
    ],
    flags: [
      'Tribal group shows elevated false negative rate (15%) — model may under-predict risk',
      'Rural false positive rate (18%) above Urban (12%) — investigate feature distribution',
    ],
  },
  {
    model: 'bail_recommendation_v2',
    overallFairnessScore: 0.68,
    demographicParity: {
      'General': { positiveRate: 0.62, falsePositiveRate: 0.09, falseNegativeRate: 0.06, sampleSize: 3500 },
      'SC/ST': { positiveRate: 0.48, falsePositiveRate: 0.16, falseNegativeRate: 0.14, sampleSize: 1200 },
      'OBC': { positiveRate: 0.55, falsePositiveRate: 0.11, falseNegativeRate: 0.10, sampleSize: 1800 },
      'Minority': { positiveRate: 0.51, falsePositiveRate: 0.13, falseNegativeRate: 0.12, sampleSize: 950 },
    },
    disparateImpactRatios: [
      { group: 'General vs SC/ST', ratio: 0.77, threshold: 0.8, status: 'fail' },
      { group: 'General vs Minority', ratio: 0.82, threshold: 0.8, status: 'pass' },
      { group: 'OBC vs SC/ST', ratio: 0.88, threshold: 0.8, status: 'pass' },
    ],
    flags: [
      'CRITICAL: General vs SC/ST ratio (0.77) below 0.8 threshold — potential disparate impact',
      'SC/ST false negative rate (14%) nearly double the General rate (6%)',
      'Model requires retraining with balanced class weights',
    ],
  },
];

const FairnessAuditPanel = () => {
  const [modelIndex, setModelIndex] = useState(0);
  const data = MOCK_MODELS[modelIndex];
  const groups = Object.entries(data.demographicParity);
  const overallStatus = data.overallFairnessScore >= 0.8 ? 'low' : data.overallFairnessScore >= 0.7 ? 'medium' : 'high';

  const chartSeries = [
    { name: 'Positive Rate', data: groups.map(([, g]) => +(g.positiveRate * 100).toFixed(1)) },
    { name: 'False Positive Rate', data: groups.map(([, g]) => +(g.falsePositiveRate * 100).toFixed(1)) },
    { name: 'False Negative Rate', data: groups.map(([, g]) => +(g.falseNegativeRate * 100).toFixed(1)) },
  ];

  const chartOptions = {
    xaxis: { categories: groups.map(([name]) => name) },
    yaxis: { title: { text: 'Rate (%)' } },
    colors: ['#1a3a5c', '#d97706', '#dc2626'],
    plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
  };

  return (
    <PanelCard title="Fairness Audit Dashboard" badge="ALGO TRANSPARENCY">
      <PanelHeader
        subtitle="Demographic parity analysis across prediction models — identifies disparate impact and bias signals"
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
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Fairness Score</div>
          <PanelBadge status={overallStatus} label={data.model} />
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
        <PanelTable headers={['Group', 'Positive Rate', 'FP Rate', 'FN Rate', 'Sample Size']}>
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
        Fairness analysis based on 30-day prediction logs · Disparate impact threshold: 0.8 (80% rule) · Audit generated {new Date().toLocaleDateString()}.
      </div>
    </PanelCard>
  );
};

export default FairnessAuditPanel;
