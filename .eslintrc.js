module.exports = {
  env: {
    commonjs: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    camelcase: 'off',
    'no-unused-vars': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
