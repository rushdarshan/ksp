import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCaseContext } from './caseContext';
import { useI18n } from '../../utils/i18n';

const INITIAL_RECOMMENDATIONS = [
  {
    id: 'REC-001',
    recommendation: 'Acquire and hash CCTV footage for Brigade Road intersection',
    system: 'Evidence Gap Detector',
    status: 'Pending',
    rationale: 'Junction camera feeds are at risk of being overwritten after 30 days.'
  },
  {
    id: 'REC-002',
    recommendation: 'Request BSA Section 63 electronic signature certificate for digital phone records',
    system: 'Filing Compliance Engine',
    status: 'Pending',
    rationale: 'Required by the Bhartiya Sakshya Adhiniyam guidelines for admissibility of digital records.'
  },
  {
    id: 'REC-003',
    recommendation: 'Issue warrant tracker for Kiran Joseph (co-accused cluster correlation)',
    system: 'Predictive Network Linker',
    status: 'Pending',
    rationale: 'Accused identified at 94% match in M G Road theft syndicate network.'
  }
];

export default function DecisionLog() {
  const { firId } = useCaseContext();
  const { t } = useI18n();
  const [recs, setRecs] = useState(INITIAL_RECOMMENDATIONS);
  const [overrideId, setOverrideId] = useState(null);
  const [reason, setReason] = useState('');
  const [logs, setLogs] = useState([
    {
      ts: new Date(Date.now() - 1000 * 60 * 45).toLocaleString(),
      action: 'System generated 3 compliance recommendations.',
      officer: 'System',
      details: 'Based on automated analysis of FIR KSP-2026-0142.'
    }
  ]);

  const handleAction = (id, newStatus, overrideReason = '') => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, overrideReason } : r));
    const recName = recs.find(r => r.id === id)?.recommendation;
    
    // Add to audit trail log
    const newLog = {
      ts: new Date().toLocaleString(),
      action: `Officer ${newStatus === 'Approved' ? 'approved' : newStatus === 'Dismissed' ? 'dismissed' : 'overrode'} recommendation ${id}`,
      officer: 'Inspector Girish (KSP-4390)',
      details: overrideReason ? `Reason: "${overrideReason}"` : `Action: ${newStatus} recommendation to "${recName}"`
    };
    setLogs(prev => [newLog, ...prev]);

    if (newStatus === 'Overridden') {
      toast.error(`Audit log updated: Recommendation ${id} overrode. Reason recorded: "${overrideReason}"`, {
        position: 'bottom-right',
        duration: 4000
      });
      setOverrideId(null);
      setReason('');
    } else {
      toast.success(`Audit log updated: Recommendation ${id} ${newStatus.toLowerCase()}`, {
        position: 'bottom-right'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div className="panel-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <div>
          <h3 className="panel-title" style={{ margin: 0, fontSize: '16px' }}>Decision Log & Audit Trail — {firId}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total officer accountability. AI recommendations require human approval before statutory submission.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {recs.map(r => (
          <div key={r.id} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-blue-400)', fontWeight: 700 }}>{r.system} · {r.id}</span>
                <h4 style={{ margin: '4px 0 6px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{r.recommendation}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}><strong>Rationale:</strong> {r.rationale}</p>
                {r.overrideReason && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#f87171', padding: '6px 10px', background: '#f8717110', borderRadius: '4px', border: '1px solid #f8717130' }}>
                    <strong>Officer Override Reason:</strong> "{r.overrideReason}"
                  </p>
                )}
              </div>
              <div>
                <span className={`badge ${r.status === 'Pending' ? 'badge--warning' : r.status === 'Approved' ? 'badge--clear' : 'badge--critical'}`}>
                  {r.status}
                </span>
              </div>
            </div>

            {r.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button 
                  onClick={() => handleAction(r.id, 'Approved')}
                  style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--color-blue-400)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Approve Recommendation
                </button>
                <button 
                  onClick={() => handleAction(r.id, 'Dismissed')}
                  style={{ padding: '6px 14px', fontSize: '12px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => setOverrideId(r.id)}
                  style={{ padding: '6px 14px', fontSize: '12px', background: 'transparent', color: '#f87171', border: '1px solid #f8717150', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Override Suggestion
                </button>
              </div>
            )}

            {overrideId === r.id && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-alt)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Provide Audit Justification for Override:</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. Awaiting court warrant / CCTV footage stored on external drive" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--surface)' }}
                  />
                  <button 
                    disabled={!reason.trim()}
                    onClick={() => handleAction(r.id, 'Overridden', reason)}
                    style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Log Override
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Audit Trail Log (Traceable History)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
          {logs.map((l, idx) => (
            <div key={idx} style={{ padding: '10px', background: 'var(--surface-alt)', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px' }}>
                <span>{l.officer}</span>
                <span>{l.ts}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{l.action}</div>
              {l.details && <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>{l.details}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
