import mongoose from "mongoose";

const monitoringLogSchema = new mongoose.Schema(
  {
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plantation",
      required: true,
      index: true
    },
    level: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info"
    },
    message: { type: String, required: true },
    context: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export default mongoose.models.MonitoringLog || mongoose.model("MonitoringLog", monitoringLogSchema);
