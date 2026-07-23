// src/MapComponent.js
import { MapContainer, TileLayer, Popup, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Import marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import styles from './map.module.scss';
// Fix default icon issue with leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const MapComponent = ({
  isLocationFound,
  userLocation,
  hotspots,
}) => {
  return (
    <>
      <MapContainer
        center={userLocation}
        zoom={isLocationFound ? 13 : 12}
        style={{ height: "clamp(440px, calc(100vh - 190px), 720px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* {userLocation && (
          <Marker position={position}>
            <Popup>
              {isLocationFound ? "You are here" : "Central location of India"}
            </Popup>
          </Marker>
        )} */}
        {/* {userLocation && position && selectedValue=="false" && (
          <NavigationControl
            userLocation={userLocation}
            destination={position}
            setRoutingControl={setRoutingControl}
          />
        )} */}
        {hotspots.length>0  && hotspots.map((hotspot, index) => (
        <Circle
          key={index}
          center={[hotspot.Latitude, hotspot.Longitude]}
          radius={650 + (Number(hotspot.crimeCount) || 1) * 220}
          pathOptions={{ color: '#a33d32', fillColor: '#c45f3b', fillOpacity: 0.2, weight: 2 }}
          className={styles.fade_circle}
        >
          <Tooltip direction="top" opacity={0.92}>{hotspot.beat_name}: {hotspot.crimeCount} reports</Tooltip>
          <Popup>
            <div>
              <strong>{hotspot.village_area_name}</strong><br />
              <strong>{hotspot.beat_name}</strong><br />
              Crime Count: {hotspot.crimeCount}
              <br />Synthetic demonstration data
            </div>
          </Popup>
        </Circle>
      ))}
      </MapContainer>
    </>
  );
};

export default MapComponent;
