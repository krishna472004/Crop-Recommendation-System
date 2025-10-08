import axios from "axios";
import { getRandomPoints } from "../utils/geoUtils.js";

export const analyzePolygon = async (req, res) => {
  try {
    const { polygon } = req.body;
    const points = getRandomPoints(polygon, 10);

    const predictions = await Promise.all(
      points.map(async ([lon, lat]) => {
        try {
          // 1️⃣ Soil data from SoilGrids
          const soilRes = await axios.get(
            `https://rest.soilgrids.org/query?lon=${lon}&lat=${lat}`
          );

          const soil = soilRes.data.properties || {};

          // Example mapping (you may adjust based on SoilGrids response)
          const soil_type = soil.taxnwrb?.value || "Loamy";
          const ph = soil.phh2o?.mean?.value || 6.5;
          const nitrogen = soil.n?.mean?.value || 30;
          const phosphorus = soil.p?.mean?.value || 20;
          const potassium = soil.k?.mean?.value || 25;

          // 2️⃣ Weather data from Open-Meteo
          const weatherRes = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
          );

          const temp = weatherRes.data.current_weather?.temperature || 28;
          const humidity = weatherRes.data.current_weather?.humidity || 70;

          return {
            latitude: lat,
            longitude: lon,
            soil_type,
            ph,
            nitrogen,
            phosphorus,
            potassium,
            temperature: temp,
            humidity,
          };
        } catch (err) {
          console.error("Error fetching API for point", lat, lon, err.message);
          return {
            latitude: lat,
            longitude: lon,
            soil_type: "Loamy",
            ph: 6.5,
            nitrogen: 30,
            phosphorus: 20,
            potassium: 25,
            temperature: 28,
            humidity: 70,
          };
        }
      })
    );

    // 3️⃣ Average all 10 points
    const avgResult = predictions.reduce(
      (acc, cur, _, arr) => {
        acc.ph += cur.ph / arr.length;
        acc.nitrogen += cur.nitrogen / arr.length;
        acc.phosphorus += cur.phosphorus / arr.length;
        acc.potassium += cur.potassium / arr.length;
        acc.temperature += cur.temperature / arr.length;
        acc.humidity += cur.humidity / arr.length;
        return acc;
      },
      {
        ph: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        temperature: 0,
        humidity: 0,
      }
    );

    // Dominant soil type
    const soilTypes = predictions.map((p) => p.soil_type);
    avgResult.soil_type = soilTypes.sort(
      (a, b) =>
        soilTypes.filter((v) => v === b).length -
        soilTypes.filter((v) => v === a).length
    )[0];

    res.json({ averagedResult: avgResult, points: predictions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
