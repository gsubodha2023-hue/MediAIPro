import express from "express";
import Prescription from "../models/Prescription.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const router = express.Router();
router.use(protect);
router.get("/", asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? { patient: req.user._id } : req.user.role === "doctor" ? { doctor: req.user._id } : {};
  const prescriptions = await Prescription.find(query).populate("patient doctor", "name email").sort({ createdAt: -1 });
  res.json({ success: true, prescriptions });
}));
router.post("/", authorize("doctor", "admin", "superadmin"), asyncHandler(async (req, res) => {
  if (!req.body.patient || !req.body.diagnosis) throw new AppError("Patient and diagnosis are required", 400);
  const prescription = await Prescription.create({ ...req.body, doctor: req.user._id });
  res.status(201).json({ success: true, prescription });
}));
router.patch("/:id/status", authorize("doctor", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!prescription) throw new AppError("Prescription not found", 404);
  res.json({ success: true, prescription });
}));
export default router;
