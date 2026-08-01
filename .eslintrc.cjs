module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import'],
  rules: {
    // No unused variables
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // No var - use const/let
    'no-var': 'error',

    // Prefer const over let when possible
    'prefer-const': 'error',

    // No magic numbers (except common ones)
    'no-magic-numbers': [
      'warn',
      {
        ignore: [
          -1, 0, 1, 2, 5, 10, 15, 20, 100, 200, 250, 500, 1000, 2000, 5000,
          10000,
        ],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
      },
    ],

    // Consistent return statements
    'consistent-return': 'error',

    // Use strict equality (industry standard)
    eqeqeq: ['error', 'always'],

    // Import ordering
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // No console in production
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // No nested ternary
    'no-nested-ternary': 'error',

    // Max function length
    'max-lines-per-function': [
      'warn',
      { max: 80, skipBlankLines: true, skipComments: true },
    ],

    // Prefer template literals
    'prefer-template': 'warn',

    // No parameter reassignment
    'no-param-reassign': ['error', { props: false }],
  },
};
