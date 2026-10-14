import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { notify } from "../services/notificationService.js";

// @route   POST /api/records
// @access  Private/Patient (self-upload, e.g. an old lab report) or Doctor
// Accepts multipart/form-data with an optional `file` field
export const createRecord = asyncHandler(async (req, res) => {
  const { type, title, description, patientId, appointmentId } = req.body;

  // Doctors create records for a specified patient; patients create for themselves
  let patient = req.user._id;
  let doctorProfile = null;

  if (req.user.role === "doctor") {
    if (!patientId) throw new AppError("patientId is required", 400);
    patient = patientId;
    doctorProfile = await Doctor.findOne({ user: req.user._id });

    // If tied to an appointment, verify this doctor actually treated this patient
    if (appointmentId) {
      const appt = await Appointment.findById(appointmentId);
      if (!appt || !appt.doctor.equals(doctorProfile._id) || !appt.patient.equals(patientId)) {
        throw new AppError("This appointment doesn't match the doctor/patient", 400);
      }
    }
  }

  const record = await MedicalRecord.create({
    patient,
    doctor: doctorProfile?._id,
    appointment: appointmentId || undefined,
    type,
    title,
    description,
    uploadedBy: req.user._id,
    attachment: req.file
      ? {
          fileName: req.file.originalname,
          fileUrl: `/uploads/${req.file.filename}`,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        }
      : undefined,
  });

  // Only notify when a doctor adds something to a patient's record - no need
  // to notify a patient about their own self-uploaded lab report
  if (req.user.role === "doctor") {
    await notify({
      userId: patient,
      title: "New medical record added",
      message: `Dr. ${req.user.name} added a new ${type.replace("_", " ")}: "${title}"`,
      type: "record",
      relatedId: record._id,
    });
  }

  res.status(201).json({ success: true, record });
});

// @route   GET /api/records/mine
// @access  Private/Patient
export const getMyRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user._id })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: records.length, records });
});

// @route   GET /api/records/patient/:patientId
// @access  Private/Doctor
// A doctor can view a patient's history - in a real system you'd also verify
// this doctor has (or has had) an appointment with this patient before allowing access.
export const getPatientRecords = asyncHandler(async (req, res) => {
  const hasTreated = await Appointment.exists({
    patient: req.params.patientId,
    doctor: (await Doctor.findOne({ user: req.user._id }))?._id,
  });
  if (!hasTreated) {
    throw new AppError("You have no appointment history with this patient", 403);
  }

  const records = await MedicalRecord.find({ patient: req.params.patientId })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: records.length, records });
});
