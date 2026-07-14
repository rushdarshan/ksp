import React, { useState } from 'react';

const GbvPanel = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resources, setResources] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const loadAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/server/gbv_analytics/analytics');
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        setLoading(true);
        try {
            const res = await fetch('/server/gbv_analytics/resources');
            const json = await res.json();
            setResources(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#be185d', '#e11d48', '#f43f5e', '#fb7185', '#f472b6', '#ec4899', '#db2777', '#9d174d'];

    const getColor = (i) => COLORS[i % COLORS.length];

    return (
        <div className="panel" style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2>GBV Analytics Hub</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Gender-Based Violence analytics across Karnataka. Tracks crime patterns, district hotspots, repeat victimization,
                and conviction rates. Integrated with Sakhi One-Stop Centre network for victim support.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => { setActiveTab('overview'); loadAnalytics(); }}
                    style={{ padding: '8px 16px', background: activeTab === 'overview' ? '#be185d' : 'var(--color-surface-50)', color: activeTab === 'overview' ? 'white' : '#333', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Overview
                </button>
                <button onClick={() => { setActiveTab('resources'); loadResources(); }}
                    style={{ padding: '8px 16px', background: activeTab === 'resources' ? '#be185d' : 'var(--color-surface-50)', color: activeTab === 'resources' ? 'white' : '#333', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Support Resources
                </button>
            </div>

            {error && <div style={{ color: 'var(--color-red)', marginBottom: '16px' }}>Error: {error}</div>}

            {loading && <div style={{ color: '#666' }}>Loading...</div>}

            {activeTab === 'overview' && data && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '16px', background: '#fdf2f8', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>TOTAL GBV CASES</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#be185d' }}>{data.summary.totalCases}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#fdf2f8', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>TREND</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: data.summary.changePercent > 0 ? 'var(--color-red)' : '#22c55e' }}>
                                {data.summary.changePercent > 0 ? '+' : ''}{data.summary.changePercent.toFixed(1)}%
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#fdf2f8', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>DISTRICTS AFFECTED</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#be185d' }}>{data.summary.districtsAffected}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ padding: '16px', background: 'var(--color-surface-50)', borderRadius: '10px', border: '1px solid var(--color-border-200)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '12px' }}>By Crime Type</div>
                            {data.byType.map((t, i) => (
                                <div key={t.type} style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                                        <span>{t.label}</span>
                                        <span style={{ fontWeight: 600 }}>{t.count} ({t.trend > 0 ? '+' : ''}{t.trend.toFixed(1)}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--color-border-200)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(100, (t.count / Math.max(...data.byType.map(x => x.count), 1)) * 100)}%`, background: getColor(i), borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '16px', background: 'var(--color-surface-50)', borderRadius: '10px', border: '1px solid var(--color-border-200)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '12px' }}>By District (top)</div>
                            {data.byDistrict.slice(0, 8).map((d, i) => (
                                <div key={d.districtId} style={{ marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                                        <span>District {d.districtId}</span>
                                        <span style={{ fontWeight: 600 }}>{d.count} ({(d.gbvShare * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--color-border-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(100, (d.count / Math.max(...data.byDistrict.map(x => x.count), 1)) * 100)}%`, background: '#be185d', borderRadius: '3px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        {data.repeatVictims.length > 0 && (
                            <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-red)' }}>Repeat GBV Victims by District</div>
                                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #fecaca' }}>
                                            <th style={{ textAlign: 'left', padding: '4px' }}>District</th>
                                            <th style={{ textAlign: 'right', padding: '4px' }}>Cases</th>
                                            <th style={{ textAlign: 'right', padding: '4px' }}>Victims</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.repeatVictims.slice(0, 8).map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #fecaca' }}>
                                                <td style={{ padding: '4px' }}>District {r.districtId}</td>
                                                <td style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>{r.count}</td>
                                                <td style={{ padding: '4px', textAlign: 'right' }}>{r.victimCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {data.convictionRate && (
                            <div style={{ padding: '16px', background: 'var(--color-surface-50)', borderRadius: '10px', border: '1px solid var(--color-border-200)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Conviction Rate</div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#be185d', marginBottom: '8px' }}>
                                    {(data.convictionRate.overall * 100).toFixed(0)}%
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                    Overall GBV conviction rate. Target: 40% (National average for heinous crimes: ~30%)
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>By District</div>
                                {data.convictionRate.byDistrict.slice(0, 5).map((d, i) => (
                                    <div key={d.districtId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                                        <span>District {d.districtId}</span>
                                        <span>{(d.rate * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {data.byMonth && data.byMonth.length > 0 && (
                        <div style={{ padding: '16px', background: 'var(--color-surface-50)', borderRadius: '10px', border: '1px solid var(--color-border-200)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Monthly Case Trend</div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px', padding: '8px 0' }}>
                                {data.byMonth.slice(-24).map((m, i) => {
                                    const h = Math.max(4, (m.cases / Math.max(...data.byMonth.map(x => x.cases), 1)) * 90);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div title={`${m.year}-${m.month}: ${m.cases}`}
                                                style={{ width: '100%', height: `${h}px`, background: '#be185d', borderRadius: '2px', minHeight: '4px', opacity: 0.6 + (h / 90) * 0.4 }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', textAlign: 'center' }}>
                                Monthly GBV cases (last 24 months)
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'resources' && resources && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 12px 0' }}>Shelters & Support Services</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {resources.shelters.map((s, i) => (
                                <div key={i} style={{ padding: '14px', background: '#fdf2f8', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{s.name}</div>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                        {s.district} · {s.phone}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {s.services.map((sv, j) => (
                                            <span key={j} style={{ padding: '2px 8px', background: '#fce7f3', borderRadius: '4px', fontSize: '11px', color: '#be185d' }}>
                                                {sv}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 12px 0' }}>Applicable Laws</h3>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {resources.laws.map((l, i) => (
                                <div key={i} style={{ padding: '10px 14px', background: 'var(--color-surface-50)', borderRadius: '8px', border: '1px solid var(--color-border-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px' }}>{l.name}</span>
                                    <span style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>{l.key}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!data && activeTab === 'overview' && !loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>
                    Click <strong>Overview</strong> to load GBV analytics
                </div>
            )}
        </div>
    );
};

export default React.memo(GbvPanel);
