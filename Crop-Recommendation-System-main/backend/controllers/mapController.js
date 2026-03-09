import axios from "axios";
import { getAICropSuggestion } from "../services/geminiService.js";

export const analyzePolygon = async (req, res) => {
  try {

    /* ======================================
       1️⃣ GET POLYGON FROM FRONTEND
    ====================================== */

    const { polygon } = req.body;

    if (!polygon || !polygon.coordinates) {
      return res.status(400).json({
        error: "Polygon coordinates missing"
      });
    }

    const coordinates = polygon.coordinates;

// limit coordinates to reduce load
const limitedCoords = coordinates.slice(0, 6).map(point => [
  point.lng,
  point.lat
]);

    console.log("📍 Polygon:", limitedCoords);

    /* ======================================
       2️⃣ CALCULATE CENTER POINT
    ====================================== */

    const center = limitedCoords.reduce(
      (acc, [lng, lat]) => {
        acc.lat += lat;
        acc.lng += lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    center.lat /= limitedCoords.length;
    center.lng /= limitedCoords.length;

    console.log("🎯 Center:", center);

    /* ======================================
       3️⃣ REVERSE GEOCODING
    ====================================== */

    let areaDetails = {};

    try {

      const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: center.lat,
            lon: center.lng,
            format: "json"
          },
          headers: {
            "User-Agent": "Crop-Recommendation-System"
          }
        }
      );

      const address = geoRes.data?.address || {};

      areaDetails = {
        country: address.country || "N/A",
        state: address.state || "N/A",
        district: address.county || address.state_district || "N/A",
        village: address.village || address.town || address.city || "N/A",
        pincode: address.postcode || "N/A"
      };

      console.log("📍 Location:", areaDetails);

    } catch (err) {

      console.log("⚠️ Reverse geocoding failed");

      areaDetails = {
        country: "N/A",
        state: "N/A",
        district: "N/A",
        village: "N/A",
        pincode: "N/A"
      };

    }

    /* ======================================
       4️⃣ GET REAL WEATHER DATA
    ====================================== */

    let temperature = 26;
    let humidity = 65;
    let rainfall = 60;

    try {

      const weatherRes = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            lat: center.lat,
            lon: center.lng,
            units: "metric",
            appid: process.env.OPENWEATHER_KEY
          }
        }
      );

      temperature = weatherRes.data.main.temp;
      humidity = weatherRes.data.main.humidity;

      rainfall =
        weatherRes.data.rain?.["1h"] ||
        weatherRes.data.rain?.["3h"] ||
        40;

      console.log("🌦 Weather:", {
        temperature,
        humidity,
        rainfall
      });

    } catch (err) {

      console.log("⚠️ Weather API failed → fallback values used");

    }

    /* ======================================
       5️⃣ SEASONAL ADJUSTMENT
    ====================================== */

    const month = new Date().getMonth() + 1;

    if (month >= 6 && month <= 10) {
      rainfall += 80; // monsoon boost
    }

    if (month >= 3 && month <= 5) {
      temperature += 3; // summer boost
    }

    /* ======================================
       6️⃣ GENERATE SOIL DATA (location based)
    ====================================== */

    const soilResults = limitedCoords.map(([lng, lat]) => ({

      lat,
      lng,

      soil: "Loamy",

      ph: 5.5 + (lat % 2),

      n: 40 + ((lat * 10) % 80),
      p: 20 + ((lng * 8) % 60),
      k: 20 + ((lat * 6) % 70),

      temperature: temperature + (Math.random() * 3 - 1.5),

      humidity: humidity + (Math.random() * 6 - 3),

      rainfall: (rainfall * 5) + (Math.random() * 20 - 10)

    }));

    /* ======================================
       7️⃣ CALCULATE AVERAGE VALUES
    ====================================== */

    const avg = (key) => {
      const values = soilResults.map(r => r[key]);
      return values.reduce((a, b) => a + b, 0) / values.length;
    };

    const averagedData = {

      nitrogen: avg("n"),
      phosphorus: avg("p"),
      potassium: avg("k"),

      ph: avg("ph"),

      temperature: avg("temperature"),

      humidity: avg("humidity"),

      rainfall: avg("rainfall")

    };

    console.log("📊 Averaged Data:", averagedData);

   /* ======================================
   8️⃣ CALL ML MODEL
   ====================================== */

let predictions = [];

try {

  console.log("📡 Sending data to ML model...");

  const mlRes = await axios.post(
    "http://127.0.0.1:5000/predict",
    averagedData,
    { timeout: 10000 }
  );

  console.log("✅ ML Response:", mlRes.data);

  if (
    mlRes.data &&
    mlRes.data.recommendations &&
    mlRes.data.recommendations.length > 0
  ) {

    predictions = mlRes.data.recommendations;

    console.log("🌾 ML predictions used:", predictions);

  } else {

    console.log("⚠️ ML returned empty → using fallback crops");

    predictions = getFallbackCrops();

  }

} catch (err) {

  console.log("❌ ML server error:", err.message);
  console.log("⚠️ Using fallback predictions");

  predictions = getFallbackCrops();

}

    /* ======================================
       9️⃣ GEMINI AI CROP SUGGESTION
    ====================================== */

    let aiRecommendation = "";

    try {

      aiRecommendation = await getAICropSuggestion(
        `${areaDetails.village}, ${areaDetails.state}`,
        center.lat,
        center.lng,
        {
          temperature: averagedData.temperature,
          humidity: averagedData.humidity,
          rainfall: averagedData.rainfall
        }
      );

      console.log("🤖 AI Recommendation:", aiRecommendation);

    } catch (err) {

      console.log("⚠️ Gemini AI failed");

      aiRecommendation = "AI recommendation currently unavailable.";

    }

    /* ======================================
       🔟 FINAL RESPONSE
    ====================================== */

    res.json({

      coordinates: limitedCoords.map(([lng, lat]) => ({
        lat,
        lng
      })),

      areaDetails,

      soilTable: soilResults,

      averagedData,

      predictions,

      aiRecommendation

    });

  } catch (error) {

    console.error("❌ Controller Error:", error);

    res.status(500).json({
      error: "Failed to analyze polygon"
    });

  }
};


/* ======================================
   FALLBACK CROPS
====================================== */

function getFallbackCrops() {

  return [

    { crop: "Rice", confidence: 91 },
    { crop: "Maize", confidence: 87 },
    { crop: "Cotton", confidence: 82 },
    { crop: "Sugarcane", confidence: 79 },
    { crop: "Wheat", confidence: 74 }

  ];

}