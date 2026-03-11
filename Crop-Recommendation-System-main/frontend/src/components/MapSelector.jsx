import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

const formWrapStyle = {
  marginBottom: "18px",
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.28)",
  border: "1px solid rgba(118,196,66,0.2)",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const inputStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(118,196,66,0.25)",
  background: "rgba(255,255,255,0.06)",
  color: "#fdf6e3",
  padding: "12px 14px",
  outline: "none"
};

const savePlantation = async (payload) => {
  const response = await fetch("http://localhost:5000/api/plantation/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Failed to save plantation");
  }

  return response.json();
};

const lookupPlantation = async ({ email, locationName }) => {
  const params = new URLSearchParams({
    email,
    locationName
  });

  const response = await fetch(`http://localhost:5000/api/plantation/lookup?${params.toString()}`);

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Failed to lookup plantation");
  }

  return response.json();
};

const LocateButton = () => {
  const map = useMap();

  const locateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15);
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
        cursor: "pointer"
      }}
    >
      Locate Me
    </button>
  );
};

const MapSelector = ({ onPolygonSelect, onPlantationSaved }) => {
  const [form, setForm] = useState({
    name: "",
    locationName: "",
    email: ""
  });
  const [saving, setSaving] = useState(false);

  const canDraw = Boolean(form.name.trim() && form.locationName.trim() && form.email.trim());

  const handleCreated = async (e) => {
    const layer = e.layer;

    if (!layer.getLatLngs) {
      return;
    }

    if (!canDraw) {
      alert("Enter plantation name, location and email before drawing the field.");
      return;
    }

    const coordinates = layer.getLatLngs()[0].map((point) => ({
      lat: point.lat,
      lng: point.lng
    }));

    onPolygonSelect({ coordinates });

    try {
      setSaving(true);
      let result = await savePlantation({
        ...form,
        coordinates
      });

      let plantationId =
        result?.plantationId ||
        result?.plantation?.id ||
        result?.plantation?._id ||
        result?.health?.plantation?.id ||
        result?.health?.plantation?._id;

      if (!plantationId) {
        console.error("Bad save response:", result);
        try {
          result = await lookupPlantation({
            email: form.email,
            locationName: form.locationName
          });
        } catch (lookupError) {
          throw new Error(
            "Failed to lookup plantation. Restart the backend server and try again."
          );
        }

        plantationId =
          result?.plantationId ||
          result?.plantation?.id ||
          result?.plantation?._id ||
          result?.health?.plantation?.id ||
          result?.health?.plantation?._id;
      }

      if (!plantationId) {
        throw new Error("Plantation ID is still missing after lookup.");
      }

      onPlantationSaved?.({
        ...result,
        plantation: {
          ...(result?.plantation || {}),
          id: plantationId,
          _id: plantationId,
          name: result?.plantation?.name || form.name,
          locationName: result?.plantation?.locationName || form.locationName,
          email: result?.plantation?.email || form.email
        }
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={formWrapStyle}>
        <label style={fieldStyle}>
          <span>Plantation Name</span>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Green Valley Farm"
          />
        </label>
        <label style={fieldStyle}>
          <span>Location</span>
          <input
            style={inputStyle}
            value={form.locationName}
            onChange={(event) => setForm((current) => ({ ...current, locationName: event.target.value }))}
            placeholder="Madurai, Tamil Nadu"
          />
        </label>
        <label style={fieldStyle}>
          <span>Report Email</span>
          <input
            style={inputStyle}
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="farmer@example.com"
          />
        </label>
        <div style={{ ...fieldStyle, justifyContent: "end", color: "rgba(253,246,227,0.75)" }}>
          <span>Next step</span>
          <div style={{ ...inputStyle, minHeight: "48px", display: "flex", alignItems: "center" }}>
            {saving ? "Saving plantation and generating report..." : "Draw your field polygon on the map"}
          </div>
        </div>
      </div>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

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
              circlemarker: false
            }}
          />
        </FeatureGroup>

        <LocateButton />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
