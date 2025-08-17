const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  projects: [
    // Frontend tests (React components, hooks, utils)
    {
      displayName: 'client',
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/integration/frontend/**/*.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    // Backend tests (API routes, services, database)
    {
      displayName: 'server',
      testEnvironment: 'jest-environment-node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.server.js'],
      testMatch: [
        '<rootDir>/tests/integration/api/**/*.test.{js,ts}',
        '<rootDir>/tests/unit/services/**/*.test.{js,ts}',
      ],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)