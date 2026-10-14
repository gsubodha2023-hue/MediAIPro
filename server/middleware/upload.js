import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "./errorHandler.js";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// For a real deployment, swap this out for Cloudinary (see note at bottom of
// this file) so files survive redeploys - Render/Railway's local disk is
// ephemeral. Local disk storage is fine for development.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF, JPEG, PNG, or WEBP files are allowed", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/*
  --- Swapping to Cloudinary for production (Step 8) ---
  1. npm install cloudinary multer-storage-cloudinary
  2. Configure cloudinary with your CLOUDINARY_* env vars
  3. Replace `storage` above with a CloudinaryStorage instance
  4. Everything else (routes/controllers) stays exactly the same, since they
     only care about `req.file.path` / `req.file.filename`, which Cloudinary's
     storage engine also provides.
*/
