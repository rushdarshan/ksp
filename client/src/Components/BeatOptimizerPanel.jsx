import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PiArrowClockwise, PiChartBar, PiInfo, PiMapPin, PiMapTrifold, PiPath,
  PiUsersThree, PiWarningCircle,
} from 'react-icons/pi';
import {
  apiArray, apiObject, clampNumber, displayText, fetchJson, finiteNumber, KARNATAKA_DISTRICTS,
} from '../utils/apiData';

function syntheticPlanningData(districtId, flowMode) {
  const district = KARNATAKA_DISTRICTS.find((item) => item.id === Number(districtId))?.name || `District ${districtId}`;
  const base = Number(districtId) % 5;
  const names = ['Central', 'Market', 'Transit', 'East', 'South'];
  const beats = names.map((name, index) => ({
    id: `${districtId}-${index + 1}`,
    name: `${district} · ${name}`,
    totalCrimes: 34 + base * 3 + index * 9,
    areaKm2: Number((4.8 + index * 1.3).toFixed(1)),
    officersAssigned: 5 + (index % 3),
    responseTimeMin: 8 + index * 2,
    riskScore: Number((0.34 + index * 0.1).toFixed(2)),
  }));
  const optimization = beats.map((beat, index) => {
    const scenarioOfficers = Math.max(4, Math.round(beat.totalCrimes / 8));
    const loadRatio = Number((beat.totalCrimes / Math.max(1, beat.officersAssigned)).toFixed(1));
    return {
      beatId: beat.id,
      beatName: beat.name,
      currentCrimes: beat.totalCrimes,
      currentOfficers: beat.officersAssigned,
      recommendedOfficers: scenarioOfficers,
      loadRatio,
      status: scenarioOfficers > beat.officersAssigned ? 'Review load' : scenarioOfficers < beat.officersAssigned ? 'Capacity available' : 'Balanced',
      index,
    };
  });
  const flowData = flowMode ? {
    criminalClusters: [
      { clusterId: 'A', criminalCount: 12 + base, topCrimeType: 'theft', avgTravelKm: 3.8 },
      { clusterId: 'B', criminalCount: 8 + base, topCrimeType: 'burglary', avgTravelKm: 5.1 },
    ],
    flowBeats: beats.map((beat, index) => ({
      beatId: beat.id,
      flowRiskScore: Number((0.42 + index * 0.08).toFixed(2)),
      predictedTargetCrime: index % 2 ? 'burglary' : 'theft',
      recommendedPatrolShift: index % 2 ? 'Evening review' : 'Morning review',
    })),
  } : null;
  const routes = beats.slice(0, 4).map((beat, index) => ({
    beatId: beat.id,
    beatName: beat.name,
    totalDistance: Number((5.2 + index * 1.1).toFixed(1)),
    estimatedMinutes: 38 + index * 7,
    route: [
      { label: 'Station', lat: 12.96 + index * 0.01, lng: 77.58 + index * 0.01 },
      { label: 'Transit node', lat: 12.97 + index * 0.01, lng: 77.59 + index * 0.01 },
      { label: 'Market area', lat: 12.98 + index * 0.01, lng: 77.60 + index * 0.01 },
    ],
  }));
  const overloaded = optimization.filter((item) => item.status === 'Review load').length;
  const balanced = optimization.filter((item) => item.status === 'Balanced').length;

  return {
    beats: { districtId, beats },
    optimization: {
      districtId, optimization, flowMode, flowData,
      summary: {
        totalBeats: beats.length,
        overloaded,
        balanced,
        avgLoad: Number((beats.reduce((sum, beat) => sum + beat.totalCrimes, 0) / beats.length).toFixed(1)),
      },
    },
    routes: { districtId, routes },
  };
}

function normalizeBeats(payload) {
  const source = apiObject(payload, ['beats', 'districtId'], ['beatData']);
  if (!Object.prototype.hasOwnProperty.call(source, 'beats')) throw new Error('Unsupported beat response');
  const beats = apiArray(source.beats, ['beats']).map((item, index) => {
      const rawRisk = finiteNumber(item?.riskScore ?? item?.risk, 0);
      return {
        id: displayText(item?.id ?? item?.beatId, `beat-${index + 1}`),
        name: displayText(item?.name ?? item?.beatName, `Beat ${index + 1}`),
        totalCrimes: Math.max(0, finiteNumber(item?.totalCrimes ?? item?.crimes)),
        areaKm2: Math.max(0, finiteNumber(item?.areaKm2 ?? item?.area)),
        officersAssigned: Math.max(0, finiteNumber(item?.officersAssigned ?? item?.officers)),
        responseTimeMin: Math.max(0, finiteNumber(item?.responseTimeMin ?? item?.responseMinutes)),
        riskScore: clampNumber(rawRisk > 1 ? rawRisk / 100 : rawRisk),
      };
    });
  const hasUsableWorkload = beats.some((beat) => beat.totalCrimes > 0
    || beat.areaKm2 > 0
    || beat.responseTimeMin > 0
    || beat.riskScore > 0);
  if (beats.length > 0 && !hasUsableWorkload) throw new Error('Beat response contains placeholder rows only');

  return {
    districtId: source.districtId,
    beats,
  };
}

function normalizeOptimization(payload) {
  const source = apiObject(payload, ['optimization', 'summary'], ['optimizationData']);
  if (!Object.prototype.hasOwnProperty.call(source, 'optimization')) throw new Error('Unsupported optimization response');
  const rows = apiArray(source.optimization, ['optimization']).map((item, index) => ({
    beatId: displayText(item?.beatId ?? item?.id, `beat-${index + 1}`),
    beatName: displayText(item?.beatName ?? item?.name, ''),
    currentCrimes: Math.max(0, finiteNumber(item?.currentCrimes ?? item?.crimes)),
    currentOfficers: Math.max(0, finiteNumber(item?.currentOfficers ?? item?.officers)),
    recommendedOfficers: Math.max(0, finiteNumber(item?.recommendedOfficers ?? item?.proposedOfficers)),
    loadRatio: Math.max(0, finiteNumber(item?.loadRatio)),
    status: displayText(item?.status, 'Review'),
  }));
  const summary = apiObject(source.summary);
  const flowSource = apiObject(source.flowData, ['criminalClusters', 'flowBeats']);
  const flowData = source.flowMode ? {
    criminalClusters: apiArray(flowSource.criminalClusters, ['criminalClusters']),
    flowBeats: apiArray(flowSource.flowBeats, ['flowBeats']),
  } : null;
  return {
    districtId: source.districtId,
    optimization: rows,
    flowMode: Boolean(source.flowMode),
    flowData,
    summary: {
      totalBeats: Math.max(0, finiteNumber(summary.totalBeats, rows.length)) || rows.length,
      overloaded: Math.max(0, finiteNumber(summary.overloaded, rows.filter((item) => item.status === 'Overloaded').length)),
      balanced: Math.max(0, finiteNumber(summary.balanced, rows.filter((item) => item.status === 'Balanced').length)),
      avgLoad: Math.max(0, finiteNumber(summary.avgLoad)),
    },
  };
}

function normalizeRoutes(payload) {
  const source = apiObject(payload, ['routes', 'districtId'], ['patrol', 'routeData']);
  if (!Object.prototype.hasOwnProperty.call(source, 'routes')) throw new Error('Unsupported route response');
  return {
    districtId: source.districtId,
    routes: apiArray(source.routes, ['routes']).map((item, index) => ({
      beatId: displayText(item?.beatId ?? item?.id, `route-${index + 1}`),
      beatName: displayText(item?.beatName ?? item?.name, `Beat ${index + 1}`),
      totalDistance: Math.max(0, finiteNumber(item?.totalDistance ?? item?.distanceKm)),
      estimatedMinutes: Math.max(0, finiteNumber(item?.estimatedMinutes ?? item?.durationMinutes)),
      route: apiArray(item?.route, ['route', 'stops']).map((stop, stopIndex) => ({
        label: displayText(stop?.label ?? stop?.name, `Stop ${stopIndex + 1}`),
        lat: finiteNumber(stop?.lat ?? stop?.latitude, Number.NaN),
        lng: finiteNumber(stop?.lng ?? stop?.longitude, Number.NaN),
      })),
    })),
  };
}

function EmptyState({ icon: Icon, title, message }) {
  return <div style={{ display: 'flex', gap: 10, padding: '24px 14px', border: '1px dashed var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)' }}><Icon size={22} weight="duotone" aria-hidden="true" /><div><strong style={{ color: 'var(--text)' }}>{title}</strong><p style={{ margin: '4px 0 0', fontSize: 12 }}>{message}</p></div></div>;
}

EmptyState.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default function BeatOptimizerPanel() {
  const [districtId, setDistrictId] = useState(1);
  const [districts, setDistricts] = useState(KARNATAKA_DISTRICTS);
  const [beats, setBeats] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('beats');
  const [flowMode, setFlowMode] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    fetchJson('/server/beat_optimizer/districts')
      .then((payload) => {
        const list = apiArray(payload, ['districts']).map((item, index) => ({
          id: finiteNumber(item?.id ?? item?.districtId, index + 1),
          name: displayText(item?.name ?? item?.districtName, `District ${index + 1}`),
        }));
        if (active && list.length > 0) setDistricts(list);
      })
      .catch(() => { if (active) setDistricts(KARNATAKA_DISTRICTS); });
    return () => { active = false; };
  }, []);

  const load = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setNotice('');
    const fallback = syntheticPlanningData(districtId, flowMode);

    const requests = await Promise.allSettled([
      fetchJson(`/server/beat_optimizer/beats/${districtId}`).then(normalizeBeats),
      fetchJson(`/server/beat_optimizer/optimize/${districtId}${flowMode ? '?flowMode=true' : ''}`).then(normalizeOptimization),
      fetchJson(`/server/beat_optimizer/patrol/${districtId}`).then(normalizeRoutes),
    ]);
    if (requestId.current !== currentRequest) return;

    const fallbackCount = requests.filter((result) => result.status === 'rejected').length;
    setBeats(requests[0].status === 'fulfilled' ? requests[0].value : fallback.beats);
    setOptimization(requests[1].status === 'fulfilled' ? requests[1].value : fallback.optimization);
    setRoutes(requests[2].status === 'fulfilled' ? requests[2].value : fallback.routes);
    if (fallbackCount > 0) setNotice(`${fallbackCount} planning service${fallbackCount === 1 ? '' : 's'} unavailable. Fixed synthetic fixtures fill the missing view${fallbackCount === 1 ? '' : 's'}.`);
    setLoading(false);
  }, [districtId, flowMode]);

  useEffect(() => { load(); }, [load]);

  const flowClusters = apiArray(optimization?.flowData?.criminalClusters, ['criminalClusters']);
  const flowBeats = apiArray(optimization?.flowData?.flowBeats, ['flowBeats']);

  return (
    <div className="panel" style={{ padding: 20, width: '100%', maxWidth: 1100, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div><h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 5px', fontSize: 22 }}><PiMapTrifold weight="duotone" aria-hidden="true" /> Beat planning workspace</h2><p style={{ margin: 0, maxWidth: 720, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>Compares workload assumptions and patrol sequences for planning discussion. It does not issue staffing or deployment orders.</p></div>
        <span style={{ padding: '5px 9px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 11, fontWeight: 700 }}>SYNTHETIC DEMO · HUMAN REVIEW</span>
      </div>

      <div style={{ display: 'flex', gap: 9, margin: '18px 0 12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 650 }}>District
          <select value={districtId} onChange={(event) => setDistrictId(Number(event.target.value))} style={{ minHeight: 36, padding: '6px 10px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--surface)', color: 'var(--text)' }}>{districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
        </label>
        <button type="button" onClick={load} disabled={loading} title="Refresh planning data" aria-label="Refresh planning data" style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', border: '1px solid var(--border-light)', borderRadius: 5, background: '#191815', color: '#fff', cursor: loading ? 'wait' : 'pointer' }}><PiArrowClockwise aria-hidden="true" /></button>
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 650 }}><input type="checkbox" checked={flowMode} onChange={(event) => setFlowMode(event.target.checked)} /> Association-flow overlay <span style={{ padding: '2px 5px', borderRadius: 4, background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 10 }}>BETA</span></label>
      </div>

      <div role="tablist" aria-label="Beat planning views" style={{ display: 'flex', gap: 5, marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid var(--border-light)', overflowX: 'auto' }}>
        {[
          { id: 'beats', label: 'Beat inputs', icon: PiChartBar },
          { id: 'optimize', label: 'Allocation scenario', icon: PiUsersThree },
          { id: 'patrol', label: 'Patrol sequence', icon: PiPath },
        ].map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', padding: '8px 11px', border: '1px solid var(--border-light)', borderRadius: 5, background: tab === id ? '#191815' : 'var(--surface)', color: tab === id ? '#fff' : 'var(--text)', cursor: 'pointer', fontWeight: 650, fontSize: 12 }}><Icon aria-hidden="true" /> {label}</button>)}
      </div>

      {notice && <div role="status" style={{ display: 'flex', gap: 8, marginBottom: 14, padding: '10px 12px', border: '1px solid #e5cf9d', borderRadius: 6, background: '#fbf3db', color: '#6f4c17', fontSize: 12 }}><PiWarningCircle size={18} aria-hidden="true" /> {notice}</div>}
      {loading && !beats && <p aria-busy="true" style={{ padding: '24px 0', color: 'var(--text-secondary)', fontSize: 13 }}>Loading planning data...</p>}

      {tab === 'beats' && beats && (beats.beats.length > 0 ? (
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 700, fontSize: 13, borderCollapse: 'collapse' }}><thead><tr style={{ background: 'var(--surface-alt)' }}><th style={th}>Beat</th><th style={th}>Recorded load</th><th style={th}>Area km²</th><th style={th}>Officers</th><th style={th}>Response min</th><th style={th}>Workload index</th></tr></thead><tbody>{beats.beats.map((beat) => <tr key={beat.id} style={{ borderTop: '1px solid var(--border-light)' }}><td style={td}><strong>{beat.name}</strong></td><td style={td}>{beat.totalCrimes}</td><td style={td}>{beat.areaKm2 || 'Not supplied'}</td><td style={td}>{beat.officersAssigned || 'Not supplied'}</td><td style={td}>{beat.responseTimeMin || 'Not supplied'}</td><td style={td}><span style={{ padding: '3px 7px', borderRadius: 4, background: beat.riskScore > 0.6 ? '#f8ece8' : '#eaf3ed', color: beat.riskScore > 0.6 ? '#8d3030' : '#31634a', fontWeight: 650 }}>{beat.riskScore.toFixed(2)}</span></td></tr>)}</tbody></table></div>
      ) : <EmptyState icon={PiChartBar} title="No beat inputs" message="No beat-level records were returned for this district." />)}

      {tab === 'optimize' && optimization && (optimization.optimization.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 9, marginBottom: 16 }}>{[
            ['Total beats', optimization.summary.totalBeats], ['Review load', optimization.summary.overloaded], ['Balanced', optimization.summary.balanced], ['Average load', optimization.summary.avgLoad], ...(optimization.flowMode ? [['Flow clusters', flowClusters.length]] : []),
          ].map(([label, value]) => <div key={label} style={{ padding: 12, border: '1px solid var(--border-light)', borderRadius: 6, background: 'var(--surface-alt)' }}><div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{label}</div><div style={{ marginTop: 2, fontSize: 23, fontWeight: 750 }}>{value}</div></div>)}</div>
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: optimization.flowMode ? 920 : 670, fontSize: 13, borderCollapse: 'collapse' }}><thead><tr style={{ background: 'var(--surface-alt)' }}><th style={th}>Beat</th><th style={th}>Recorded load</th><th style={th}>Current staff</th><th style={th}>Scenario staff</th><th style={th}>Load ratio</th><th style={th}>Review state</th>{optimization.flowMode && <><th style={th}>Flow index</th><th style={th}>Pattern category</th><th style={th}>Review window</th></>}</tr></thead><tbody>{optimization.optimization.map((item, index) => { const flow = flowBeats[index] || {}; const rawFlowScore = finiteNumber(flow.flowRiskScore); return <tr key={item.beatId} style={{ borderTop: '1px solid var(--border-light)' }}><td style={td}>{item.beatName || item.beatId}</td><td style={td}>{item.currentCrimes}</td><td style={td}>{item.currentOfficers}</td><td style={td}><strong>{item.recommendedOfficers}</strong></td><td style={td}>{item.loadRatio.toFixed(1)}</td><td style={td}>{item.status}</td>{optimization.flowMode && <><td style={td}>{rawFlowScore.toFixed(2)}</td><td style={{ ...td, textTransform: 'capitalize' }}>{displayText(flow.predictedTargetCrime, 'Not supplied')}</td><td style={td}>{displayText(flow.recommendedPatrolShift, 'Not supplied')}</td></>}</tr>; })}</tbody></table></div>
          {optimization.flowMode && <section style={{ marginTop: 18, paddingTop: 15, borderTop: '1px solid var(--border-light)' }}><h3 style={{ margin: '0 0 5px', fontSize: 14 }}>Association-flow scenario</h3><p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: 12 }}>Illustrative grouping only. Association does not establish criminal involvement, intent, or an operational need.</p>{flowClusters.length > 0 ? <div style={{ display: 'grid', gap: 7 }}>{flowClusters.map((cluster, index) => <div key={cluster.clusterId || index} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: index === 0 ? 0 : '1px solid var(--border-light)', fontSize: 12 }}><strong>Cluster {displayText(cluster.clusterId, index + 1)}</strong><span>{finiteNumber(cluster.criminalCount)} synthetic records · {displayText(cluster.topCrimeType, 'unclassified')} · {finiteNumber(cluster.avgTravelKm).toFixed(1)} km</span></div>)}</div> : <EmptyState icon={PiInfo} title="No flow clusters" message="The overlay returned no grouped records." />}</section>}
        </>
      ) : <EmptyState icon={PiUsersThree} title="No allocation scenario" message="No workload rows were available to compare." />)}

      {tab === 'patrol' && routes && (routes.routes.length > 0 ? <div style={{ display: 'grid', gap: 0 }}>{routes.routes.map((route, routeIndex) => <article key={route.beatId} style={{ padding: '13px 0', borderTop: routeIndex === 0 ? 0 : '1px solid var(--border-light)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 9 }}><div><strong>{route.beatName}</strong><div style={{ marginTop: 3, color: 'var(--text-secondary)', fontSize: 12 }}>{route.route.length} review stops · {route.totalDistance.toFixed(1)} km · {route.estimatedMinutes} min</div></div><PiPath size={20} aria-hidden="true" /></div>{route.route.length > 0 ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{route.route.map((stop, index) => <span key={`${stop.label}-${index}`} title={Number.isFinite(stop.lat) && Number.isFinite(stop.lng) ? `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}` : 'Coordinates unavailable'} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 8px', border: '1px solid var(--border-light)', borderRadius: 5, background: 'var(--surface-alt)', fontSize: 12 }}><PiMapPin aria-hidden="true" /> {index + 1}. {stop.label}</span>)}</div> : <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>No route stops returned.</p>}</article>)}</div> : <EmptyState icon={PiPath} title="No patrol sequence" message="No route candidates were returned for this district." />)}

      <p style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '18px 0 0', paddingTop: 14, borderTop: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: 11, lineHeight: 1.5 }}><PiInfo size={16} aria-hidden="true" /> Validate demand, geography, staff availability, officer safety, legal authority, and local command judgment before changing a beat or patrol plan.</p>
    </div>
  );
}

const th = { textAlign: 'left', padding: '10px 11px', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 650 };
const td = { padding: '10px 11px' };
