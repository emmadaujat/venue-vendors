// ===========================================================
// HD Test 1 - auth.signup.test.ts
// ===========================================================
// CONTEXT (this is the "contextual" comment block the spec asks
// for): the sign-up form on the React side already refuses weak
// passwords, but a determined attacker can bypass that by POST-
// ing JSON directly to the API. This is OWASP A07
// (Identification & Authentication Failures): if the backend
// trusts the frontend's validation, a single curl command can
// create an account with the password "abc".
//
// This test pins down the backend's defence: the API itself
// MUST reject a weak password with a 400 status BEFORE doing
// anything else (so it never touches the database with an
// untrusted credential).
//
// supertest hits the real Express app exported by app.ts, so
// every middleware (cors -> express.json -> auth controller) is
// exercised end-to-end. The test does not need the database to
// be initialised because authController.register() returns on
// the password check long before it queries `userRepository`.
// ===========================================================

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

    // 400 = Bad Request, NOT 500. A 500 would mean the bad input
    // reached the DB and exploded there instead of being caught.
    expect(res.status).toBe(400);

    // The error message MUST mention the password so the front-
    // end can highlight the correct field. We do a loose regex
    // match so the test does not break if the wording is tweaked.
    expect(res.body.message).toMatch(/password/i);
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
    expect(res.body.message).toMatch(/uppercase/i);
  });
});
