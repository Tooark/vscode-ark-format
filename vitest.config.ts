import { defineConfig } from 'vitest/config';

// Configuração raiz do Vitest para rodar todos os pacotes do monorepo de uma vez
// (modo "projects"): cada pacote mantém sua própria vitest.config.ts (aliases,
// setupFiles etc.), mas a cobertura é consolidada em um único relatório na raiz.
// Uso: pnpm test:coverage
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts'],
    coverage: {
      include: ['packages/*/src/**/*.ts'],
      // Exclui arquivos sem lógica executável própria: barrels de re-export (index/utils),
      // declarações de tipos e os editorConfigReader que só re-exportam do shared
      // (o do makefile permanece: tem constantes próprias e teste dedicado).
      exclude: [
        '**/*.test.ts',
        'packages/shared/src/index.ts',
        'packages/shared/src/types.ts',
        'packages/*/src/formatters/types.ts',
        'packages/*/src/formatters/utils.ts',
        'packages/shell/src/formatters/editorConfigReader.ts',
        'packages/powershell/src/formatters/editorConfigReader.ts'
      ],
      reportsDirectory: './coverage'
    }
  }
});
