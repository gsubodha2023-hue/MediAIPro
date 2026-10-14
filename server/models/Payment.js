import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "LKR" },
  method: { type: String, enum: ["cash", "card", "online", "insurance"], default: "cash" },
  status: { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
  reference: String,
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
