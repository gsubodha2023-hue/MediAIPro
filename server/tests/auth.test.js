import request from "supertest";
import app from "../app.js";
import { connectTestDB, clearTestDB, closeTestDB } from "./setup.js";

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

describe("POST /api/auth/register", () => {
  it("registers a new patient and returns an access token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe("jane@example.com");
    // Always forced to 'patient' regardless of what's sent - this is the
    // security behavior we most want a regression test to catch
    expect(res.body.user.role).toBe("patient");
  });

  it("rejects registration with a duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Another Jane",
      email: "jane@example.com",
      password: "password456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane2@example.com",
      password: "short",
    });

    expect(res.statusCode).toBe(400);
  });

  it("silently ignores an attempt to self-register as admin", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Sneaky User",
      email: "sneaky@example.com",
      password: "password123",
      role: "admin",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe("patient");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });

  it("rejects a non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/auth/me (protected route)", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.statusCode).toBe(401);
  });

  it("returns the user's profile with a valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("jane@example.com");
  });
});
