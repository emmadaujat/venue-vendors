// auth.ts - Express middleware for JWT authentication and role-based access control.
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// Verifies the Authorization: Bearer <token> header and attaches the decoded
// payload to req.user. Returns 401 if the token is missing or invalid.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not signed in (missing auth token)" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired or invalid. Please sign in again." });
  }
}

// Guards a route to a specific set of roles. Must be used after requireAuth.
// Example: router.post("/bookings", requireAuth, requireRole("hirer"), ...)
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not signed in" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do that" });
    }

    next();
  };
}
