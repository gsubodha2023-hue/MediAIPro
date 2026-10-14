import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: String, phone: String, email: String,
  departments: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Hospital", hospitalSchema);
