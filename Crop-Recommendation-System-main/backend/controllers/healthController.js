import Plantation from "../models/Plantation.js";
import { findPlantationById, isMemoryDbEnabled } from "../database/runtimeStore.js";
import { createDailyNDVIReport, getPlantationHealthSummary } from "../services/ndviService.js";

export const getPlantationHealth = async (req, res) => {
  try {
    const plantationId = req.params.id;
    const plantation = isMemoryDbEnabled()
      ? await findPlantationById(plantationId)
      : await Plantation.findById(plantationId);

    if (!plantation) {
      return res.status(404).json({ error: "Plantation not found" });
    }

    const health = await getPlantationHealthSummary(plantationId);

    if (!health) {
      const latestReport = await createDailyNDVIReport(plantation);
      const fallbackHealth = await getPlantationHealthSummary(plantationId);

      return res.json({
        plantation: {
          id: plantation._id,
          name: plantation.name,
          locationName: plantation.locationName,
          email: plantation.email
        },
        latestReport,
        ...fallbackHealth
      });
    }

    res.json({
      plantation: {
        id: plantation._id,
        name: plantation.name,
        locationName: plantation.locationName,
        email: plantation.email
      },
      latestReport: health.reports[0] || null,
      ...health
    });
  } catch (error) {
    console.error("Health controller error:", error);
    res.status(500).json({ error: "Failed to calculate health" });
  }
};
