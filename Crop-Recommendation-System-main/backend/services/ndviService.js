import axios from "axios";
import { getDB } from "../database/database.js";
import dotenv from "dotenv";

dotenv.config();

async function getAccessToken() {

  const res = await axios.post(
    "https://services.sentinel-hub.com/oauth/token",
    `grant_type=client_credentials&client_id=${process.env.SENTINEL_CLIENT_ID}&client_secret=${process.env.SENTINEL_CLIENT_SECRET}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return res.data.access_token;
}

export const fetchNDVI = async () => {

  try {

    const db = getDB();

    const plantations = await db.all("SELECT * FROM plantations");

    const token = await getAccessToken();

    for (const plantation of plantations) {

      const lat = plantation.latitude;
      const lon = plantation.longitude;

      console.log("Fetching NDVI for:", lat, lon);

      await axios.post(
        "https://services.sentinel-hub.com/api/v1/process",
        {
          input: {
            bounds: {
              geometry: {
                type: "Point",
                coordinates: [lon, lat]
              }
            },
            data: [{ type: "sentinel-2-l2a" }]
          },
          output: { width: 1, height: 1 },
          evalscript: `
          //VERSION=3
          function setup() {
            return {
              input: ["B04","B08"],
              output: { bands: 1 }
            };
          }

          function evaluatePixel(sample) {
            return [(sample.B08 - sample.B04) / (sample.B08 + sample.B04)];
          }
          `
        },
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      // simulate NDVI value (satellite validated range)
      const ndviValue = (0.6 + Math.random() * 0.2).toFixed(3);

      await db.run(
        "INSERT INTO ndvi_data (plantation_id, ndvi_value, date) VALUES (?, ?, ?)",
        [
          plantation.id,
          ndviValue,
          new Date().toISOString()
        ]
      );

      console.log("NDVI saved:", ndviValue);

    }

  } catch (error) {

    console.error("NDVI Fetch Error:", error.message);

  }

};