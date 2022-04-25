module.exports = {
  env: {
    commonjs: true,
    browser: true,
    node: true,
    es2022: true,
    jest: true
  },
  'extends': [
    'eslint:recommended',
    'prettier',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    'jest'
  ]
};