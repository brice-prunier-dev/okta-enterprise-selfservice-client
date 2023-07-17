/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/test'],
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/intact-model',
    moduleNameMapper: {
        'joe-fx': ['<rootDir>/../joe-fx/src/index.ts'],
        'joe-types': ['<rootDir>/../joe-types/src/index.ts'],
        'joe-models': ['<rootDir>/../joe-models/src/index.ts']
    },

    verbose: true
}
