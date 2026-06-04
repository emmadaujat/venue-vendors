// vendor-stats.routes.ts - vendor analytics endpoint. GET /api/vendor/stats powers the Infographic Report.
import { Router } from "express";
import { VendorStatsController } from "../controller/vendorStatsController";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();
const vendorStatsController = new VendorStatsController();

router.use(requireAuth, requireRole("vendor"));

router.get("/stats", (req, res) => vendorStatsController.getStats(req, res));

export default router;
