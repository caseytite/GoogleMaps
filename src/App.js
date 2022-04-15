import React, { useState, useCallback, useRef } from "react";
import Search from "./components/Search";
import LocateUser from "./components/LocateUser";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { formatRelative, set } from "date-fns";
import mapStyles from "./mapStyles";
import "@reach/combobox/styles.css";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const defaultLocation = {
  lat: 48.428421,
  lng: -123.365646,
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

function App() {
  const [libraries] = useState(["places"]);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [markers, setMarker] = useState([]);
  const [info, setInfo] = useState(null);
  const [add, setAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [show, setShow] = useState(false);

  const onMapClick = useCallback((event) => {
    console.log("markers", markers);
    setMarker((prev) => [
      ...prev,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
        desc,
        title,
      },
    ]);
    setAdd(false);
    setShow(false);
  }, []);

  const updateMarker = (t, d) => {
    const currentMarker = markers.find((marker) => marker.time === info.time);
    const otherMarkers = markers.filter((marker) => marker.time !== info.time);
    console.log("cur", currentMarker);
    console.log("other", otherMarkers);

    currentMarker.desc = d;
    currentMarker.title = t;
    setMarker([...otherMarkers, currentMarker]);
    setShow(true);
    setAdd(false);
  };

  const mapReference = useRef();
  const onMapLoad = useCallback((map) => {
    mapReference.current = map;
  }, []);

  const moveTo = useCallback(({ lat, lng }) => {
    mapReference.current.panTo({ lat, lng });
    mapReference.current.setZoom(15);
  }, []);

  if (loadError) return "Error on map load";
  if (!isLoaded) return "Loading maps";

  return (
    <div>
      <Search moveTo={moveTo} />
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
              url: "/hand-point-right-solid.svg",
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
              setAdd(false);
            }}
          >
            <div>
              {!add && (
                <>
                  <h2>{!show ? "Your new pin!" : info.title} </h2>
                  <p>Created {formatRelative(info.time, new Date())}</p>
                  {show && <p>{info.desc}</p>}
                  <button onClick={() => setAdd(true)}>
                    {!show ? "Add Details" : "Edit Details"}
                  </button>
                </>
              )}
              {add && (
                <>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  ></input>
                  <input
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  ></input>
                  <button onClick={() => updateMarker(title, desc)}>
                    Add Details
                  </button>
                </>
              )}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default App;
