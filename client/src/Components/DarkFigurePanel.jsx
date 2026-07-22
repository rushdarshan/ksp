import { useState, useEffect } from 'react';

function CrimeBar({ crimeType, actual, lowerBound, upperBound }) {
    const maxVal = Math.max(upperBound, actual);
    const barWidth = maxVal > 0 ? 300 : 0;

    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', textTransform: 'capitalize' }}>{crimeType}</div>
            <div style={{ position: 'relative', height: '24px', background: '#f3f4f6', borderRadius: '4px', width: `${Math.min(barWidth, 300)}px` }}>
                <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${(actual / (maxVal || 1)) * 100}%`,
                    background: '#3b82f6', borderRadius: '4px', opacity: 0.8,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: '4px', boxSizing: 'border-box'
                }}>
                    <span style={{ fontSize: '11px', color: '#fff' }}>{actual}</span>
                </div>
                <div style={{
                    position: 'absolute', left: `${(lowerBound / (maxVal || 1)) * 100}%`,
                    width: `${((upperBound - lowerBound) / (maxVal || 1)) * 100}%`,
                    top: '4px', height: '16px',
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(239,68,68,0.3) 3px, rgba(239,68,68,0.3) 6px)',
                    border: '1px dashed #ef4444', borderRadius: '2px'
                }} />
            </div>
        </div>
    );
}

export default function DarkFigurePanel() {
    const [data, setData] = useState(null);
    const [districtId, setDistrictId] = useState('1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (dId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/server/dark_figure/dark-figure?district=${dId}`);
            if (!res.ok) throw new Error('Dark figure data unavailable');
            const json = await res.json();
            setData(json.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(districtId);
    }, [districtId]);

    const totalReported = data ? Object.values(data.firCounts || {}).reduce((s, v) => s + v, 0) : 0;
    const totalEstimated = data ? Object.values(data.estimatedTotals || {}).reduce((s, v) => s + v.estimated, 0) : 0;

    const crimeTypes = data ? Object.entries(data.estimatedTotals || {})
        .map(([ct, v]) => ({ crimeType: ct, ...v }))
        .sort((a, b) => (b.estimated - (data.firCounts[b.crimeType] || 0)) - (a.estimated - (data.firCounts[a.crimeType] || 0)))
    : [];

    if (loading) {
        return (
            <div style={{ padding: '1rem' }}>
                <div style={{ height: '20px', width: '250px', background: 'var(--color-gray-200)', borderRadius: '4px', marginBottom: '16px' }} />
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ height: '40px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '1rem' }}>
                <div style={{ padding: '12px', border: '1px solid #fca5a5', borderRadius: '8px', background: 'var(--color-surface-red)', marginBottom: '12px' }}>
                    <p style={{ color: 'var(--color-red)', margin: '0 0 8px 0', fontSize: '14px' }}>{error}</p>
                    <button onClick={() => fetchData(districtId)} style={{ padding: '4px 12px', background: 'var(--color-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
                </div>
                <select value={districtId} onChange={e => setDistrictId(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer' }}>
                    {Array.from({length: 20}, (_, i) => (
                        <option key={i+1} value={i+1}>District {i+1}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="panel" style={{ padding: '1rem' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>Dark Figure Layer</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-gray-500)' }}>
                Estimated unreported crime based on Karnataka Crime Victimisation Survey 2019
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 500 }}>Reported FIRs</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>{totalReported}</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--color-surface-red)', borderRadius: '8px', border: '1px solid var(--color-red-200)' }}>
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>Estimated Actual (±35%)</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#991b1b' }}>{totalEstimated}</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--color-surface-green)', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>District</div>
                    <select value={districtId} onChange={e => setDistrictId(e.target.value)}
                        style={{ fontSize: '16px', fontWeight: 700, color: '#166534', border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 0' }}
                        aria-label="Select district for dark figure analysis">
                        {Array.from({length: 20}, (_, i) => (
                            <option key={i+1} value={i+1}>District {i+1}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div aria-live="polite">
                {data?.recommendation && (
                    <div style={{
                        padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: 500,
                        background: data.gapPercent > 50 ? 'var(--color-surface-red)' : '#f0fdf4',
                        border: `1px solid ${data.gapPercent > 50 ? 'var(--color-red-200)' : '#bbf7d0'}`,
                        color: data.gapPercent > 50 ? '#991b1b' : '#166534'
                    }}>
                        {data.recommendation}
                    </div>
                )}
            </div>

            <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Crime Type Breakdown</h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Actual (blue) vs Estimated range (red dashed)</span>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {crimeTypes.slice(0, 5).map(ct => (
                        <CrimeBar
                            key={ct.crimeType}
                            crimeType={ct.crimeType}
                            actual={data.firCounts[ct.crimeType] || 0}
                            lowerBound={ct.lowerBound}
                            upperBound={ct.upperBound}
                        />
                    ))}
                    {crimeTypes.length > 5 && (
                        <details>
                            <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#3b82f6', fontWeight: 500 }}>Show all {crimeTypes.length} crime types</summary>
                            <div style={{ marginTop: '8px' }}>
                                {crimeTypes.slice(5).map(ct => (
                                    <CrimeBar
                                        key={ct.crimeType}
                                        crimeType={ct.crimeType}
                                        actual={data.firCounts[ct.crimeType] || 0}
                                        lowerBound={ct.lowerBound}
                                        upperBound={ct.upperBound}
                                    />
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>

            <p style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                Underreporting estimates based on Karnataka Crime Victimisation Survey 2019. Estimates shown with ±35% uncertainty band for 7-year projection gap.
            </p>
        </div>
    );
}
