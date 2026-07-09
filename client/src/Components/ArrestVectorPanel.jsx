import { useState, useEffect, useRef } from 'react'
import { useFilter } from '../FilterContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' })

const stationIcon = new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [20, 28], iconAnchor: [10, 28] })

const TIER_COLORS = { on_scene: '#22c55e', short: '#d97706', cross_district: '#dc2626' }
const GRAVITY_OPACITY = { felony: 0.9, misdemeanour: 0.6, petty: 0.4 }

function MapBounds({ vectors, stations }) {
  const map = useMap()
  useEffect(() => {
    if (vectors.length === 0) return
    const bounds = L.latLngBounds(vectors.map(v => v.incident))
    stations.forEach(s => bounds.extend([s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [vectors, stations, map])
  return null
}

export default function ArrestVectorPanel() {
  const [data, setData] = useState(null)
  const [filterTier, setFilterTier] = useState('all')
  const [selectedFir, setSelectedFir] = useState(null)
  const { station, dateFrom, dateTo, crimeType } = useFilter();

  useEffect(() => {
    const p = new URLSearchParams();
    if (station) p.set('station', station);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    if (crimeType) p.set('crimeType', crimeType);
    fetch('/server/arrest_vector/vectors?' + p)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [station, dateFrom, dateTo, crimeType])

  if (!data) return <div className="panel"><div className="panel-box"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>

  const filtered = filterTier === 'all' ? data.vectors : data.vectors.filter(v => v.tier === filterTier)
  const { summary } = data

  return (
    <div className="panel">
      <div className="panel-box">
        <h2 style={{ marginBottom: 4 }}>Arrest Vector</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', marginBottom: 20, maxWidth: 600 }}>
          The geography of capture — spatial displacement between crime incident GPS and arrest station.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>TOTAL ARRESTS</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{summary.total}</div>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #22c55e40', background: '#22c55e08', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>ON SCENE</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>{summary.onScenePct}%</div>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #dc262640', background: '#dc262608', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>CROSS-DISTRICT</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>{summary.crossDistrict}</div>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>AVG VECTOR</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{summary.avgDistanceKm}km</div>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>MAX VECTOR</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{summary.maxDistanceKm}km</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[{ k: 'all', l: 'All Vectors' }, { k: 'on_scene', l: 'On Scene (≤1km)' }, { k: 'short', l: 'Short (1-5km)' }, { k: 'cross_district', l: 'Cross-District (>5km)' }].map(({ k, l }) => (
            <button key={k} onClick={() => setFilterTier(k)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${filterTier === k ? 'var(--accent)' : 'var(--border)'}`,
                background: filterTier === k ? 'var(--accent)' : 'transparent',
                color: filterTier === k ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--size-caption)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ height: 450, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <MapContainer center={[12.97, 77.59]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapBounds vectors={filtered} stations={data.stations} />
              {filtered.map(v => {
                const st = data.stations.find(s => s.name === v.arrestStation)
                if (!st) return null
                return (
                  <Polyline
                    key={v.caseId}
                    positions={[v.incident, [st.lat, st.lng]]}
                    pathOptions={{ color: TIER_COLORS[v.tier], weight: 2, opacity: GRAVITY_OPACITY[v.gravity], dashArray: v.tier === 'on_scene' ? null : '6, 4' }}
                    eventHandlers={{ click: () => setSelectedFir(v) }}
                  />
                )
              })}
              {filtered.map(v => (
                <Circle key={`inc-${v.caseId}`} center={v.incident} radius={v.tier === 'on_scene' ? 150 : 80}
                  pathOptions={{ color: TIER_COLORS[v.tier], fillColor: TIER_COLORS[v.tier], fillOpacity: 0.3, weight: 2 }}
                  eventHandlers={{ click: () => setSelectedFir(v) }}
                />
              ))}
              {data.stations.map((s, i) => (
                <Marker key={i} position={[s.lat, s.lng]} icon={stationIcon}>
                  <Popup><strong>{s.name}</strong><br/>{s.district}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 450, overflowY: 'auto' }}>
            {filtered.map(v => (
              <div key={v.caseId} onClick={() => setSelectedFir(v)}
                style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: `1px solid ${selectedFir?.caseId === v.caseId ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: selectedFir?.caseId === v.caseId ? 'var(--accent)08' : 'var(--surface)', cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 'var(--size-caption)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v.firNo}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TIER_COLORS[v.tier] }}>{v.vectorKm}km</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                  {v.arrestStation} · {v.officer} · {v.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedFir && (
          <div style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--surface)', marginBottom: 16 }}>
            <div style={{ fontSize: 'var(--size-caption)', fontWeight: 600, marginBottom: 8 }}>{selectedFir.firNo} — Vector Detail</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 'var(--size-caption)' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Crime GPS:</span> {selectedFir.incident.lat}, {selectedFir.incident.lng}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Arrest at:</span> {selectedFir.arrestStation}</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Distance:</span> {selectedFir.vectorKm} km</div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Gravity:</span> {selectedFir.gravity}</div>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 'var(--size-sub)', fontWeight: 600, marginBottom: 12 }}>Sink Stations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.sinkStations.map(s => (
            <div key={s.station} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong style={{ fontSize: 'var(--size-sub)' }}>{s.station}</strong>
                <span style={{ fontSize: 'var(--size-caption)', color: '#dc2626', fontWeight: 700 }}>{s.avgVectorKm} km avg</span>
              </div>
              <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>
                {s.captureCount} cases · Sources: {s.sourceDistricts.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
