import React, { useState, useEffect } from 'react';

const BeatOptimizerPanel = () => {
    const [districtId, setDistrictId] = useState(1);
    const [districts, setDistricts] = useState([]);
    const [beats, setBeats] = useState(null);
    const [optimization, setOptimization] = useState(null);
    const [routes, setRoutes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('beats');
    const [flowMode, setFlowMode] = useState(false);

    const KARNATAKA_DISTRICTS = [
        { id: 1, name: 'Bengaluru City' },
        { id: 2, name: 'Mysuru City' },
        { id: 3, name: 'Mangaluru City' },
        { id: 4, name: 'Hubballi-Dharwad City' },
        { id: 5, name: 'Belagavi City' },
        { id: 6, name: 'Kalaburagi City' },
        { id: 7, name: 'Shivamogga' },
        { id: 8, name: 'Tumakuru' },
        { id: 9, name: 'Davanagere' },
        { id: 10, name: 'Ballari' }
    ];

    useEffect(() => {
        fetch('/server/beat_optimizer/districts')
            .then(r => r.json())
            .then(setDistricts)
            .catch(() => setDistricts(KARNATAKA_DISTRICTS));
    }, []);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [b, o, r] = await Promise.all([
                fetch(`/server/beat_optimizer/beats/${districtId}`).then(r => r.json()),
                fetch(`/server/beat_optimizer/optimize/${districtId}${flowMode ? '?flowMode=true' : ''}`).then(r => r.json()),
                fetch(`/server/beat_optimizer/patrol/${districtId}`).then(r => r.json())
            ]);
            setBeats(b);
            setOptimization(o);
            setRoutes(r);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [districtId, flowMode]);

    return (
        <div className="panel" style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2>Beat & Patrol Optimizer</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Optimize beat boundaries and patrol routes based on crime load. MIP-based beat redesign and ACO-inspired patrol routing.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <label style={{ fontWeight: 600, fontSize: '13px' }}>District:</label>
                <select value={districtId} onChange={e => setDistrictId(Number(e.target.value))}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={load} style={{ padding: '6px 16px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Refresh
                </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                {['beats', 'optimize', 'patrol'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '8px 16px', background: tab === t ? '#0d6efd' : '#f8fafc', color: tab === t ? 'white' : '#333', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                        {t === 'beats' ? 'Beats' : t === 'optimize' ? 'Optimization' : 'Patrol Routes'}
                    </button>
                ))}
                <div style={{ marginLeft: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                        <input type="checkbox" checked={flowMode} onChange={e => setFlowMode(e.target.checked)}
                            style={{ marginRight: '4px' }} />
                        Criminal-Flow Mode
                    </label>
                    {flowMode && <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 600 }}>BETA</span>}
                </div>
            </div>

            {error && <div style={{ color: '#dc2626', marginBottom: '16px' }}>Error: {error}</div>}
            {loading && <div style={{ color: '#666' }}>Loading...</div>}

            {tab === 'beats' && beats && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#f1f5f9' }}>
                            <th style={th}>Beat</th><th style={th}>Crimes</th><th style={th}>Area km²</th><th style={th}>Officers</th><th style={th}>Response (min)</th><th style={th}>Risk</th>
                        </tr></thead>
                        <tbody>
                            {beats.beats.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={td}>{b.name}</td>
                                    <td style={td}>{b.totalCrimes}</td>
                                    <td style={td}>{b.areaKm2}</td>
                                    <td style={td}>{b.officersAssigned}</td>
                                    <td style={td}>{b.responseTimeMin}</td>
                                    <td style={td}><span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: b.riskScore > 0.6 ? '#fef2f2' : '#f0fdf4', color: b.riskScore > 0.6 ? '#dc2626' : '#22c55e' }}>{b.riskScore.toFixed(2)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'optimize' && optimization && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: optimization.flowMode ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        {[
                            { label: 'Total Beats', value: optimization.summary.totalBeats, color: '#0d6efd' },
                            { label: 'Overloaded', value: optimization.summary.overloaded, color: '#dc2626' },
                            { label: 'Balanced', value: optimization.summary.balanced, color: '#22c55e' },
                            { label: 'Avg Crime Load', value: optimization.summary.avgLoad, color: '#6b7280' },
                            ...(optimization.flowMode ? [{ label: 'Criminal Clusters', value: optimization.flowData.criminalClusters.length, color: '#7c3aed' }] : [])
                        ].map(s => (
                            <div key={s.label} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '11px', color: s.color, fontWeight: 600 }}>{s.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ background: '#f1f5f9' }}>
                                <th style={th}>Beat</th><th style={th}>Current Crimes</th><th style={th}>Current Officers</th><th style={th}>Recommended</th><th style={th}>Load Ratio</th><th style={th}>Status</th>
                                {optimization.flowMode && <><th style={th}>Flow Risk</th><th style={th}>Target Crime</th><th style={th}>Patrol Shift</th></>}
                            </tr></thead>
                            <tbody>
                                {optimization.optimization.map((o, idx) => {
                                    const flow = optimization.flowData?.flowBeats?.[idx];
                                    return (
                                    <tr key={o.beatId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={td}>{o.beatId}</td>
                                        <td style={td}>{o.currentCrimes}</td>
                                        <td style={td}>{o.currentOfficers}</td>
                                        <td style={td}><strong>{o.recommendedOfficers}</strong></td>
                                        <td style={td}>{o.loadRatio}</td>
                                        <td style={td}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                background: o.status === 'Overloaded' ? '#fef2f2' : o.status === 'Underloaded' ? '#fffbeb' : '#f0fdf4',
                                                color: o.status === 'Overloaded' ? '#dc2626' : o.status === 'Underloaded' ? '#d97706' : '#22c55e' }}>
                                                {o.status}
                                            </span>
                                        </td>
                                        {flow && <>
                                            <td style={td}><span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: flow.flowRiskScore > 0.8 ? '#fef2f2' : '#f0fdf4', color: flow.flowRiskScore > 0.8 ? '#dc2626' : '#22c55e' }}>{flow.flowRiskScore.toFixed(2)}</span></td>
                                            <td style={{ ...td, textTransform: 'capitalize', fontSize: '12px' }}>{flow.predictedTargetCrime}</td>
                                            <td style={{ ...td, fontSize: '12px' }}>{flow.recommendedPatrolShift}</td>
                                        </>}
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {optimization.flowMode && optimization.flowData && (
                        <div style={{ marginTop: '20px', padding: '16px', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #ddd6fe' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0', color: '#6d28d9' }}>Criminal Flow Clusters</h3>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                                Beat boundaries adjusted for criminal residence and movement patterns — proactive coverage instead of reactive.
                            </p>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {optimization.flowData.criminalClusters.map(c => (
                                    <div key={c.clusterId} style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Cluster {c.clusterId} — {c.criminalCount} criminals</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Top crime: {c.topCrimeType} · Avg travel: {c.avgTravelKm}km</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {tab === 'patrol' && routes && (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {routes.routes.map(r => (
                        <div key={r.beatId} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{r.beatName} Patrol Route</div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                {r.route.length} stops · ~{r.totalDistance}km · ~{r.estimatedMinutes}min
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {r.route.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#e0f2fe', borderRadius: '6px', fontSize: '12px' }}>
                                        <span style={{ fontWeight: 700, color: '#0d6efd' }}>#{i + 1}</span>
                                        <span>{p.label}</span>
                                        <span style={{ color: '#666', fontSize: '10px' }}>({p.lat.toFixed(2)}, {p.lng.toFixed(2)})</span>
                                        {i < r.route.length - 1 && <span style={{ color: '#94a3b8' }}>→</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab !== 'beats' && !loading && (
                tab === 'optimize' ? (!optimization && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Select a district to see optimization</div>)
                : (!routes && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Select a district to see patrol routes</div>)
            )}
        </div>
    );
};

const th = { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#64748b', fontWeight: 600 };
const td = { padding: '10px 12px' };

export default BeatOptimizerPanel;
