import Doctor from "../models/Doctor.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

// @route   GET /api/doctors
// @access  Private (any logged-in user)
// Supports ?specialization=Cardiology to filter
export const getDoctors = asyncHandler(async (req, res) => {
  const filter = { isVerified: true };
  if (req.query.specialization) {
    filter.specialization = new RegExp(req.query.specialization, "i");
  }

  const doctors = await Doctor.find(filter).populate(
    "user",
    "name email phone avatar"
  );

  res.status(200).json({ success: true, count: doctors.length, doctors });
});

// @route   GET /api/doctors/:id
// @access  Private
export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(
    "user",
    "name email phone avatar"
  );
  if (!doctor) throw new AppError("Doctor not found", 404);
  res.status(200).json({ success: true, doctor });
});

// @route   PATCH /api/doctors/me
// @access  Private/Doctor
// Lets a logged-in doctor update their own profile (bio, fee, availability, etc.)
export const updateMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new AppError("Doctor profile not found", 404);

  const allowedFields = [
    "bio",
    "consultationFee",
    "availability",
    "yearsOfExperience",
    "department",
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });

  await doctor.save();
  res.status(200).json({ success: true, doctor });
});
