module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  // The first run may need to download MongoDB for mongodb-memory-server.
  testTimeout: 600000
};
