// ===========================================================
// express/index.d.ts — tells TypeScript that req.user can exist
// ===========================================================
// Our auth middleware attaches the logged-in user onto the
// Express request object as `req.user`. Express does not know
// about that extra field by default, so TypeScript would show a
// red squiggle every time we read req.user.
//
// This declaration file "teaches" TypeScript the shape of that
// extra field so the rest of the code stays type-safe.
// ===========================================================

import { JwtUserPayload } from "../../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth() after a valid token is verified.
      // It is optional because public routes have no user.
      user?: JwtUserPayload;
    }
  }
}

export {};
