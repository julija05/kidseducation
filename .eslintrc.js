module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-hooks',
    ],
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'double'],
        'semi': ['error', 'always'],
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: [
        'node_modules/',
        'vendor/',
        'public/build/',
        'bootstrap/cache/',
    ],
};