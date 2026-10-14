import express from "express";
import { registerPatient, getAllAppointments } from "../controllers/receptionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("receptionist", "admin", "superadmin"));

router.post("/patients", registerPatient);
router.get("/appointments", getAllAppointments);

export default router;
