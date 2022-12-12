module.exports = {
  rootDir: __dirname,
  verbose: true,
  roots: [
    '<rootDir>/src/',
  ],
  moduleNameMapper: {
    'src/(.*)': [
      '<rootDir>/src/$1',
    ],
  },
};
