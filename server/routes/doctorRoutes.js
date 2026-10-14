import express from "express";
import {
  getDoctors,
  getDoctorById,
  updateMyDoctorProfile,
} from "../controllers/doctorController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.patch("/me", protect, authorize("doctor"), updateMyDoctorProfile);

export default router;
