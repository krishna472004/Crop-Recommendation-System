import { getDB } from "../database/database.js";

export const getPlantationHealth = async (req, res) => {

  try {

    const db = getDB();

    const plantationId = req.params.id;

    const data = await db.all(
      "SELECT ndvi_value, date FROM ndvi_data WHERE plantation_id = ? ORDER BY date DESC",
      [plantationId]
    );

    if (!data.length) {
      return res.json({ message: "No NDVI data available yet" });
    }

    const weeks = [[], [], [], []];

    data.forEach((item, index) => {
      const weekIndex = Math.floor(index / 7);
      if (weekIndex < 4) {
        weeks[weekIndex].push(item.ndvi_value);
      }
    });

    const avg = (arr) =>
      arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;

    const week1 = avg(weeks[0]);
    const week2 = avg(weeks[1]);
    const week3 = avg(weeks[2]);
    const week4 = avg(weeks[3]);

    const totalAvg = (week1 + week2 + week3 + week4) / 4;

    const health = (totalAvg * 100).toFixed(2);

    res.json({
      week1,
      week2,
      week3,
      week4,
      plantationHealth: health + "%"
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to calculate health" });

  }

};