import express from "express";
import {
  createStaffUser,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Every route here requires a logged-in admin or superadmin
router.use(protect, authorize("admin", "superadmin"));

router.post("/users", createStaffUser);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", toggleUserStatus);

export default router;
