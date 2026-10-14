import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["blood_pressure", "blood_sugar", "weight", "bmi", "water", "sleep", "mood", "diary", "vaccination"], required: true },
  value: { type: Number },
  secondaryValue: { type: Number },
  unit: { type: String, trim: true },
  note: { type: String, trim: true, maxlength: 1000 },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("HealthLog", healthLogSchema);
