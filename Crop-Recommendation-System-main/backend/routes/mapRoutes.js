import express from "express";
import { analyzePolygon } from "../controllers/mapController.js";

const router = express.Router();
router.post("/analyze", analyzePolygon);

export default router;
