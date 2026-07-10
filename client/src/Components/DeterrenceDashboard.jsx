import React, { useState, useEffect } from 'react';

const DeterrenceDashboard = () => {
    const [districtId, setDistrictId] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const DISTRICTS = [
        { id: 1, name: 'Bengaluru City' },
        { id: 2, name: 'Mysuru City' },
        { id: 3, name: 'Mangaluru City' },
        { id: 4, name: 'Hubballi-Dharwad City' },
        { id: 5, name: 'Belagavi City' },
        { id: 6, name: 'Kalaburagi City' },
        { id: 7, name: 'Shivamogga' },
        { id: 8, name: 'Tumakuru' },
        { id: 9, name: 'Davanagere' },
        { id: 10, name: 'Ballari' },
        { id: 11, name: 'Vijayapura' },
        { id: 12, name: 'Bidar' },
        { id: 13, name: 'Hassan' },
        { id: 14, name: 'Udupi' },
        { id: 15, name: 'Dharwad' },
        { id: 16, name: 'Kolar' },
        { id: 17, name: 'Chikkamagaluru' },
        { id: 18, name: 'Mandya' },
        { id: 19, name: 'Bagalkote' },
        { id: 20, name: 'Chitradurga' }
    ];

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [exceedRes, darkRes, transitRes] = await Promise.all([
                fetch(`/server/exceedance_curve/exceedance?district=${districtId}`).then(r => r.json()),
                fetch(`/server/dark_figure/dark-figure?district=${districtId}`).then(r => r.json()),
                fetch(`/server/transit_detection/transit-detection?district=${districtId}&crimeType=theft`).then(r => r.json())
            ]);
            setData({ exceedance: exceedRes, darkFigure: darkRes.data, transit: transitRes });
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [districtId]);

    const getTrend = (val) => val > 50 ? { label: 'Worsening', color: '#dc2626' } : val > 25 ? { label: 'Stable', color: '#d97706' } : { label: 'Improving', color: '#22c55e' };

    return (
        <div className="panel" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', margin: '0 0 4px 0' }}>Crime Genome — Public Dashboard</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>Karnataka State Police · Crime Intelligence for Citizen Awareness</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'center' }}>
                <label style={{ fontWeight: 600, fontSize: '13px' }}>District:</label>
                <select value={districtId} onChange={e => setDistrictId(Number(e.target.value))}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            {error && <div style={{ color: '#dc2626', marginBottom: '16px', textAlign: 'center' }}>Error: {error}</div>}
            {loading && <div style={{ textAlign: 'center', color: '#666' }}>Loading...</div>}
            {data && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Index</div>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: data.exceedance.worstOffense.exceedanceCurve.find(e => e.returnPeriodYears === 1).thresholdExceedance > 30 ? '#dc2626' : '#d97706' }}>
                                {data.exceedance.worstOffense.exceedanceCurve.find(e => e.returnPeriodYears === 1).thresholdExceedance}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>monthly avg</div>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Crime</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0d6efd', textTransform: 'capitalize', marginTop: '4px' }}>{data.exceedance.worstOffense.crimeType}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>highest risk type</div>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trend</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: getTrend(data.darkFigure?.gapPercent || 0).color, marginTop: '4px' }}>
                                {getTrend(data.darkFigure?.gapPercent || 0).label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>vs prior period</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Risk Outlook</h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {data.exceedance.worstOffense.exceedanceCurve.map((ep, i) => (
                                    <span key={i} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: ep.returnPeriodYears <= 2 ? '#f0fdf4' : ep.returnPeriodYears <= 5 ? '#fffbeb' : '#fef2f2', color: ep.returnPeriodYears <= 2 ? '#16a34a' : ep.returnPeriodYears <= 5 ? '#d97706' : '#dc2626' }}>
                                        {ep.returnPeriodYears}yr ≥ {ep.thresholdExceedance}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Active Transits</h3>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0891b2' }}>{data.transit.detectedTransits.length}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>detected crime sprees (7 days)</div>
                        </div>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px 0' }}>Prevention Tips</h3>
                        <ul style={{ margin: '0', padding: '0 0 0 16px', fontSize: '13px', color: '#4b5563', lineHeight: '1.8' }}>
                            <li>Secure vehicles with steering locks — auto theft is the most common crime in this district</li>
                            <li>Report suspicious activity to your local police station or dial 112</li>
                            <li>Install CCTV cameras at entry points — visible cameras deter burglary</li>
                            <li>Avoid sharing OTPs and banking passwords — cyber fraud cases are rising</li>
                        </ul>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#94a3b8' }}>
                        Data source: Karnataka State Police · Updated daily · No personally identifiable information shown
                    </div>
                </>
            )}
        </div>
    );
};

export default DeterrenceDashboard;
