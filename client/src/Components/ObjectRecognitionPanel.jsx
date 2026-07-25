import { useEffect, useState } from 'react';
import { PiMagnifyingGlass, PiScan, PiShieldCheck, PiWarningCircle } from 'react-icons/pi';
import apiFetch from '../utils/apiFetch';

const DEMO_IMAGES = [
  { id: 'evidence-001', label: 'Crime Scene — Kitchen', src: 'https://picsum.photos/seed/evidence1/200/200' },
  { id: 'evidence-002', label: 'Seized Items — Bag A', src: 'https://picsum.photos/seed/evidence2/200/200' },
  { id: 'evidence-003', label: 'Street — CCTV Footage', src: 'https://picsum.photos/seed/evidence3/200/200' },
  { id: 'evidence-004', label: 'Suspect — Belongings', src: 'https://picsum.photos/seed/evidence4/200/200' },
];

const CONFIDENCE_COLORS = {
  high: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  medium: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  low: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

function getConfidenceLevel(score) {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

export default function ObjectRecognitionPanel() {
  const [selected, setSelected] = useState(DEMO_IMAGES[0].id);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/object_recognition/detect', {
      method: 'POST',
      body: JSON.stringify({ imageId: selected }),
    }).then(data => {
      setResult(data);
    }).catch(() => {
      setResult(null);
    }).finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="panel-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PiMagnifyingGlass /> Object Recognition
        </h2>
        {result?.metadata?.dataSource === 'catalyst_zia_object_recognition' && (
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

      {loading && (
        <div className="panel-loading" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <PiScan size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div>Scanning for objects...</div>
        </div>
      )}

      {!loading && result && (
        <>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {result.detectionCount} object{result.detectionCount !== 1 ? 's' : ''} detected
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {result.detections.map((d, i) => {
              const level = getConfidenceLevel(d.confidence);
              const c = CONFIDENCE_COLORS[level];
              return (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 20, fontSize: 13,
                  background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                }}>
                  {level === 'high' ? <PiShieldCheck /> : <PiWarningCircle />}
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{d.object}</span>
                  <span style={{ opacity: 0.7, fontSize: 11 }}>{(d.confidence * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          {result.metadata?.humanReviewRequired && (
            <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              AI-assisted detection — all findings require human verification.
            </p>
          )}
        </>
      )}

      {!loading && !result && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No objects detected. Try a different evidence image.</p>
      )}
    </div>
  );
}
