// app.ts - Express application factory (no listen, no DB init).
// Split from index.ts so supertest tests can import the app without opening a TCP port.

import "reflect-metadata";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import vendorRoutes from "./routes/vendor.routes";
import venueRoutes from "./routes/venue.routes";
import hirerRoutes from "./routes/hirer.routes";
import bookingRoutes from "./routes/booking.routes";
import vendorStatsRoutes from "./routes/vendor-stats.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api", authRoutes);

// Hirer-side routes registered before vendor routes so Express matches them first.
app.use("/api/venues", venueRoutes);
app.use("/api/hirer", hirerRoutes);
app.use("/api/bookings", bookingRoutes);

// Stats router registered before the main vendor router so /api/vendor/stats matches first.
app.use("/api/vendor", vendorStatsRoutes);
app.use("/api/vendor", vendorRoutes);

export default app;
