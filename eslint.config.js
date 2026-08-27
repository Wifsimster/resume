import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'dist-types', 'node_modules', 'playwright-report', 'test-results'] },
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs', 'tests/**/*.ts', 'vite.config.ts', 'playwright.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      // Only the two classic hooks rules: the React-compiler preview rules
      // (refs/purity/immutability) reject the R3F pattern of mutating three.js
      // objects through refs, which this codebase uses deliberately
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // The 3D scene code intentionally reaches into three.js internals and
      // browser APIs that aren't fully typed — keep `any` a warning, not a wall
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
)
