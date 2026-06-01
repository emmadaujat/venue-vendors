// ===========================================================
// admin-backend — App 4 entry point (SCAFFOLD ONLY)
// ===========================================================
// This file was scaffolded as part of Task S1 (project setup).
// The real Apollo GraphQL implementation is Emma's Task B4.1.
//
// Emma: replace the placeholder below by following the week10
// reference at:
//   weeklypracsforref/week10/week10LECTURE/example1/backend/src/index.ts
//
// That pattern is roughly:
//   import { ApolloServer } from "@apollo/server";
//   import { expressMiddleware } from "@apollo/server/express4";
//   import { typeDefs } from "./graphql/schema";
//   import { resolvers } from "./graphql/resolvers";
//   import { AppDataSource } from "./data-source";
//   ...create server, app.use("/graphql", expressMiddleware(server)),
//      AppDataSource.initialize(), app.listen(PORT)
//
// data-source.ts + the entity/ files are copied here by Emma
// (Tasks S2 and S3 — same DB, separate app).
// ===========================================================

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
  // Initialise the database connection
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

  // Create Apollo Server with schema and resolvers
  const server = new ApolloServer({ typeDefs, resolvers });

  // Must start Apollo before attaching to Express
  await server.start();

  // Attach GraphQL endpoint to Express at /graphql
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // adminLogin mutation doesn't need a token — skip verification for it
        const operationName = (req.body as any)?.operationName;
        if (operationName === "AdminLogin") return {};

        // All other queries/mutations require a valid token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error("Unauthorized — no token provided");
        }

        const token = authHeader.split(" ")[1];
        try {
          const user = verifyToken(token);
          // Verify the token belongs to an admin
          if (user.role !== "admin") {
            throw new Error("Unauthorized — admin access only");
          }
          return { user };
        } catch {
          throw new Error("Unauthorized — invalid or expired token");
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
