const ResultPanel = ({ data }) => {
  if (!data || !data.length) return null;

  // 🧮 Calculate numeric averages
  const averages = {
    ph: data.reduce((sum, d) => sum + (parseFloat(d.ph) || 0), 0) / data.length,
    nitrogen:
      data.reduce((sum, d) => sum + (parseFloat(d.nitrogen) || 0), 0) /
      data.length,
    phosphorus:
      data.reduce((sum, d) => sum + (parseFloat(d.phosphorus) || 0), 0) /
      data.length,
    potassium:
      data.reduce((sum, d) => sum + (parseFloat(d.potassium) || 0), 0) /
      data.length,
    temperature:
      data.reduce((sum, d) => sum + (parseFloat(d.temperature) || 0), 0) /
      data.length,
    humidity:
      data.reduce((sum, d) => sum + (parseFloat(d.humidity) || 0), 0) /
      data.length,
  };

  // 🌍 Find the majority (most frequent) soil type
  const soilCounts = {};
  data.forEach((d) => {
    const soil = d.soil_type || "Unknown";
    soilCounts[soil] = (soilCounts[soil] || 0) + 1;
  });

  const majorSoilType = Object.entries(soilCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <h3>🌱 Land Data Results</h3>

      <table
        style={{
          margin: "auto",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
          width: "90%",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th>Lat</th>
            <th>Lng</th>
            <th>Soil</th>
            <th>pH</th>
            <th>N</th>
            <th>P</th>
            <th>K</th>
            <th>Temp (°C)</th>
            <th>Humidity (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.latitude?.toFixed(3)}</td>
              <td>{d.longitude?.toFixed(3)}</td>
              <td>{d.soil_type || "N/A"}</td>
              <td>{d.ph ?? "N/A"}</td>
              <td>{d.nitrogen ?? "N/A"}</td>
              <td>{d.phosphorus ?? "N/A"}</td>
              <td>{d.potassium ?? "N/A"}</td>
              <td>{d.temperature ?? "N/A"}</td>
              <td>{d.humidity ?? "N/A"}</td>
            </tr>
          ))}

          {/* 🧾 Average Row */}
          <tr style={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}>
            <td colSpan="2">Average</td>
            <td>{majorSoilType}</td>
            <td>{averages.ph.toFixed(2)}</td>
            <td>{averages.nitrogen.toFixed(2)}</td>
            <td>{averages.phosphorus.toFixed(2)}</td>
            <td>{averages.potassium.toFixed(2)}</td>
            <td>{averages.temperature.toFixed(2)}</td>
            <td>{averages.humidity.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultPanel;
