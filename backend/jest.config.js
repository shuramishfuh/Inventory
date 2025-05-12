/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.+)$': '$1',
    '^(\\.{1,2}/.+)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  automock: false,
  resetMocks: false
};