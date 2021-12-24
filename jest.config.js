const config = {
  preset: 'jest-preset-angular',
  roots: [
    '<rootDir>/src'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test-config/setup-jest.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|@ionic-native|@ionic)'
  ],
  moduleNameMapper: {
    '@components/(.*)': '<rootDir>/src/app/components/$1',
    '@pipes/(.*)': '<rootDir>/src/app/pipes/$1',
    '@services/(.*)': '<rootDir>/src/app/services/$1',
    '@shared/(.*)': '<rootDir>/src/app/shared/$1',
    '@test/(.*)': '<rootDir>/test-config/$1'
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test-config/',
    '/shared/',
    '.html',
    'public.ts'
  ]
};

module.exports = config;
