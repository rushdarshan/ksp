import { PiMagnifyingGlass } from "react-icons/pi";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
// Import marker icons
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
        void e;
      });
    }
    return () => {
      if (routingControlRef.current) map.removeControl(routingControlRef.current);
    };
  }, [userLocation, destination, map]);

  return null;
};

const SearchLocation = ({userLocation,setUserLocation}) => {
    const [location , setLocation]=useState('')
    const [position, setPosition] = useState([12.9719, 77.6067]);
    const [isLocationFound, setIsLocationFound] = useState(false);
    const [searchError, setSearchError] = useState('');

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
            setIsLocationFound(true);
            setSearchError('');
          } else {
            setSearchError('Destination not found. Add a Bengaluru locality or landmark.');
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
          setSearchError('Route lookup is unavailable. Try again when map services reconnect.');
        }
      };

      const handleSearch = () => {
        if (location.trim()) {
          getCoordinates(location);
        } else {
          setSearchError('Enter a destination before searching.');
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
      }, [setUserLocation]);
    
  return (
        <div className={styles.topSection}>
        <div className={styles.headerSection}>
            <div className={styles.searchBar}>
            <input aria-label="Route destination" type="text" placeholder="Destination in Karnataka" value={location} onChange={(e)=>setLocation(e.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSearch()}/>
            <button type="button" onClick={handleSearch} aria-label="Find route" title="Find route" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}><PiMagnifyingGlass size={20} /></button>
            </div>
        </div>
        {searchError && <p role="alert" style={{ margin: '0', padding: '10px 16px', color: 'var(--status-critical-text)', background: 'var(--status-critical-bg)', fontSize: 13 }}>{searchError}</p>}
        <MapContainer
        center={userLocation}
        zoom={13}
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
