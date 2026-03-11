import express from "express";
import { savePlantation } from "../controllers/plantationController.js";

const router = express.Router();

router.post("/save", savePlantation);

export default router;