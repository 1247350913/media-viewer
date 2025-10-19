// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Monorepo-friendly ESLint flat config
export default tseslint.config([
  {
    ignores: ['**/dist/**', '**/.turbo/**', '**/release/**', '**/node_modules/**'],
  },
  // Base JS/TS rules
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        // Let ESLint auto-detect nearest tsconfig.* in each workspace
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React hooks best practices
      ...reactHooks.configs['recommended-latest'].rules,
      // Fast refresh safe components during dev
      ...reactRefresh.configs.vite.rules,
      // Prefs
      'no-console': 'warn',
    },
  },
  // Keep helper functions in packages honest
  {
    files: ["packages/ui/**", "packages/utils/src/isomorphic/**"],
    rules: {
    "no-restricted-imports": ["error", { "paths": [{ "name": "fs" }, { "name": "path" }, { "name": "electron" }] }]
    }
  }
]);
