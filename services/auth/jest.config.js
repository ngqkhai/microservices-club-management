/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/models/index.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};
