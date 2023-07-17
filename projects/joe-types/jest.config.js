/** @type {import('jest').Config} */
module.exports = {
    transform: {
        '\\.(ts)$': 'ts-jest'
    },
    roots: ['<rootDir>/test'],
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/joe-types',
    moduleNameMapper: {
        'joe-fx': ['<rootDir>/../joe-fx/src/index.ts'],
        'joe-types': ['<rootDir>/src/index.ts']
    },

    verbose: true
};
