module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ['/node_modules/'],
  
  // A set of global variables that need to be available in all test environments
  globals: {
    'NODE_ENV': 'test',
  },
  
  // If the test path matches any of the patterns, it will be skipped
  testPathIgnorePatterns: ['/node_modules/'],
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  
  // Setup files to run before/after tests
  setupFilesAfterEnv: ['./tests/setup.js'],
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // An array of glob patterns indicating a set of files for which coverage 
  // information should be collected
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Excluding entry point
  ],
  
  // The minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};
