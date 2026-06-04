// jwt.ts - helpers for signing and verifying JWT tokens used by the auth system.
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "dev-only-change-me";
const TOKEN_EXPIRES_IN = "7d";

export interface JwtUserPayload {
  id: number;
  role: string;
  email: string;
}

export function signToken(user: JwtUserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

// jwt.verify throws if the token is expired, tampered, or invalid.
// Callers should wrap this in a try/catch.
export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}
