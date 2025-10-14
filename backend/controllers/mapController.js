import axios from "axios";
import { getRandomPoints } from "../utils/geoUtils.js";

// Your AgroDataCube API token
const API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3N1ZWR0byI6Im1vcnRoaWtyaXNobmEyMDE3QGdtYWlsLmNvbSIsInJlc291cmNlIjpbIioiXSwiaWF0IjoxNzYwMzc3ODM5fQ.fwe3-SHnlEJHad-83GYivJuaVyLWqA_EwB_rIEnU4rM";

// Helper to add delay between requests to avoid rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyzePolygon = async (req, res) => {
  try {
    const { polygon } = req.body;

    if (!polygon || polygon.length < 3) {
      return res.status(400).json({ error: "Invalid polygon data" });
    }

    // Generate 10 random points inside the polygon
    const points = getRandomPoints(polygon, 10);
    const predictions = [];

    for (const [lon, lat] of points) {
      try {
        // 1️⃣ Fetch weather from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm`;
        const { data: weatherData } = await axios.get(weatherUrl);

        const temp = weatherData.current_weather?.temperature ?? 28;
        const humidity =
          weatherData.hourly?.relative_humidity_2m?.slice(-1)[0] ??
          weatherData.current_weather?.relative_humidity ??
          70;
        const soilTemp =
          weatherData.hourly?.soil_temperature_0_to_7cm?.slice(-1)[0] ?? 27;
        const soilMoisture =
          weatherData.hourly?.soil_moisture_0_to_7cm?.slice(-1)[0] ?? 0.25;

        // 2️⃣ Fetch soil & NPK from AgroDataCube
        const soilUrl = `https://agrodatacube.wur.nl/api/v2/rest/fields?geometry=POINT(${lon}%20${lat})&epsg=4326&year=2023&page_size=1&page_offset=0`;
        const { data: soilData } = await axios.get(soilUrl, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });

        // Example extraction (depends on API response format)
        const ph = soilData?.results?.[0]?.properties?.ph_h2o ?? 6.5;
        const nitrogen = soilData?.results?.[0]?.properties?.nitrogen ?? 25;
        const phosphorus = soilData?.results?.[0]?.properties?.phosphorus ?? 20;
        const potassium = soilData?.results?.[0]?.properties?.potassium ?? 25;
        const soilType =
          soilData?.results?.[0]?.properties?.soil_type ?? "Loamy";

        predictions.push({
          latitude: lat,
          longitude: lon,
          soil_type: soilType,
          ph,
          nitrogen,
          phosphorus,
          potassium,
          temperature: temp,
          humidity,
          soil_temperature: soilTemp,
          soil_moisture: soilMoisture,
        });
      } catch (err) {
        console.error("Error fetching API for point", lat, lon, err.message);

        // Fallback values if API fails
        predictions.push({
          latitude: lat,
          longitude: lon,
          soil_type: "Loamy",
          ph: 6.5,
          nitrogen: 30,
          phosphorus: 20,
          potassium: 25,
          temperature: 28,
          humidity: 70,
          soil_temperature: 27,
          soil_moisture: 0.25,
        });
      }

      await delay(300); // prevent hitting rate limits
    }

    // 3️⃣ Average all results
    const avg = predictions.reduce(
      (acc, cur, _, arr) => {
        acc.ph += cur.ph / arr.length;
        acc.nitrogen += cur.nitrogen / arr.length;
        acc.phosphorus += cur.phosphorus / arr.length;
        acc.potassium += cur.potassium / arr.length;
        acc.temperature += cur.temperature / arr.length;
        acc.humidity += cur.humidity / arr.length;
        acc.soil_temperature += cur.soil_temperature / arr.length;
        acc.soil_moisture += cur.soil_moisture / arr.length;
        return acc;
      },
      {
        ph: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        temperature: 0,
        humidity: 0,
        soil_temperature: 0,
        soil_moisture: 0,
      }
    );

    // 4️⃣ Determine most common soil type
    const soilTypes = predictions.map((p) => p.soil_type);
    avg.soil_type =
      soilTypes.sort(
        (a, b) =>
          soilTypes.filter((v) => v === b).length -
          soilTypes.filter((v) => v === a).length
      )[0] ?? "Loamy";

    res.json({
      message: "Polygon analysis completed successfully",
      averagedResult: avg,
      points: predictions,
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
