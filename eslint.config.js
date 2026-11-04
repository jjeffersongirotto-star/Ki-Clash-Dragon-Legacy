// v0.28.1 — ferramenta que confere o código (ESLint + typescript-eslint). Rodar: npm run lint
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'android/**', 'node_modules/**', 'public/**', 'scripts/android/**', 'desktop/node_modules/**', 'desktop/app/**', 'desktop/release/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // o projeto usa `_` para parâmetros ignorados
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      // casts de teste e de dados antigos do save
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-constant-condition': ['error', { checkLoops: false }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // v0.61.0: app de computador (Electron, CommonJS do Node)
  { files: ['desktop/**/*.cjs'], languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
