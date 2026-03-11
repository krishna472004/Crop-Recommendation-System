import express from "express";
import Plantation from "../models/Plantation.js";
import NDVIReport from "../models/NDVIReport.js";
import {
  findPlantationById,
  findReportsByPlantation,
  isMemoryDbEnabled
} from "../database/runtimeStore.js";
import { createDailyNDVIReport, getMonitoringLogs } from "../services/ndviService.js";

const router = express.Router();

router.get("/ndvi/reports/:plantationId", async (req, res) => {
  try {
    const reports = isMemoryDbEnabled()
      ? await findReportsByPlantation(req.params.plantationId, 200)
      : await NDVIReport.find({ plantationId: req.params.plantationId })
          .sort({ createdAt: -1 })
          .lean();

    res.json({ reports });
  } catch (error) {
    console.error("Fetch NDVI reports error:", error);
    res.status(500).json({ error: "Failed to fetch NDVI reports" });
  }
});

router.get("/ndvi/logs/:plantationId", async (req, res) => {
  try {
    const logs = await getMonitoringLogs(req.params.plantationId, 100);
    res.json({ logs });
  } catch (error) {
    console.error("Fetch NDVI logs error:", error);
    res.status(500).json({ error: "Failed to fetch NDVI logs" });
  }
});

router.post("/ndvi/run-now/:plantationId", async (req, res) => {
  try {
    const plantation = isMemoryDbEnabled()
      ? await findPlantationById(req.params.plantationId)
      : await Plantation.findById(req.params.plantationId);

    if (!plantation) {
      return res.status(404).json({ error: "Plantation not found" });
    }

    const report = await createDailyNDVIReport(plantation, { forceNew: true });
    res.json({ report });
  } catch (error) {
    console.error("Run NDVI now error:", error);
    res.status(500).json({ error: "Failed to create NDVI report" });
  }
});

export default router;
