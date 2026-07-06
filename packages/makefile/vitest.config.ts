import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@tooark\/ark-format-shared$/,
        replacement: path.resolve(__dirname, '../shared/src/index.ts')
      },
      {
        find: /^@tooark\/ark-format-shared\/(.+)$/,
        replacement: path.resolve(__dirname, '../shared/src/$1.ts')
      }
    ]
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
