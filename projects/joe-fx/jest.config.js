
/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-preset-angular',
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/joe-fx',
    verbose: true
};
