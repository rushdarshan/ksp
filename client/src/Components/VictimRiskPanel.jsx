import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const VictimRiskPanel = () => {
    const [searchParams] = useSearchParams();
    const [victimId, setVictimId] = useState(searchParams.get('name') || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [highRiskVictims, setHighRiskVictims] = useState(null);

    const search = async () => {
        if (!victimId.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/server/victim_risk_shield/score/${encodeURIComponent(victimId.trim())}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json = await res.json();
            setResult(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadHighRisk = async () => {
        setLoading(true);
        try {
            const res = await fetch('/server/victim_risk_shield/high-risk');
            const json = await res.json();
            setHighRiskVictims(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (searchParams.get('name')) search() }, [])

    const riskColor = (level) => {
        switch (level) {
            case 'High': return '#dc2626';
            case 'Medium': return '#f59e0b';
            default: return '#22c55e';
        }
    };

    return (
        <div className="panel" style={{ padding: '20px', maxWidth: '900px' }}>
            <h2>🛡️ Victim Risk Shield</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Automated repeat victimization risk scoring. ProVict-style model adapted for Karnataka Police.
                Every FIR is scored for victim revictimization risk — no existing Indian police platform does this.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Search Victim</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={victimId} onChange={e => setVictimId(e.target.value)}
                            placeholder="Enter Victim ID (e.g., V100, V101, or a name)"
                            style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                            onKeyDown={e => e.key === 'Enter' && search()} />
                        <button onClick={search} disabled={loading}
                            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                            {loading ? '⏳' : '🔍 Search'}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={loadHighRisk}
                        style={{ padding: '10px 20px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        👥 Show High-Risk Victims
                    </button>
                </div>
            </div>

            {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>Error: {error}</div>}

            {result && (
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: `conic-gradient(${riskColor(result.riskLevel)} ${(result.riskScore / 100) * 360}deg, #e2e8f0 0deg)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px',
                            color: riskColor(result.riskLevel)
                        }}>
                            {result.riskScore}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '18px' }}>
                                Risk: <span style={{ color: riskColor(result.riskLevel) }}>{result.riskLevel}</span>
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                                {result.firCount} FIR{result.firCount !== 1 ? 's' : ''} · {result.percentile}th percentile · Victim: {result.victimName || result.victimId}
                            </div>
                        </div>
                    </div>

                    {result.timeSpanDays > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Time Span</div>
                                <div style={{ fontWeight: 600 }}>{result.timeSpanDays} days</div>
                            </div>
                            <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Escalation Rate</div>
                                <div style={{ fontWeight: 600 }}>{result.escalationRate}/month</div>
                            </div>
                            {result.recentMONdays && (
                                <div style={{ padding: '10px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Last Interval</div>
                                    <div style={{ fontWeight: 600 }}>{result.recentMONdays} days</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Risk Factors</div>
                        {result.factors.map((f, i) => (
                            <div key={i} style={{ padding: '6px 12px', background: result.riskLevel === 'High' ? '#fef2f2' : '#fffbeb', borderRadius: '6px', marginBottom: '4px', fontSize: '13px' }}>
                                {result.riskLevel === 'High' ? '🚩' : '⚡'} {f}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '12px', background: riskColor(result.riskLevel) === '#dc2626' ? '#fef2f2' : riskColor(result.riskLevel) === '#f59e0b' ? '#fffbeb' : '#f0fdf4', borderRadius: '8px', fontSize: '13px' }}>
                        <strong>Recommendation:</strong> {result.recommendation}
                    </div>

                    {result.history && result.history.length > 1 && (
                        <details style={{ marginTop: '12px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Victimization History ({result.history.length} events)</summary>
                            <table style={{ width: '100%', marginTop: '8px', fontSize: '12px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ textAlign: 'left', padding: '6px' }}>FIR</th>
                                        <th style={{ textAlign: 'left', padding: '6px' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '6px' }}>District</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.history.map((h, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '6px' }}>{h.firNo}/{h.year}</td>
                                            <td style={{ padding: '6px' }}>{new Date(h.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '6px' }}>{h.districtId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </details>
                    )}
                </div>
            )}

            {highRiskVictims && (
                <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>🚨 High-Risk Victims (multiple FIRs)</div>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #fecaca' }}>
                                <th style={{ textAlign: 'left', padding: '6px' }}>Victim ID</th>
                                <th style={{ textAlign: 'left', padding: '6px' }}>FIR Count</th>
                                <th style={{ textAlign: 'left', padding: '6px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {highRiskVictims.map((v, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #fecaca' }}>
                                    <td style={{ padding: '6px' }}>{v.victimId}</td>
                                    <td style={{ padding: '6px' }}><strong>{v.count}</strong></td>
                                    <td style={{ padding: '6px' }}>
                                        <button onClick={() => { setVictimId(v.victimId); setHighRiskVictims(null); search(); }}
                                            style={{ padding: '4px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            Score
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VictimRiskPanel;
