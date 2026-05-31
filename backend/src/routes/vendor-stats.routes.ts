// ===========================================================
// vendor-stats.routes.ts - DI vendor analytics
// ===========================================================
// Mounted at /api/vendor in index.ts (alongside vendor.routes).
// Only a signed-in VENDOR can hit these endpoints.
//
//   GET /api/vendor/stats?range=week|month|lastMonth|all
//
// The stats power the four charts on the Infographic Report page.
// ===========================================================

import { Router } from "express";
import { VendorStatsController } from "../controller/vendorStatsController";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();
const vendorStatsController = new VendorStatsController();

router.use(requireAuth, requireRole("vendor"));

router.get("/stats", (req, res) => vendorStatsController.getStats(req, res));

export default router;
