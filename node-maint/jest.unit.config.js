module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./test'],
  collectCoverageFrom: ['./**/*.{ts,tsx}'],
  coverageDirectory: './coverage',
  testMatch: ['./**/*.test.(ts|tsx|js)', './**/*.spec.(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
