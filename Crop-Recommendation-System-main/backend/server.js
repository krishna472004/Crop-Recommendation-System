import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import mapRoutes from "./routes/mapRoutes.js";
import plantationRoutes from "./routes/plantationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import ndviAnalysisRoutes from "./routes/ndviAnalysis.js";

import { initDB } from "./database/database.js";
import { startNDVIScheduler } from "./cron/ndviScheduler.js";

dotenv.config();

console.log("Groq Key Loaded:", process.env.GROQ_API_KEY);

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* Initialize SQLite database */
initDB().then(() => {
  console.log("✅ Plantation database initialized");
});

/* Routes */
app.use("/api/map", mapRoutes);
app.use("/api/plantation", plantationRoutes);
app.use("/api", healthRoutes);
app.use("/api", ndviAnalysisRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  /* Start NDVI Scheduler */
  startNDVIScheduler();
});