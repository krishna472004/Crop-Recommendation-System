import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mapRoutes from "./routes/mapRoutes.js";

dotenv.config();   // load .env variables

console.log("Gemini Key Loaded:", process.env.GEMINI_API_KEY);  // 👈 add this

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/map", mapRoutes);

const PORT = 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);