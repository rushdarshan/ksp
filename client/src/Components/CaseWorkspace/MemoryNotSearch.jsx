import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ponytail: hardcoded mock, swap for API when backend is ready
const MOCK_SIMILAR_CASES = [
  {
    caseId: 'KSP-2026-0098',
    crimeType: 'Robbery',
    station: 'Koramangala PS',
    overlapCount: 3,
    overlapEntities: ['Robbery pattern', 'Urban junction', 'Evening patrol zone'],
    crossStation: false,
  },
  {
    caseId: 'KSP-2026-0301',
    crimeType: 'Robbery',
    station: 'Whitefield PS',
    overlapCount: 2,
    overlapEntities: ['Offence category', 'Urban corridor'],
    crossStation: true,
  },
];

export default function MemoryNotSearch({ firId = 'KSP-2026-0142' }) {
  const navigate = useNavigate();
  const [accessRequested, setAccessRequested] = useState({});

  if (!MOCK_SIMILAR_CASES.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
        No cross-case connections found
      </div>
    );
  }

  const handleRequestAccess = (caseId) => {
    setAccessRequested(prev => ({ ...prev, [caseId]: true }));
    // ponytail: console log as audit entry, replace with real API call
    console.log(`[audit] Access requested for cross-station case ${caseId} from ${firId} at ${new Date().toISOString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Similar case review</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
          Pattern signals for officer review; no direct relationship is established
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
        {MOCK_SIMILAR_CASES.map((sc) => (
          <div
            key={sc.caseId}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt, #f8f8f8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span
                onClick={() => sc.crossStation && !accessRequested[sc.caseId] ? null : navigate(`/dashboard/case/${sc.caseId}`)}
                style={{
                  fontSize: 13, fontWeight: 700, color: sc.crossStation && !accessRequested[sc.caseId] ? 'var(--text-secondary)' : 'var(--accent)',
                  textDecoration: sc.crossStation && !accessRequested[sc.caseId] ? 'none' : 'underline',
                  cursor: 'pointer',
                }}
              >{sc.caseId}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px',
                background: '#f59e0b20', color: '#f59e0b', borderRadius: 6,
              }}>{sc.overlapCount} overlap</span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {sc.crimeType} · {sc.station}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: sc.crossStation ? 6 : 0 }}>
              {sc.overlapEntities.map(e => (
                <span key={e} style={{
                  fontSize: 11, padding: '1px 6px', borderRadius: 4,
                  background: 'var(--surface)', border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                }}>{e}</span>
              ))}
            </div>

            {sc.crossStation && (
              accessRequested[sc.caseId] ? (
                <div style={{ fontSize: 11, color: 'var(--color-green-alt)', fontWeight: 600, marginTop: 4 }}>
                  ✓ Access requested — pending approval
                </div>
              ) : (
                <button
                  onClick={() => handleRequestAccess(sc.caseId)}
                  style={{
                    marginTop: 4, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                    background: 'transparent', color: 'var(--color-red-soft)',
                    border: '1px solid var(--color-red-soft)', borderRadius: 6, cursor: 'pointer',
                  }}
                >Request Access</button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
