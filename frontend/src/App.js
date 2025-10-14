import React, { useState } from "react";
import axios from "axios";
import MapSelector from "./components/MapSelector.jsx";
import "./App.css";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePolygonSelect = async (polygon) => {
    setLoading(true);
    setAnalysis(null);

    try {
      console.log("📤 Sending polygon to backend:", polygon);

      // ✅ Backend endpoint
      const res = await axios.post("http://localhost:5000/api/map/analyze", { polygon });

      console.log("✅ Backend response:", res.data);
      setAnalysis(res.data);
    } catch (err) {
      console.error("❌ Error analyzing polygon:", err);
      alert("Error analyzing polygon. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h2>🌾 Smart Crop Recommendation — Soil Analyzer</h2>

      <MapSelector onPolygonSelect={handlePolygonSelect} />

      {loading && (
        <p style={{ color: "#1565c0", fontWeight: "bold", marginTop: "20px" }}>
          ⏳ Analyzing polygon, please wait...
        </p>
      )}

      {analysis && (
        <div style={{ marginTop: "20px" }}>
          <h3>🧾 Analysis Result</h3>

          {/* ✅ Coordinates Table */}
          {analysis.coordinates && analysis.coordinates.length > 0 && (
            <table
              style={{
                margin: "20px auto",
                borderCollapse: "collapse",
                width: "80%",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {analysis.coordinates.map((c, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{c.lat}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{c.lng}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ✅ Real-time Soil Data Table */}
          {analysis.soilTable && analysis.soilTable.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h4>🌱 Soil Data Table</h4>
              <table
                style={{
                  margin: "10px auto",
                  borderCollapse: "collapse",
                  width: "95%",
                  border: "1px solid #ddd",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Soil Type</th>
                    <th>pH</th>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Temp (°C)</th>
                    <th>Humidity (%)</th>
                    <th>Rainfall (mm)</th> {/* Added Rainfall header */}
                  </tr>
                </thead>
                <tbody>
                  {analysis.soilTable.map((row, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.lat}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.lng}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.soil}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.ph}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.n}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.p}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.k}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.temp}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.humidity}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.rainfall}</td> {/* Added Rainfall */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
