// express/index.d.ts - augments the Express Request type with req.user (set by requireAuth).
import { JwtUserPayload } from "../../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};
