import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useCaseContext } from './caseContext';
import {
  PiArrowRight,
  PiChartBar,
  PiClipboardText,
  PiDownloadSimple,
  PiGraph,
  PiLightning,
  PiMagnifyingGlass,
  PiRobot,
} from 'react-icons/pi';
import { ACTIVE_CASE_BRIEF, ACTIVE_CASE_FACTS } from './caseFacts';
import './AIIntelligenceBrief.scss';

import apiFetch from '../../utils/apiFetch';

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
function ProvenanceBadge({ fn, function: functionName, label }) {
  const sourceName = fn || functionName || 'source';
  return (
    <span className="aib-provenance" title={sourceName}>
      {label || sourceName.replace(/_/g, ' ')}
    </span>
  );
}

ProvenanceBadge.propTypes = {
  fn: PropTypes.string,
  function: PropTypes.string,
  label: PropTypes.string,
};

// ── Score gauge (SVG arc) ──────────────────────────────────
function ScoreGauge({ score, label, size = 80 }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? 'var(--color-green-alt)' : pct >= 50 ? '#facc15' : '#f87171';
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

ScoreGauge.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string,
  size: PropTypes.number,
};

// ── Narrative review badge ─────────────────────────────────
function ReviewSupportBadge({ score, label }) {
  const color = '#76531b';
  return (
    <span className="aib-veracity" style={{ background: `${color}20`, color, borderColor: `${color}60` }}>
      <span className="aib-veracity__dot" style={{ background: color }} />
      {label} · {Math.round(score * 100)}%
    </span>
  );
}

ReviewSupportBadge.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

// ── Solvability factor row ─────────────────────────────────
function FactorRow({ f }) {
  const color = f.weight >= 0.75 ? 'var(--color-green-alt)' : f.weight >= 0.5 ? '#facc15' : 'var(--color-red-soft)';
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

FactorRow.propTypes = {
  f: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
  }).isRequired,
};

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

    if (firId === ACTIVE_CASE_FACTS.firId) {
      setData(ACTIVE_CASE_BRIEF);
      setLoading(false);
      return () => { cancelled = true; };
    }

    timerRef.current = setTimeout(() => {
      if (!cancelled) setLatency(true);
    }, 5000);

    apiFetch('/zia_brief/zia_brief', {
      method: 'POST',
      body: JSON.stringify({ caseId: firId }),
    })
      .then(r => r ? r.json() : null)
      .then(d => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        clearTimeout(timerRef.current);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; clearTimeout(timerRef.current); };
  }, [firId, timeRange]);

  // Re-fetch on time range change (shows refresh indicator)
  useEffect(() => {
    if (timeRange.from) {
      setRefreshing(true);
      const t = setTimeout(() => setRefreshing(false), 1500);
      return () => clearTimeout(t);
    }
  }, [timeRange]);

  if (loading) return (
    <div className="aib">
      <div className="aib__header">
        <span className="aib__icon"><PiRobot weight="duotone" /></span>
        <div>
          <h2 className="aib__title">ZIA Intelligence Brief</h2>
          <p className="aib__sub">{firId} — Synthesising multi-agent analysis</p>
        </div>
      </div>
      <Skeleton />
    </div>
  );

  if (!data) return null;

  const narrativeReview = data.narrativeReview || data.veracity || {};
  const provMap = {};
  (data.provenance || []).forEach(p => { provMap[p.function] = p; });

  const exportPDF = () => {
    const rawId = parseInt(String(firId).replace(/\D/g, '')) || 142;
    window.open(`${apiUrl}/zia_brief/pdf?caseId=${rawId}`, '_blank');
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
        <span className="aib__icon"><PiRobot weight="duotone" /></span>
        <div>
          <h2 className="aib__title">ZIA Intelligence Brief</h2>
          <p className="aib__sub">{firId} — Multi-agent synthesis</p>
        </div>
        <div className="aib__header-scores">
          <ScoreGauge score={data.solvability?.score || 0} label="Readiness" size={72} />
          <ScoreGauge score={narrativeReview.score || 0} label="Review aid" size={72} />
          <button className="aib__export-btn" onClick={exportPDF} title="Export as PDF">
            <PiDownloadSimple size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Narrative */}
      <section className="aib__card">
        <div className="aib__card-head">
          <PiClipboardText aria-hidden="true" />
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

      {/* Investigation readiness */}
      <section className="aib__card">
        <div className="aib__card-head">
          <PiChartBar aria-hidden="true" />
          <h3>Investigation Readiness</h3>
          <ReviewSupportBadge score={data.solvability?.score || 0} label={data.solvability?.label || 'REVIEW REQUIRED'} />
          {provMap.solvability_index && <ProvenanceBadge {...provMap.solvability_index} />}
        </div>
        <div className="aib__card-body">
          {(data.solvability?.factors || []).map((f, i) => <FactorRow key={i} f={f} />)}
          {data.solvability?.recommendation && (
            <div className="aib__reco-note"><PiArrowRight aria-hidden="true" /> {data.solvability.recommendation}</div>
          )}
        </div>
      </section>

      {/* Narrative review support */}
      <section className="aib__card">
        <div className="aib__card-head">
          <PiMagnifyingGlass aria-hidden="true" />
          <h3>Narrative Review Support</h3>
          <ReviewSupportBadge score={narrativeReview.score || 0} label={narrativeReview.label || 'REVIEW SUPPORT'} />
          {provMap.narrative_review && <ProvenanceBadge {...provMap.narrative_review} />}
        </div>
        <div className="aib__card-body">
          <div className="aib__veracity-flags">
            {(narrativeReview.flags || []).map((f, i) => {
              const c = f.weight >= 0.7 ? 'var(--color-green-alt)' : f.weight >= 0.4 ? '#facc15' : 'var(--color-red-soft)';
              return (
                <div key={i} className="aib__vflag">
                  <span className="aib__vflag-type">{f.type.replace(/_/g, ' ')}</span>
                  <span className="aib__vflag-pct" style={{ color: c }}>{Math.round(f.weight * 100)}%</span>
                  <span className="aib__vflag-desc">{f.description}</span>
                </div>
              );
            })}
          </div>
          {narrativeReview.methodology && (
            <div className="aib__method">{narrativeReview.methodology}</div>
          )}
        </div>
      </section>

      {/* Similar Cases */}
      <section className="aib__card">
        <div className="aib__card-head">
          <PiGraph aria-hidden="true" />
          <h3>Similar Cases</h3>
        </div>
        <div className="aib__card-body">
          <div className="aib__similar-list">
            {(data.similarCases || []).map((c, i) => {
              const pct = Math.round(c.similarity * 100);
              const color = pct >= 70 ? 'var(--color-green-alt)' : pct >= 50 ? '#facc15' : '#60a5fa';
              return (
                <button key={i} className="aib__similar" onClick={() => switchTab('network')}>
                  <span className="aib__similar-fir">KSP-2026-{String(c.caseId).padStart(4, '0')}</span>
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
          <PiGraph aria-hidden="true" />
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
          <PiLightning aria-hidden="true" />
          <h3>Recommended Next Steps</h3>
        </div>
        <div className="aib__card-body">
          {(data.recommendations || []).map((r, i) => {
            const pc = r.priority === 'HIGH' ? 'var(--color-red-soft)' : r.priority === 'MEDIUM' ? 'var(--color-amber-alt)' : 'var(--color-green-alt)';
            return (
              <div key={i} className="aib__reco">
                <span className="aib__reco-pri" style={{ background: `${pc}20`, color: pc }}>{r.priority}</span>
                <span className="aib__reco-action">{r.action}</span>
                {(r.deadlineLabel || r.deadline) && (
                  <span className="aib__reco-date">
                    {r.deadlineLabel || `by ${new Date(r.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
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
