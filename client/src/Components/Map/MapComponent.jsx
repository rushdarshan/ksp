// src/MapComponent.js
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { routing } from "leaflet";
import { Icon } from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
// Import marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import styles from './map.module.scss';
const customIcon = new Icon({
  iconUrl: "client\public\Icons\location-pin.png",
  iconSize: [38, 38],
});
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
  selectedValue,
  setRoutingControl
}) => {
  return (
    <>
      <MapContainer
        center={userLocation}
        zoom={isLocationFound ? 13 : 5}
        style={{ height: "100vh", width: "100%" }}
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
          radius={2000}
          pathOptions={{ color: 'red' }}
          className={styles.fade_circle}
        >
          <Popup>
            <div>
              <strong>{hotspot.village_area_name}</strong><br />
              <strong>{hotspot.beat_name}</strong><br />
              Crime Count: {hotspot.crimeCount}
            </div>
          </Popup>
        </Circle>
      ))}
      </MapContainer>
    </>
  );
};

export default MapComponent;
