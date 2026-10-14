import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true }, dosage: String, frequency: String,
  duration: String, instructions: String,
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  diagnosis: { type: String, required: true },
  medicines: { type: [medicineSchema], default: [] },
  advice: String,
  validUntil: Date,
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Prescription", prescriptionSchema);
