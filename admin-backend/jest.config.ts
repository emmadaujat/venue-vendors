// ===========================================================
// jest.config.ts - admin-backend (App 4, GraphQL) test runner
// ===========================================================
// ts-jest lets Jest run our TypeScript resolver tests directly.
// testEnvironment "node" because this is a server app (no DOM).
// The tsconfig already enables experimentalDecorators +
// emitDecoratorMetadata, which the TypeORM entities need.
// ===========================================================

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
};

export default config;
