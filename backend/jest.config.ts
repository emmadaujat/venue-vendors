// jest.config.ts - Jest configuration for the backend HD tests.
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  maxWorkers: 1,
  silent: false,
};

export default config;
