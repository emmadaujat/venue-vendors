// ===========================================================
// index.ts - production / dev entry point
// ===========================================================
// All routes live in app.ts so the HD supertest tests can use
// the same Express instance without opening a port. This file
// only initialises the database connection and starts listening.
// ===========================================================

import { AppDataSource } from "./data-source";
import app from "./app";

const PORT = process.env.PORT || 3001;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error during Data Source initialization:", err));
