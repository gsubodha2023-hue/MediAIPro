import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  setTwoFactor,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
  validate,
} from "../validators/authValidators.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/2fa", protect, setTwoFactor);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
