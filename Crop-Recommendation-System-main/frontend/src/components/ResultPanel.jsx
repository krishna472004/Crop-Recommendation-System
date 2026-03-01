import React from "react";

const ResultPanel = ({ data }) => {
  // Check if soilTable exists and has entries
  if (!data || !data.soilTable || data.soilTable.length === 0) {
    return (
      <p style={{ textAlign: "center", marginTop: "30px" }}>
        No data available. Please select an area to analyze.
      </p>
    );
  }

  // Extract soilTable array (exclude the Average row)
  const soilData = data.soilTable.filter((d) => d.lat !== "Average");

  // Calculate averages including rainfall
  const avg = {
    ph:
      soilData.reduce((sum, d) => sum + (parseFloat(d.ph) || 0), 0) /
      soilData.length,
    n:
      soilData.reduce((sum, d) => sum + (parseFloat(d.n) || 0), 0) /
      soilData.length,
    p:
      soilData.reduce((sum, d) => sum + (parseFloat(d.p) || 0), 0) /
      soilData.length,
    k:
      soilData.reduce((sum, d) => sum + (parseFloat(d.k) || 0), 0) /
      soilData.length,
    temp:
      soilData.reduce((sum, d) => sum + (parseFloat(d.temp) || 0), 0) /
      soilData.length,
    humidity:
      soilData.reduce((sum, d) => sum + (parseFloat(d.humidity) || 0), 0) /
      soilData.length,
    rainfall:
      soilData.reduce((sum, d) => sum + (parseFloat(d.rainfall) || 0), 0) /
      soilData.length,
  };

  return (
    <div style={{ margin: "30px auto", textAlign: "center", width: "95%" }}>
      <h3 style={{ marginBottom: "15px" }}>🌱 Land Data Results</h3>

      <table
        style={{
          margin: "auto",
          borderCollapse: "collapse",
          width: "100%",
          fontFamily: "Arial, sans-serif",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
            <th>Lat</th>
            <th>Lng</th>
            <th>Soil</th>
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
          {soilData.map((d, i) => (
            <tr key={i}>
              <td>{d.lat.toFixed(6)}</td>
              <td>{d.lng.toFixed(6)}</td>
              <td>{d.soil}</td>
              <td>{d.ph}</td>
              <td>{d.n}</td>
              <td>{d.p}</td>
              <td>{d.k}</td>
              <td>{d.temp}</td>
              <td>{d.humidity}</td>
              <td>{d.rainfall}</td> {/* Display rainfall */}
            </tr>
          ))}

          {/* Average Row */}
          <tr style={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}>
            <td>Average</td>
            <td></td>
            <td>Mixed</td>
            <td>{avg.ph.toFixed(2)}</td>
            <td>{avg.n.toFixed(2)}</td>
            <td>{avg.p.toFixed(2)}</td>
            <td>{avg.k.toFixed(2)}</td>
            <td>{avg.temp.toFixed(2)}</td>
            <td>{avg.humidity.toFixed(2)}</td>
            <td>{avg.rainfall.toFixed(2)}</td> {/* Display average rainfall */}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultPanel;
