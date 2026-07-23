import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PiClockCounterClockwise, PiFlag, PiHourglass, PiInfo, PiMagnifyingGlass,
  PiShieldCheckered, PiUsersThree, PiWarningCircle,
} from 'react-icons/pi';
import { apiArray, apiObject, clampNumber, displayText, fetchJson, finiteNumber } from '../utils/apiData';

function normalizeScore(payload) {
  const source = apiObject(payload, ['riskScore', 'riskLevel', 'victimId'], ['score', 'assessment']);
  if (!Object.prototype.hasOwnProperty.call(source, 'riskScore')) {
    throw new Error('The scoring service returned an unsupported response.');
  }

  return {
    victimId: displayText(source.victimId ?? source.id, 'Unknown record'),
    victimName: displayText(source.victimName, ''),
    riskScore: clampNumber(source.riskScore, 0, 100),
    riskLevel: displayText(source.riskLevel, 'Unclassified'),
    firCount: Math.max(0, finiteNumber(source.firCount)),
    timeSpanDays: Math.max(0, finiteNumber(source.timeSpanDays)),
    escalationRate: Math.max(0, finiteNumber(source.escalationRate)),
    recentIntervalDays: source.recentMONdays === null ? null : Math.max(0, finiteNumber(source.recentMONdays)),
    factors: apiArray(source.factors, ['factors']).map((factor) => displayText(factor, '')).filter(Boolean),
    history: apiArray(source.history, ['history']),
  };
}

function normalizeQueue(payload) {
  return apiArray(payload, ['highRiskVictims', 'victims', 'records'])
    .map((item) => ({
      victimId: displayText(item?.victimId ?? item?.id, ''),
      count: Math.max(0, finiteNumber(item?.count ?? item?.firCount)),
    }))
    .filter((item) => item.victimId && item.count > 0);
}

function reviewTone(level) {
  const normalized = String(level).toLowerCase();
  if (normalized === 'high') return { label: 'Elevated review', color: '#8d3030', bg: '#f8ece8', border: '#dfb8aa' };
  if (normalized === 'medium') return { label: 'Priority review', color: '#8a5b16', bg: '#fbf3db', border: '#e5cf9d' };
  return { label: 'Routine review', color: '#31634a', bg: '#eaf3ed', border: '#bfd5c7' };
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN');
}

export default function VictimRiskPanel() {
  const [searchParams] = useSearchParams();
  const initialVictimId = searchParams.get('name') || '';
  const [victimId, setVictimId] = useState(initialVictimId);
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [reviewQueue, setReviewQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');

  const search = useCallback(async (requestedId) => {
    const id = String(requestedId ?? '').trim();
    if (!id) {
      setSearchError('Enter a victim record ID to run a review.');
      return;
    }

    setSearching(true);
    setSearchError('');
    setResult(null);
    try {
      const payload = await fetchJson(`/server/victim_risk_shield/score/${encodeURIComponent(id)}`);
      setResult(normalizeScore(payload));
    } catch {
      setSearchError('The review score is unavailable. No score has been inferred or substituted.');
    } finally {
      setSearching(false);
    }
  }, []);

  const loadReviewQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError('');
    try {
      const payload = await fetchJson('/server/victim_risk_shield/high-risk');
      setReviewQueue(normalizeQueue(payload));
    } catch {
      setReviewQueue([]);
      setQueueError('The repeat-record queue could not be loaded.');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => { loadReviewQueue(); }, [loadReviewQueue]);

  useEffect(() => {
    if (initialVictimId) search(initialVictimId);
  }, [initialVictimId, search]);

  const openRecord = (id) => {
    setVictimId(id);
    search(id);
  };

  const tone = result ? reviewTone(result.riskLevel) : null;

  return (
    <div className="panel victim-risk-panel" style={{ padding: 20, width: '100%', maxWidth: 1000, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h2 className="panel-icon-title" style={{ margin: '0 0 5px', fontSize: 22 }}>
            <PiShieldCheckered weight="duotone" aria-hidden="true" /> Victim support review
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: 700, fontSize: 13, lineHeight: 1.55 }}>
            Prototype triage of repeat-victimization indicators from available records. It cannot determine protection, credibility, or investigation action.
          </p>
        </div>
        <span style={{ padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 11, fontWeight: 700 }}>
          SYNTHETIC DEMO · HUMAN REVIEW
        </span>
      </div>

      <form
        onSubmit={(event) => { event.preventDefault(); search(victimId); }}
        style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', margin: '20px 0' }}
      >
        <label style={{ flex: '1 1 300px', minWidth: 0, display: 'grid', gap: 7, fontSize: 13, fontWeight: 600 }}>
          Victim record ID
          <input
            aria-label="Victim record ID"
            value={victimId}
            onChange={(event) => setVictimId(event.target.value)}
            placeholder="For example, V100"
            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 40, padding: '9px 11px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface)', color: 'var(--text)', fontSize: 14 }}
          />
        </label>
        <button
          type="submit"
          disabled={searching}
          style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', border: 0, borderRadius: 5, background: '#191815', color: '#fff', fontWeight: 650, cursor: searching ? 'wait' : 'pointer' }}
        >
          {searching ? <PiHourglass aria-hidden="true" /> : <PiMagnifyingGlass aria-hidden="true" />}
          {searching ? 'Reviewing' : 'Review record'}
        </button>
      </form>

      {searchError && (
        <div role="alert" style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '10px 12px', border: '1px solid #dfb8aa', borderRadius: 6, background: '#f8ece8', color: '#78312d', fontSize: 12 }}>
          <PiWarningCircle size={18} aria-hidden="true" /> {searchError}
        </div>
      )}

      {result && tone && (
        <section aria-label="Prototype victim support review result" style={{ marginBottom: 22, padding: 17, border: `1px solid ${tone.border}`, borderRadius: 7, background: tone.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'wrap', marginBottom: 15 }}>
            <div style={{ width: 72, height: 72, flex: '0 0 72px', display: 'grid', placeItems: 'center', border: `7px solid ${tone.border}`, borderRadius: '50%', background: 'var(--surface)', color: tone.color, fontSize: 20, fontWeight: 750 }}>
              {Math.round(result.riskScore)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ marginBottom: 3, color: tone.color, fontSize: 17, fontWeight: 700 }}>{tone.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {result.firCount} linked FIR{result.firCount === 1 ? '' : 's'} · Record {result.victimName || result.victimId}
              </div>
              <div style={{ marginTop: 3, color: 'var(--text-tertiary)', fontSize: 11 }}>Prototype score, not a protection or enforcement decision</div>
            </div>
          </div>

          {(result.timeSpanDays > 0 || result.recentIntervalDays !== null) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 8, marginBottom: 15 }}>
              <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--surface)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Record time span</div><strong>{result.timeSpanDays} days</strong>
              </div>
              <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--surface)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Recorded interval</div><strong>{result.recentIntervalDays ?? 'Not available'}{result.recentIntervalDays !== null ? ' days' : ''}</strong>
              </div>
              <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--surface)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Prototype rate</div><strong>{result.escalationRate.toFixed(2)} / month</strong>
              </div>
            </div>
          )}

          <h3 style={{ margin: '0 0 7px', fontSize: 13 }}>Signals to verify</h3>
          {result.factors.length > 0 ? result.factors.map((factor, index) => (
            <div key={`${factor}-${index}`} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '7px 0', borderTop: index === 0 ? 0 : `1px solid ${tone.border}`, fontSize: 12, lineHeight: 1.45 }}>
              <PiFlag color={tone.color} aria-hidden="true" /> {factor}
            </div>
          )) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>The service returned no supporting factors. Treat the score as incomplete.</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 13, padding: '10px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border-light)', fontSize: 12, lineHeight: 1.5 }}>
            <PiInfo size={18} aria-hidden="true" />
            <span><strong>Required review:</strong> verify source FIRs, apply the approved victim-support protocol, and record the responsible officer’s decision. Do not act from this score alone.</span>
          </div>

          {result.history.length > 0 && (
            <details style={{ marginTop: 13 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 650, fontSize: 13 }}>Source history ({result.history.length})</summary>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={{ width: '100%', minWidth: 460, fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>FIR</th><th style={th}>Date</th><th style={th}>District</th></tr></thead>
                  <tbody>
                    {result.history.map((item, index) => (
                      <tr key={`${item?.firNo || 'fir'}-${index}`} style={{ borderTop: '1px solid var(--border-light)' }}>
                        <td style={td}>{displayText(item?.firNo, 'Unavailable')}{item?.year ? `/${item.year}` : ''}</td>
                        <td style={td}>{safeDate(item?.date)}</td>
                        <td style={td}>{displayText(item?.districtId, 'Unavailable')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </section>
      )}

      <section aria-labelledby="repeat-review-title" style={{ paddingTop: 17, borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <h3 id="repeat-review-title" style={{ display: 'flex', alignItems: 'center', gap: 7, margin: 0, fontSize: 15 }}>
            <PiUsersThree size={19} aria-hidden="true" /> Repeat-record review queue
          </h3>
          <button type="button" onClick={loadReviewQueue} disabled={queueLoading} title="Refresh review queue" aria-label="Refresh review queue" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface)', color: 'var(--text)', cursor: queueLoading ? 'wait' : 'pointer' }}>
            <PiClockCounterClockwise aria-hidden="true" />
          </button>
        </div>

        {queueError && <p role="status" style={{ margin: '0 0 10px', color: '#78312d', fontSize: 12 }}>{queueError}</p>}
        {queueLoading && reviewQueue === null && <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Loading repeat records...</p>}

        {reviewQueue && reviewQueue.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 430, fontSize: 13, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-alt)' }}><th style={th}>Record ID</th><th style={th}>Linked FIRs</th><th style={th}>Action</th></tr></thead>
              <tbody>
                {reviewQueue.map((item) => (
                  <tr key={item.victimId} style={{ borderTop: '1px solid var(--border-light)' }}>
                    <td style={td}>{item.victimId}</td><td style={td}><strong>{item.count}</strong></td>
                    <td style={td}><button type="button" onClick={() => openRecord(item.victimId)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: '#191815', color: '#fff', cursor: 'pointer', fontSize: 12 }}><PiMagnifyingGlass aria-hidden="true" /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reviewQueue && reviewQueue.length === 0 && !queueLoading && (
          <div style={{ padding: '20px 12px', border: '1px dashed var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12, textAlign: 'center' }}>
            No repeat records were returned. This does not establish that no victim is at risk.
          </div>
        )}
      </section>
    </div>
  );
}

const th = { padding: '9px 10px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 650 };
const td = { padding: '9px 10px' };
