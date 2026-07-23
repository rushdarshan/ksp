import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiChartLine, PiInfo, PiMapPin, PiPhoneCall, PiShieldCheckered, PiTrendUp, PiWarningCircle,
} from 'react-icons/pi';
import {
  apiArray, apiObject, displayText, fetchJson, finiteNumber, KARNATAKA_DISTRICTS,
} from '../utils/apiData';

const CATEGORY_GUIDANCE = {
  theft: ['Lock vehicles and secure valuables out of sight.', 'Record serial numbers for high-value property.', 'Report suspicious activity through an approved police channel.'],
  burglary: ['Use functioning locks and adequate entry lighting.', 'Ask a trusted contact to monitor an empty property.', 'Preserve the scene and avoid touching disturbed objects.'],
  cyber: ['Never share OTPs, PINs, or account passwords.', 'Verify payment requests through a second channel.', 'Preserve messages, transaction IDs, and screenshots when reporting fraud.'],
  fraud: ['Verify identities before transferring money.', 'Do not install remote-access software at a caller’s request.', 'Contact the relevant bank promptly after a suspicious transaction.'],
  default: ['Use well-lit routes and remain aware of local advisories.', 'Preserve relevant details when reporting an incident.', 'Call 112 when immediate emergency assistance is required.'],
};

function syntheticPublicData(districtId) {
  const crimeTypes = ['theft', 'burglary', 'cyber', 'fraud'];
  const crimeType = crimeTypes[(Number(districtId) - 1) % crimeTypes.length];
  const baseline = 24 + Number(districtId);
  return {
    exceedance: {
      worstOffense: {
        crimeType,
        exceedanceCurve: [
          { returnPeriodYears: 1, thresholdExceedance: baseline },
          { returnPeriodYears: 2, thresholdExceedance: baseline + 5 },
          { returnPeriodYears: 5, thresholdExceedance: baseline + 11 },
          { returnPeriodYears: 10, thresholdExceedance: baseline + 16 },
        ],
      },
      metadata: { note: 'Fixed synthetic public-dashboard fixture' },
    },
    darkFigure: { gapPercent: 28 + (Number(districtId) % 5) * 4 },
    transit: {
      detectedTransits: Number(districtId) % 3 === 0 ? [] : [
        { startDate: '2026-06-04', endDate: '2026-06-10', significance: 1.8 },
        { startDate: '2026-06-18', endDate: '2026-06-22', significance: 1.6 },
      ],
      metadata: { note: 'Fixed synthetic pattern windows' },
    },
  };
}

function normalizeExceedance(payload) {
  const source = apiObject(payload, ['worstOffense', 'curves'], ['exceedance']);
  const worst = apiObject(source.worstOffense, ['crimeType', 'exceedanceCurve']);
  if (!Object.prototype.hasOwnProperty.call(worst, 'exceedanceCurve')) throw new Error('Unsupported exceedance response');
  return {
    worstOffense: {
      crimeType: displayText(worst.crimeType, 'unclassified'),
      exceedanceCurve: apiArray(worst.exceedanceCurve, ['exceedanceCurve']).map((item) => ({
        returnPeriodYears: Math.max(1, finiteNumber(item?.returnPeriodYears, 1)),
        thresholdExceedance: Math.max(0, finiteNumber(item?.thresholdExceedance ?? item?.threshold)),
      })).sort((a, b) => a.returnPeriodYears - b.returnPeriodYears),
    },
    metadata: apiObject(source.metadata),
  };
}

function normalizeDarkFigure(payload) {
  const source = apiObject(payload, ['gapPercent', 'firCounts'], ['darkFigure']);
  if (!Object.prototype.hasOwnProperty.call(source, 'gapPercent')) throw new Error('Unsupported reporting-gap response');
  return { gapPercent: Math.max(0, finiteNumber(source.gapPercent)), recommendation: displayText(source.recommendation, '') };
}

function normalizeTransit(payload) {
  const source = apiObject(payload, ['detectedTransits', 'timeSeries'], ['transit']);
  if (!Object.prototype.hasOwnProperty.call(source, 'detectedTransits')) throw new Error('Unsupported pattern-window response');
  return { detectedTransits: apiArray(source.detectedTransits, ['detectedTransits']), metadata: apiObject(source.metadata) };
}

export default function DeterrenceDashboard() {
  const [districtId, setDistrictId] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setNotice('');
    const fallback = syntheticPublicData(districtId);
    const responses = await Promise.allSettled([
      fetchJson(`/server/exceedance_curve/exceedance?district=${districtId}`).then(normalizeExceedance),
      fetchJson(`/server/dark_figure/dark-figure?district=${districtId}`).then(normalizeDarkFigure),
      fetchJson(`/server/transit_detection/transit-detection?district=${districtId}&crimeType=theft`).then(normalizeTransit),
    ]);
    if (requestId.current !== currentRequest) return;

    const fallbackCount = responses.filter((response) => response.status === 'rejected').length;
    setData({
      exceedance: responses[0].status === 'fulfilled' ? responses[0].value : fallback.exceedance,
      darkFigure: responses[1].status === 'fulfilled' ? responses[1].value : fallback.darkFigure,
      transit: responses[2].status === 'fulfilled' ? responses[2].value : fallback.transit,
    });
    if (fallbackCount > 0) setNotice(`${fallbackCount} data service${fallbackCount === 1 ? '' : 's'} unavailable. Fixed synthetic values fill the missing indicator${fallbackCount === 1 ? '' : 's'}.`);
    setLoading(false);
  }, [districtId]);

  useEffect(() => { load(); }, [load]);

  const curve = data?.exceedance?.worstOffense?.exceedanceCurve || [];
  const oneYearPoint = curve.find((point) => point.returnPeriodYears === 1) || curve[0];
  const topCategory = data?.exceedance?.worstOffense?.crimeType || 'unclassified';
  const guidance = CATEGORY_GUIDANCE[topCategory.toLowerCase()] || CATEGORY_GUIDANCE.default;
  const patternWindows = data?.transit?.detectedTransits || [];

  return (
    <div className="panel deterrence-panel" style={{ padding: 20, width: '100%', maxWidth: 1000, margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 5px', fontSize: 22 }}><PiShieldCheckered weight="duotone" aria-hidden="true" /> Public safety indicators</h2>
          <p style={{ margin: 0, maxWidth: 680, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>District-level demonstration of aggregated statistical indicators. This is not real-time incident data or a personal safety guarantee.</p>
        </div>
        <span style={{ padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 11, fontWeight: 700 }}>SYNTHETIC DEMO · NO PII</span>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '18px 0 14px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <PiMapPin size={18} aria-hidden="true" />
        <label htmlFor="public-district" style={{ fontSize: 13, fontWeight: 650 }}>District</label>
        <select id="public-district" value={districtId} onChange={(event) => setDistrictId(Number(event.target.value))} style={{ minHeight: 36, maxWidth: '100%', padding: '6px 10px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--surface)', color: 'var(--text)' }}>{KARNATAKA_DISTRICTS.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
      </div>

      {notice && <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, padding: '10px 12px', border: '1px solid #e5cf9d', borderRadius: 6, background: '#fbf3db', color: '#6f4c17', fontSize: 12 }}><PiWarningCircle size={18} aria-hidden="true" /> {notice}</div>}
      {loading && !data && <p aria-busy="true" style={{ padding: '26px 0', color: 'var(--text-secondary)', fontSize: 13 }}>Loading district indicators...</p>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 10, marginBottom: 20 }}>
            <div style={metricStyle}><PiChartLine size={20} weight="duotone" aria-hidden="true" /><span style={metricLabel}>One-year threshold</span><strong style={metricValue}>{oneYearPoint?.thresholdExceedance ?? 'N/A'}</strong><small style={metricNote}>synthetic incidents / month</small></div>
            <div style={metricStyle}><PiTrendUp size={20} weight="duotone" aria-hidden="true" /><span style={metricLabel}>Category under review</span><strong style={{ ...metricValue, fontSize: 20, textTransform: 'capitalize' }}>{topCategory.replaceAll('_', ' ')}</strong><small style={metricNote}>illustrative highest threshold</small></div>
            <div style={metricStyle}><PiInfo size={20} weight="duotone" aria-hidden="true" /><span style={metricLabel}>Reporting-gap model</span><strong style={metricValue}>{finiteNumber(data.darkFigure?.gapPercent)}%</strong><small style={metricNote}>estimate, not observed incidents</small></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 18, marginBottom: 20 }}>
            <section>
              <h3 style={sectionTitle}>Threshold curve</h3>
              {curve.length > 0 ? <div style={{ display: 'grid', gap: 7 }}>{curve.map((point) => <div key={point.returnPeriodYears} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 9, alignItems: 'center', fontSize: 12 }}><span>{point.returnPeriodYears}-year</span><div style={{ height: 7, overflow: 'hidden', borderRadius: 3, background: 'var(--surface-alt)' }}><div style={{ width: `${Math.min(100, (point.thresholdExceedance / Math.max(1, ...curve.map((item) => item.thresholdExceedance))) * 100)}%`, height: '100%', borderRadius: 3, background: '#736c5e' }} /></div><strong>{point.thresholdExceedance}</strong></div>)}</div> : <div style={emptyStyle}>No threshold curve was returned.</div>}
            </section>
            <section>
              <h3 style={sectionTitle}>Pattern windows for review</h3>
              <div style={{ fontSize: 30, fontWeight: 750 }}>{patternWindows.length}</div>
              <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>Statistical windows flagged in the synthetic series. A flag does not establish a crime spree or forecast future incidents.</p>
            </section>
          </div>

          <section style={{ paddingTop: 17, borderTop: '1px solid var(--border-light)' }}>
            <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 7 }}><PiPhoneCall aria-hidden="true" /> General prevention guidance</h3>
            <ul style={{ margin: 0, paddingLeft: 19, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.75 }}>{guidance.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>

          <p style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '18px 0 0', paddingTop: 14, borderTop: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: 11, lineHeight: 1.5 }}><PiInfo size={16} aria-hidden="true" /> Fixed demonstration and unvalidated model outputs may be present. Verify current official advisories and contact local authorities for operational information.</p>
        </>
      )}
    </div>
  );
}

const metricStyle = { minHeight: 132, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 14, border: '1px solid var(--border-light)', borderRadius: 7, background: 'var(--surface-alt)' };
const metricLabel = { marginTop: 10, color: 'var(--text-secondary)', fontSize: 11 };
const metricValue = { marginTop: 2, fontSize: 28, fontWeight: 750 };
const metricNote = { marginTop: 'auto', paddingTop: 8, color: 'var(--text-tertiary)', fontSize: 10 };
const sectionTitle = { margin: '0 0 11px', fontSize: 14, fontWeight: 700 };
const emptyStyle = { padding: '20px 12px', border: '1px dashed var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12 };
