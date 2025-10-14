import axios from "axios";

// Your AgroDataCube API token
const API_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3N1ZWR0byI6Im1vcnRoaWtyaXNobmEyMDE3QGdtYWlsLmNvbSIsInJlc291cmNlIjpbIioiXSwiaWF0IjoxNzYwMzc3ODM5fQ.fwe3-SHnlEJHad-83GYivJuaVyLWqA_EwB_rIEnU4rM";

// Helper to add delay between requests to avoid rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyzePolygon = async (req, res) => {
  try {
    const { polygon } = req.body;
    console.log("📩 Received polygon:", JSON.stringify(polygon, null, 2));

    if (!polygon || !polygon.coordinates) {
      return res.status(400).json({ error: "Invalid polygon data" });
    }

    const coordinates = polygon.coordinates[0];
    const limitedCoords = coordinates.slice(0, 6);
    console.log(`🧮 Fetching real-time data for ${limitedCoords.length} points...`);

    const results = await Promise.all(
      limitedCoords.map(async ([lng, lat]) => {
        try {
          // 🧱 SOIL DATA (ISRIC SoilGrids)
          const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&depth=0-5cm`;
          const soilRes = await axios.get(soilUrl, { timeout: 15000 });

          const layers = soilRes.data?.properties?.layers || [];
          const getValue = (name) =>
            layers.find((l) => l.name === name)?.depths?.[0]?.values?.mean ?? null;

          const phRaw = getValue("phh2o");
          const nRaw = getValue("nitrogen");
          const pRaw = getValue("phosphorus");
          const kRaw = getValue("potassium");

          const clay = getValue("clay") ?? 0;
          const sand = getValue("sand") ?? 0;
          let soilType = "Unknown";
          if (sand > 60) soilType = "Sandy";
          else if (clay > 40) soilType = "Clay";
          else if (sand > 30 && clay < 30) soilType = "Loamy";
          else soilType = "Mixed";

          // 🌦️ WEATHER (OpenWeatherMap)
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=ec6629c7c794d6bd782d4b3285aa657e&units=metric`;
          const weatherRes = await axios.get(weatherUrl, { timeout: 15000 });

          let temp = null;
          let humidity = null;
          if (weatherRes.status === 200 && weatherRes.data?.main) {
            temp = weatherRes.data.main.temp;
            humidity = weatherRes.data.main.humidity;
          }

          // 🌧️ RAINFALL DATA (Open-Meteo — past 14 days)
          const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation&past_days=14`;
          const meteoRes = await axios.get(meteoUrl, { timeout: 20000 });

          const rainData = meteoRes.data?.hourly?.precipitation ?? [];
          let rainfall = 0;

          if (rainData.length > 0) {
            // Sum of precipitation for the last 14 days (in mm)
            rainfall = rainData.reduce((a, b) => a + b, 0);
          }

          console.log(
            `✅ Weather for (${lat}, ${lng}): ${temp ?? "--"}°C, ${humidity ?? "--"}%, Rainfall (14 days): ${rainfall.toFixed(
              1
            )} mm`
          );

          return {
            lat,
            lng,
            soil: soilType,
            ph: phRaw ? (phRaw / 10).toFixed(2) : 6.5,
            n: nRaw ? nRaw.toFixed(1) : 200,
            p: pRaw ? pRaw.toFixed(1) : 30,
            k: kRaw ? kRaw.toFixed(1) : 150,
            temp: temp !== null ? temp.toFixed(1) : 28,
            humidity: humidity !== null ? humidity.toFixed(1) : 60,
            rainfall: rainfall.toFixed(1),
          };
        } catch (err) {
          console.warn(`⚠️ Error fetching for (${lat}, ${lng}): ${err.message}`);
          return {
            lat,
            lng,
            soil: "Mixed",
            ph: 6.5,
            n: 200,
            p: 30,
            k: 150,
            temp: 28,
            humidity: 60,
            rainfall: 0,
          };
        }
      })
    );

    // 📊 Averages
    const avg = (key) => {
      const vals = results.map((r) => parseFloat(r[key])).filter((v) => !isNaN(v));
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "0.00";
    };

    results.push({
      lat: "Average",
      lng: "",
      soil: "Mixed",
      ph: avg("ph"),
      n: avg("n"),
      p: avg("p"),
      k: avg("k"),
      temp: avg("temp"),
      humidity: avg("humidity"),
      rainfall: avg("rainfall"),
    });

    res.json({
      coordinates: limitedCoords.map(([lng, lat]) => ({ lat, lng })),
      soilTable: results,
    });
  } catch (err) {
    console.error("❌ Error analyzing polygon:", err.message);
    res.status(500).json({ error: "Failed to analyze polygon" });
  }
};
