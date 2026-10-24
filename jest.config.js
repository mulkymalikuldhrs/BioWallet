module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/apps/web/.next/',
    '<rootDir>/dist/',
  ],
};
