import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let mongoReadyPromise;

export async function initMongo() {
  if (mongoReadyPromise) {
    return mongoReadyPromise;
  }

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not configured. Using in-memory NDVI storage.");
    return null;
  }

  mongoReadyPromise = mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "crop_recommendation"
  });

  await mongoReadyPromise;
  console.log("MongoDB connected");
  return mongoose.connection;
}
