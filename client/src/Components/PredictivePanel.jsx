import { useCallback, useEffect, useState } from 'react';
import {
  PiArrowClockwise, PiClock, PiFirstAid, PiHouseLine, PiInfo, PiLaptop,
  PiLockOpen, PiMapPin, PiMegaphone, PiMoney, PiShield, PiSiren, PiSkull,
  PiSword, PiUsers, PiWarning, PiWrench,
} from 'react-icons/pi';
import {
  apiArray, apiObject, clampNumber, displayText, fetchJson, finiteNumber, KARNATAKA_DISTRICTS,
} from '../utils/apiData';

const SIGNAL_TIERS = [
  { min: 0.7, label: 'Strong', color: '#8d3030', bg: '#f8ece8', border: '#dfb8aa' },
  { min: 0.4, label: 'Moderate', color: '#8a5b16', bg: '#fbf3db', border: '#e5cf9d' },
  { min: 0, label: 'Exploratory', color: '#31634a', bg: '#eaf3ed', border: '#bfd5c7' },
];

const CRIME_ICONS = {
  theft: PiLockOpen, burglary: PiHouseLine, robbery: PiSword, assault: PiFirstAid,
  murder: PiSkull, sexual: PiShield, fraud: PiMoney, cyber: PiLaptop, drugs: PiWarning,
  property: PiWrench, extortion: PiMegaphone, publicorder: PiUsers,
};

function syntheticScenario(districtId) {
  const district = KARNATAKA_DISTRICTS.find((item) => item.id === Number(districtId))?.name || `District ${districtId}`;
  return {
    predictions: [
      { crimeType: 'theft', location: `${district} transit corridor`, timeWindow: '18:00-22:00', confidence: 0.62, reasoning: 'Fixed demo fixture illustrating an evening concentration signal.' },
      { crimeType: 'assault', location: `${district} mixed-use zone`, timeWindow: '22:00-02:00', confidence: 0.51, reasoning: 'Fixed demo fixture illustrating a late-night review window.' },
      { crimeType: 'cyber', location: `${district} district-wide`, timeWindow: '10:00-14:00', confidence: 0.43, reasoning: 'Fixed demo fixture illustrating a daytime reporting pattern.' },
    ],
    topCrimes: [['theft', 18], ['assault', 13], ['cyber', 9]],
    firCount: 40,
    generatedAt: null,
    method: 'Fixed synthetic fixture',
  };
}

function normalizeTopCrimes(value) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (Array.isArray(item)) return [displayText(item[0], 'Other'), finiteNumber(item[1])];
      return [displayText(item?.crimeType ?? item?.type ?? item?.label, 'Other'), finiteNumber(item?.count ?? item?.value)];
    }).filter(([, count]) => count > 0);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([label, count]) => [label, finiteNumber(count)]).filter(([, count]) => count > 0);
  }
  return [];
}

function normalizeResponse(payload) {
  const source = apiObject(payload, ['predictions', 'firCount', 'topCrimes'], ['prediction']);
  if (!Object.prototype.hasOwnProperty.call(source, 'predictions')) {
    throw new Error('Prediction service returned an unsupported response.');
  }

  const predictions = apiArray(source.predictions, ['predictions']).map((item) => {
    const rawConfidence = finiteNumber(item?.confidence ?? item?.score ?? item?.probability, 0);
    return {
      crimeType: displayText(item?.crime_type ?? item?.crimeType ?? item?.type, 'Unclassified'),
      location: displayText(item?.location ?? item?.area, 'Location not specified'),
      timeWindow: displayText(item?.time_window ?? item?.timeWindow, 'Time window not specified'),
      confidence: clampNumber(rawConfidence > 1 ? rawConfidence / 100 : rawConfidence),
      reasoning: displayText(item?.reasoning ?? item?.explanation, 'No explanation supplied by the service.'),
    };
  });

  return {
    predictions,
    topCrimes: normalizeTopCrimes(source.topCrimes),
    firCount: Math.max(0, finiteNumber(source.firCount)),
    generatedAt: source.generatedAt || source.metadata?.generatedAt || null,
    method: displayText(source.method ?? source.metadata?.method, 'Prototype analytics service'),
  };
}

function getTier(confidence) {
  return SIGNAL_TIERS.find((tier) => confidence >= tier.min) || SIGNAL_TIERS[2];
}

export default function PredictivePanel() {
  const [data, setData] = useState(null);
  const [districtId, setDistrictId] = useState('1');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchData = useCallback(async (selectedDistrict) => {
    setLoading(true);
    setNotice('');
    try {
      const payload = await fetchJson(`/server/predictive_mode/predict?districtId=${selectedDistrict}`);
      setData(normalizeResponse(payload));
      setUsingFallback(false);
    } catch {
      setData(syntheticScenario(selectedDistrict));
      setUsingFallback(true);
      setNotice('Analytics service is unavailable. Showing a fixed synthetic scenario so the workflow remains reviewable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(districtId);
    const interval = window.setInterval(() => fetchData(districtId), 900000);
    return () => window.clearInterval(interval);
  }, [districtId, fetchData]);

  if (loading && !data) {
    return (
      <div className="panel" style={{ padding: 20, width: '100%', boxSizing: 'border-box' }} aria-busy="true">
        <div style={{ height: 20, width: 'min(250px, 70%)', background: 'var(--border-light)', borderRadius: 4, marginBottom: 16 }} />
        {[1, 2, 3].map((item) => (
          <div key={item} style={{ height: 100, background: 'var(--surface-alt)', borderRadius: 6, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  const predictions = data?.predictions || [];

  return (
    <div className="panel" style={{ padding: 20, width: '100%', maxWidth: 1100, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>Predictive intelligence</h2>
          <p style={{ margin: 0, maxWidth: 680, fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            Prototype pattern signals for analyst review. This view does not predict individual behavior or authorize deployment.
          </p>
        </div>
        <span style={{ padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 11, fontWeight: 700 }}>
          SYNTHETIC DEMO · HUMAN REVIEW
        </span>
      </div>

      <div style={{
        display: 'flex', gap: 10, margin: '18px 0 14px', alignItems: 'center', flexWrap: 'wrap',
        padding: '10px 12px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)',
      }}>
        <select
          value={districtId}
          onChange={(event) => setDistrictId(event.target.value)}
          aria-label="Select district for scenario signals"
          style={{ minHeight: 36, padding: '6px 10px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }}
        >
          {KARNATAKA_DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
        </select>
        <span style={{ flex: 1, minWidth: 180, fontSize: 12, color: 'var(--text-secondary)' }}>
          {data?.firCount || 0} synthetic FIR records · {data?.topCrimes?.length || 0} categories · {data?.method}
        </span>
        <button
          type="button"
          onClick={() => fetchData(districtId)}
          disabled={loading}
          aria-label="Refresh scenario signals"
          title="Refresh scenario signals"
          style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', border: '1px solid var(--border-light)', borderRadius: 5, background: '#191815', color: '#fff', cursor: loading ? 'wait' : 'pointer' }}
        >
          <PiArrowClockwise size={17} aria-hidden="true" />
        </button>
      </div>

      {notice && (
        <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, padding: '10px 12px', border: '1px solid #e5cf9d', borderRadius: 6, background: '#fbf3db', color: '#6f4c17', fontSize: 12, lineHeight: 1.5 }}>
          <PiInfo size={18} aria-hidden="true" /> {notice}
        </div>
      )}

      {predictions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12, marginBottom: 16 }}>
          {predictions.map((prediction, index) => {
            const tier = getTier(prediction.confidence);
            const CrimeIcon = CRIME_ICONS[prediction.crimeType.toLowerCase()] || PiSiren;
            return (
              <article key={`${prediction.crimeType}-${index}`} style={{ padding: 15, borderRadius: 7, background: tier.bg, border: `1px solid ${tier.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <CrimeIcon size={22} weight="duotone" aria-hidden="true" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>{tier.label} signal · {Math.round(prediction.confidence * 100)}%</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, textTransform: 'capitalize' }}>{prediction.crimeType}</h3>
                <div style={{ display: 'grid', gap: 4, marginBottom: 9, color: 'var(--text-secondary)', fontSize: 12 }}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><PiMapPin aria-hidden="true" /> {prediction.location}</span>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><PiClock aria-hidden="true" /> {prediction.timeWindow}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>{prediction.reasoning}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, padding: '22px 14px', border: '1px dashed var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)' }}>
          <PiSiren size={22} weight="duotone" aria-hidden="true" />
          <div><strong style={{ color: 'var(--text)' }}>No scenario signals returned</strong><p style={{ margin: '4px 0 0', fontSize: 12 }}>The selected dataset has no model output. No conclusion should be inferred from an empty result.</p></div>
        </div>
      )}

      {data?.topCrimes?.length > 0 && (
        <section style={{ paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
          <h3 style={{ margin: '0 0 9px', fontSize: 13 }}>Synthetic 30-day distribution</h3>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {data.topCrimes.map(([crimeType, count]) => (
              <span key={crimeType} style={{ padding: '5px 9px', borderRadius: 5, background: 'var(--surface-alt)', border: '1px solid var(--border-light)', fontSize: 12, textTransform: 'capitalize' }}>
                {crimeType}: {count}
              </span>
            ))}
          </div>
        </section>
      )}

      <p style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '16px 0 0', fontSize: 11, lineHeight: 1.5, color: 'var(--text-tertiary)' }}>
        <PiInfo size={15} aria-hidden="true" />
        <span>
          {usingFallback ? 'Fixed synthetic fixture. ' : ''}Correlations are not proof of causation. An authorized analyst must verify source records, model validity, and legal basis before any operational decision.
          {data?.generatedAt ? ` Service timestamp: ${new Date(data.generatedAt).toLocaleString()}.` : ''}
        </span>
      </p>
    </div>
  );
}
