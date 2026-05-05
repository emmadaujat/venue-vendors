import type { Config } from "jest";

const config: Config = {
  // Use jsdom so we can render React components in tests
  testEnvironment: "jsdom",

  // ts-jest lets Jest understand TypeScript files
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // Load jest-dom matchers (like toBeInTheDocument) before every test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Map the @/ path alias to src/ so imports work the same as in the app
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
