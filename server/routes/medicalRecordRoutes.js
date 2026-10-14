import express from "express";
import {
  createRecord,
  getMyRecords,
  getPatientRecords,
} from "../controllers/medicalRecordController.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("patient", "doctor"),
  upload.single("file"),
  createRecord
);
router.get("/mine", authorize("patient"), getMyRecords);
router.get("/patient/:patientId", authorize("doctor"), getPatientRecords);

export default router;
