import axios from "axios";
import { useState } from "react";
import "./App.css";
import MapSelector from "./components/MapSelector.jsx";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePolygonSelect = async (polygon) => {
    if (!polygon || !polygon.coordinates) {
      alert("Invalid polygon data");
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending polygon to backend:", polygon);

      const res = await axios.post(
        "http://localhost:5000/api/map/analyze",
        { polygon }
      );

      console.log("✅ Backend full response:", res.data);
      console.log("📍 Area Details:", res.data.areaDetails);

      setAnalysis(res.data);
    } catch (err) {
      console.error("❌ Error analyzing polygon:", err);
      alert("Error analyzing polygon. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  const generateReason = (crop, avg) => {
    const reasons = [];
    if (avg.nitrogen > 150) reasons.push("high nitrogen");
    if (avg.phosphorus > 40) reasons.push("high phosphorus");
    if (avg.potassium > 100) reasons.push("high potassium");
    if (avg.ph < 6) reasons.push("acidic soil");
    if (avg.ph > 7.5) reasons.push("alkaline soil");
    if (avg.temperature > 30) reasons.push("high temperature");
    if (avg.temperature < 20) reasons.push("low temperature");
    if (avg.humidity > 70) reasons.push("high humidity");
    if (avg.humidity < 40) reasons.push("low humidity");
    if (avg.rainfall > 100) reasons.push("high rainfall");
    if (avg.rainfall < 30) reasons.push("low rainfall");

    return `Recommended because of ${
      reasons.join(", ") || "favorable conditions"
    } for ${crop}.`;
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <div className="header-content">
          <h1 className="main-title">
            <span className="title-icon">🌾</span>
            Smart Crop Recommendation System
          </h1>
          <p className="subtitle">Analyze your land and get AI-powered crop suggestions</p>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="map-section">
          <MapSelector onPolygonSelect={handlePolygonSelect} />
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Analyzing polygon, please wait...</p>
          </div>
        )}

        {analysis && (
          <div className="results-container">
            <h2 className="section-main-title">Analysis Results</h2>

            {/* Coordinates Section */}
            {analysis.coordinates && analysis.coordinates.length > 0 && (
              <div className="card coordinates-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">📍</span>
                    Polygon Coordinates
                  </h3>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Latitude</th>
                          <th>Longitude</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.coordinates.map((c, i) => (
                          <tr key={i}>
                            <td>{c.lat}</td>
                            <td>{c.lng}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Location Details Section */}
            {analysis.areaDetails && (
              <div className="card location-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">🗺️</span>
                    Location Details
                  </h3>
                </div>
                <div className="card-body">
                  <div className="location-grid">
                    <div className="location-item">
                      <span className="location-label">Country</span>
                      <span className="location-value">{analysis.areaDetails.country}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">State</span>
                      <span className="location-value">{analysis.areaDetails.state}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">District</span>
                      <span className="location-value">{analysis.areaDetails.district}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Village / Town</span>
                      <span className="location-value">{analysis.areaDetails.village}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Pincode</span>
                      <span className="location-value">{analysis.areaDetails.pincode}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Soil Data Section */}
            {analysis.soilTable && analysis.soilTable.length > 0 && (
              <div className="card soil-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">🌱</span>
                    Soil & Weather Analysis
                  </h3>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="data-table soil-table">
                      <thead>
                        <tr>
                          <th>Lat</th>
                          <th>Lng</th>
                          <th>Soil Type</th>
                          <th>pH</th>
                          <th>N</th>
                          <th>P</th>
                          <th>K</th>
                          <th>Temp (°C)</th>
                          <th>Humidity (%)</th>
                          <th>Rainfall (mm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.soilTable.map((row, i) => (
                          <tr key={i}>
                            <td>{row.lat}</td>
                            <td>{row.lng}</td>
                            <td><span className="soil-type-badge">{row.soil}</span></td>
                            <td>{row.ph}</td>
                            <td>{row.n}</td>
                            <td>{row.p}</td>
                            <td>{row.k}</td>
                            <td>{row.temp}</td>
                            <td>{row.humidity}</td>
                            <td>{row.rainfall}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Crop Recommendations Section */}
            {analysis.predictions && analysis.predictions.length > 0 && (
              <div className="card recommendations-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="icon">🌾</span>
                    Recommended Crops for Cultivation
                  </h3>
                </div>
                <div className="card-body">
                  <div className="recommendations-grid">
                    {analysis.predictions.map((p, i) => (
                      <div key={i} className="crop-item">
                        <div className="crop-rank">#{i + 1}</div>
                        <div className="crop-name">{p.crop}</div>
                        <div className="crop-confidence">
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{ width: `${p.confidence}%` }}
                            ></div>
                          </div>
                          <span className="confidence-text">{p.confidence}% Confidence</span>
                        </div>
                        <div className="crop-reason">
                          {generateReason(p.crop, analysis.averagedData)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;