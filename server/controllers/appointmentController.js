import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { notify } from "../services/notificationService.js";

// @route   POST /api/appointments
// @access  Private/Patient
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, type, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404);

  // Basic double-booking guard (the unique index in the model is the real
  // safety net, but checking here lets us return a friendly error message)
  const clash = await Appointment.findOne({
    doctor: doctorId,
    date,
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });
  if (clash) {
    throw new AppError("This time slot is already booked", 409);
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date,
    timeSlot,
    type,
    reason,
  });

  // Notify the doctor so they know a new booking needs confirmation
  await notify({
    userId: doctor.user,
    title: "New appointment request",
    message: `${req.user.name} requested an appointment on ${new Date(date).toLocaleDateString()} at ${timeSlot}.`,
    type: "appointment",
    relatedId: appointment._id,
  });

  res.status(201).json({ success: true, appointment });
});

// @route   GET /api/appointments/mine
// @access  Private/Patient
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

// @route   GET /api/appointments/doctor
// @access  Private/Doctor
// Returns appointments for the logged-in doctor
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new AppError("Doctor profile not found", 404);

  const { status } = req.query;
  const filter = { doctor: doctor._id };
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("patient", "name email phone dateOfBirth gender")
    .sort({ date: 1 });

  res.status(200).json({ success: true, count: appointments.length, appointments });
});

// @route   PATCH /api/appointments/:id/status
// @access  Private/Doctor
// Doctor confirms, completes, or cancels an appointment; can attach notes
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ["confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor || !appointment.doctor.equals(doctor._id)) {
    throw new AppError("Not authorized to modify this appointment", 403);
  }

  appointment.status = status;
  if (notes) appointment.notes = notes;
  if (status === "cancelled") appointment.cancelledBy = "doctor";

  await appointment.save();

  const statusMessages = {
    confirmed: "Your appointment has been confirmed.",
    completed: "Your appointment has been marked as completed.",
    cancelled: "Your appointment has been cancelled by the doctor.",
  };
  await notify({
    userId: appointment.patient,
    title: `Appointment ${status}`,
    message: statusMessages[status],
    type: "appointment",
    relatedId: appointment._id,
  });

  res.status(200).json({ success: true, appointment });
});

// @route   PATCH /api/appointments/:id/cancel
// @access  Private/Patient
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);

  if (!appointment.patient.equals(req.user._id)) {
    throw new AppError("Not authorized to cancel this appointment", 403);
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = "patient";
  appointment.cancellationReason = req.body.reason || "";
  await appointment.save();

  const doctor = await Doctor.findById(appointment.doctor);
  if (doctor) {
    await notify({
      userId: doctor.user,
      title: "Appointment cancelled",
      message: `${req.user.name} cancelled their appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
      type: "appointment",
      relatedId: appointment._id,
    });
  }

  res.status(200).json({ success: true, appointment });
});
