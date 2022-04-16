module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'eslint:recommended',
    'prettier',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  env: {
    es6: true
  },
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
  ],
  'rules': {
  },
};
