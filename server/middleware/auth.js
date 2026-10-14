import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError, asyncHandler } from "./errorHandler.js";

// Verifies the access token sent in the Authorization header
// and attaches the logged-in user to req.user
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError("User no longer exists or is deactivated", 401);
    }

    req.user = user; // now every downstream handler can read req.user
    next();
  } catch (error) {
    throw new AppError("Not authorized, token failed or expired", 401);
  }
});

// Usage: authorize("doctor", "admin") - only allows these roles through
// Must be used AFTER `protect` since it relies on req.user
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};
