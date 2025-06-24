// eslint.config.mjs
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import moduleResolver from 'eslint-plugin-module-resolver';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  {
    settings: {
      react: {
        version: 'detect',
      },
    }
  },
  {
    ignores: ['eslint.config.mjs', 'vite.config.ts', 'dist'],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier: eslintPluginPrettier,
      'module-resolver': moduleResolver,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'module-resolver/use-alias': [
        'error',
        {
          alias: {
            '~': './src',
          },
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./**', '../**'],
              message: 'Use absolute imports with "~" instead.',
            },
          ],
        },
      ],

      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
      eqeqeq: 'warn',
      'prefer-arrow-callback': 'warn',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
