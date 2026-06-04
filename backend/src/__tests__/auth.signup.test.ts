// HD Test 1 - POST /api/register rejects weak passwords
// The sign-up form validates passwords client-side, but an attacker can bypass it by
// posting JSON directly to the API (OWASP A07 - Identification and Authentication Failures).
// This test pins the backend's defence: the API must reject a weak password with 400
// before touching the database.
// supertest uses the real Express app from app.ts; no database init is needed because
// authController.register() returns on the password check before querying userRepository.

import request from "supertest";
import app from "../app";

describe("POST /api/register - weak password is rejected", () => {
  test("returns 400 when password is shorter than 6 chars", async () => {
    const res = await request(app).post("/api/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phoneNumber: "0412345678",
      role: "hirer",
      password: "abc", // too short -> must be rejected
    });

    expect(res.status).toBe(400);
    // Assert on `fields` (the list of failing property names), not the constraint message
    // text, so the assertion stays stable if wording changes.
    expect(res.body.fields).toContain("password");
  });

  test("returns 400 when password has no uppercase letter", async () => {
    const res = await request(app).post("/api/register").send({
      firstName: "Test",
      lastName: "User",
      email: "test2@example.com",
      phoneNumber: "0412345678",
      role: "hirer",
      password: "abcdefg1!", // 9 chars, has digit + special, but no uppercase
    });

    expect(res.status).toBe(400);
    expect(res.body.fields).toContain("password");
  });
});
