/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/test/'],
  testMatch: ['<rootDir>/test/*.test.ts'],
  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
  collectCoverage: true,
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
  coverageDirectory: '../../coverage/joe-models',
  verbose: true,
  passWithNoTests: true,
}
