import express from "express";
import { getPlantationHealth } from "../controllers/healthController.js";

const router = express.Router();

router.get("/health/:id", getPlantationHealth);

export default router;