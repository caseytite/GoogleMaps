import React, { useState, useCallback, useRef } from 'react';
import Search from './components/Search';
import LocateUser from './components/LocateUser';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import mapStyles from './mapStyles';
import "@reach/combobox/styles.css"

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const defaultLocation = {
  lat: 48.428421,
  lng: -123.365646,
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};

function App() {
  const [ libraries ] = useState(['places']);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [markers, setMarker] = useState([]);
  const [info, setInfo] = useState(null);

  const onMapClick = useCallback((event) => {
    setMarker((prev) => [
      ...prev,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);
  

  const mapReference = useRef();
  const onMapLoad = useCallback((map) => {
    mapReference.current = map;
  }, []);

  const moveTo = useCallback(({lat,lng}) => {
    mapReference.current.panTo({lat,lng})
    mapReference.current.setZoom(15)
    }, [])

  if (loadError) return 'Error on map load';
  if (!isLoaded) return 'Loading maps';

  return (
    <div>

      <Search moveTo={moveTo}/>
      <LocateUser moveTo={moveTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={defaultLocation}
        onClick={onMapClick}
        onLoad={onMapLoad}
        options={options}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: '/hand-point-right-solid.svg',
              scaledSize: new window.google.maps.Size(20, 20),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(22, 5),
            }}
            animation={2}
            onClick={() => {
              setInfo(marker);
            }}
          />
        ))}
        {info ? (
          <InfoWindow
            position={{ lat: info.lat, lng: info.lng }}
            onCloseClick={() => {
              setInfo(null);
            }}            
          >
            <div>
              <h2>Your new pin! </h2>
              <p>Created { formatRelative(info.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default App;
