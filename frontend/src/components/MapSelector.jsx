import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

const LocateButton = () => {
  const map = useMap();

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 15);
        },
        () => alert("Unable to retrieve your location")
      );
    } else {
      alert("Geolocation not supported by your browser");
    }
  };

  return (
    <button
      onClick={locateMe}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1000,
        padding: "8px 12px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      📍 Locate Me
    </button>
  );
};

const MapSelector = ({ onPolygonSelect }) => {
  const mapRef = useRef();

  const onCreated = (e) => {
    const layer = e.layer;
    const coordinates = layer
      .getLatLngs()[0]
      .map((latlng) => [latlng.lng, latlng.lat]);

    const polygon = {
      type: "Polygon",
      coordinates: [coordinates],
    };

    onPolygonSelect(polygon);
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "80vh", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated}
            draw={{
              polygon: true,
              rectangle: false,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
        <LocateButton />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
