import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export function createTypeScriptConfig (files = ['src/**/*.ts']) {
  return [
    {
      files,
      languageOptions: {
        parser,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module'
        }
      },
      plugins: {
        '@typescript-eslint': tseslint
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
      }
    }
  ];
}