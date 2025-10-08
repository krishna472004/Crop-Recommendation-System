import { useState } from "react";
import { analyzePolygon } from "./api";
import MapSelector from "./components/MapSelector";
import ResultPanel from "./components/ResultPanel";

function App() {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePolygonSelect = async (polygon) => {
    setLoading(true);
    try {
      const data = await analyzePolygon(polygon);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data from API.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "10px" }}>
        🌾 Crop Recommendation System
      </h2>
      <MapSelector onPolygonSelect={handlePolygonSelect} />
      {loading ? (
        <p style={{ textAlign: "center" }}>Analyzing polygon... Please wait.</p>
      ) : (
        <ResultPanel data={result} />
      )}
    </div>
  );
}

export default App;
