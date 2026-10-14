import request from "supertest";
import app from "../app.js";
import { connectTestDB, clearTestDB, closeTestDB } from "./setup.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// Helper: creates a doctor directly in the DB (bypassing the admin API,
// since these tests are about appointments, not staff creation)
const createDoctor = async () => {
  const doctorUser = await User.create({
    name: "Dr. Alice",
    email: "alice@example.com",
    password: "password123",
    role: "doctor",
  });
  const doctor = await Doctor.create({
    user: doctorUser._id,
    specialization: "Cardiology",
    licenseNumber: "LIC-001",
    isVerified: true,
  });
  return doctor;
};

const registerAndLoginPatient = async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Patient One",
    email: "patient@example.com",
    password: "password123",
  });
  return res.body.accessToken;
};

describe("POST /api/appointments", () => {
  it("lets a patient book an available slot", async () => {
    const doctor = await createDoctor();
    const token = await registerAndLoginPatient();

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id,
        date: "2026-08-01",
        timeSlot: "10:00",
        type: "in-person",
        reason: "Routine checkup",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.appointment.status).toBe("pending");
  });

  it("rejects a double-booking for the same doctor/date/timeSlot", async () => {
    const doctor = await createDoctor();
    const token = await registerAndLoginPatient();

    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id,
        date: "2026-08-01",
        timeSlot: "10:00",
        reason: "First booking",
      });

    // A second patient tries to book the exact same slot
    const secondToken = (
      await request(app).post("/api/auth/register").send({
        name: "Patient Two",
        email: "patient2@example.com",
        password: "password123",
      })
    ).body.accessToken;

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${secondToken}`)
      .send({
        doctorId: doctor._id,
        date: "2026-08-01",
        timeSlot: "10:00",
        reason: "Second booking, same slot",
      });

    expect(res.statusCode).toBe(409);
  });

  it("rejects booking with a non-existent doctor", async () => {
    const token = await registerAndLoginPatient();
    const fakeDoctorId = "64a000000000000000000000";

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: fakeDoctorId,
        date: "2026-08-01",
        timeSlot: "10:00",
        reason: "Checkup",
      });

    expect(res.statusCode).toBe(404);
  });

  it("rejects a doctor trying to book an appointment (wrong role)", async () => {
    const doctorProfile = await createDoctor();
    const doctorLogin = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${doctorLogin.body.accessToken}`)
      .send({
        doctorId: doctorProfile._id,
        date: "2026-08-01",
        timeSlot: "10:00",
        reason: "Checkup",
      });

    expect(res.statusCode).toBe(403);
  });
});
