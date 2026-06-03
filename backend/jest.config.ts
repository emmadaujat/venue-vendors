// ===========================================================
// jest.config.ts - Jest configuration for the backend HD tests
// ===========================================================
// Uses ts-jest so .ts test files run without a separate build
// step. testEnvironment "node" because we're testing an
// Express HTTP API (no DOM).
// ===========================================================

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Tests run on a single isolated process so jest.mock calls
  // don't leak between files.
  maxWorkers: 1,
  // The data-source uses dotenv at import-time; suppress noise.
  silent: false,
};

export default config;
