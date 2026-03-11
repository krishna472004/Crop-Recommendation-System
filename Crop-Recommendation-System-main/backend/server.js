import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import mapRoutes from "./routes/mapRoutes.js";
import plantationRoutes from "./routes/plantationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import ndviAnalysisRoutes from "./routes/ndviAnalysis.js";

import { initDB } from "./database/database.js";
import { initMongo } from "./database/mongo.js";
import { startNDVIScheduler } from "./cron/ndviScheduler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

initDB().then(() => {
  console.log("SQLite initialized");
});

initMongo().catch((error) => {
  console.error("MongoDB init failed:", error.message);
});

app.use("/api/map", mapRoutes);
app.use("/api/plantation", plantationRoutes);
app.use("/api", healthRoutes);
app.use("/api", ndviAnalysisRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startNDVIScheduler();
});
