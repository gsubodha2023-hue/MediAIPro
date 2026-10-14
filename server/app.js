import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import receptionRoutes from "./routes/receptionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import operationsRoutes from "./routes/operationsRoutes.js";

const app = express();

// ---- Security & core middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allows the httpOnly refresh-token cookie to be sent
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limit auth routes specifically to slow down brute-force attacks
// (skipped entirely in tests so the test suite isn't artificially throttled)
if (process.env.NODE_ENV !== "test") {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: "Too many attempts, please try again later",
  });
  app.use("/api/auth", authLimiter);
}

// ---- Routes ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "MediAI Pro API is running" });
});

// Serve uploaded files (lab reports, prescriptions) so the frontend can display/download them.
// crossOriginResourcePolicy is relaxed here specifically because the frontend
// runs on a different origin (port 5173) than the API (port 5000) in dev.
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    setHeaders: (res) => res.set("Cross-Origin-Resource-Policy", "cross-origin"),
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", medicalRecordRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reception", receptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/health-logs", healthRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/operations", operationsRoutes);

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

export default app;
