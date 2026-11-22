import { describe, expect, it } from 'vitest';
import {
  classifyLine,
  classifyTrimmedLine,
  defineDepthChange,
  endsWithLineContinuation,
  findCommentStart,
  findTargetSeparator,
  hasRecipePrefix,
  isFullLineComment,
  isStandaloneFunctionCall,
  looksLikeRecipeCommand,
  maskReferences,
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

describe('maskReferences', () => {
  const visible = (text: string): string => maskReferences(text).replace(/\u0001/g, '_');

  it('mascara referências entre parênteses e chaves, com aninhamento', () => {
    expect(visible('a $(b c) d')).toBe('a ______ d');
    expect(visible('a ${b:c} d')).toBe('a ______ d');
    expect(visible('$(call f,$(x),(y)): z')).toBe('__________________: z');
    expect(visible('${a{b}c} = 1')).toBe('________ = 1');
  });

  it('mascara variáveis de um caractere e o escape $$', () => {
    expect(visible('$@: $<')).toBe('__: __');
    expect(visible('$$(not a ref): x')).toBe('__(not a ref): x');
  });

  it('mascara até o fim da linha quando a referência não fecha', () => {
    expect(visible('X := $(call f,a:b \\')).toBe('X := ______________');
  });

  it('mantém o tamanho e o texto fora das referências', () => {
    const text = 'all: $(OBJS) # c $(x)';
    expect(maskReferences(text)).toHaveLength(text.length);
    expect(visible('a $ b')).toBe('a __b');
    expect(visible('fim$')).toBe('fim$');
  });
});

describe('findCommentStart com referências', () => {
  it('ignora o # dentro de referências', () => {
    expect(findCommentStart("N := $(shell grep -c '^#' f)")).toBe(-1);
    expect(findCommentStart('X := ${subst #,,$(Y)}')).toBe(-1);
    expect(findCommentStart('X := $(subst #,,$(Y)) # c')).toBe(22);
  });

  it('continua reconhecendo o # fora de referências e ignorando o escapado', () => {
    expect(findCommentStart('DIR := /usr#c')).toBe(11);
    expect(findCommentStart('X := a\\#b # c')).toBe(10);
    expect(findCommentStart('X := a\\\\#b')).toBe(8);
  });
});

describe('findTargetSeparator', () => {
  it('encontra o primeiro separador fora de referências', () => {
    expect(findTargetSeparator('all: deps')).toEqual({ index: 3, length: 1 });
    expect(findTargetSeparator('all :: deps')).toEqual({ index: 4, length: 2 });
    expect(findTargetSeparator('$(M:%=t_%): t_%: x')).toEqual({ index: 10, length: 1 });
    expect(findTargetSeparator('a b &: c')).toEqual({ index: 5, length: 1 });
  });

  it('não confunde com atribuição, escape, letra de unidade ou referência', () => {
    expect(findTargetSeparator('X := 1')).toBeNull();
    expect(findTargetSeparator('X ::= 1')).toBeNull();
    expect(findTargetSeparator('$(info a: b)')).toBeNull();
    expect(findTargetSeparator('C:/out/a.o')).toBeNull();
    expect(findTargetSeparator('C:/out/a.o: C:/src/a.c')).toEqual({ index: 10, length: 1 });
    expect(findTargetSeparator('lib D:\\x.o: y')).toEqual({ index: 10, length: 1 });
    expect(findTargetSeparator('a\\:b: c')).toEqual({ index: 4, length: 1 });
  });
});

describe('classifyTrimmedLine com referências e prefixos', () => {
  it.each([
    ['$(eval $(call tmpl,a,b:c))', 'other'],
    ['$(info ver http://example.com/a)', 'other'],
    ['$(foreach v,$(VARS),$(eval $(v) := 1))', 'other'],
    ['$(MODULES:%=test_%): test_%:', 'target'],
    ['$(OBJDIR)/%.o: %.c', 'target'],
    ['$(PREFIX)_VAR := $(subst =,:,x)', 'assignment'],
    ['export define BODY', 'define-open'],
    ['private define BODY', 'define-open'],
    ['override export define BODY', 'define-open'],
    ['export DEFINE_X = 1', 'assignment'],
    ['endif# fim', 'conditional-end'],
    ['else# senao', 'conditional-else'],
    ['endef # fim', 'define-end'],
    ['endef# fim', 'other'],
    ['endif-foo: x', 'target'],
  ])('classifica "%s" como %s', (line, kind) => {
    expect(classifyTrimmedLine(line)).toBe(kind);
  });

  it('defineDepthChange conta só o define sem prefixos e o endef seguido de espaço ou fim de linha', () => {
    expect(defineDepthChange('define INNER')).toBe(1);
    expect(defineDepthChange('  define INNER')).toBe(1);
    expect(defineDepthChange('endef')).toBe(-1);
    expect(defineDepthChange('  endef # fim')).toBe(-1);

    // Como no make: prefixos, comentário colado e linhas com TAB são texto do corpo
    expect(defineDepthChange('override define X')).toBe(0);
    expect(defineDepthChange('export define X')).toBe(0);
    expect(defineDepthChange('endef# fim')).toBe(0);
    expect(defineDepthChange('\tendef')).toBe(0);
    expect(defineDepthChange('\tdefine X')).toBe(0);
    expect(defineDepthChange('defined = 1')).toBe(0);
  });

  it.each([
    '$(eval $(call regra,a,b:c))',
    '$(foreach t,a b,$(eval $(t): ; @echo $(t)))',
    '$(info ver http://example.com/a)',
    '${warning falta algo}',
    '$(eval X := 1) # comentário',
    '$(info a) $(info b)',
    '$(call setup)',
  ])('isStandaloneFunctionCall reconhece "%s"', (line) => {
    expect(isStandaloneFunctionCall(line)).toBe(true);
  });

  it.each([
    '$(CC) -o x x.c',
    '$(MAKE)',
    '$(Q)echo done',
    '$(OBJ): $(SRC)',
    'X := $(shell date)',
    'echo $(info a)',
    '$@',
  ])('isStandaloneFunctionCall rejeita "%s"', (line) => {
    expect(isStandaloneFunctionCall(line)).toBe(false);
  });

  it('looksLikeRecipeCommand ignora o ":" dentro de referências', () => {
    expect(looksLikeRecipeCommand('$(info a: b)')).toBe(true);
    expect(looksLikeRecipeCommand('$(OBJ): $(SRC)')).toBe(false);
  });
});
