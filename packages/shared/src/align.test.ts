import { describe, expect, it } from 'vitest';
import { alignAssignmentBlocks, AlignableAssignmentParts, ALIGNMENT_NAME_LIMIT, AssignmentAlignMeta } from './align';

// Parser simples de exemplo: `nome op valor` com operadores = e :=
function parse (line: string): AlignableAssignmentParts | null {
  const match = line.match(/^([ \t]*)([A-Za-z_][\w]*)\s*(:=|\+=|=)[ \t]*(.*)$/);

  if (!match) {
    return null;
  }

  return { indent: match[1], name: match[2], operator: match[3], rest: match[4] };
}

function align (lines: string[], meta: AssignmentAlignMeta[]): string[] {
  return alignAssignmentBlocks(lines, meta, parse);
}

describe('alignAssignmentBlocks', () => {
  it('alinha operadores pelo caractere = final em blocos contíguos', () => {
    const lines = ['A = 1', 'LONG_NAME := 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'head'];

    expect(align(lines, meta)).toEqual(['A          = 1', 'LONG_NAME := 2']);
  });

  it('a linha mais larga (nome + espaço + operador) define a coluna por linha', () => {
    const lines = ['AB := 1', 'LONGER = 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'head'];

    // Mais larga: 'LONGER =' (6 + 1 + 1 = 8); AB := alinha o = final na mesma coluna
    expect(align(lines, meta)).toEqual(['AB    := 1', 'LONGER = 2']);
  });

  it('linhas other encerram o bloco', () => {
    const lines = ['A = 1', '# comentário', 'LONG_NAME = 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'other', 'head'];

    expect(align(lines, meta)).toEqual(['A = 1', '# comentário', 'LONG_NAME = 2']);
  });

  it('indentação diferente separa os blocos', () => {
    const lines = ['  A = 1', 'LONG_NAME = 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'head'];

    expect(align(lines, meta)).toEqual(['  A = 1', 'LONG_NAME = 2']);
  });

  it('continuações não encerram o bloco e aligned-continuation é realinhada', () => {
    const lines = ['SRCS = a \\', '       b', 'NAME_LONGER := x'];
    const meta: AssignmentAlignMeta[] = ['head', 'aligned-continuation', 'head'];
    const result = align(lines, meta);

    expect(result[0]).toBe(`SRCS${' '.repeat(9)}= a \\`);
    expect(result[1]).toBe(`${' '.repeat(15)}b`);
    expect(result[2]).toBe('NAME_LONGER := x');
  });

  it('plain-continuation é preservada sem realinhamento', () => {
    const lines = ['SRCS = a \\', '  b', 'NAME_LONGER := x'];
    const meta: AssignmentAlignMeta[] = ['head', 'plain-continuation', 'head'];
    const result = align(lines, meta);

    expect(result[1]).toBe('  b');
  });

  it('nome acima do limite fica fora sem empurrar o bloco', () => {
    const huge = 'X'.repeat(ALIGNMENT_NAME_LIMIT + 1);
    const lines = ['A = 1', 'BB = 2', `${huge} = 3`];
    const meta: AssignmentAlignMeta[] = ['head', 'head', 'head'];

    expect(align(lines, meta)).toEqual(['A  = 1', 'BB = 2', `${huge} = 3`]);
  });

  it('atribuição sem valor termina no operador', () => {
    const lines = ['A =', 'LONG_NAME = 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'head'];

    expect(align(lines, meta)).toEqual(['A         =', 'LONG_NAME = 2']);
  });

  it('é idempotente', () => {
    const lines = ['A = 1', 'LONG_NAME := 2'];
    const meta: AssignmentAlignMeta[] = ['head', 'head'];
    const once = align(lines, meta);

    expect(align(once, meta)).toEqual(once);
  });
});
