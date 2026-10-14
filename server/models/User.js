import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password in queries by default
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "receptionist", "admin", "superadmin"],
      default: "patient",
    },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    avatar: { type: String, default: "" }, // Cloudinary URL later
    address: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    allergies: [{ type: String, trim: true }],
    emergencyContacts: [{ name: String, relationship: String, phone: String }],
    preferences: {
      language: { type: String, enum: ["English", "Sinhala", "Tamil"], default: "English" },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
    },
    twoFactorEnabled: { type: Boolean, default: false },

    // Role-specific extras kept light here; doctor-specific data
    // (specialization, license, etc.) lives in a separate Doctor model
    // that references this User via `user` field — see models/Doctor.js

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // admin can deactivate accounts

    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving, but only if it changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
