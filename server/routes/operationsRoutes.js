import express from "express";
import Hospital from "../models/Hospital.js";
import Payment from "../models/Payment.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import AIChat from "../models/AIChat.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();
router.use(protect);
router.get("/hospitals", asyncHandler(async (_req, res) => res.json({ success: true, hospitals: await Hospital.find().sort({ name: 1 }) })));
router.post("/hospitals", authorize("admin", "superadmin"), asyncHandler(async (req, res) => res.status(201).json({ success: true, hospital: await Hospital.create(req.body) })));
router.get("/payments", authorize("receptionist", "admin", "superadmin"), asyncHandler(async (_req, res) => res.json({ success: true, payments: await Payment.find().populate("patient", "name email").sort({ createdAt: -1 }) })));
router.post("/payments", authorize("receptionist", "admin", "superadmin"), asyncHandler(async (req, res) => res.status(201).json({ success: true, payment: await Payment.create(req.body) })));
router.get("/audit", authorize("admin", "superadmin"), asyncHandler(async (_req, res) => res.json({ success: true, logs: await AuditLog.find().populate("actor", "name email").sort({ createdAt: -1 }).limit(200) })));
router.get("/analytics", authorize("admin", "superadmin"), asyncHandler(async (_req, res) => {
  const [users, appointments, completed, aiChats, revenue] = await Promise.all([
    User.countDocuments(), Appointment.countDocuments(), Appointment.countDocuments({ status: "completed" }),
    AIChat.countDocuments(), Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  res.json({ success: true, analytics: { users, appointments, completed, aiChats, revenue: revenue[0]?.total || 0 } });
}));
export default router;
