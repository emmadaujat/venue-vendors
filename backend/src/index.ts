import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth.routes";
import vendorRoutes from "./routes/vendor.routes";
// (hirer side)
import venueRoutes from "./routes/venue.routes";
import hirerRoutes from "./routes/hirer.routes";
import bookingRoutes from "./routes/booking.routes";

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use("/api/vendor", vendorRoutes);

// Connect to the database then start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error during Data Source initialization:", err));
