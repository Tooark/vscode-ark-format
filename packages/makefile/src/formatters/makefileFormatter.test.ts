import { describe, expect, it, vi } from 'vitest';

// Não pode importar o vscode nos testes, então utiliza formatText por meio de um wrapper simples
// que não depende das APIs do vscode.
// MakefileFormatter.formatText é público e usa apenas operações de string.
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

function format (input: string, opts?: Partial<MakefileFormatterOptions>): string {
  const formatter = new MakefileFormatter({ ...defaultOpts, ...opts });

  return formatter.formatText(input);
}

describe('MakefileFormatter - recipes', () => {
  it('preserva o prefixo TAB e o corpo das recipes', () => {
    const input = 'all:\n\techo "hello   world"\n\t@echo ok\n';

    expect(format(input)).toBe('all:\n\techo "hello   world"\n\t@echo ok\n');
  });

  it('normaliza TABs múltiplos no início de recipes para exatamente 1 TAB', () => {
    const input = 'all:\n\t\t\techo indentado\n';

    expect(format(input)).toBe('all:\n\techo indentado\n');
  });

  it('normaliza mistura de espaços e TABs no início de recipes para 1 TAB', () => {
    expect(format('all:\n\t  echo x\n')).toBe('all:\n\techo x\n');
    expect(format('all:\n  \techo x\n')).toBe('all:\n\techo x\n');
    expect(format('all:\n \t \techo x\n')).toBe('all:\n\techo x\n');
  });

  it('converte recipes indentadas com espaços para TAB', () => {
    expect(format('all:\n    echo hello\n')).toBe('all:\n\techo hello\n');
    expect(format('all:\n        echo hello\n')).toBe('all:\n\techo hello\n');
  });

  it('recipe já correta com 1 TAB permanece idêntica', () => {
    const input = 'all:\n\techo ok\n';

    expect(format(input)).toBe(input);
    expect(format(format(input))).toBe(input);
  });

  it('preserva TABs múltiplos quando normalizeRecipePrefix está desabilitado', () => {
    const input = 'all:\n\t\techo indentado\n';

    expect(format(input, { normalizeRecipePrefix: false })).toBe(input);
  });

  it('não converte espaços quando a linha é sintaxe de Makefile', () => {
    const input = 'all:\n\techo ok\n  VAR := 1\n';

    expect(format(input)).toBe('all:\n\techo ok\nVAR := 1\n');
  });

  it('não converte quando normalizeRecipePrefix está desabilitado', () => {
    const input = 'all:\n    echo hello\n';

    expect(format(input, { normalizeRecipePrefix: false })).toBe('all:\n    echo hello\n');
  });

  it('mantém contexto de recipe após linhas em branco', () => {
    const input = 'all:\n\techo a\n\n\techo b\n';

    expect(format(input)).toBe('all:\n\techo a\n\n\techo b\n');
  });

  it('mantém contexto de recipe após comentários', () => {
    const input = 'all:\n\techo a\n# comentário\n\techo b\n';

    expect(format(input)).toBe('all:\n\techo a\n# comentário\n\techo b\n');
  });

  it('encerra contexto de recipe após atribuição', () => {
    const input = 'all:\n\techo a\nVAR := 1\n\tindentado que nao e recipe\n';

    expect(format(input)).toBe('all:\n\techo a\nVAR := 1\n\tindentado que nao e recipe\n');
  });
});

describe('MakefileFormatter - condicionais', () => {
  it('indenta o corpo de blocos condicionais', () => {
    const input = 'ifeq ($(OS),Windows_NT)\nBIN := app.exe\nelse\nBIN := app\nendif\n';
    const expected = 'ifeq ($(OS),Windows_NT)\n  BIN := app.exe\nelse\n  BIN := app\nendif\n';

    expect(format(input)).toBe(expected);
  });

  it('indenta condicionais aninhados', () => {
    const input = 'ifeq ($(A),1)\nifeq ($(B),2)\nVAR := x\nendif\nendif\n';
    const expected = 'ifeq ($(A),1)\n  ifeq ($(B),2)\n    VAR := x\n  endif\nendif\n';

    expect(format(input)).toBe(expected);
  });

  it('preserva recipes dentro de condicionais em contexto de recipe', () => {
    const input = 'all:\nifeq ($(OS),Windows_NT)\n\tcopy a b\nelse\n\tcp a b\nendif\n';

    expect(format(input)).toBe(input);
  });

  it('respeita indentSize configurado', () => {
    const input = 'ifdef DEBUG\nCFLAGS += -g\nendif\n';

    expect(format(input, { indentSize: 4 })).toBe('ifdef DEBUG\n    CFLAGS += -g\nendif\n');
  });

  it('preserva a indentação original quando indentConditionals está desabilitado', () => {
    const input = 'ifdef DEBUG\n    CFLAGS += -g\nendif\n';

    expect(format(input, { indentConditionals: false })).toBe('ifdef DEBUG\n    CFLAGS += -g\nendif\n');
  });

  it('normaliza espaço entre palavra-chave condicional e parêntese', () => {
    const input = 'ifeq($(OS),Windows_NT)\nVAR := 1\nendif\n';

    expect(format(input)).toBe('ifeq ($(OS),Windows_NT)\n  VAR := 1\nendif\n');
  });
});

describe('MakefileFormatter - define', () => {
  it('preserva o conteúdo de blocos define sem alterações', () => {
    const input = 'define TEMPLATE\n  linha   com   espaços\n\techo $(1)\nendef\n';

    expect(format(input)).toBe(input);
  });

  it('preserva linhas em branco dentro de define', () => {
    const input = 'define TEMPLATE\nlinha1\n\n\n\nlinha2\nendef\n';

    expect(format(input)).toBe(input);
  });
});

describe('MakefileFormatter - continuações de linha', () => {
  it('preserva continuações de atribuição já alinhadas', () => {
    const input = 'SRCS = a.c \\\n       b.c \\\n       c.c\n';

    expect(format(input)).toBe(input);
  });

  it('remove espaços após a barra de continuação', () => {
    const input = 'SRCS = a.c \\   \n       b.c\n';

    expect(format(input)).toBe('SRCS = a.c \\\n       b.c\n');
  });

  it('alinha continuações de atribuição com o início do valor', () => {
    const input = 'SRCS = main.c \\\n  util.c \\\nio.c\n';
    const expected = 'SRCS = main.c \\\n       util.c \\\n       io.c\n';

    expect(format(input)).toBe(expected);
  });

  it('alinha pelo resultado formatado da primeira linha', () => {
    const input = 'SRCS=main.c \\\n           util.c\n';

    expect(format(input)).toBe('SRCS = main.c \\\n       util.c\n');
  });

  it('alinha considerando a indentação de condicionais', () => {
    const input = 'ifdef X\nSRCS = a.c \\\nb.c\nendif\n';
    const expected = 'ifdef X\n  SRCS = a.c \\\n         b.c\nendif\n';

    expect(format(input)).toBe(expected);
  });

  it('alinha continuações de atribuições com prefixo export', () => {
    const input = 'export FLAGS := -a \\\n-b\n';

    expect(format(input)).toBe('export FLAGS := -a \\\n                -b\n');
  });

  it('não alinha continuações de recipes', () => {
    const input = 'all:\n\tgcc -c a.c \\\n\t\t-o a.o\n';

    expect(format(input)).toBe(input);
  });

  it('não alinha continuações de alvos', () => {
    const input = 'all: dep1 \\\n     dep2\n\techo ok\n';

    expect(format(input)).toBe(input);
  });

  it('não alinha quando a atribuição tem comentário inline', () => {
    const input = 'VAR = a # comentario \\\nresto do comentario\n';

    expect(format(input)).toBe(input);
  });

  it('alinhamento de continuações é idempotente', () => {
    const input = 'CFLAGS += -Wall \\\n    -O2 \\\n          -g\n';
    const once = format(input);

    expect(format(once)).toBe(once);
    expect(once).toBe('CFLAGS += -Wall \\\n          -O2 \\\n          -g\n');
  });
});

describe('MakefileFormatter - alinhamento de atribuições (alignAssignments)', () => {
  it('desligado (padrão): normaliza alinhamento existente para 1 espaço', () => {
    const input = 'SHELL         := /bin/bash\n.DEFAULT_GOAL := all\n';

    expect(format(input)).toBe('SHELL := /bin/bash\n.DEFAULT_GOAL := all\n');
  });

  it('ligado: alinha operadores pelo caractere = final, por bloco', () => {
    const input = [
      'SHELL := /bin/bash',
      '.DEFAULT_GOAL := all',
      '',
      'NAME = app',
      'VERSION ?= 1.0.0',
      'CFLAGS += -Wall -O2',
      'BUILD_DATE != date +%F',
      'CACHE_DIR ::= .cache',
      'export PREFIX_TEST := /usr/local',
      ''
    ].join('\n');

    // A linha mais larga é 'export PREFIX_TEST :=' (18 + 1 + 2 = 21): fica com exatamente
    // um espaço antes do operador e define a coluna do `=` final para o bloco.
    const expected = [
      'SHELL         := /bin/bash',
      '.DEFAULT_GOAL := all',
      '',
      'NAME                = app',
      'VERSION            ?= 1.0.0',
      'CFLAGS             += -Wall -O2',
      'BUILD_DATE         != date +%F',
      'CACHE_DIR         ::= .cache',
      'export PREFIX_TEST := /usr/local',
      ''
    ].join('\n');

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('bloco misturando ::= com := onde o nome mais longo não usa ::= (off-by-one)', () => {
    const input = 'CACHE_DIR ::= .cache\nexport PREFIX := /usr/local\n';
    // Linha mais larga: 'export PREFIX :=' (13 + 1 + 2 = 16) fica com 1 espaço antes do :=;
    // 'CACHE_DIR ::=' alinha o `=` final na mesma coluna com 4 espaços de preenchimento.
    const expected = 'CACHE_DIR    ::= .cache\nexport PREFIX := /usr/local\n';

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('blocos separados por linha em branco alinham em colunas próprias', () => {
    const input = 'A := 1\nLONG_NAME := 2\n\nB := 3\nC := 4\n';
    const expected = 'A         := 1\nLONG_NAME := 2\n\nB := 3\nC := 4\n';

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('comentário encerra o bloco de alinhamento', () => {
    const input = 'A := 1\n# separador\nLONG_NAME := 2\n';

    expect(format(input, { alignAssignments: true })).toBe(input);
  });

  it('nunca converte um operador em outro', () => {
    const input = 'NAME = app\nVERSION ?= 1.0.0\n';
    const output = format(input, { alignAssignments: true });

    expect(output).toContain(' = app');
    expect(output).toContain('?= 1.0.0');
    expect(output).not.toContain(':= app');
  });

  it('não interfere em define, target-specific e recipes', () => {
    const input = [
      'define X',
      'foo   :=   bar',
      'endef',
      '',
      'debug: CFLAGS += -g',
      'debug: build',
      '\techo ok',
      ''
    ].join('\n');

    expect(format(input, { alignAssignments: true })).toBe(input);
  });

  it('nome acima do limite fica fora do alinhamento sem empurrar o bloco', () => {
    const hugeName = 'X'.repeat(45);
    const input = `A := 1\nBB := 2\n${hugeName} := 3\n`;
    const expected = `A  := 1\nBB := 2\n${hugeName} := 3\n`;

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('atribuições em níveis diferentes de indentação não alinham entre si', () => {
    const input = 'ifdef X\nAA := 1\nendif\nLONG_NAME := 2\n';
    const expected = 'ifdef X\n  AA := 1\nendif\nLONG_NAME := 2\n';

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('atribuições no mesmo nível de condicional alinham entre si', () => {
    const input = 'ifdef X\nAA := 1\nLONG_NAME := 2\nendif\n';
    const expected = 'ifdef X\n  AA        := 1\n  LONG_NAME := 2\nendif\n';

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('realinha continuações de atribuição com a nova coluna do valor', () => {
    const input = 'SRCS = main.c \\\n       util.c\nNAME_LONGER := x\n';
    // eqWidth = len('NAME_LONGER') + 1 + len(':=') = 14; valor começa na coluna 15
    const expected = `SRCS${' '.repeat(9)}= main.c \\\n${' '.repeat(15)}util.c\nNAME_LONGER := x\n`;

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('nunca usa TAB no preenchimento do alinhamento', () => {
    const input = 'A := 1\nLONG_NAME := 2\nCACHE_DIR ::= 3\n';
    const output = format(input, { alignAssignments: true });

    for (const line of output.split('\n')) {
      expect(line.startsWith('\t')).toBe(false);
      expect(line.includes('\t')).toBe(false);
    }
  });

  it('é idempotente com a opção ligada', () => {
    const input = 'NAME = app\nVERSION ?= 1.0.0\nCACHE_DIR ::= .cache\n\nall: build\n\techo ok\n';
    const once = format(input, { alignAssignments: true });

    expect(format(once, { alignAssignments: true })).toBe(once);
  });

  it('desligado remove o alinhamento produzido anteriormente (normaliza, não ignora)', () => {
    const aligned = format('NAME = app\nVERSION ?= 1.0.0\nCACHE_DIR ::= .cache\n', { alignAssignments: true });
    const normalized = format(aligned, { alignAssignments: false });

    expect(normalized).toBe('NAME = app\nVERSION ?= 1.0.0\nCACHE_DIR ::= .cache\n');
  });
});

describe('MakefileFormatter - receitas dentro de condicionais em corpo de regra', () => {
  it('comando em coluna 0 dentro de ifdef no corpo da regra recebe TAB', () => {
    const input = 'test: build\n\t./run-tests.sh --verbose\nifdef DEBUG\n@echo "modo debug ativo"\nendif\n';
    const expected = 'test: build\n\t./run-tests.sh --verbose\nifdef DEBUG\n\t@echo "modo debug ativo"\nendif\n';

    expect(format(input)).toBe(expected);
  });

  it('comando indentado com espaços dentro de ifdef no corpo da regra recebe TAB', () => {
    const input = 'test: build\n\t./run.sh\nifdef DEBUG\n  @echo "dbg"\nendif\n';

    expect(format(input)).toBe('test: build\n\t./run.sh\nifdef DEBUG\n\t@echo "dbg"\nendif\n');
  });

  it('fora de corpo de regra, conteúdo de condicional segue com 2 espaços por nível', () => {
    const input = 'ifdef DEBUG\nCFLAGS += -g\nendif\n';

    expect(format(input)).toBe('ifdef DEBUG\n  CFLAGS += -g\nendif\n');
  });

  it('comando com : entre aspas em contexto de recipe recebe TAB (não vira alvo)', () => {
    const input = 'info:\n@echo "Projeto: $(PROJECT)"\n@echo "Fontes: $(SOURCES)"\n';
    const expected = 'info:\n\t@echo "Projeto: $(PROJECT)"\n\t@echo "Fontes: $(SOURCES)"\n';

    expect(format(input)).toBe(expected);
  });

  it('alvo real em coluna 0 após recipes encerra o contexto de recipe', () => {
    const input = 'all:\n\techo a\nclean: extra\n\trm -rf build\n';

    expect(format(input)).toBe(input);
  });

  it('receita após else dentro do corpo da regra também recebe TAB', () => {
    const input = 'all:\n\techo a\nifeq ($(OS),Windows_NT)\ncopy a b\nelse\ncp a b\nendif\n';
    const expected = 'all:\n\techo a\nifeq ($(OS),Windows_NT)\n\tcopy a b\nelse\n\tcp a b\nendif\n';

    expect(format(input)).toBe(expected);
  });
});

describe('MakefileFormatter - continuações dentro de receitas', () => {
  it('continuações de recipe em coluna 0 recebem TAB', () => {
    const input = 'build/%.o: src/%.c\n\t@mkdir -p build\n\t$(CC) $(CFLAGS) \\\n-c $< \\\n-o $@\n';
    const expected = 'build/%.o: src/%.c\n\t@mkdir -p build\n\t$(CC) $(CFLAGS) \\\n\t-c $< \\\n\t-o $@\n';

    expect(format(input)).toBe(expected);
  });

  it('continuações de recipe indentadas com espaços recebem TAB', () => {
    const input = 'all:\n\tgcc a.c \\\n    -o app\n';

    expect(format(input)).toBe('all:\n\tgcc a.c \\\n\t-o app\n');
  });

  it('continuações de recipe que já têm TAB são preservadas', () => {
    const input = 'all:\n\tgcc -c a.c \\\n\t\t-o a.o\n';

    expect(format(input)).toBe(input);
  });

  it('continuação de recipe convertida de espaços também recebe TAB', () => {
    const input = 'all:\n    gcc a.c \\\n-o app\n';

    expect(format(input)).toBe('all:\n\tgcc a.c \\\n\t-o app\n');
  });

  it('conversão de continuações de recipe é idempotente', () => {
    const input = 'build/%.o: src/%.c\n\t$(CC) $(CFLAGS) \\\n-c $< \\\n-o $@\n';
    const once = format(input);

    expect(format(once)).toBe(once);
  });

  it('preserva a indentação interna de blocos shell multilinha em continuações', () => {
    const input = 'deploy:\n\tif [ -f config ]; then \\\n\t\tcp config build/; \\\n\tfi\n';

    expect(format(input)).toBe(input);
  });

  it('continuação com espaços antes de TAB preserva a indentação interna', () => {
    const input = 'deploy:\n\tif [ -f config ]; then \\\n  \t\tcp config build/; \\\n\tfi\n';
    const expected = 'deploy:\n\tif [ -f config ]; then \\\n\t\tcp config build/; \\\n\tfi\n';

    expect(format(input)).toBe(expected);
  });

  it('primeira linha do comando com TABs extras normaliza, continuação preserva extras', () => {
    const input = 'all:\n\t\t\tif true; then \\\n\t\techo ok; \\\n\tfi\n';
    const expected = 'all:\n\tif true; then \\\n\t\techo ok; \\\n\tfi\n';

    expect(format(input)).toBe(expected);
  });
});

describe('MakefileFormatter - convergência (determinismo)', () => {
  it('versão bagunçada e versão parcialmente formatada convergem byte a byte', () => {
    // Mesmo conteúdo lógico: uma versão sem formatação nenhuma...
    const messy = [
      'SHELL:=/bin/bash',
      'ifeq($(OS),Windows_NT)',
      'BIN:=app.exe',
      'endif',
      'SRCS = a.c \\',
      'b.c',
      'all :$(BIN)',
      '\techo done',
      ''
    ].join('\n');

    // ...e uma versão parcialmente formatada (operadores espaçados, mas sem indentação
    // de condicional e sem alinhamento de continuação)
    const partial = [
      'SHELL := /bin/bash',
      'ifeq ($(OS),Windows_NT)',
      'BIN := app.exe',
      'endif',
      'SRCS = a.c \\',
      '       b.c',
      'all: $(BIN)',
      '\techo done',
      ''
    ].join('\n');

    expect(format(messy)).toBe(format(partial));
    expect(format(messy, { alignAssignments: true })).toBe(format(partial, { alignAssignments: true }));
  });

  it('mesma entrada e mesma configuração produzem sempre a mesma saída', () => {
    const input = 'A:=1\nifdef X\nB:=2\nendif\nall:\n\techo ok\n';
    const first = format(input);

    for (let i = 0; i < 3; i++) {
      expect(format(input)).toBe(first);
    }
  });
});

describe('MakefileFormatter - diretivas e variáveis target-specific', () => {
  it('diretivas condicionais nunca recebem TAB, mesmo em corpo de regra', () => {
    const input = 'test: build\n\t./run.sh\nifdef DEBUG\n\t@echo debug\nendif\n';

    expect(format(input)).toBe(input);
  });

  it('trata variável target-specific como linha de regra', () => {
    const input = 'debug: CFLAGS += -g -DDEBUG\ndebug: build\n\techo dbg\n';

    expect(format(input)).toBe(input);
  });

  it('normaliza doc comments com dois marcadores', () => {
    const input = '##doc do alvo\nall:\n\techo ok\n';

    expect(format(input)).toBe('## doc do alvo\nall:\n\techo ok\n');
  });

  it('não toca comentários dentro de recipes', () => {
    const input = 'all:\n\t#comentario de shell\n\techo ok\n';

    expect(format(input)).toBe(input);
  });

  it('não toca comentários dentro de define', () => {
    const input = 'define X\n#sem espaco preservado\nendef\n';

    expect(format(input)).toBe(input);
  });
});

describe('MakefileFormatter - espaçamento e limpeza', () => {
  it('normaliza atribuições e alvos', () => {
    const input = 'VAR:=valor\nall :build\n\techo ok\n';

    expect(format(input)).toBe('VAR := valor\nall: build\n\techo ok\n');
  });

  it('normaliza comentários', () => {
    const input = '#comentário\nVAR := 1\n';

    expect(format(input)).toBe('# comentário\nVAR := 1\n');
  });

  it('reduz linhas em branco consecutivas', () => {
    const input = 'A := 1\n\n\n\nB := 2\n';

    expect(format(input)).toBe('A := 1\n\nB := 2\n');
  });

  it('remove linhas em branco iniciais', () => {
    const input = '\n\nA := 1\n';

    expect(format(input)).toBe('A := 1\n');
  });

  it('garante nova linha final', () => {
    expect(format('A := 1')).toBe('A := 1\n');
  });

  it('remove espaços finais', () => {
    const input = 'A := 1   \nall:   \n\techo ok  \n';

    expect(format(input)).toBe('A := 1\nall:\n\techo ok\n');
  });

  it('preserva espaços finais quando desabilitado', () => {
    const input = 'all:\n\techo ok  \n';

    expect(format(input, { trimTrailingWhitespace: false })).toBe('all:\n\techo ok  \n');
  });
});

describe('MakefileFormatter - finais de linha', () => {
  it('normaliza CRLF para LF', () => {
    const input = 'A := 1\r\nall:\r\n\techo ok\r\n';

    expect(format(input)).toBe('A := 1\nall:\n\techo ok\n');
  });

  it('aplica CRLF quando configurado', () => {
    const input = 'A := 1\nall:\n\techo ok\n';

    expect(format(input, { lineEnding: 'CRLF' })).toBe('A := 1\r\nall:\r\n\techo ok\r\n');
  });

  it('preserva CRLF no modo Auto', () => {
    const input = 'A := 1\r\n';

    expect(format(input, { lineEnding: 'Auto' })).toBe('A := 1\r\n');
  });
});

describe('MakefileFormatter - segurança', () => {
  it('preserva o documento integralmente quando .RECIPEPREFIX é redefinido', () => {
    const input = '.RECIPEPREFIX = >\nall:\n> echo ok\n\nVAR:=sem_formatacao   \n';

    expect(format(input)).toBe(input);
  });

  it('preserva linhas TAB desconhecidas fora do contexto de recipe', () => {
    const input = 'VAR := 1\n\tlinha orfa com tab\n';

    expect(format(input)).toBe('VAR := 1\n\tlinha orfa com tab\n');
  });
});

describe('MakefileFormatter - idempotência', () => {
  it('formatar duas vezes produz o mesmo resultado', () => {
    const input = [
      '#header',
      '',
      'SHELL:=/bin/bash',
      'ifeq($(OS),Windows_NT)',
      'BIN:=app.exe',
      'else',
      'BIN:=app',
      'endif',
      '',
      'SRCS = a.c \\',
      '       b.c',
      '',
      'define HELP',
      'uso:  make all',
      'endef',
      '',
      'all :$(BIN)',
      '\techo "done"',
      'ifdef DEBUG',
      '\techo debug',
      'endif',
      '',
      'clean:',
      '    rm -rf build',
      ''
    ].join('\n');

    const once = format(input);
    const twice = format(once);

    expect(twice).toBe(once);
  });
});

describe('MakefileFormatter - formatDocument', () => {
  it('retorna edição única quando há mudanças', () => {
    const formatter = new MakefileFormatter(defaultOpts);
    const text = 'VAR:=1\n';
    const document = {
      getText: () => text,
      positionAt: (offset: number) => ({ line: 0, character: offset })
    } as any;

    const edits = formatter.formatDocument(document);

    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe('VAR := 1\n');
  });

  it('retorna vazio quando não há mudanças', () => {
    const formatter = new MakefileFormatter(defaultOpts);
    const text = 'VAR := 1\n';
    const document = {
      getText: () => text,
      positionAt: (offset: number) => ({ line: 0, character: offset })
    } as any;

    expect(formatter.formatDocument(document)).toHaveLength(0);
  });
});
