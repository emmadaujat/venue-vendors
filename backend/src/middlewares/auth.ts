// ===========================================================
// auth.ts — middleware that protects backend routes
// ===========================================================
// "Middleware" is just a function that runs BEFORE a route's
// controller. Express gives it (req, res, next). If everything
// is fine we call next() to continue to the controller. If not
// we send back an error and DON'T call next(), so the controller
// never runs.
//
// (Task S4). 
// Every protected endpoint (Aleeya's hirer routes, Emma's vendor
// routes) uses requireAuth, and many also use requireRole.
// ===========================================================

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// ---------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------
// Use this on any route that should only work when the caller is
// logged in. The browser must send the token in a header that
// looks like:   Authorization: Bearer <the-token-string>
//
// If the token is missing or invalid we reply 401 Unauthorized.
// If it is valid we copy the user details onto req.user so the
// controller knows who is making the request.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // The header must exist and start with the word "Bearer ".
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not signed in (missing auth token)" });
  }

  // Everything after "Bearer " is the actual token string.
  const token = authHeader.split(" ")[1];

  try {
    // verifyToken throws if the token is fake/expired/tampered.
    const user = verifyToken(token);
    req.user = user; // remember who this is for the controller
    next(); // all good — continue to the route
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Session expired or invalid. Please sign in again." });
  }
}

// ---------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------
// Use this AFTER requireAuth when a route should only work for a
// certain kind of user. Example for a hirer-only route:
//
//   router.post("/bookings", requireAuth, requireRole("hirer"), ...)
//
// You can pass more than one role, e.g. requireRole("hirer","admin").
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // requireAuth must have run first and set req.user.
    if (!req.user) {
      return res.status(401).json({ message: "Not signed in" });
    }

    // Is the logged-in user's role one of the allowed ones?
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to do that",
      });
    }

    next(); // role is allowed so continue
  };
}
