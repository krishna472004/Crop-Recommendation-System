import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

/* ================================
   Plantation Save API
================================ */
const savePlantation = async (coordinates) => {
  try {
    const response = await fetch("http://localhost:5000/api/plantation/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "My Plantation",
        coordinates: coordinates,
      }),
    });

    const data = await response.json();
    console.log("🌱 Plantation Saved:", data);
  } catch (error) {
    console.error("Error saving plantation:", error);
  }
};

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

  /* NEW STATE FOR NDVI HEALTH */
  const [healthData, setHealthData] = useState(null);

  /* ================================
     Fetch NDVI Health
  =================================*/
  const fetchHealthData = async () => {
    try {

      const response = await fetch("http://localhost:5000/api/health/1");

      const data = await response.json();

      console.log("🌱 NDVI Health:", data);

      setHealthData(data);

    } catch (error) {
      console.error("Health API error:", error);
    }
  };

  /* Call health API when page loads */
  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleCreated = (e) => {
    const layer = e.layer;

    if (!layer.getLatLngs) return;

    const latlngs = layer.getLatLngs()[0];

    const coordinates = latlngs.map((point) => ({
      lat: point.lat,
      lng: point.lng,
    }));

    console.log("📍 Polygon Selected:", coordinates);

    /* Existing functionality */
    onPolygonSelect({
      coordinates,
    });

    /* Plantation Save */
    savePlantation(coordinates);
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

      {/* ================================
          NDVI HEALTH DISPLAY
      =================================*/}
      {healthData && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#f5f5f5",
          }}
        >

          <h3>🌱 Plantation Health Analysis</h3>

          <p>Week 1 NDVI: {healthData.week1}</p>
          <p>Week 2 NDVI: {healthData.week2}</p>
          <p>Week 3 NDVI: {healthData.week3}</p>
          <p>Week 4 NDVI: {healthData.week4}</p>

          <h2>Overall Health: {healthData.plantationHealth}</h2>

        </div>
      )}

    </div>
  );
};

export default MapSelector;