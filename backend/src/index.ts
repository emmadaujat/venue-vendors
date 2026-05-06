import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Error during Data Source initialization:", err));
