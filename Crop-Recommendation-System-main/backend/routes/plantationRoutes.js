import express from "express";
import { lookupPlantation, savePlantation } from "../controllers/plantationController.js";

const router = express.Router();

router.post("/save", savePlantation);
router.get("/lookup", lookupPlantation);

export default router;
