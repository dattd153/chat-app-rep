/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/apps/web'], // Avoid testing React frontend with standard node jest
  projects: [
    '<rootDir>/packages/*',
    '<rootDir>/services/*'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json' // uses the local package tsconfig
    }]
  }
};
