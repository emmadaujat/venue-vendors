import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth.routes";
import vendorRoutes from "./routes/vendor.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Register auth routes — handles /api/register and /api/signin and /api/getuserprofile
app.use("/api", authRoutes);
app.use("/api", vendorRoutes);

// Connect to the database then start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error during Data Source initialization:", err));
