module.exports = {
    preset: 'jest-preset-angular',
    testMatch: ['<rootDir>/test/*.test.ts'],
    collectCoverage: true,
    coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
    coverageDirectory: '../../coverage/joe-viewmodels',
    moduleNameMapper: {
        'joe-fx': '<rootDir>/../joe-fx/src/index.ts',
        'joe-types': '<rootDir>/../joe-types/src/index.ts',
        'joe-models': '<rootDir>/../joe-models/src/index.ts',
    },
    roots: ['<rootDir>/test/'],
    verbose: true,
};
