import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("patient"), createAppointment);
router.get("/mine", authorize("patient"), getMyAppointments);
router.patch("/:id/cancel", authorize("patient"), cancelAppointment);

router.get("/doctor", authorize("doctor"), getDoctorAppointments);
router.patch("/:id/status", authorize("doctor"), updateAppointmentStatus);

export default router;
