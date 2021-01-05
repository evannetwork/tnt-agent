process.env.IS_TEST = 'true';

// suppress MaxListenersExceededWarning: Possible EventEmitter memory leak detected warning in tests
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.ts',
  ],
  // The test environment that will be used for testing
  testEnvironment: 'node',
};
