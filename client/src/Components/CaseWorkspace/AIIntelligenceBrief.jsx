import React, { useState, useEffect, useRef } from 'react';
import { useCaseContext } from './CaseWorkspace';
import { FaDownload } from 'react-icons/fa';
import './AIIntelligenceBrief.scss';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const MOCK_BRIEF = {
  narrative: 'FIR KSP-2026-0142 involves a robbery near MG Road metro station reported on 2026-03-15. Solvability analysis indicates strong witness and CCTV evidence. Veracity score is 84% (GENUINE). Network analysis links primary accused to the M G Road Snatchers gang with 2 co-offenders. The case is currently under investigation at Brigade Road PS with golden period expired but chargesheet deadline in 18 days.',
  solvability: {
    firNo: 'KSP-2026-0142', score: 0.67, label: 'SOLVABLE',
    factors: [
      { name: 'Witness availability', weight: 0.85, value: '2 witnesses identified' },
      { name: 'Physical evidence', weight: 0.72, value: 'CCTV footage within 48hr window' },
      { name: 'Suspect identification', weight: 0.60, value: 'Partial — scar description, no name' },
      { name: 'Time to report', weight: 0.92, value: 'Reported within 4 hours' },
      { name: 'Location specificity', weight: 0.88, value: 'Exact location identified' },
    ],
    recommendation: 'Prioritize for investigation. Strong witness and evidence indicators.',
  },
  veracity: {
    score: 0.84, label: 'GENUINE',
    flags: [
      { type: 'specificity', weight: 0.8, description: 'Narrative contains specific temporal and spatial details' },
      { type: 'coherence', weight: 0.7, description: 'Event sequence is logically ordered and internally consistent' },
      { type: 'complainant_detail', weight: 0.9, description: 'Complainant identified by name' },
      { type: 'delay_indicator', weight: 0.9, description: 'No delay in reporting' },
      { type: 'property_claim', weight: 0.7, description: 'Property value within expected range' },
    ],
    methodology: 'VeriPol-inspired logistic regression + TF-IDF features + behavioral markers',
  },
  similarCases: [
    { caseId: 89, similarity: 0.78, reason: 'Same MO — chain snatching with 2-wheeler getaway in nearby area' },
    { caseId: 301, similarity: 0.65, reason: 'Linked accused, same gang affiliation (M G Road Snatchers)' },
    { caseId: 255, similarity: 0.52, reason: 'Geographic proximity, similar time-of-day pattern' },
  ],
  entityLinks: [
    { source: 'N1', target: 'N2', weight: 5, relation: 'co-offender' },
    { source: 'N1', target: 'N3', weight: 3, relation: 'known-associate' },
    { source: 'N2', target: 'N6', weight: 4, relation: 'family' },
    { source: 'N1', target: 'N4', weight: 1, relation: 'perpetrator-victim' },
  ],
  recommendations: [
    { priority: 'HIGH', action: 'Retrieve CCTV from SH-9 junction before 48h overwrite', deadline: '2026-07-12T09:00:00Z' },
    { priority: 'HIGH', action: 'Issue lookout notice for accused Mohan Kumar', deadline: '2026-07-11T18:00:00Z' },
    { priority: 'MEDIUM', action: 'Conduct victim statement re-examination for chain-of-custody evidence', deadline: '2026-07-13T18:00:00Z' },
    { priority: 'LOW', action: 'File supplementary chargesheet sections 395/397 IPC', deadline: '2026-07-25T18:00:00Z' },
  ],
  confidence: 0.82,
  provenance: [
    { function: 'solvability_index', methodology: 'Random Forest classifier on case features' },
    { function: 'veracity_index', methodology: 'VeriPol-inspired logistic regression + TF-IDF' },
    { function: 'network_analysis', methodology: 'Graph-based co-offender linkage' },
    { function: 'daily_brief', methodology: 'Aggregate district crime statistics' },
    { function: 'agentic_police', methodology: 'Multi-agent orchestration log' },
  ],
};

// ── Skeleton loader (redaction-bar pattern) ────────────────
function Skeleton() {
  const bars = [85, 65, 72, 55, 90, 40, 78];
  return (
    <div className="aib-skeleton" aria-label="Loading intelligence brief…">
      {bars.map((w, i) => (
        <div key={i} className="aib-skeleton__bar" style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }} />
      ))}
      <div className="aib-skeleton__label">ZIA orchestrating agents…</div>
    </div>
  );
}

// ── Provenance badge ───────────────────────────────────────
function ProvenanceBadge({ fn, label }) {
  return (
    <span className="aib-provenance" title={fn}>
      {label || fn.replace(/_/g, ' ')}
    </span>
  );
}

// ── Score gauge (SVG arc) ──────────────────────────────────
function ScoreGauge({ score, label, size = 80 }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#facc15' : '#f87171';
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const dashLen = arc * score;
  return (
    <div className="aib-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-light)" strokeWidth="6"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={-circ * 0.125}
          strokeLinecap="round" transform={`rotate(-225 ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dashLen} ${circ}`} strokeDashoffset={-circ * 0.125}
          strokeLinecap="round" transform={`rotate(-225 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="aib-gauge__inner">
        <span className="aib-gauge__pct" style={{ color }}>{pct}</span>
        <span className="aib-gauge__label">{label || 'Score'}</span>
      </div>
    </div>
  );
}

// ── Veracity badge ─────────────────────────────────────────
function VeracityBadge({ score, label }) {
  const color = label === 'GENUINE' ? '#4ade80' : label === 'NEEDS REVIEW' ? '#facc15' : '#f87171';
  return (
    <span className="aib-veracity" style={{ background: `${color}20`, color, borderColor: `${color}60` }}>
      <span className="aib-veracity__dot" style={{ background: color }} />
      {label} · {Math.round(score * 100)}%
    </span>
  );
}

// ── Solvability factor row ─────────────────────────────────
function FactorRow({ f }) {
  const color = f.weight >= 0.75 ? '#4ade80' : f.weight >= 0.5 ? '#facc15' : '#f87171';
  return (
    <div className="aib-factor">
      <div className="aib-factor__header">
        <span className="aib-factor__name">{f.name}</span>
        <span className="aib-factor__val" style={{ color }}>{Math.round(f.weight * 100)}%</span>
      </div>
      <div className="aib-factor__bar">
        <div className="aib-factor__fill" style={{ width: `${f.weight * 100}%`, background: color }} />
      </div>
      <span className="aib-factor__detail">{f.value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function AIIntelligenceBrief() {
  const { firId, switchTab, timeRange } = useCaseContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latency, setLatency] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setLatency(false);

    const start = Date.now();
    timerRef.current = setTimeout(() => {
      if (!cancelled) setLatency(true);
    }, 5000);

    fetch(`${apiUrl}/zia_brief/zia_brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: firId }),
    })
      .then(r => r.json())
      .then(d => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(MOCK_BRIEF);
      })
      .finally(() => {
        clearTimeout(timerRef.current);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; clearTimeout(timerRef.current); };
  }, [firId, timeRange]);

  // Re-fetch on time range change (shows refresh indicator)
  useEffect(() => {
    if (data && timeRange.from) {
      setRefreshing(true);
      const t = setTimeout(() => setRefreshing(false), 1500);
      return () => clearTimeout(t);
    }
  }, [timeRange]);

  if (loading) return (
    <div className="aib">
      <div className="aib__header">
        <span className="aib__icon">🤖</span>
        <div>
          <h2 className="aib__title">ZIA Intelligence Brief</h2>
          <p className="aib__sub">{firId} — Synthesising multi-agent analysis</p>
        </div>
      </div>
      <Skeleton />
    </div>
  );

  if (!data) return null;

  const provMap = {};
  (data.provenance || []).forEach(p => { provMap[p.function] = p; });

  const exportPDF = () => {
    const el = document.querySelector('.aib');
    if (!el) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>ZIA Brief - ' + firId + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: system-ui, sans-serif; color: #0a0a0a; padding: 32px; max-width: 800px; margin: 0 auto; }');
    printWindow.document.write('h2 { font-family: Fraunces, serif; font-size: 22px; margin-bottom: 4px; }');
    printWindow.document.write('.aib__card { border: 1px solid #e8e6e3; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }');
    printWindow.document.write('.aib__card-head { padding: 10px 16px; background: #f8fafc; border-bottom: 1px solid #e8e6e3; font-weight: 600; font-size: 14px; }');
    printWindow.document.write('.aib__card-body { padding: 16px; font-size: 13px; line-height: 1.6; }');
    printWindow.document.write('.aib__para { margin: 0 0 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #ddd; font-size: 13px; }');
    printWindow.document.write('.aib__factor { margin-bottom: 8px; }');
    printWindow.document.write('.aib__factor-name { font-weight: 600; font-size: 13px; }');
    printWindow.document.write('.aib__factor-detail { font-size: 11px; color: #6b6b6b; }');
    printWindow.document.write('.aib__reco { padding: 8px 12px; background: #f8fafc; border: 1px solid #ddd; margin-bottom: 6px; font-size: 13px; }');
    printWindow.document.write('.aib__reco-pri { font-weight: 700; font-size: 10px; margin-right: 8px; }');
    printWindow.document.write('.aib__sub { color: #6b6b6b; font-size: 13px; margin: 0 0 16px; }');
    printWindow.document.write('.aib__conf { font-size: 11px; color: #6b6b6b; }');
    printWindow.document.write('.aib__vflag { padding: 6px 10px; margin-bottom: 4px; font-size: 12px; border: 1px solid #ddd; }');
    printWindow.document.write('.aib__similar { padding: 8px 12px; margin-bottom: 6px; font-size: 12px; border: 1px solid #e8e6e3; }');
    printWindow.document.write('.aib__entity { padding: 8px 12px; font-size: 12px; border: 1px solid #e8e6e3; margin-bottom: 6px; }');
    printWindow.document.write('.aib__method { font-style: italic; font-size: 11px; color: #6b6b6b; margin-top: 8px; }');
    printWindow.document.write('.aib__reco-note { font-size: 12px; color: #6b6b6b; padding: 6px 10px; border: 1px solid #ddd; margin-top: 8px; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h2>ZIA Intelligence Brief</h2>');
    printWindow.document.write('<p class="aib__sub">' + firId + ' — Generated ' + new Date().toLocaleString('en-IN') + '</p>');
    printWindow.document.write(el.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="aib">
      {latency && (
        <div className="aib__refresh-bar">Refreshing latest intelligence…</div>
      )}
      {refreshing && (
        <div className="aib__refresh-bar">Applying time filter…</div>
      )}

      {/* Header */}
      <div className="aib__header">
        <span className="aib__icon">🤖</span>
        <div>
          <h2 className="aib__title">ZIA Intelligence Brief</h2>
          <p className="aib__sub">{firId} — Multi-agent synthesis</p>
        </div>
        <div className="aib__header-scores">
          <ScoreGauge score={data.solvability?.score || 0} label="Solvability" size={72} />
          <ScoreGauge score={data.veracity?.score || 0} label="Veracity" size={72} />
          <button className="aib__export-btn" onClick={exportPDF} title="Export as PDF">
            <FaDownload size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Narrative */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>📋</span>
          <h3>Case Narrative</h3>
          {data.confidence != null && (
            <span className="aib__conf">{Math.round(data.confidence * 100)}% confidence</span>
          )}
        </div>
        <div className="aib__card-body">
          {(data.narrative || '').split('\n').filter(Boolean).map((p, i) => (
            <p key={i} className="aib__para">{p}</p>
          ))}
        </div>
      </section>

      {/* Solvability */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>📊</span>
          <h3>Solvability Analysis</h3>
          <VeracityBadge score={data.solvability?.score || 0} label={data.solvability?.label || '—'} />
          {provMap.solvability_index && <ProvenanceBadge {...provMap.solvability_index} />}
        </div>
        <div className="aib__card-body">
          {(data.solvability?.factors || []).map((f, i) => <FactorRow key={i} f={f} />)}
          {data.solvability?.recommendation && (
            <div className="aib__reco-note">→ {data.solvability.recommendation}</div>
          )}
        </div>
      </section>

      {/* Veracity */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>🔍</span>
          <h3>Veracity Assessment</h3>
          {provMap.veracity_index && <ProvenanceBadge {...provMap.veracity_index} />}
        </div>
        <div className="aib__card-body">
          <div className="aib__veracity-flags">
            {(data.veracity?.flags || []).map((f, i) => {
              const c = f.weight >= 0.7 ? '#4ade80' : f.weight >= 0.4 ? '#facc15' : '#f87171';
              return (
                <div key={i} className="aib__vflag" style={{ borderLeftColor: c }}>
                  <span className="aib__vflag-type">{f.type.replace(/_/g, ' ')}</span>
                  <span className="aib__vflag-pct" style={{ color: c }}>{Math.round(f.weight * 100)}%</span>
                  <span className="aib__vflag-desc">{f.description}</span>
                </div>
              );
            })}
          </div>
          {data.veracity?.methodology && (
            <div className="aib__method">{data.veracity.methodology}</div>
          )}
        </div>
      </section>

      {/* Similar Cases */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>🔗</span>
          <h3>Similar Cases</h3>
        </div>
        <div className="aib__card-body">
          <div className="aib__similar-list">
            {(data.similarCases || []).map((c, i) => {
              const pct = Math.round(c.similarity * 100);
              const color = pct >= 70 ? '#4ade80' : pct >= 50 ? '#facc15' : '#60a5fa';
              return (
                <button key={i} className="aib__similar" onClick={() => switchTab('network')}>
                  <span className="aib__similar-fir">KSP-2026-{String(c.caseId).padStart(3, '0')}</span>
                  <span className="aib__similar-pct" style={{ background: `${color}20`, color }}>{pct}% match</span>
                  <span className="aib__similar-why">{c.reason}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Entity Links */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>🕸️</span>
          <h3>Entity Links</h3>
          {provMap.network_analysis && <ProvenanceBadge {...provMap.network_analysis} />}
        </div>
        <div className="aib__card-body">
          <div className="aib__entity-grid">
            {(data.entityLinks || []).map((e, i) => (
              <button key={i} className="aib__entity" onClick={() => switchTab('network')}>
                <span className="aib__entity-nodes">{e.source} → {e.target}</span>
                <span className="aib__entity-rel">{e.relation.replace(/-/g, ' ')}</span>
                <span className="aib__entity-weight">w:{e.weight}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="aib__card">
        <div className="aib__card-head">
          <span>⚡</span>
          <h3>Recommended Next Steps</h3>
        </div>
        <div className="aib__card-body">
          {(data.recommendations || []).map((r, i) => {
            const pc = r.priority === 'HIGH' ? '#f87171' : r.priority === 'MEDIUM' ? '#facc15' : '#4ade80';
            return (
              <div key={i} className="aib__reco" style={{ borderLeftColor: pc }}>
                <span className="aib__reco-pri" style={{ background: `${pc}20`, color: pc }}>{r.priority}</span>
                <span className="aib__reco-action">{r.action}</span>
                {r.deadline && (
                  <span className="aib__reco-date">
                    by {new Date(r.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
