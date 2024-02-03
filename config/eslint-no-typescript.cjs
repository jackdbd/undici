const prettier_config = require('./prettier.cjs')

const config = {
  extends: [
    // https://eslint.org/docs/rules/
    'eslint:recommended',
    // plugin:prettier/recommended must be the last extension
    // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
    'plugin:prettier/recommended'
  ],
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', prettier_config]
  }
}

// console.log('=== ESLint no-typescript config ===', config)

module.exports = config
