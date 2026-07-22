import { BiSearchAlt } from "react-icons/bi";
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

const NavigationControl = ({ userLocation, destination }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  // console.log("userlocation ", userLocation);
  // console.log("destination ", destination);
  // const points = [
  //   L.latLng(userLocation[0], userLocation[1]),
  //   L.latLng(destination[0], destination[1]),
  // ];
  useEffect(() => {
    if (destination && userLocation) {
      // Remove previous routes
      if (routingControlRef.current) {
        routingControlRef.current.setWaypoints([]);
      }

      // Add new route
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(destination[0], destination[1]),
        ],
        // routeWhileDragging: false,
        // geocoder: L.Control.Geocoder.nominatim(),
        draggableWaypoints: false,
      }).addTo(map);
      // Store the routing control reference
      routingControlRef.current = routingControl;

      routingControl.on("routesfound", (e) => {
        // console.log(e);
      });
    }
  }, [userLocation, destination, map]);

  return null;
};

const SearchLocation = ({userLocation,setUserLocation}) => {
    const [location , setLocation]=useState('')
    const [position, setPosition] = useState([28.7041, 77.1025]);
    const [isLocationFound, setIsLocationFound] = useState(false);

        const getCoordinates = async (location) => {
        try {
          const response = await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
            q: location,
            format: 'json',
            addressdetails: '1',
            limit: '1'
          })).then(r => r.json());
    
          if (response.length > 0) {
            const { lat, lon } = response[0];
            setPosition([ lat, lon ]);
          } else {

          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        //   alert('An error occurred while fetching coordinates');
        }
      };

      const handleSearch = () => {
        if (location.trim()) {
          getCoordinates(location);
        } else {
          alert('Please enter a location');
        }
      };

      useEffect(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              //   setPosition([latitude, longitude]);
              setUserLocation([latitude, longitude]);
              setIsLocationFound(true);
            },
            (error) => {
              console.error("Error getting user's location: ", error);
              setIsLocationFound(false);
            }
          );
        }
      }, []);
    
  return (
        <div className={styles.topSection}>
        <div className={styles.headerSection}>
            <div className={styles.searchBar}>
            <input type="text" placeholder="Search Dashboard"  value={location} onChange={(e)=>setLocation(e.target.value)}/>
            <BiSearchAlt className={styles.icon} onClick={handleSearch} />
            </div>
        </div>
        <MapContainer
        center={userLocation}
        zoom={isLocationFound ? 13 : 7}
        style={{ height: "clamp(440px, calc(100vh - 190px), 720px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userLocation && (
          <Marker position={position}>
            <Popup>
              {isLocationFound ? "You are here" : "Central location of India"}
            </Popup>
          </Marker>
        )}
        {userLocation && position && (
          <NavigationControl
            userLocation={userLocation}
            destination={position}
          />
        )}
      </MapContainer>
        </div>
  );
};

export default SearchLocation;
