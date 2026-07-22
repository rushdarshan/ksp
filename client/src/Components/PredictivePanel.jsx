import { useState, useEffect } from 'react';
import {
    PiClock, PiFirstAid, PiHouseLine, PiLaptop, PiLockOpen, PiMapPin,
    PiMegaphone, PiMoney, PiShield, PiSiren, PiSkull, PiSword, PiUsers, PiWarning, PiWrench
} from 'react-icons/pi';

const CONFIDENCE_TIERS = [
    { min: 0.7, label: 'High', color: 'var(--color-red)', bg: '#fef2f2', border: '#fecaca' },
    { min: 0.4, label: 'Medium', color: 'var(--color-amber)', bg: '#fffbeb', border: '#fde68a' },
    { min: 0, label: 'Low', color: '#16a34a', bg: 'var(--color-surface-green)', border: '#bbf7d0' },
];

function getTier(confidence) {
    return CONFIDENCE_TIERS.find(t => confidence >= t.min) || CONFIDENCE_TIERS[2];
}

const CRIME_ICONS = {
    theft: PiLockOpen, burglary: PiHouseLine, robbery: PiSword, assault: PiFirstAid, murder: PiSkull,
    sexual: PiShield, fraud: PiMoney, cyber: PiLaptop, drugs: PiWarning, property: PiWrench,
    extortion: PiMegaphone, publicorder: PiUsers
};

export default function PredictivePanel() {
    const [data, setData] = useState(null);
    const [districtId, setDistrictId] = useState('1');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (dId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/server/predictive_mode/predict?districtId=${dId}`);
            if (!res.ok) throw new Error('Prediction service unavailable');
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(districtId);
        const interval = setInterval(() => fetchData(districtId), 900000);
        return () => clearInterval(interval);
    }, [districtId]);

    if (loading) {
        return (
            <div className="panel" style={{ padding: '1rem' }}>
                <div style={{ height: '20px', width: '250px', background: 'var(--color-gray-200)', borderRadius: '4px', marginBottom: '16px' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '120px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '12px' }} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel" style={{ padding: '1rem' }}>
                <div style={{ padding: '12px', border: '1px solid #fca5a5', borderRadius: '8px', background: 'var(--color-surface-red)', marginBottom: '12px' }}>
                    <p style={{ color: 'var(--color-red)', margin: '0 0 8px 0', fontSize: '14px' }}>{error}</p>
                    <button onClick={() => fetchData(districtId)} style={{ padding: '4px 12px', background: 'var(--color-red)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
                </div>
            </div>
        );
    }

    const predictions = data?.predictions || [];

    return (
        <div className="panel" style={{ padding: '1rem' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>Predictive Intelligence</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-gray-500)' }}>
                AI-driven crime predictions based on 30-day FIR patterns · {data?.method === 'heuristic' ? 'Heuristic model' : 'QuickML Qwen 2.5-14B'}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <select value={districtId} onChange={e => setDistrictId(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer' }}
                    aria-label="Select district for predictions">
                    {Array.from({ length: 20 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>District {i + 1}</option>
                    ))}
                </select>
                <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                    {data?.firCount || 0} FIRs analyzed · {data?.topCrimes?.length || 0} crime types detected
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {predictions.map((p, i) => {
                    const tier = getTier(p.confidence);
                    const CrimeIcon = CRIME_ICONS[p.crime_type?.toLowerCase()] || PiSiren;
                    return (
                        <div key={i} style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: tier.bg,
                            border: `1px solid ${tier.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="prediction-icon"><CrimeIcon weight="duotone" /></span>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    background: tier.color,
                                    color: '#fff',
                                    textTransform: 'uppercase'
                                }}>
                                    {tier.label} {Math.round(p.confidence * 100)}%
                                </span>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'capitalize', color: tier.color }}>
                                {p.crime_type || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#4b5563' }}>
                                <div className="prediction-meta"><PiMapPin /> {p.location || 'Unknown location'}</div>
                                <div className="prediction-meta"><PiClock /> {p.time_window || 'Unknown time'}</div>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', margin: 0, fontStyle: 'italic' }}>
                                {p.reasoning || 'No reasoning provided'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {predictions.length === 0 && (
                <div className="prediction-empty">
                    <span><PiSiren weight="duotone" /></span>
                    <div>
                        <strong>No elevated signals in this district</strong>
                        <p>The current 30-day FIR window does not contain enough activity to produce a deployment forecast.</p>
                    </div>
                </div>
            )}

            {data?.topCrimes && data.topCrimes.length > 0 && (
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>30-Day Crime Distribution</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {data.topCrimes.map(([ct, count]) => (
                            <span key={ct} style={{
                                fontSize: '12px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: 'var(--color-gray-200)',
                                textTransform: 'capitalize'
                            }}>
                                {ct}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <p style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                Predictions are AI-generated based on historical FIR patterns. Use as decision support only — not as sole basis for deployment.
                Generated at {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'unknown'}.
            </p>
        </div>
    );
}
