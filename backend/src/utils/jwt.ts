// ===========================================================
// jwt.ts — small helper for creating and reading JWT tokens
// ===========================================================
// A JWT (JSON Web Token) is just a signed string. When a user
// signs in, we put a few harmless details about them (their id,
// role and email) inside a token and "sign" it with a secret.
// Later, when the browser sends that token back, we can verify
// the signature to be sure nobody tampered with it.
//
// (Task S4). 
// Emma's sign-in endpoint (S5) calls signToken() to hand a token 
// to the browser, and the auth middleware calls verifyToken() to 
// check it on every protected request.
// ===========================================================

import jwt from "jsonwebtoken";

// The secret used to sign tokens. In production this comes from
// the .env file (JWT_SECRET). The fallback string is only so the
// app still runs locally if someone forgot to set the .env value.
const JWT_SECRET: string = process.env.JWT_SECRET || "dev-only-change-me";

// How long a token stays valid before the user must sign in again.
const TOKEN_EXPIRES_IN = "7d";

// This is exactly the small bundle of data we store inside a token.
// We NEVER put the password or anything sensitive in here, because
// the contents of a JWT can be read by anyone (only the signature
// is protected, not the data).
export interface JwtUserPayload {
  id: number; // matches User.userID in the database
  role: string; // "hirer" | "vendor" | "admin"
  email: string;
}

// Build a signed token for a user that just logged in / signed up.
export function signToken(user: JwtUserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

// Check a token coming back from the browser.
// If it is valid we get the payload back; if it is fake, expired
// or tampered with, jwt.verify throws, so the caller should wrap
// this in a try/catch (the auth middleware does exactly that).
export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}
