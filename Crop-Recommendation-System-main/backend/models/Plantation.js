import mongoose from "mongoose";

const coordinateSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const plantationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    locationName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    coordinates: { type: [coordinateSchema], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Plantation || mongoose.model("Plantation", plantationSchema);
