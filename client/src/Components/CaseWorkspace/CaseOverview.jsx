import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_ENTITIES, ACTIVE_CASE_FACTS, ACTIVE_CASE_TIMELINE } from './caseFacts';
import { bridgeEvents } from '../../utils/bridgeEvents';
import { useI18n } from '../../utils/i18n';

export default function CaseOverview() {
  const { caseData } = useCaseContext();
  const { t } = useI18n();
  const stage = caseData?.fir_stage || 'Under Investigation';
  const crime = caseData?.CrimeGroup_Name || 'Robbery';
  const station = caseData?.UnitName || 'Brigade Road PS';
  const district = caseData?.DistrictName || 'Bengaluru';
  const recentTimeline = ACTIVE_CASE_TIMELINE.slice(0, 4);

  const askZia = (query) => {
    bridgeEvents.emit('query-from-dashboard', query);
  };

  return (
    <div className="case-overview">
      {/* 30-Second Case Card */}
      <div className="case-overview__section">
        <div className="case-overview__heading">
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{t('cardTitle')}</h3>
          <span style={{
            padding: '3px 10px', fontSize: 11, fontWeight: 700,
            background: '#f8717120', color: '#f87171', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{stage}</span>
        </div>

        <div className="case-overview__facts">
          {[
            { label: t('crime'), value: crime },
            { label: t('incident'), value: ACTIVE_CASE_FACTS.incidentDateLabel },
            { label: t('location'), value: ACTIVE_CASE_FACTS.location },
            { label: t('io'), value: ACTIVE_CASE_FACTS.investigatingOfficer },
            { label: t('readiness'), value: `${ACTIVE_CASE_FACTS.readiness}%`, query: 'How is case readiness calculated?' },
            { label: t('filing'), value: `Due in ${ACTIVE_CASE_FACTS.filingDueDays} days`, query: 'What are the legal statutory limits for this case?' },
          ].map(item => (
            <div 
              key={item.label}
              onClick={() => item.query && askZia(item.query)}
              style={{ cursor: item.query ? 'pointer' : 'default' }}
              title={item.query ? 'Click to ask ZIA' : ''}
            >
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', textDecoration: item.query ? 'underline dashed var(--border-light)' : 'none' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div 
          onClick={() => askZia(`What is the recommended next action for FIR ${caseData?.CrimeNo || 'KSP-2026-0142'}?`)}
          style={{ 
            padding: '12px 16px', 
            background: '#f8717108', 
            borderRadius: 8, 
            border: '1px solid #f8717130', 
            fontSize: 13, 
            color: '#f87171', 
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          title="Click to ask ZIA about this action"
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8717112'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8717108'}
        >
          <strong>{t('recommendedNext')}</strong> Acquire the identified CCTV footage, record its hash, and obtain the BSA Section 63 certificate. Continue at-large follow-up for Kiran Joseph.
        </div>
        <p className="case-overview__jurisdiction">{station} · {district}</p>
      </div>

      {/* Key Entities */}
      <div className="case-overview__section">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t('keyEntities')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACTIVE_CASE_ENTITIES.map((e) => (
            <div 
              key={`${e.type}-${e.name}`} 
              onClick={() => askZia(`Tell me about key entity ${e.name} (${e.role}) and their link to other suspects`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: 'var(--surface-alt)', borderRadius: 8,
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              title="Click to analyze entity with ZIA"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
            >
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
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t('recentTimeline')}</h3>
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
