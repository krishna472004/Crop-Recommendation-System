import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mapRoutes from "./routes/mapRoutes.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/map", mapRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
