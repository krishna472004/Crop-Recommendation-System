import cron from "node-cron";
import { fetchNDVIForAllPlantations } from "../services/ndviService.js";

export const startNDVIScheduler = () => {

  console.log("NDVI Scheduler Started");

  // Testing mode: runs every minute
  cron.schedule("* * * * *", async () => {

    console.log("Running NDVI monitoring tick...");

    await fetchNDVIForAllPlantations();

  });

};
