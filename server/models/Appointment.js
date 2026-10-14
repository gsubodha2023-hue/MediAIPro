import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: Date, required: true }, // the calendar day of the appointment
    timeSlot: { type: String, required: true }, // e.g. "10:30" - keeps slot logic simple
    type: {
      type: String,
      enum: ["in-person", "video"],
      default: "in-person",
    },
    reason: { type: String, required: true, trim: true }, // patient's stated reason for visit
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, trim: true }, // doctor's notes, filled in after the visit
    cancelledBy: { type: String, enum: ["patient", "doctor", null], default: null },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Prevents the same doctor from being double-booked in the same slot
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
