import React from 'react';
import { useCaseContext } from './CaseWorkspace';

const MOCK_ENTITIES = [
  { type: 'Person', name: 'Ravi Kumar', role: 'Prime Suspect' },
  { type: 'Phone', name: '98450XXXXX', role: 'Suspect CDR' },
  { type: 'Vehicle', name: 'KA-01-AB-1234', role: 'Crime Vehicle' },
];

const MOCK_TIMELINE = [
  { date: '2026-07-06', event: 'FIR registered — Robbery at SH-9 junction' },
  { date: '2026-07-07', event: 'CCTV footage collected from junction camera' },
  { date: '2026-07-08', event: 'Suspect vehicle identified — KA-01-AB-1234' },
  { date: '2026-07-09', event: 'CDR analysis initiated for suspect phone' },
];

export default function CaseOverview() {
  const { caseData, firId } = useCaseContext();
  const stage = caseData?.fir_stage || 'Under Investigation';
  const crime = caseData?.CrimeGroup_Name || 'Robbery';
  const station = caseData?.UnitName || 'Brigade Road PS';
  const district = caseData?.DistrictName || 'Bengaluru';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 30-Second Case Card */}
      <div style={{
        padding: 24, background: 'var(--surface)', borderRadius: 12,
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>30-Second Case Card</h3>
          <span style={{
            padding: '3px 10px', fontSize: 11, fontWeight: 700,
            background: '#f8717120', color: '#f87171', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{stage}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Crime', value: crime },
            { label: 'Station', value: station },
            { label: 'District', value: district },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', background: '#f8717108', borderRadius: 8, border: '1px solid #f8717130', fontSize: 13, color: '#f87171' }}>
          <strong>Recommended Next Action:</strong> Complete CDR analysis for suspect phone. Section 65B certificate pending for CCTV evidence.
        </div>
      </div>

      {/* Key Entities */}
      <div style={{
        padding: 24, background: 'var(--surface)', borderRadius: 12,
        border: '1px solid var(--border-light)',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Key Entities</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_ENTITIES.map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'var(--surface-alt)', borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: e.type === 'Person' ? 'var(--color-blue-400)20' : e.type === 'Phone' ? '#a78bfa20' : '#f59e0b20',
                color: e.type === 'Person' ? 'var(--color-blue-400)' : e.type === 'Phone' ? '#a78bfa' : '#f59e0b',
              }}>{e.type}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{e.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Timeline */}
      <div style={{
        padding: 24, background: 'var(--surface)', borderRadius: 12,
        border: '1px solid var(--border-light)',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Recent Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MOCK_TIMELINE.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: i < MOCK_TIMELINE.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, fontFamily: 'monospace' }}>{t.date}</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{t.event}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
