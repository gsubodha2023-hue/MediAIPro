import mongoose from "mongoose";

// A Doctor extends a User (role: 'doctor') with medical-professional-specific data.
// Kept separate from User so the User model stays lean and reusable across roles.
const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    department: { type: String, trim: true },
    bio: { type: String, trim: true },
    consultationFee: { type: Number, default: 0 },
    yearsOfExperience: { type: Number, default: 0 },

    // Weekly recurring availability, e.g.
    // [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: String, // "09:00"
        endTime: String, // "17:00"
      },
    ],

    isVerified: { type: Boolean, default: false }, // admin verifies doctor credentials
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
