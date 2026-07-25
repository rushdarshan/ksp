import { useEffect, useState } from 'react';
import { PiFaceMask, PiGenderIntersex, PiClock, PiShieldCheck } from 'react-icons/pi';
import apiFetch from '../utils/apiFetch';

const DEMO_IMAGES = [
    { id: 'suspect-001', label: 'Suspect — Ravi S.', src: 'https://picsum.photos/seed/suspect1/200/200' },
    { id: 'suspect-002', label: 'Suspect — Meena K.', src: 'https://picsum.photos/seed/suspect2/200/200' },
    { id: 'victim-001', label: 'Victim — Lakshmi D.', src: 'https://picsum.photos/seed/victim1/200/200' },
    { id: 'suspect-004', label: 'Suspect — Arun P.', src: 'https://picsum.photos/seed/suspect4/200/200' },
];

export default function FaceAnalyticsPanel() {
    const [selected, setSelected] = useState(DEMO_IMAGES[0].id);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiFetch('/face_analytics/analyze', {
            method: 'POST',
            body: JSON.stringify({ imageId: selected }),
        }).then(data => {
            setResult(data);
        }).catch(() => {
            setResult(null);
        }).finally(() => setLoading(false));
    }, [selected]);

    const face = result?.faces?.[0];

    return (
        <div className="panel-shell">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PiFaceMask /> Face Analytics
                </h2>
                {result?.metadata?.dataSource === 'catalyst_zia_face_analytics' && (
                    <span className="badge badge--info" style={{ fontSize: 10 }}>Catalyst Zia</span>
                )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {DEMO_IMAGES.map(img => (
                    <button key={img.id} onClick={() => setSelected(img.id)}
                        style={{
                            padding: 4, borderRadius: 10, border: `2px solid ${selected === img.id ? 'var(--accent)' : 'var(--border)'}`,
                            background: 'var(--surface)', cursor: 'pointer', transition: 'border-color 0.15s',
                        }}>
                        <img src={img.src} alt={img.label} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    </button>
                ))}
            </div>

            {loading && <div className="panel-loading" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Analyzing face...</div>}

            {!loading && face && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 24px', fontSize: 14 }}>
                    <PiGenderIntersex size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div><strong>Gender:</strong> {face.gender?.value} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({(face.gender?.confidence * 100).toFixed(0)}% confidence)</span></div>

                    <PiClock size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div><strong>Age Range:</strong> {face.age?.min}–{face.age?.max} years</div>

                    <PiFaceMask size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div><strong>Emotion:</strong> {face.emotion?.value}</div>

                    <PiShieldCheck size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div><strong style={{ color: face.confidence > 0.8 ? 'var(--status-clear-text)' : 'var(--status-warning-text)' }}>
                        {face.confidence > 0.8 ? 'High confidence match' : 'Review recommended'}
                    </strong></div>
                </div>
            )}

            {!loading && !face && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No face detected in the selected image. Try a different image.</p>
            )}
        </div>
    );
}
