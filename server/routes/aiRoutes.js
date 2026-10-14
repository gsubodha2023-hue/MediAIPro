import express from "express";
import {
  chatWithAI,
  getChatHistory,
  checkSymptoms,
  getSymptomHistory,
} from "../controllers/aiController.js";
import { protect, authorize } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

router.use(protect, authorize("patient"));

// AI calls cost money and can be abused - rate limit more strictly than general routes
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: "Too many AI requests, please slow down",
});
router.use(aiLimiter);

router.post("/chat", chatWithAI);
router.get("/chat/history", getChatHistory);
router.post("/symptom-checker", checkSymptoms);
router.get("/symptom-checker/history", getSymptomHistory);

export default router;
