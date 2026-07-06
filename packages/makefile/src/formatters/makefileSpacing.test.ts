import { describe, expect, it } from 'vitest';
import { applyMakefileSpacing, getAssignmentValueColumn, MakefileSpacingConfig } from './makefileSpacing';
import type { MakefileLineKind } from './types';

const defaultCfg: MakefileSpacingConfig = {
  spaceAroundAssignment: true,
  spaceAfterTargetColon: true,
  spaceAfterCommentMarker: true,
  collapseSpaces: true
};

function spacing (line: string, kind: MakefileLineKind, cfg?: Partial<MakefileSpacingConfig>): string {
  return applyMakefileSpacing(line, kind, { ...defaultCfg, ...cfg });
}

describe('applyMakefileSpacing - atribuições', () => {
  it('normaliza espaço em torno dos operadores', () => {
    expect(spacing('VAR=valor', 'assignment')).toBe('VAR = valor');
    expect(spacing('VAR:=valor', 'assignment')).toBe('VAR := valor');
    expect(spacing('VAR::=valor', 'assignment')).toBe('VAR ::= valor');
    expect(spacing('VAR?=valor', 'assignment')).toBe('VAR ?= valor');
    expect(spacing('VAR+=valor', 'assignment')).toBe('VAR += valor');
    expect(spacing('VAR!=comando', 'assignment')).toBe('VAR != comando');
  });

  it('normaliza espaços excessivos em torno do operador', () => {
    expect(spacing('VAR   :=    valor', 'assignment')).toBe('VAR := valor');
  });

  it('preserva espaços internos do valor', () => {
    expect(spacing('CFLAGS := -Wall  -O2', 'assignment')).toBe('CFLAGS := -Wall  -O2');
  });

  it('normaliza prefixos de atribuição', () => {
    expect(spacing('export  VAR:=valor', 'assignment')).toBe('export VAR := valor');
  });

  it('mantém atribuição sem valor sem espaço final', () => {
    expect(spacing('VAR :=', 'assignment')).toBe('VAR :=');
    expect(spacing('VAR=', 'assignment')).toBe('VAR =');
  });

  it('não altera quando a opção está desabilitada', () => {
    expect(spacing('VAR:=valor', 'assignment', { spaceAroundAssignment: false })).toBe('VAR:=valor');
  });

  it('normaliza comentário inline de atribuição', () => {
    expect(spacing('VAR := 1 #comentário', 'assignment')).toBe('VAR := 1 # comentário');
  });
});

describe('applyMakefileSpacing - alvos', () => {
  it('remove espaço antes do : e garante espaço após', () => {
    expect(spacing('all :build test', 'target')).toBe('all: build test');
    expect(spacing('all:build', 'target')).toBe('all: build');
    expect(spacing('all : build', 'target')).toBe('all: build');
  });

  it('preserva regras de dois pontos duplos', () => {
    expect(spacing('install ::deps', 'target')).toBe('install:: deps');
  });

  it('não adiciona espaço final em alvos sem pré-requisitos', () => {
    expect(spacing('clean :', 'target')).toBe('clean:');
  });

  it('colapsa espaços na lista de pré-requisitos', () => {
    expect(spacing('all: build   test    lint', 'target')).toBe('all: build test lint');
  });

  it('suporta múltiplos alvos e regras de padrão', () => {
    expect(spacing('foo bar : baz', 'target')).toBe('foo bar: baz');
    expect(spacing('%.o : %.c', 'target')).toBe('%.o: %.c');
  });

  it('não altera o separador quando a opção está desabilitada', () => {
    expect(spacing('all :build', 'target', { spaceAfterTargetColon: false })).toBe('all :build');
  });

  it('normaliza comentário inline de alvo', () => {
    expect(spacing('all: build #comentário', 'target')).toBe('all: build # comentário');
  });
});

describe('applyMakefileSpacing - condicionais', () => {
  it('garante espaço entre a palavra-chave e o parêntese', () => {
    expect(spacing('ifeq($(OS),Windows_NT)', 'conditional-open')).toBe('ifeq ($(OS),Windows_NT)');
    expect(spacing('ifneq(,$(DEBUG))', 'conditional-open')).toBe('ifneq (,$(DEBUG))');
  });

  it('normaliza else ifeq', () => {
    expect(spacing('else ifeq($(CC),gcc)', 'conditional-else')).toBe('else ifeq ($(CC),gcc)');
  });

  it('mantém ifdef sem parênteses', () => {
    expect(spacing('ifdef  VERBOSE', 'conditional-open')).toBe('ifdef VERBOSE');
  });
});

describe('applyMakefileSpacing - comentários', () => {
  it('garante espaço após o marcador', () => {
    expect(spacing('#comentário', 'comment')).toBe('# comentário');
    expect(spacing('##doc', 'comment')).toBe('## doc');
  });

  it('preserva comentários já normalizados', () => {
    expect(spacing('# comentário', 'comment')).toBe('# comentário');
    expect(spacing('#', 'comment')).toBe('#');
  });

  it('preserva shebang', () => {
    expect(spacing('#!/usr/bin/env make', 'comment')).toBe('#!/usr/bin/env make');
  });

  it('não altera quando a opção está desabilitada', () => {
    expect(spacing('#comentário', 'comment', { spaceAfterCommentMarker: false })).toBe('#comentário');
  });
});

describe('getAssignmentValueColumn', () => {
  it('calcula a coluna do valor em atribuições formatadas', () => {
    expect(getAssignmentValueColumn('SRCS = main.c \\')).toBe(7);
    expect(getAssignmentValueColumn('CFLAGS += -Wall \\')).toBe(10);
    expect(getAssignmentValueColumn('  BIN := app \\')).toBe(9);
    expect(getAssignmentValueColumn('export FLAGS := -a \\')).toBe(16);
  });

  it('retorna null para linhas que não são atribuições', () => {
    expect(getAssignmentValueColumn('all: build')).toBeNull();
    expect(getAssignmentValueColumn('# comentário')).toBeNull();
  });
});

describe('applyMakefileSpacing - diretivas e outras linhas', () => {
  it('colapsa espaços internos', () => {
    expect(spacing('include   config.mk   local.mk', 'directive')).toBe('include config.mk local.mk');
  });

  it('não colapsa quando a opção está desabilitada', () => {
    expect(spacing('include   config.mk', 'directive', { collapseSpaces: false })).toBe('include   config.mk');
  });

  it('preserva # escapado como conteúdo', () => {
    expect(spacing('VAR := a\\#b', 'assignment')).toBe('VAR := a\\#b');
  });
});
