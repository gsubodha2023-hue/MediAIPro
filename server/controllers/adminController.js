import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

// @route   POST /api/admin/users
// @access  Private/Admin
// Creates a staff account. If role is 'doctor', also requires doctor-specific
// fields and creates the linked Doctor profile in the same request.
export const createStaffUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    specialization,
    licenseNumber,
    department,
    consultationFee,
  } = req.body;

  if (!["doctor", "receptionist", "admin"].includes(role)) {
    throw new AppError(
      "Role must be one of: doctor, receptionist, admin",
      400
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 400);
  }

  const user = await User.create({ name, email, password, role, phone });

  let doctorProfile = null;
  if (role === "doctor") {
    if (!specialization || !licenseNumber) {
      // roll back the user we just created since the doctor profile failed validation
      await User.findByIdAndDelete(user._id);
      throw new AppError(
        "specialization and licenseNumber are required for doctor accounts",
        400
      );
    }
    doctorProfile = await Doctor.create({
      user: user._id,
      specialization,
      licenseNumber,
      department,
      consultationFee,
      isVerified: true, // admin-created, so pre-verified
    });
  }

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    doctorProfile,
  });
});

// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-refreshToken");
  res.status(200).json({ success: true, count: users.length, users });
});

// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
// Activate/deactivate an account
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"}`,
    user: { id: user._id, isActive: user.isActive },
  });
});
