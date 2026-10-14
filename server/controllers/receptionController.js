import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

// @route   POST /api/reception/patients
// @access  Private/Receptionist,Admin
// Reception staff register walk-in patients who don't self-register online.
// A temporary password is generated; in a real system you'd email/print it
// or force a password reset on first login.
export const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, phone, dateOfBirth, gender } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("A patient with this email already exists", 400);

  const tempPassword = Math.random().toString(36).slice(-10) + "A1";

  const patient = await User.create({
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    password: tempPassword,
    role: "patient",
  });

  res.status(201).json({
    success: true,
    patient: { id: patient._id, name: patient.name, email: patient.email },
    tempPassword, // shown once so reception can hand it to the patient
    note: "Share this temporary password with the patient securely. They should change it after first login.",
  });
});

// @route   GET /api/reception/appointments
// @access  Private/Receptionist,Admin
// A front-desk-wide view across all doctors, for managing check-ins/schedules
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { date, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient", "name phone email")
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ date: 1, timeSlot: 1 });

  res.status(200).json({ success: true, count: appointments.length, appointments });
});
