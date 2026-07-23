import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { PiInfo, PiMapPin, PiWarningCircle } from 'react-icons/pi';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { PanelCard } from './panels';
import { apiArray, clampNumber, fetchJson, finiteNumber } from '../utils/apiData';

const SYNTHETIC_HOTSPOTS = [
  { lat: 12.9758, lng: 77.6031, risk: 0.82 },
  { lat: 12.9614, lng: 77.5846, risk: 0.68 },
  { lat: 12.9875, lng: 77.5712, risk: 0.57 },
  { lat: 12.9448, lng: 77.6125, risk: 0.49 },
  { lat: 13.0042, lng: 77.6201, risk: 0.38 },
];

function normalizePoints(payload) {
  return apiArray(payload, ['hotspots', 'points', 'predictions'])
    .map((point) => ({
      lat: finiteNumber(point?.lat ?? point?.latitude, Number.NaN),
      lng: finiteNumber(point?.lng ?? point?.longitude, Number.NaN),
      risk: clampNumber(point?.risk ?? point?.score ?? point?.probability, 0, 1, 0.35),
    }))
    .filter((point) => Number.isFinite(point.lat)
      && Number.isFinite(point.lng)
      && Math.abs(point.lat) <= 90
      && Math.abs(point.lng) <= 180);
}

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return undefined;
    const heatLayer = L.heatLayer(
      points.map((point) => [point.lat, point.lng, point.risk]),
      {
        radius: 28,
        blur: 18,
        maxZoom: 17,
        max: 1,
        gradient: { 0.25: '#d7e8dd', 0.5: '#e7c979', 0.75: '#ce7a52', 1: '#8d3030' },
      },
    );
    heatLayer.addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [map, points]);

  return null;
}

HeatmapLayer.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    risk: PropTypes.number.isRequired,
  })).isRequired,
};

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    fetchJson('/server/quickml_predict/predict?districtId=1')
      .then((payload) => {
        if (!active) return;
        setHotspots(normalizePoints(payload));
        setUsingFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setHotspots(SYNTHETIC_HOTSPOTS);
        setUsingFallback(true);
        setNotice('Prediction service is unavailable. A fixed synthetic preview is shown.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const hasPoints = hotspots.length > 0;

  return (
    <PanelCard title="Hotspot scenario map" badge="SYNTHETIC DEMO" loading={loading}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 12px',
        marginBottom: 12, border: '1px solid var(--border-light)', borderRadius: 6,
        background: 'var(--surface-alt)', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5,
      }}>
        {usingFallback ? <PiWarningCircle size={18} aria-hidden="true" /> : <PiInfo size={18} aria-hidden="true" />}
        <span>
          {notice || 'Illustrative density signals from the prototype analytics service.'}
          {' '}These points are not verified incidents or a deployment instruction. Human review is required.
        </span>
      </div>

      <div aria-label="Synthetic hotspot scenario for Bengaluru" style={{
        position: 'relative', width: '100%', height: 'clamp(320px, 52vw, 500px)',
        overflow: 'hidden', border: '1px solid var(--border-light)', borderRadius: 6,
      }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer points={hotspots} />
        </MapContainer>

        {!hasPoints && (
          <div style={{
            position: 'absolute', zIndex: 500, inset: 'auto 12px 12px', display: 'flex', gap: 8,
            alignItems: 'center', padding: '10px 12px', background: 'var(--surface)',
            border: '1px solid var(--border-light)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12,
          }}>
            <PiMapPin size={18} aria-hidden="true" />
            No usable coordinates were returned for this district.
          </div>
        )}
      </div>
    </PanelCard>
  );
}
