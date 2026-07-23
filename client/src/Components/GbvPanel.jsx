import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PiInfo, PiMapPin, PiPhoneCall, PiScales, PiShieldCheckered, PiTrendUp,
  PiUsersThree, PiWarningCircle,
} from 'react-icons/pi';
import {
  apiArray, apiObject, displayText, fetchJson, finiteNumber, KARNATAKA_DISTRICTS,
} from '../utils/apiData';

const SYNTHETIC_ANALYTICS = {
  summary: { totalCases: 412, changePercent: -4.8, districtsAffected: 8 },
  byType: [
    { type: 'domestic', label: 'Domestic violence', count: 142, trend: -3.2 },
    { type: 'harassment', label: 'Sexual harassment', count: 96, trend: 2.1 },
    { type: 'kidnapping', label: 'Kidnapping and abduction', count: 71, trend: -1.4 },
    { type: 'sexual', label: 'Sexual assault', count: 63, trend: -6.7 },
    { type: 'dowry', label: 'Dowry-related offences', count: 40, trend: -2.5 },
  ],
  byDistrict: [
    { districtId: 1, count: 104, gbvShare: 0.252 }, { districtId: 2, count: 67, gbvShare: 0.163 },
    { districtId: 3, count: 54, gbvShare: 0.131 }, { districtId: 4, count: 49, gbvShare: 0.119 },
    { districtId: 5, count: 43, gbvShare: 0.104 }, { districtId: 8, count: 38, gbvShare: 0.092 },
  ],
  byMonth: [31, 34, 29, 36, 38, 35, 41, 37, 33, 30, 35, 33].map((cases, index) => ({ year: 2026, month: index + 1, cases })),
  repeatVictims: [
    { districtId: 1, count: 18, victimCount: 11 }, { districtId: 2, count: 10, victimCount: 7 },
    { districtId: 3, count: 8, victimCount: 6 },
  ],
  convictionRate: { overall: 0.31, byDistrict: [{ districtId: 1, rate: 0.34 }, { districtId: 2, rate: 0.29 }, { districtId: 3, rate: 0.27 }] },
};

const FALLBACK_RESOURCES = {
  shelters: [
    { name: 'Emergency response', district: 'Statewide', phone: '112', services: ['Emergency response'] },
    { name: 'Sakhi One-Stop Centre directory', district: 'District referral', phone: 'Verify locally', services: ['Medical', 'Legal', 'Counselling', 'Shelter'] },
  ],
  laws: [
    { name: 'Protection of Women from Domestic Violence Act, 2005', key: 'DV Act' },
    { name: 'Protection of Children from Sexual Offences Act, 2012', key: 'POCSO' },
    { name: 'Dowry Prohibition Act, 1961', key: 'DP Act' },
  ],
};

function districtName(id) {
  return KARNATAKA_DISTRICTS.find((district) => district.id === Number(id))?.name || `District ${displayText(id, 'unknown')}`;
}

function normalizeAnalytics(payload) {
  const source = apiObject(payload, ['summary', 'byType', 'byDistrict'], ['analytics']);
  if (!Object.prototype.hasOwnProperty.call(source, 'summary')) {
    throw new Error('Analytics service returned an unsupported response.');
  }

  const byType = apiArray(source.byType, ['byType']).map((item, index) => ({
    type: displayText(item?.type ?? item?.id, `type-${index}`),
    label: displayText(item?.label ?? item?.type, 'Unclassified'),
    count: Math.max(0, finiteNumber(item?.count)),
    trend: finiteNumber(item?.trend),
  }));
  const byDistrict = apiArray(source.byDistrict, ['byDistrict']).map((item) => ({
    districtId: finiteNumber(item?.districtId ?? item?.id),
    count: Math.max(0, finiteNumber(item?.count)),
    gbvShare: Math.max(0, finiteNumber(item?.gbvShare ?? item?.share)),
  }));
  const byMonth = apiArray(source.byMonth, ['byMonth']).map((item) => ({
    year: finiteNumber(item?.year), month: finiteNumber(item?.month), cases: Math.max(0, finiteNumber(item?.cases ?? item?.count)),
  }));
  const repeatVictims = apiArray(source.repeatVictims, ['repeatVictims']).map((item) => ({
    districtId: finiteNumber(item?.districtId ?? item?.id),
    count: Math.max(0, finiteNumber(item?.count)),
    victimCount: Math.max(0, finiteNumber(item?.victimCount ?? item?.records)),
  }));
  const convictionSource = apiObject(source.convictionRate, ['overall', 'byDistrict']);
  const convictionRate = {
    overall: Math.max(0, finiteNumber(convictionSource.overall)),
    byDistrict: apiArray(convictionSource.byDistrict, ['byDistrict']).map((item) => ({
      districtId: finiteNumber(item?.districtId ?? item?.id), rate: Math.max(0, finiteNumber(item?.rate)),
    })),
  };
  const summary = apiObject(source.summary);
  const computedTotal = byType.reduce((sum, item) => sum + item.count, 0);

  return {
    summary: {
      totalCases: Math.max(0, finiteNumber(summary.totalCases, computedTotal)) || computedTotal,
      changePercent: finiteNumber(summary.changePercent),
      districtsAffected: Math.max(0, finiteNumber(summary.districtsAffected, byDistrict.length)) || byDistrict.length,
    },
    byType, byDistrict, byMonth, repeatVictims, convictionRate,
  };
}

function normalizeResources(payload) {
  const source = apiObject(payload, ['shelters', 'laws'], ['resources']);
  return {
    shelters: apiArray(source.shelters, ['shelters']).map((item) => ({
      name: displayText(item?.name, 'Support service'),
      district: displayText(item?.district, 'Area not specified'),
      phone: displayText(item?.phone, 'Verify locally'),
      services: apiArray(item?.services, ['services']).map((service) => displayText(service, '')).filter(Boolean),
    })),
    laws: apiArray(source.laws, ['laws']).map((item) => ({
      name: displayText(item?.name, 'Legal reference'), key: displayText(item?.key, 'Verify'),
    })),
  };
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '24px 14px', border: '1px dashed var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)' }}>
      <Icon size={22} weight="duotone" aria-hidden="true" />
      <div><strong style={{ color: 'var(--text)' }}>{title}</strong><p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.5 }}>{message}</p></div>
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default function GbvPanel() {
  const [data, setData] = useState(null);
  const [resources, setResources] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      setData(normalizeAnalytics(await fetchJson('/server/gbv_analytics/analytics')));
    } catch {
      setData(SYNTHETIC_ANALYTICS);
      setNotice('Analytics service is unavailable. Showing a fixed synthetic dataset.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      const normalized = normalizeResources(await fetchJson('/server/gbv_analytics/resources'));
      setResources(normalized.shelters.length || normalized.laws.length ? normalized : FALLBACK_RESOURCES);
    } catch {
      setResources(FALLBACK_RESOURCES);
      setNotice('Support directory service is unavailable. Verify every contact before referral.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview' && !data) loadAnalytics();
    if (tab === 'resources' && !resources) loadResources();
  };

  const maxTypeCount = Math.max(1, ...(data?.byType || []).map((item) => item.count));
  const maxDistrictCount = Math.max(1, ...(data?.byDistrict || []).map((item) => item.count));
  const maxMonthlyCases = Math.max(1, ...(data?.byMonth || []).map((item) => item.cases));

  return (
    <div className="panel" style={{ padding: 20, width: '100%', maxWidth: 1100, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 5px', fontSize: 22 }}><PiShieldCheckered weight="duotone" aria-hidden="true" /> Gender violence analytics</h2>
          <p style={{ margin: 0, maxWidth: 720, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>
            Aggregated prototype analysis for trend review and support-service coordination. No person-level risk or credibility inference is shown here.
          </p>
        </div>
        <span style={{ padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 11, fontWeight: 700 }}>SYNTHETIC DEMO</span>
      </div>

      <div role="tablist" aria-label="Gender violence analytics views" style={{ display: 'flex', gap: 5, margin: '18px 0 16px', paddingBottom: 10, borderBottom: '1px solid var(--border-light)', overflowX: 'auto' }}>
        {[['overview', 'Overview'], ['resources', 'Support resources']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => selectTab(id)} style={{ whiteSpace: 'nowrap', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 5, background: activeTab === id ? '#191815' : 'var(--surface)', color: activeTab === id ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 650, fontSize: 13 }}>{label}</button>
        ))}
      </div>

      {notice && <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, padding: '10px 12px', border: '1px solid #e5cf9d', borderRadius: 6, background: '#fbf3db', color: '#6f4c17', fontSize: 12 }}><PiWarningCircle size={18} aria-hidden="true" /> {notice}</div>}
      {loading && <div aria-busy="true" style={{ padding: '26px 0', color: 'var(--text-secondary)', fontSize: 13 }}>Loading analytical view...</div>}

      {!loading && activeTab === 'overview' && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Records in demo', value: data.summary.totalCases.toLocaleString('en-IN'), icon: PiUsersThree },
              { label: 'Period change', value: `${data.summary.changePercent > 0 ? '+' : ''}${data.summary.changePercent.toFixed(1)}%`, icon: PiTrendUp },
              { label: 'Districts represented', value: data.summary.districtsAffected, icon: PiMapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ padding: 14, border: '1px solid var(--border-light)', borderRadius: 7, background: 'var(--surface-alt)' }}>
                <Icon size={19} weight="duotone" aria-hidden="true" /><div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 11 }}>{label}</div><div style={{ marginTop: 2, fontSize: 26, fontWeight: 750 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18, marginBottom: 20 }}>
            <section>
              <h3 style={sectionTitle}>Category distribution</h3>
              {data.byType.length > 0 ? data.byType.map((item) => (
                <div key={item.type} style={{ marginBottom: 10 }}>
                  <div style={barLabel}><span>{item.label}</span><strong>{item.count} · {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%</strong></div>
                  <div style={barTrack}><div style={{ width: `${(item.count / maxTypeCount) * 100}%`, height: '100%', borderRadius: 3, background: item.trend > 0 ? '#9e5c43' : '#4e735e' }} /></div>
                </div>
              )) : <EmptyState icon={PiInfo} title="No category data" message="The service returned no grouped offence records for this period." />}
            </section>

            <section>
              <h3 style={sectionTitle}>District distribution</h3>
              {data.byDistrict.length > 0 ? data.byDistrict.slice(0, 8).map((item) => (
                <div key={item.districtId} style={{ marginBottom: 10 }}>
                  <div style={barLabel}><span>{districtName(item.districtId)}</span><strong>{item.count} · {(item.gbvShare * 100).toFixed(1)}%</strong></div>
                  <div style={barTrack}><div style={{ width: `${(item.count / maxDistrictCount) * 100}%`, height: '100%', borderRadius: 3, background: '#191815' }} /></div>
                </div>
              )) : <EmptyState icon={PiMapPin} title="No district data" message="No district aggregates were returned for this period." />}
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18, paddingTop: 17, borderTop: '1px solid var(--border-light)' }}>
            <section>
              <h3 style={sectionTitle}>Repeat-record review</h3>
              {data.repeatVictims.length > 0 ? (
                <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 390, borderCollapse: 'collapse', fontSize: 12 }}><thead><tr><th style={th}>District</th><th style={th}>Linked cases</th><th style={th}>Records</th></tr></thead><tbody>{data.repeatVictims.slice(0, 8).map((item) => <tr key={item.districtId} style={{ borderTop: '1px solid var(--border-light)' }}><td style={td}>{districtName(item.districtId)}</td><td style={td}>{item.count}</td><td style={td}>{item.victimCount}</td></tr>)}</tbody></table></div>
              ) : <EmptyState icon={PiUsersThree} title="No repeat records" message="An empty aggregate does not establish that no victim needs support." />}
            </section>

            <section>
              <h3 style={sectionTitle}>Outcome indicator</h3>
              {data.convictionRate.overall > 0 ? <><div style={{ fontSize: 30, fontWeight: 750 }}>{(data.convictionRate.overall * 100).toFixed(0)}%</div><p style={{ margin: '3px 0 12px', color: 'var(--text-secondary)', fontSize: 12 }}>Synthetic case-outcome ratio. Verify denominator, case stage, and source period before comparison.</p>{data.convictionRate.byDistrict.slice(0, 5).map((item) => <div key={item.districtId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: '1px solid var(--border-light)', fontSize: 12 }}><span>{districtName(item.districtId)}</span><strong>{(item.rate * 100).toFixed(0)}%</strong></div>)}</> : <EmptyState icon={PiScales} title="No outcome data" message="No denominator-safe outcome ratio was returned." />}
            </section>
          </div>

          <section style={{ marginTop: 20, paddingTop: 17, borderTop: '1px solid var(--border-light)' }}>
            <h3 style={sectionTitle}>Monthly record trend</h3>
            {data.byMonth.length > 0 ? <><div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, paddingTop: 8 }}>{data.byMonth.slice(-24).map((item, index) => <div key={`${item.year}-${item.month}-${index}`} title={`${item.month}/${item.year}: ${item.cases}`} style={{ flex: 1, minWidth: 4, height: `${Math.max(5, (item.cases / maxMonthlyCases) * 110)}px`, borderRadius: '3px 3px 0 0', background: '#736c5e' }} />)}</div><p style={{ margin: '7px 0 0', color: 'var(--text-tertiary)', textAlign: 'center', fontSize: 11 }}>Most recent 24 reported periods in the demonstration dataset</p></> : <EmptyState icon={PiTrendUp} title="No monthly trend" message="The service returned no time-series records." />}
          </section>
        </>
      )}

      {!loading && activeTab === 'resources' && resources && (
        <div style={{ display: 'grid', gap: 22 }}>
          <section>
            <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 7 }}><PiPhoneCall aria-hidden="true" /> Support directory</h3>
            <p style={{ margin: '-4px 0 12px', color: 'var(--text-secondary)', fontSize: 12 }}>Confirm service availability and referral protocol before sharing contact details.</p>
            {resources.shelters.length > 0 ? <div style={{ display: 'grid', gap: 8 }}>{resources.shelters.map((item, index) => <article key={`${item.name}-${index}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(120px, auto)', gap: 10, padding: '11px 0', borderTop: index === 0 ? 0 : '1px solid var(--border-light)' }}><div><strong style={{ fontSize: 13 }}>{item.name}</strong><div style={{ marginTop: 3, color: 'var(--text-secondary)', fontSize: 12 }}>{item.district} · {item.services.join(', ') || 'Services not listed'}</div></div><span style={{ justifySelf: 'end', fontSize: 12, fontWeight: 650 }}>{item.phone}</span></article>)}</div> : <EmptyState icon={PiPhoneCall} title="Directory unavailable" message="Use the approved district referral directory." />}
          </section>
          <section style={{ paddingTop: 17, borderTop: '1px solid var(--border-light)' }}>
            <h3 style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 7 }}><PiScales aria-hidden="true" /> Legal references</h3>
            {resources.laws.length > 0 ? resources.laws.map((item, index) => <div key={`${item.key}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: index === 0 ? 0 : '1px solid var(--border-light)', fontSize: 12 }}><span>{item.name}</span><strong>{item.key}</strong></div>) : <EmptyState icon={PiScales} title="No legal references" message="Consult the current approved legal reference set." />}
          </section>
        </div>
      )}
    </div>
  );
}

const sectionTitle = { margin: '0 0 12px', fontSize: 14, fontWeight: 700 };
const barLabel = { display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4, fontSize: 12 };
const barTrack = { height: 7, overflow: 'hidden', borderRadius: 3, background: 'var(--surface-alt)' };
const th = { padding: '8px 9px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 650 };
const td = { padding: '8px 9px' };
