import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";
import VerificationToken from "../models/VerificationToken.js";

// Sends the refresh token as an httpOnly cookie (safer than localStorage - JS can't read it)
const sendRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 400);
  }

  // Only allow patients to self-register with an elevated role blocked.
  // Doctors/staff/admins should be created by an admin (see adminController later).
  const safeRole = role === "patient" ? "patient" : "patient";

  const user = await User.create({ name, email, password, role: safeRole, phone });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await VerificationToken.create({ user: user._id, tokenHash: crypto.createHash("sha256").update(verificationToken).digest("hex"), type: "email", expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  await sendEmail({ to: user.email, subject: "Verify your MediAI Pro email", text: `Verify your email with this token: ${verificationToken}` });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  sendRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route   POST /api/auth/refresh
// @access  Public (relies on httpOnly cookie)
// When the short-lived access token expires, the frontend calls this
// endpoint to silently get a new one without forcing the user to log in again.
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError("No refresh token provided", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new AppError("Refresh token mismatch, please log in again", 401);
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  res.status(200).json({ success: true, accessToken: newAccessToken });
});

// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await User.updateOne({ refreshToken: token }, { refreshToken: "" });
  }
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "dateOfBirth", "gender", "address", "bloodGroup", "allergies", "emergencyContacts", "preferences", "avatar"];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

export const setTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: Boolean(req.body.enabled) }, { new: true });
  res.json({ success: true, twoFactorEnabled: user.twoFactorEnabled, message: user.twoFactorEnabled ? "Two-factor protection enabled" : "Two-factor protection disabled" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    await sendEmail({ to: user.email, subject: "Reset your MediAI Pro password", text: `Use this reset token within 30 minutes: ${rawToken}` });
  }
  res.json({ success: true, message: "If the account exists, reset instructions have been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } }).select("+passwordResetToken +passwordResetExpires");
  if (!user) throw new AppError("Reset token is invalid or expired", 400);
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password updated successfully" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const record = await VerificationToken.findOne({ tokenHash, type: "email", expiresAt: { $gt: Date.now() } });
  if (!record) throw new AppError("Verification token is invalid or expired", 400);
  await User.findByIdAndUpdate(record.user, { isEmailVerified: true });
  await record.deleteOne();
  res.json({ success: true, message: "Email verified successfully" });
});
