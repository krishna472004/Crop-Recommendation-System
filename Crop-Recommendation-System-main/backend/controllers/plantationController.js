import { initDB } from "../database/database.js";

export const savePlantation = async (req, res) => {

  const { name, latitude, longitude } = req.body;

  const db = await initDB();

  await db.run(
    "INSERT INTO plantations (name, latitude, longitude) VALUES (?, ?, ?)",
    [name, latitude, longitude]
  );

  res.json({ message: "Plantation saved successfully" });
};