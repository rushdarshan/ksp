import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_ENTITIES, ACTIVE_CASE_FACTS, ACTIVE_CASE_TIMELINE } from './caseFacts';

export default function CaseOverview() {
  const { caseData } = useCaseContext();
  const stage = caseData?.fir_stage || 'Under Investigation';
  const crime = caseData?.CrimeGroup_Name || 'Robbery';
  const station = caseData?.UnitName || 'Brigade Road PS';
  const district = caseData?.DistrictName || 'Bengaluru';
  const recentTimeline = ACTIVE_CASE_TIMELINE.slice(0, 4);

  return (
    <div className="case-overview">
      {/* 30-Second Case Card */}
      <div className="case-overview__section">
        <div className="case-overview__heading">
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>30-Second Case Card</h3>
          <span style={{
            padding: '3px 10px', fontSize: 11, fontWeight: 700,
            background: '#f8717120', color: '#f87171', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{stage}</span>
        </div>

        <div className="case-overview__facts">
          {[
            { label: 'Crime', value: crime },
            { label: 'Incident', value: ACTIVE_CASE_FACTS.incidentDateLabel },
            { label: 'Location', value: ACTIVE_CASE_FACTS.location },
            { label: 'Investigating officer', value: ACTIVE_CASE_FACTS.investigatingOfficer },
            { label: 'Readiness', value: `${ACTIVE_CASE_FACTS.readiness}%` },
            { label: 'Statutory filing', value: `Due in ${ACTIVE_CASE_FACTS.filingDueDays} days` },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', background: '#f8717108', borderRadius: 8, border: '1px solid #f8717130', fontSize: 13, color: '#f87171' }}>
          <strong>Recommended next action:</strong> Acquire the identified CCTV footage, record its hash, and obtain the BSA Section 63 certificate. Continue at-large follow-up for Kiran Joseph.
        </div>
        <p className="case-overview__jurisdiction">{station} · {district}</p>
      </div>

      {/* Key Entities */}
      <div className="case-overview__section">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Key Entities</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACTIVE_CASE_ENTITIES.map((e) => (
            <div key={`${e.type}-${e.name}`} style={{
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
      <div className="case-overview__section">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Recent Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recentTimeline.map((t, i) => (
            <div key={`${t.date}-${t.label}`} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: i < recentTimeline.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, fontFamily: 'var(--font-mono)' }}>{t.date.slice(0, 10)}</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{t.label} - {t.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
