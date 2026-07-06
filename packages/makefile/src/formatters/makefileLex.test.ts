import { describe, expect, it } from 'vitest';
import {
  classifyLine,
  classifyTrimmedLine,
  endsWithLineContinuation,
  findCommentStart,
  hasRecipePrefix,
  isFullLineComment,
  looksLikeRecipeCommand,
  usesCustomRecipePrefix
} from './makefileLex';

describe('classifyTrimmedLine', () => {
  it('classifica linhas vazias', () => {
    expect(classifyTrimmedLine('')).toBe('blank');
  });

  it('classifica comentários de linha inteira', () => {
    expect(classifyTrimmedLine('# comentário')).toBe('comment');
    expect(classifyTrimmedLine('## doc')).toBe('comment');
  });

  it('classifica atribuições com todos os operadores', () => {
    expect(classifyTrimmedLine('VAR = valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR := valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR ::= valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR :::= valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR ?= valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR += valor')).toBe('assignment');
    expect(classifyTrimmedLine('VAR != comando')).toBe('assignment');
    expect(classifyTrimmedLine('VAR=valor')).toBe('assignment');
  });

  it('classifica atribuições com prefixos', () => {
    expect(classifyTrimmedLine('export VAR := valor')).toBe('assignment');
    expect(classifyTrimmedLine('override VAR = valor')).toBe('assignment');
    expect(classifyTrimmedLine('export override VAR += valor')).toBe('assignment');
  });

  it('classifica alvos', () => {
    expect(classifyTrimmedLine('all: build test')).toBe('target');
    expect(classifyTrimmedLine('all:')).toBe('target');
    expect(classifyTrimmedLine('%.o: %.c')).toBe('target');
    expect(classifyTrimmedLine('.PHONY: all clean')).toBe('target');
    expect(classifyTrimmedLine('install:: deps')).toBe('target');
    expect(classifyTrimmedLine('foo bar: baz')).toBe('target');
  });

  it('não confunde atribuição com alvo', () => {
    expect(classifyTrimmedLine('VAR := foo:bar')).toBe('assignment');
    expect(classifyTrimmedLine('URL = http://example.com')).toBe('assignment');
  });

  it('classifica condicionais', () => {
    expect(classifyTrimmedLine('ifeq ($(OS),Windows_NT)')).toBe('conditional-open');
    expect(classifyTrimmedLine('ifneq (,$(DEBUG))')).toBe('conditional-open');
    expect(classifyTrimmedLine('ifdef VERBOSE')).toBe('conditional-open');
    expect(classifyTrimmedLine('ifndef RELEASE')).toBe('conditional-open');
    expect(classifyTrimmedLine('else')).toBe('conditional-else');
    expect(classifyTrimmedLine('else ifeq ($(CC),gcc)')).toBe('conditional-else');
    expect(classifyTrimmedLine('endif')).toBe('conditional-end');
  });

  it('classifica blocos define', () => {
    expect(classifyTrimmedLine('define TEMPLATE')).toBe('define-open');
    expect(classifyTrimmedLine('override define TEMPLATE')).toBe('define-open');
    expect(classifyTrimmedLine('endef')).toBe('define-end');
  });

  it('classifica diretivas', () => {
    expect(classifyTrimmedLine('include config.mk')).toBe('directive');
    expect(classifyTrimmedLine('-include local.mk')).toBe('directive');
    expect(classifyTrimmedLine('sinclude opt.mk')).toBe('directive');
    expect(classifyTrimmedLine('export VAR')).toBe('directive');
    expect(classifyTrimmedLine('unexport VAR')).toBe('directive');
    expect(classifyTrimmedLine('vpath %.c src')).toBe('directive');
    expect(classifyTrimmedLine('undefine VAR')).toBe('directive');
  });

  it('não confunde alvo chamado include com diretiva', () => {
    expect(classifyTrimmedLine('include: deps')).toBe('target');
  });

  it('classifica linhas desconhecidas como other', () => {
    expect(classifyTrimmedLine('$(eval $(call template,x))')).toBe('other');
    expect(classifyTrimmedLine('echo hello')).toBe('other');
  });

  it('não confunde palavras iniciadas com nomes de condicionais', () => {
    expect(classifyTrimmedLine('ifeqx := 1')).toBe('assignment');
    expect(classifyTrimmedLine('endifok: dep')).toBe('target');
  });
});

describe('endsWithLineContinuation', () => {
  it('detecta continuação com uma barra invertida', () => {
    expect(endsWithLineContinuation('SRCS = a.c \\')).toBe(true);
    expect(endsWithLineContinuation('SRCS = a.c \\  ')).toBe(true);
  });

  it('não detecta continuação com barras escapadas (número par)', () => {
    expect(endsWithLineContinuation('PATH = C:\\\\')).toBe(false);
  });

  it('detecta continuação com número ímpar de barras', () => {
    expect(endsWithLineContinuation('PATH = C:\\\\\\')).toBe(true);
  });

  it('não detecta continuação em linhas normais', () => {
    expect(endsWithLineContinuation('all: build')).toBe(false);
    expect(endsWithLineContinuation('')).toBe(false);
  });
});

describe('isFullLineComment / hasRecipePrefix', () => {
  it('identifica comentários de linha inteira', () => {
    expect(isFullLineComment('# foo')).toBe(true);
    expect(isFullLineComment('foo # bar')).toBe(false);
  });

  it('identifica prefixo de recipe (TAB)', () => {
    expect(hasRecipePrefix('\techo ok')).toBe(true);
    expect(hasRecipePrefix('    echo ok')).toBe(false);
    expect(hasRecipePrefix('echo ok')).toBe(false);
  });
});

describe('findCommentStart', () => {
  it('encontra o início do comentário', () => {
    expect(findCommentStart('# tudo comentário')).toBe(0);
    expect(findCommentStart('VAR = 1 # inline')).toBe(8);
  });

  it('ignora # escapado', () => {
    expect(findCommentStart('VAR = a\\#b')).toBe(-1);
    expect(findCommentStart('VAR = a\\#b # real')).toBe(11);
  });

  it('retorna -1 quando não há comentário', () => {
    expect(findCommentStart('VAR = 1')).toBe(-1);
  });
});

describe('looksLikeRecipeCommand', () => {
  it('identifica comandos com modificadores de recipe', () => {
    expect(looksLikeRecipeCommand('@echo "Projeto: x"')).toBe(true);
    expect(looksLikeRecipeCommand('-rm -f foo:bar')).toBe(true);
    expect(looksLikeRecipeCommand('+make -C sub target:dep')).toBe(true);
  });

  it('identifica comandos com : apenas dentro de aspas', () => {
    expect(looksLikeRecipeCommand('echo "hora: agora"')).toBe(true);
    expect(looksLikeRecipeCommand("echo 'a: b'")).toBe(true);
  });

  it('não confunde alvos reais com comandos', () => {
    expect(looksLikeRecipeCommand('all: build test')).toBe(false);
    expect(looksLikeRecipeCommand('debug: CFLAGS += -g')).toBe(false);
    expect(looksLikeRecipeCommand('docker run -p 8080:80 img')).toBe(false);
  });
});

describe('classifyLine', () => {
  it('produz metadados completos', () => {
    const result = classifyLine('  VAR := 1 \\');

    expect(result.kind).toBe('assignment');
    expect(result.trimmed).toBe('VAR := 1 \\');
    expect(result.raw).toBe('  VAR := 1 \\');
    expect(result.endsWithContinuation).toBe(true);
  });
});

describe('usesCustomRecipePrefix', () => {
  it('detecta redefinição de .RECIPEPREFIX', () => {
    expect(usesCustomRecipePrefix('.RECIPEPREFIX = >\nall:\n> echo ok\n')).toBe(true);
    expect(usesCustomRecipePrefix('VAR = 1\n.RECIPEPREFIX := >\n')).toBe(true);
  });

  it('não detecta em Makefiles comuns', () => {
    expect(usesCustomRecipePrefix('all:\n\techo ok\n')).toBe(false);
    expect(usesCustomRecipePrefix('# .RECIPEPREFIX citado em comentário nao conta')).toBe(false);
  });
});
