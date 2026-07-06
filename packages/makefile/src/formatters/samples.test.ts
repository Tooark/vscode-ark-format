import { describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Simula o módulo vscode para que a importação transitiva seja bem-sucedida.
vi.mock('vscode', () => ({}));

import { MakefileFormatter } from './makefileFormatter';
import { MakefileFormatterOptions } from './types';

const defaultOpts: MakefileFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: true,
  insertFinalNewline: true,
  lineEnding: 'LF',
  collapseSpaces: true,
  indentConditionals: true,
  normalizeRecipePrefix: true,
  alignAssignments: false,
  spacing: {
    spaceAroundAssignment: true,
    spaceAfterTargetColon: true,
    spaceAfterCommentMarker: true
  }
};

function readSample (name: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../samples', name), 'utf-8');
}

function format (input: string, opts?: Partial<MakefileFormatterOptions>): string {
  const formatter = new MakefileFormatter({ ...defaultOpts, ...opts });

  return formatter.formatText(input);
}

describe('samples - convergência das entradas desconfiguradas', () => {
  // example.mk (espaçamento ruim + recipes sem TAB) e Makefile (bom espaçamento,
  // mas recipes sem TAB) têm o mesmo conteúdo lógico: formatados, devem convergir
  // byte a byte (exceto o comentário de cabeçalho, que é diferente de propósito)
  it('example.mk e Makefile convergem para a mesma saída formatada', () => {
    const fromMessy = format(readSample('example.mk')).split('\n').slice(1);
    const fromPartial = format(readSample('Makefile')).split('\n').slice(1);

    expect(fromMessy).toEqual(fromPartial);
  });

  it('formatar samples/Makefile restaura o TAB de todas as recipes', () => {
    const lines = format(readSample('Makefile')).split('\n');

    expect(lines).toContain('\t$(CC) $(CFLAGS) -o $(BIN) $(SRCS)');
    expect(lines).toContain('\t./run-tests.sh --verbose');
    expect(lines).toContain('\t@echo "modo debug"');
    expect(lines).toContain('\trm -rf $(BIN) *.o');
  });

  it('formatar samples/GNUmakefile restaura o TAB das recipes e continuações', () => {
    const lines = format(readSample('GNUmakefile')).split('\n');

    expect(lines).toContain('\t@echo "Projeto: $(PROJECT) ($(UPPER))"');
    expect(lines).toContain('\t@mkdir -p build');
    expect(lines).toContain('\t$(CC) $(CFLAGS) \\');
    expect(lines).toContain('\t-c $< \\');
    expect(lines).toContain('\t-o $@');
    expect(lines).toContain('\trm -rf build');
  });
});

describe('samples - idempotência nos dois modos de alinhamento', () => {
  const samples = ['Makefile', 'GNUmakefile', 'example.mk', 'example.complex.mk'];

  for (const sample of samples) {
    for (const alignAssignments of [false, true]) {
      it(`${sample} é idempotente com alignAssignments=${alignAssignments}`, () => {
        const once = format(readSample(sample), { alignAssignments });

        expect(format(once, { alignAssignments })).toBe(once);
      });
    }
  }
});

describe('samples - invariantes estruturais das receitas', () => {
  it('receitas do example.complex.mk formatado começam com TAB (inclusive dentro de ifdef)', () => {
    const lines = format(readSample('example.complex.mk')).split('\n');

    // Comandos de recipe conhecidos do exemplo, incluindo o convertido de espaços
    // (./run-tests.sh) e o que fica dentro de ifdef no corpo da regra (@echo "modo debug ativo")
    const recipeCommands = [
      './run-tests.sh --verbose',
      '@echo "modo debug ativo"',
      '$(CC) $(CFLAGS) -c $< -o $@',
      '@echo "$(HELP_TEXT)"'
    ];

    for (const command of recipeCommands) {
      expect(lines).toContain(`\t${command}`);
    }
  });

  it('continuações de recipe do GNUmakefile formatado começam com TAB', () => {
    const lines = format(readSample('GNUmakefile')).split('\n');

    // Continuações da recipe do alvo build/%.o
    expect(lines.some(line => line.startsWith('\t') && line.trimStart().startsWith('-c '))).toBe(true);
    expect(lines.some(line => line.startsWith('\t') && line.trimStart().startsWith('-o '))).toBe(true);
  });

  it('nenhuma atribuição de variável começa com TAB nos samples formatados', () => {
    for (const sample of ['Makefile', 'GNUmakefile', 'example.mk', 'example.complex.mk']) {
      const lines = format(readSample(sample)).split('\n');

      for (const line of lines) {
        // Uma atribuição de variável do make no início de linha nunca deve estar após TAB
        expect(/^\t[A-Za-z_.][A-Za-z0-9_.]*\s*(:{1,3}=|\?=|\+=|!=)/.test(line)).toBe(false);
      }
    }
  });
});
