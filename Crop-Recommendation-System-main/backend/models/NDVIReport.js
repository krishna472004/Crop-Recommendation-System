import mongoose from "mongoose";

const ndviReportSchema = new mongoose.Schema(
  {
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plantation",
      required: true,
      index: true
    },
    reportDate: { type: String, required: true, index: true },
    reportKey: { type: String, required: true, index: true },
    ndviValue: { type: Number, required: true },
    status: { type: String, required: true },
    trend: { type: String, required: true },
    summary: { type: String, required: true },
    source: { type: String, default: "simulated" },
    emailSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

ndviReportSchema.index({ plantationId: 1, reportKey: 1 }, { unique: true });

export default mongoose.models.NDVIReport || mongoose.model("NDVIReport", ndviReportSchema);
