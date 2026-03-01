import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Sends polygon data to backend for analysis
export const analyzePolygon = async (polygon) => {
  try {
    const res = await API.post("/map/analyze", { polygon });
    return res.data;
  } catch (error) {
    console.error("Error analyzing polygon:", error);
    throw error;
  }
};
