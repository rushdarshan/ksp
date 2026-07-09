import { useState, useEffect } from 'react';

function getScoreColor(score) {
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#ca8a04';
    return '#dc2626';
}

function getScoreLabel(score) {
    if (score >= 70) return 'High solvability';
    if (score >= 40) return 'Moderate solvability';
    return 'Low solvability';
}

export default function SolvabilityBadge({ firData }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchScore = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/server/solvability_index/solvability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firNo: firData?.FIRNo || '',
                    firYear: firData?.FIRYear || '',
                    narrative: firData?.Narrative || firData?.narrative || '',
                    districtId: firData?.DistrictID || firData?.districtId || '',
                    evidenceTypes: [],
                    delayHours: 0,
                    witnessCount: 0,
                    suspectIdentified: false
                })
            });
            if (!res.ok) throw new Error('Solvability analysis unavailable');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (firData) fetchScore();
    }, [firData]);

    if (loading) {
        return (
        <div className="panel" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                <div style={{ height: '16px', width: '200px', background: '#e5e7eb', borderRadius: '8px', marginBottom: '8px' }} />
                <div style={{ height: '12px', width: '160px', background: '#e5e7eb', borderRadius: '8px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2' }}>
                <p style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '14px' }}>Analysis unavailable</p>
                <button onClick={fetchScore} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
            </div>
        );
    }

    if (!result) return null;

    const { solvabilityScore, uncertaintyBand, factors } = result;
    const color = getScoreColor(solvabilityScore);
    const label = getScoreLabel(solvabilityScore);

    return (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Solvability Index</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                    role="meter"
                    aria-valuenow={solvabilityScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Solvability score ${solvabilityScore} out of 100`}
                    style={{
                        width: '160px', height: '20px', background: '#e5e7eb', borderRadius: '10px',
                        overflow: 'hidden', position: 'relative'
                    }}
                >
                    <div style={{
                        width: `${solvabilityScore}%`, height: '100%', background: color,
                        borderRadius: '10px'
                    }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '18px', color }}>
                    {solvabilityScore} ± {uncertaintyBand}
                </span>
                <span style={{ fontSize: '13px', color: color, fontWeight: 500 }}>{label}</span>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>Heuristic score — not validated against local data</p>
            <details>
                <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151' }}>Factor breakdown</summary>
                <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 16px', fontSize: '13px', color: '#4b5563' }}>
                    {factors.map((f, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>
                            {f.name}: {f.score}/{f.max}
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    );
}
