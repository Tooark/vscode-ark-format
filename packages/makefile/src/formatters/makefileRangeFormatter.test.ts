import { describe, expect, it, vi } from 'vitest';

// Não pode importar o vscode nos testes, então utiliza formatSelectedText por meio de um wrapper simples
// que não depende das APIs do vscode.
// MakefileRangeFormatter.formatSelectedText é público e usa apenas operações de string.
// É simulado o módulo vscode para que a importação seja bem-sucedida.
vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: any, public end: any) { }
  },
  TextEdit: {
    replace: (range: any, newText: string) => ({ range, newText }),
  },
  Position: class {
    constructor (public line: number, public character: number) { }
  },
}));

import { MakefileRangeFormatter } from './makefileRangeFormatter';
import { MakefileRangeFormatterOptions } from './types';

const defaultOpts: MakefileRangeFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: false,
  insertFinalNewline: false,
  lineEnding: 'Auto',
  collapseSpaces: true,
  indentConditionals: true,
  normalizeRecipePrefix: true,
  alignAssignments: false,
  spacing: {
    spaceAroundAssignment: true,
    spaceAfterTargetColon: true,
    spaceAfterCommentMarker: true
  },
  reindent: false,
  baseIndent: 0
};

function formatRange (input: string, opts?: Partial<MakefileRangeFormatterOptions>): string {
  const formatter = new MakefileRangeFormatter({ ...defaultOpts, ...opts });

  return formatter.formatSelectedText(input);
}

describe('MakefileRangeFormatter - sem reindentação', () => {
  it('aplica espaçamento preservando a indentação original', () => {
    const input = '  VAR:=valor\nall :build';

    expect(formatRange(input)).toBe('  VAR := valor\nall: build');
  });

  it('preserva recipes (linhas com TAB)', () => {
    const input = 'all:\n\techo   "com   espaços"';

    expect(formatRange(input)).toBe('all:\n\techo   "com   espaços"');
  });

  it('preserva conteúdo de blocos define na seleção', () => {
    const input = 'define X\nfoo   :=bar\nendef';

    expect(formatRange(input)).toBe('define X\nfoo   :=bar\nendef');
  });

  it('preserva linhas de continuação', () => {
    const input = 'SRCS = a.c \\\n       b.c';

    expect(formatRange(input)).toBe('SRCS = a.c \\\n       b.c');
  });

  it('reduz linhas em branco consecutivas', () => {
    const input = 'A := 1\n\n\n\nB := 2';

    expect(formatRange(input)).toBe('A := 1\n\nB := 2');
  });

  it('não altera a profundidade de condicionais', () => {
    const input = 'ifdef DEBUG\nCFLAGS += -g\nendif';

    expect(formatRange(input)).toBe('ifdef DEBUG\nCFLAGS += -g\nendif');
  });

  it('preserva a seleção quando .RECIPEPREFIX é redefinido', () => {
    const input = '.RECIPEPREFIX = >\n> echo   ok';

    expect(formatRange(input)).toBe(input);
  });
});

describe('MakefileRangeFormatter - com reindentação', () => {
  it('reindenta o corpo de condicionais', () => {
    const input = 'ifdef DEBUG\nCFLAGS += -g\nendif';

    expect(formatRange(input, { reindent: true })).toBe('ifdef DEBUG\n  CFLAGS += -g\nendif');
  });

  it('usa baseIndent calculado do contexto do documento', () => {
    const input = 'CFLAGS += -g\nLDFLAGS += -v';

    expect(formatRange(input, { reindent: true, baseIndent: 1 })).toBe('  CFLAGS += -g\n  LDFLAGS += -v');
  });

  it('fecha condicional considerando o baseIndent', () => {
    const input = 'CFLAGS += -g\nendif';

    expect(formatRange(input, { reindent: true, baseIndent: 1 })).toBe('  CFLAGS += -g\nendif');
  });

  it('preserva recipes ao reindentar', () => {
    const input = 'all:\n\techo   ok';

    expect(formatRange(input, { reindent: true })).toBe('all:\n\techo   ok');
  });
});

describe('MakefileRangeFormatter - alinhamento de atribuições (alignAssignments)', () => {
  it('alinha blocos de atribuição na seleção sem reindentação', () => {
    const input = 'A := 1\nLONG_NAME := 2';

    expect(formatRange(input, { alignAssignments: true })).toBe('A         := 1\nLONG_NAME := 2');
  });

  it('alinha apenas linhas com a mesma indentação preservada', () => {
    const input = '  A := 1\nLONG_NAME := 2';

    expect(formatRange(input, { alignAssignments: true })).toBe('  A := 1\nLONG_NAME := 2');
  });

  it('alinha ao reindentar a seleção', () => {
    const input = 'A := 1\nLONG_NAME := 2';

    expect(formatRange(input, { reindent: true, alignAssignments: true })).toBe('A         := 1\nLONG_NAME := 2');
  });

  it('desligado (padrão) mantém 1 espaço', () => {
    const input = 'A         := 1\nLONG_NAME := 2';

    expect(formatRange(input)).toBe('A := 1\nLONG_NAME := 2');
  });
});

describe('MakefileRangeFormatter - formatRange', () => {
  it('retorna vazio quando não há mudanças', () => {
    const formatter = new MakefileRangeFormatter(defaultOpts);
    const text = 'VAR := 1';
    const document = {
      getText: () => text
    } as any;
    const range = {} as any;

    expect(formatter.formatRange(document, range)).toHaveLength(0);
  });

  it('retorna edição única quando há mudanças', () => {
    const formatter = new MakefileRangeFormatter(defaultOpts);
    const text = 'VAR:=1';
    const document = {
      getText: () => text
    } as any;
    const range = {} as any;

    const edits = formatter.formatRange(document, range);

    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe('VAR := 1');
  });
});
