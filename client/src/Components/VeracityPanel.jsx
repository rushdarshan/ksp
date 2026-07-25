import { useState, useEffect } from 'react';
import { PanelCard, PanelHeader, PanelTable, PanelBadge } from './panels';
import apiFetch from '../utils/apiFetch';

const PRESET_FIRS = {
  detailed: {
    narrative: 'On 15 March 2026 at approximately 8:30 PM, I was returning home from my shop on MG Road. Two men on a motorcycle approached me. One of them pointed a knife at me and demanded my bag. I clearly saw their faces — one had a scar on his left cheek, the other was wearing a red helmet. They took my bag containing Rs. 15,000 cash and my phone. I immediately went to the nearest police station and filed this report. I remember the motorcycle registration started with KA-01.',
    complainantName: 'Rajesh Kumar',
    accusedCount: 2,
    hasWitnesses: true,
    delayReason: '',
    propertyValue: 25000
  },
  sparse: {
    narrative: 'Someone stole my phone yesterday. I think it was the guy who lives next door. He has been bothering me for a while. He is a bad person. The phone is expensive and I need it back. The police should do something about it. This is a serious matter and I want action taken immediately.',
    complainantName: 'Anonymous',
    accusedCount: 0,
    hasWitnesses: false,
    delayReason: 'Busy',
    propertyValue: 500000
  }
};

const VeracityPanel = ({
  initialNarrative = '',
  initialComplainantName = '',
  initialAccusedCount = '',
  initialHasWitnesses = false,
  initialDelayReason = '',
  initialPropertyValue = '',
  autoAnalyze = false
}) => {
  const [narrative, setNarrative] = useState(initialNarrative);
  const [complainantName, setComplainantName] = useState(initialComplainantName);
  const [accusedCount, setAccusedCount] = useState(initialAccusedCount);
  const [hasWitnesses, setHasWitnesses] = useState(initialHasWitnesses);
  const [delayReason, setDelayReason] = useState(initialDelayReason);
  const [propertyValue, setPropertyValue] = useState(initialPropertyValue);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state if props change
  useEffect(() => {
    setNarrative(initialNarrative);
    setComplainantName(initialComplainantName);
    setAccusedCount(initialAccusedCount);
    setHasWitnesses(initialHasWitnesses);
    setDelayReason(initialDelayReason);
    setPropertyValue(initialPropertyValue);
  }, [initialNarrative, initialComplainantName, initialAccusedCount, initialHasWitnesses, initialDelayReason, initialPropertyValue]);

  const analyze = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/veracity_index/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res || !res.ok) throw new Error(`Server error: ${res?.status || 'network error'}`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto analyze on mount or narrative change if requested
  useEffect(() => {
    if (autoAnalyze && initialNarrative) {
      analyze({
        narrative: initialNarrative,
        complainantName: initialComplainantName,
        accusedCount: parseInt(initialAccusedCount) || 0,
        hasWitnesses: initialHasWitnesses,
        delayReason: initialDelayReason,
        propertyValue: parseInt(initialPropertyValue) || 0
      });
    }
  }, [
    autoAnalyze,
    initialAccusedCount,
    initialComplainantName,
    initialDelayReason,
    initialHasWitnesses,
    initialNarrative,
    initialPropertyValue,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyze({ narrative, complainantName, accusedCount: parseInt(accusedCount) || 0, hasWitnesses, delayReason, propertyValue: parseInt(propertyValue) || 0 });
  };

  const loadPreset = (type) => {
    const p = PRESET_FIRS[type];
    setNarrative(p.narrative);
    setComplainantName(p.complainantName);
    setAccusedCount(String(p.accusedCount));
    setHasWitnesses(p.hasWitnesses);
    setDelayReason(p.delayReason);
    setPropertyValue(String(p.propertyValue));
  };

  const scoreColor = (s) => {
    if (s >= 0.7) return 'var(--pastel-green-text)';
    if (s >= 0.4) return 'var(--pastel-yellow-text)';
    return 'var(--pastel-red-text)';
  };

  const scoreStatus = (s) => {
    if (s >= 0.7) return 'low';
    if (s >= 0.4) return 'medium';
    return 'high';
  };

  return (
    <PanelCard title="FIR Narrative Quality" badge="DECISION SUPPORT">
      <PanelHeader
        subtitle="Reviews documentation specificity and completeness. It does not determine whether a report is true or whether a person is guilty."
        action={
          <div className="veracity-presets" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadPreset('detailed')} style={btnStyle}>Detailed sample</button>
            <button onClick={() => loadPreset('sparse')} style={{ ...btnStyle, color: 'var(--pastel-red-text)' }}>Sparse sample</button>
          </div>
        }
      />

      <form className="veracity-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={narrative}
          onChange={e => setNarrative(e.target.value)}
          placeholder="Enter FIR narrative..."
          rows={6}
          style={inputStyle}
          required
        />
        <div className="veracity-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input aria-label="Complainant name" value={complainantName} onChange={e => setComplainantName(e.target.value)} placeholder="Complainant name" style={inputStyle} />
          <input aria-label="Accused count" value={accusedCount} onChange={e => setAccusedCount(e.target.value)} placeholder="Accused count" type="number" style={inputStyle} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={hasWitnesses} onChange={e => setHasWitnesses(e.target.checked)} /> Witnesses
          </label>
          <input aria-label="Property value" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="Property value (Rs.)" type="number" style={inputStyle} />
        </div>
        <input aria-label="Delay reason" value={delayReason} onChange={e => setDelayReason(e.target.value)} placeholder="Delay reason (if any)" style={inputStyle} />
        <button type="submit" disabled={loading} style={{ ...btnStyle, color: 'var(--accent)', fontWeight: 600 }}>
          {loading ? 'Reviewing...' : 'Review narrative quality'}
        </button>
      </form>

      {error && <div style={{ color: 'var(--pastel-red-text)', marginTop: '16px', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)' }}>Error: {error}</div>}

      {result && (() => {
        const finalScore = result.veracityScore !== undefined ? result.veracityScore : result.score || 0;
        return (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{
                width: '80px', height: '80px', border: `2px solid ${scoreColor(finalScore)}`,
                borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.25rem',
                color: scoreColor(finalScore)
              }}>
                {Math.round(finalScore * 100)}%
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Documentation signal</div>
                <PanelBadge status={scoreStatus(finalScore)} label={finalScore >= 0.7 ? 'MORE COMPLETE' : finalScore >= 0.45 ? 'NEEDS REVIEW' : 'SPARSE RECORD'} />
              </div>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--pastel-yellow)', color: 'var(--pastel-yellow-text)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-sub)' }}>
              Human review required. A sparse narrative may reflect trauma, language, disability, or limited access to information and must never reduce investigative attention by itself.
            </div>

            {result.flags && result.flags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: 'var(--size-caption)', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--accent)', marginBottom: '8px' }}>
                  Flags ({result.flags.length})
                </div>
                {result.flags.map((f, i) => (
                  <div key={i} style={{ padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', marginBottom: '4px', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)' }}>
                    {typeof f === 'object' ? f.description : f}
                  </div>
                ))}
              </div>
            )}

            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                LINGUISTIC DETAILS
              </summary>
              <PanelTable headers={['Metric', 'Value']}>
                {Object.entries(result.details || {}).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>
                      {k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {typeof v === 'number' ? v.toFixed(3) : v}
                    </td>
                  </tr>
                ))}
              </PanelTable>
            </details>

            {result.ziaAssessment && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)' }}>
                ZIA REVIEW NOTE: {result.ziaAssessment}
              </div>
            )}
          </div>
        );
      })()}
    </PanelCard>
  );
};

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--size-body)',
  fontFamily: 'var(--font-body)',
  background: 'var(--surface)',
  color: 'var(--text)',
};

const btnStyle = {
  padding: '8px 16px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--size-sub)',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--text-secondary)',
};

export default VeracityPanel;
