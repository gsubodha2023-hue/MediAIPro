// Run once after connecting to a fresh database: npm run seed
// Creates a superadmin account so you can log in and start creating
// doctor/receptionist/admin accounts through the API (or a future admin UI).
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  await connectDB();

  const email = "admin@mediaipro.test";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Superadmin already exists:", email);
    process.exit(0);
  }

  await User.create({
    name: "Super Admin",
    email,
    password: "ChangeMe123", // CHANGE THIS after first login
    role: "superadmin",
  });

  console.log("Superadmin created!");
  console.log("Email:", email);
  console.log("Password: ChangeMe123  (change this immediately after logging in)");
  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
