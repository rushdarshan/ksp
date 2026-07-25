import { useEffect, useState } from "react";
import SearchLocation from "./SearchLocation";
import MapComponent from "./MapComponent";
import { getCrimeHotspots } from "../../utils/utility";
import Loader from "../../ui/Dropdown/Loader";
import styles from  "./map.module.scss";
import { PiMapPin, PiPath } from "react-icons/pi";
import {
  useNavigation,
} from "react-router-dom";
import apiFetch from "../../utils/apiFetch";

// src/geocode.j
// export async function loader() {

//   try {
//     const response = await axios.post(`${apiUrl}/getcrimehotspot`,{}, {
//       headers : {
//         "jwt_token" : localStorage.getItem('token')
//       }
//     });
//       // return { response };
//       return response.data
//   } catch (error) {
//    console.log(error)
//   }
//   return []
// }

const getCoordinates = async (place) => {
  const response = await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
    q: place,
    format: 'json',
    addressdetails: '1',
    limit: '1'
  })).then(r => r.json());

  if (response.length > 0) {
    const { lat : Latitude, lon : Longitude } = response[0];
    return { Latitude, Longitude };
  } else {
    throw new Error('Location not found');
  }
};

export default function Map2() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);
  const [selectedValue, setSelectedValue] = useState("true");
  // const beatData = useLoaderData();
  const [beatData,setBeatData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const handleChange = (event) => {
        setSelectedValue(event.target.value);

    };


  useEffect(()=>{
    if(!beatData)
      return;

    const fetchCoordinates = async (data) => {
      let count = 0;
      const results = [];
      for (const place of Object.values(data)) {
        if (place.Latitude !=0.0 && place.Longitude !=0.0) {
          results.push(place);
          setHotspots(prevData=>{
            return [...prevData,place]
          })
          // continue;
        }else {
        count +=1
        if (count > 5) {
          results.push(null);
          continue;
        }
        // console.log('searched for location while count is:', place.location, count, place.Latitude, place.Longitude);
        try {
          const coords = await getCoordinates(place.location);
          count += 1;
          results.push({ ...place, ...coords });
          setHotspots(prevData=>{
            return [...prevData,{ ...place, ...coords }]
          })
        } catch (error) {
          console.log(`Error fetching coordinates for ${place.name}:`, error);
          count += 1;
          results.push(null);
        }
        // setHotspots(results.filter(result => result !== null));
      }
    
    }
    };
    
    fetchCoordinates(beatData);
    
  },[beatData])

  useEffect(()=>{
    const getPlaces = async () => {
      try {
        const res = await apiFetch('/getcrimehotspot', {
          method: 'POST',
          body: JSON.stringify({})
        }).then(r => r ? r.json() : [])
        
        setBeatData(getCrimeHotspots(res))
      } catch (error) {
        console.log('error while fetching places data : ',error)
      }
    }
    getPlaces()
  },[])
  // const {data, isLoading , error }= useFetchData(`${apiUrl}/getcrimehotspot`,{},{
  //   headers : {
  //     "jwt_token" : localStorage.getItem('token')
  //   }
  // })
  // if (isLoading) {
  //   return <Loader/>;
  // }

  // if (error) {
  //   return <p>Error: {error.message}</p>;
  // }

  // if (!data) {
  //   return <p>No data available.</p>;
  // }
  // if(data){
  //   setBeatData(data)
  //   // console.log(data)
  // }
  if(navigation.state === "loading")
     return <Loader/>

  return (
    <section className={styles.commandMap}>
    <div className={styles.option_selector}>
        <div className={styles.map_intro}>
          {selectedValue === 'true' ? <PiMapPin size={20} /> : <PiPath size={20} />}
          <div><strong>Command map</strong><span>{selectedValue === 'true' ? `${hotspots.length} active beat clusters` : 'Plan a verified destination route'}</span></div>
        </div>
        <label htmlFor="command-map-mode">Map mode</label>
        <select id="command-map-mode" value={selectedValue} onChange={handleChange}>
            <option value = {true}>Crime hotspots</option>
            <option value = {false}>Navigation</option>
        </select>
    </div>
    {selectedValue=="false" && <SearchLocation userLocation={userLocation} setUserLocation={setUserLocation}/>}
      {selectedValue=="true" && <MapComponent
        hotspots={hotspots}
        userLocation={userLocation}
      />}
    </section>
  );
}

// import React, { useEffect, useState } from "react";
// export default function Map2() {
  
//   const [data, setData] = useState(null)
//   useEffect(() => {
//     setTimeout(() => {
//       console.log("timeout function executed ")
//       setData( {
//         "beat 1 ": {
//           beat_name: "beat 1",
//           village_area_name: "panvel",
//           location: "tmkc",
//         },
//       });
//       // console.log(data)
//     }, 10000);
//   }, []);
//   useEffect(() => {
//     if (!data) return;
//     const getdata=  async () => {
//       try {
//         console.log('data is ',data)
//       } catch (error) {
//         console.log("error is : ", error);
//       }
//     };
//     getdata()
//   }, [data]);
//   return <div>HI there buddy</div>;
// }
