/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/index.js',
    '!src/config/**',
    '!src/**/database.js'
  ],
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};
