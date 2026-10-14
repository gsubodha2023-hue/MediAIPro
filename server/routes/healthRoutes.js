import express from "express";
import HealthLog from "../models/HealthLog.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const router = express.Router();
router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? { patient: req.user._id } : (req.query.patient ? { patient: req.query.patient } : {});
  const logs = await HealthLog.find(query).sort({ recordedAt: -1 }).limit(200);
  res.json({ success: true, logs });
}));

router.post("/", asyncHandler(async (req, res) => {
  const allowed = ["blood_pressure", "blood_sugar", "weight", "bmi", "water", "sleep", "mood", "diary", "vaccination"];
  if (!allowed.includes(req.body.type)) throw new AppError("Invalid health log type", 400);
  const log = await HealthLog.create({ ...req.body, patient: req.user.role === "patient" ? req.user._id : req.body.patient });
  res.status(201).json({ success: true, log });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const log = await HealthLog.findById(req.params.id);
  if (!log) throw new AppError("Health log not found", 404);
  if (req.user.role === "patient" && String(log.patient) !== String(req.user._id)) throw new AppError("Not authorized", 403);
  await log.deleteOne();
  res.json({ success: true });
}));

export default router;
