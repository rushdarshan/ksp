import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { PanelCard } from './panels';

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heatPoints = points.map(p => [p.lat, p.lng, p.risk * 100]);
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: '#E1F3FE', 0.6: '#FBF3DB', 0.7: '#FDEBEC', 0.8: '#FDEBEC', 1.0: '#9F2F2D' }
    });
    heatLayer.addTo(map);
    return () => { map.removeLayer(heatLayer); };
  }, [map, points]);
  return null;
};

const HotspotMap = () => {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch('/server/quickml_predict/predict?districtId=1')
      .then(res => res.json())
      .then(data => setHotspots(data))
      .catch(err => console.error("Error fetching hotspot data:", err));
  }, []);

  return (
    <PanelCard title="Hotspot Forecast" badge="PREDICTIVE">
      <div style={{ width: '100%', height: '500px', overflow: 'hidden' }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <HeatmapLayer points={hotspots} />
        </MapContainer>
      </div>
    </PanelCard>
  );
};

export default HotspotMap;
