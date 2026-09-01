import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

/**
 * Constant variable for default rules.
 */
const defaultRules = {
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_'
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  'no-console': 'off',
  eqeqeq: ['error', 'always'],
  curly: ['error', 'all'],
};

/**
 * Constant variable for default ignores.
 */
const defaultIgnores = [
  'dist/**',
  'out/**',
  'node_modules/**',
  '**/*.d.ts'
];

/**
 * Creates a shared TypeScript ESLint flat config with optional overrides.
 * @param {object} [options] Options for creating the config.
 * @param {string[]} [options.files] Glob patterns for the files to include.
 * @param {Record<string, unknown>} [options.rules] Custom rules to override the default rules.
 * @param {string[]} [options.ignores] Glob patterns for the files to ignore.
 * @returns {import('eslint').Linter.Config[]} Returns an array of ESLint configuration objects.
 */
export function createTypeScriptConfig (options = {}) {
  const {
    files = ['**/*.ts'],
    rules = {},
    ignores: customIgnores = [],
  } = options;

  const ignores = [...defaultIgnores, ...customIgnores];

  return [
    {
      files,
      languageOptions: {
        parser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      plugins: {
        '@typescript-eslint': tseslint,
      },
      rules: {
        ...defaultRules,
        ...rules,
      },
    },
    {
      ignores,
    },
  ];
}

/** @type {import('eslint').Linter.Config[]} */
const baseConfig = createTypeScriptConfig();

export default baseConfig;
