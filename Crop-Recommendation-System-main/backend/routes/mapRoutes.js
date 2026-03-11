import express from "express";
import { analyzePolygon } from "../controllers/mapController.js";

const router = express.Router();

/*
====================================================
 MAP ANALYSIS ROUTE
====================================================
Endpoint:
POST /api/map/analyze

Body sent from frontend:
{
  polygon: {
    coordinates: [...]
  }
}
====================================================
*/

router.post("/analyze", analyzePolygon);

export default router;