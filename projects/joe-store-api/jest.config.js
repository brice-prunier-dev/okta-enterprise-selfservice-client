/** @type {import('jest').Config} */
module.exports = {
    transform: {
        '\\.(ts)$': 'ts-jest'
    },
    preset: 'jest-preset-angular',
    roots: ['<rootDir>/test/'],
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/joe-store-api',
    verbose: true,
    passWithNoTests: true,
};
