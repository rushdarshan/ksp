module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // This JavaScript codebase validates external data at API boundaries instead
    // of maintaining duplicate runtime PropTypes for every presentation helper.
    'react/prop-types': 'off',
    // Route modules intentionally co-locate loaders, hooks, and components.
    'react-refresh/only-export-components': 'off',
  },
}
