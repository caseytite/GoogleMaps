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
import "./App.css";

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
  const [addDescription, setAddDescription] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const onMapClick = useCallback((event) => {
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
    setAddDescription(false);
  }, []);

  const updateMarker = (t, d) => {
    const currentMarker = markers.find((marker) => marker.time === info.time);
    const otherMarkers = markers.filter((marker) => marker.time !== info.time);

    currentMarker.desc = d;
    currentMarker.title = t;
    setMarker([...otherMarkers, currentMarker]);

    setAddDescription(false);
    setTitle("");
    setDesc("");
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
              setAddDescription(false);
            }}
          >
            <div>
              {!addDescription && (
                <div>
                  <h2>{!info.title ? "Your new pin!" : info.title} </h2>
                  <p>Created {formatRelative(info.time, new Date())}</p>
                  {info.desc && <p>{info.desc}</p>}
                  <button onClick={() => setAddDescription(true)}>
                    Edit Details
                  </button>
                </div>
              )}
              {addDescription && (
                <div className="inputs">
                  <h3>Add Title</h3>
                  <input
                    value={title}
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                  ></input>
                  <h3>Add Description</h3>
                  <input
                    value={desc}
                    placeholder="Description"
                    onChange={(e) => setDesc(e.target.value)}
                  ></input>
                  <button onClick={() => updateMarker(title, desc)}>
                    Add Details
                  </button>
                </div>
              )}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default App;
