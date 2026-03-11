import cron from "node-cron";
import { fetchNDVI } from "../services/ndviService.js";

export const startNDVIScheduler = () => {

  console.log("NDVI Scheduler Started");

  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {

    console.log("Running daily NDVI monitoring...");

    await fetchNDVI();

  });

};