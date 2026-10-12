module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^utils$': '<rootDir>/packages/utils/src',
    '^wallet-core$': '<rootDir>/packages/wallet-core/src',
    '^biometric-core$': '<rootDir>/packages/biometric-core/src',
    '^shared-ui$': '<rootDir>/packages/shared-ui/src',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/apps/web/.next/', '<rootDir>/dist/'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
