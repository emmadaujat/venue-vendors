// admin-backend/index.ts - Apollo GraphQL entry point. Initialises the DB and mounts the
// GraphQL server at /graphql. All operations except adminLogin require a valid admin JWT.
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { AppDataSource } from "./data-source";
import { verifyToken } from "./utils/jwt";

async function main() {
  await AppDataSource.initialize();
  console.log("Admin DB connected");

  const app = express();
  // Allow requests from admin frontend running on localhost:5173
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  // Attach GraphQL endpoint to Express at /graphql
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // adminLogin does not require a token; skip verification for it.
        const operationName = (req.body as any)?.operationName;
        if (operationName === "AdminLogin") return {};

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error("Unauthorized: no token provided");
        }

        const token = authHeader.split(" ")[1];
        try {
          const user = verifyToken(token);
          // Verify the token belongs to an admin
          if (user.role !== "admin") {
            throw new Error("Unauthorized: admin access only");
          }
          return { user };
        } catch {
          throw new Error("Unauthorized: invalid or expired token");
        }
      },
    }),
  );

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`admin-backend scaffold running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start admin server", err);
});
