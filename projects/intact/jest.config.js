/** @type {import('jest').Config} */
module.exports = {
    preset: "jest-preset-angular",
    setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/intact',
    moduleNameMapper: {
        'joe-fx': '<rootDir>/../joe-fx/src/index.ts',
        'joe-types': '<rootDir>/../joe-types/src/index.ts',
        'joe-models': '<rootDir>/../joe-models/src/index.ts',
        'joe-viewmodels': '<rootDir>/../joe-viewmodels/src/index.ts',
        'joe-store-api': '<rootDir>/../joe-store-api/src/index.ts',
        'intact-models': '<rootDir>/../intact-models/src/index.ts'
    },

    verbose: true,
}
