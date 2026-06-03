// ===========================================================
// app.ts - the Express application (no listen, no DB init)
// ===========================================================
// Split out from index.ts so the supertest HD tests can `import
// app` and fire requests at it without opening a TCP port or
// needing a live database. (Plan A4.2 / week9 example3 pattern.)
//
// index.ts is now a 3-line bootstrapper that initialises the
// data source and calls app.listen().
// ===========================================================

import "reflect-metadata";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import vendorRoutes from "./routes/vendor.routes";
// (hirer side)
import venueRoutes from "./routes/venue.routes";
import hirerRoutes from "./routes/hirer.routes";
import bookingRoutes from "./routes/booking.routes";
// DI vendor analytics (Infographic Report)
import vendorStatsRoutes from "./routes/vendor-stats.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Register auth routes — handles /api/register and /api/signin and /api/getuserprofile
app.use("/api", authRoutes);

// Hirer-side routes. These use specific prefixes
// (/api/venues, /api/hirer, /api/bookings) and are registered
// BEFORE the generic vendor routes so Express matches them first.
app.use("/api/venues", venueRoutes);
app.use("/api/hirer", hirerRoutes);
app.use("/api/bookings", bookingRoutes);

// Stats router is registered FIRST so /api/vendor/stats matches
// here before falling through to Emma's main vendor router.
app.use("/api/vendor", vendorStatsRoutes);
app.use("/api/vendor", vendorRoutes);

export default app;
