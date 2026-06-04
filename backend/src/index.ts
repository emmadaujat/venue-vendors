// index.ts - production entry point. Initialises the database connection and starts the HTTP server.
import { AppDataSource } from "./data-source";
import app from "./app";

const PORT = process.env.PORT || 3001;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error during Data Source initialization:", err));
