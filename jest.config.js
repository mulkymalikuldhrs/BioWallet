module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^utils$': '<rootDir>/packages/utils/src',
    '^wallet-core$': '<rootDir>/packages/wallet-core/src',
    '^biometric-core$': '<rootDir>/packages/biometric-core/src',
    '^shared-ui$': '<rootDir>/packages/shared-ui/src'
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/apps/web/.next/',
    '<rootDir>/dist/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
