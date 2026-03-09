import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

/* ================================
   Locate Me Button
================================ */
const LocateButton = () => {
  const map = useMap();

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        map.setView([latitude, longitude], 15);

        console.log("📍 User location:", latitude, longitude);
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
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
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      📍 Locate Me
    </button>
  );
};

/* ================================
   Map Selector Component
================================ */
const MapSelector = ({ onPolygonSelect }) => {
  const mapRef = useRef();

  const handleCreated = (e) => {
    const layer = e.layer;

    if (!layer.getLatLngs) return;

    const latlngs = layer.getLatLngs()[0];

    const coordinates = latlngs.map((point) => ({
      lat: point.lat,
      lng: point.lng,
    }));

    console.log("📍 Polygon Selected:", coordinates);

    onPolygonSelect({
      coordinates,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "80vh", width: "100%" }}
        ref={mapRef}
      >
        {/* Map Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Draw Controls */}
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
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

        {/* Locate Me */}
        <LocateButton />
      </MapContainer>
    </div>
  );
};

export default MapSelector;