export default {
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/__tests__/helpers/'],
  collectCoverageFrom: ['server/**/*.js', '!server/plugin.js'],
}
