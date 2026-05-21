import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: unknown, public end: unknown) { }
  },
  TextEdit: {
    replace: (range: unknown, newText: string) => ({ range, newText }),
  },
}));

import { PowerShellRangeFormatter } from './powerShellRangeFormatter';
import { PowerShellRangeFormatterOptions } from './types';

function createRange (startLine: number, startChar: number, endLine: number, endChar: number) {
  return {
    start: { line: startLine, character: startChar },
    end: { line: endLine, character: endChar },
    isEmpty: startLine === endLine && startChar === endChar,
    isSingleLine: startLine === endLine,
    contains: () => false,
    isEqual: () => false,
    intersection: () => undefined,
    union: () => ({}) as any,
    with: () => ({}) as any,
  } as any;
}

const defaultOpts: PowerShellRangeFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: false,
  insertFinalNewline: false,
  lineEnding: 'Auto',
  collapseSpaces: true,
  reindent: true,
  baseIndent: 0,
};

function formatRange (input: string, opts?: Partial<PowerShellRangeFormatterOptions>): string {
  return new PowerShellRangeFormatter({ ...defaultOpts, ...opts }).formatSelectedText(input);
}

describe('PowerShellRangeFormatter.formatRange', () => {
  it('retorna edição quando texto muda', () => {
    const formatter = new PowerShellRangeFormatter(defaultOpts);
    const range = createRange(0, 0, 1, 5);
    const doc = {
      getText: () => 'function Test{\nWrite-Host "ok"\n}',
    } as any;
    const edits = formatter.formatRange(doc, range);
    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toContain('function Test {');
  });

  it('retorna array vazio quando texto não muda', () => {
    const formatter = new PowerShellRangeFormatter(defaultOpts);
    const range = createRange(0, 0, 0, 5);
    const doc = {
      getText: () => 'Write-Host "ok"',
    } as any;
    const edits = formatter.formatRange(doc, range);
    expect(edits).toHaveLength(0);
  });
});

describe('PowerShellRangeFormatter.formatSelectedText (reindent)', () => {
  it('aplica baseIndent ao reindentar seleção', () => {
    const input = 'if ($true){\nWrite-Host "hi"\n}';
    const result = formatRange(input, { reindent: true, baseIndent: 1 });
    const lines = result.split('\n');

    expect(lines[0]).toBe('  if ($true) {');
    expect(lines[1]).toBe('    Write-Host "hi"');
    expect(lines[2]).toBe('  }');
  });

  it('preserva conteúdo de here-string durante reindent', () => {
    const input = [
      '$text = @"',
      '  linha interna',
      '"@',
      'Write-Host $text'
    ].join('\n');

    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');

    expect(lines[0]).toBe('$text = @"');
    expect(lines[1]).toBe('  linha interna');
    expect(lines[2]).toBe('"@');
    expect(lines[3]).toBe('Write-Host $text');
  });

  it('reindenta com tab quando indentStyle for tab', () => {
    const input = 'if ($true){\nWrite-Host "hi"\n}';
    const result = formatRange(input, { reindent: true, baseIndent: 0, indentStyle: 'tab' });
    const lines = result.split('\n');

    expect(lines[0]).toBe('if ($true) {');
    expect(lines[1]).toBe('\tWrite-Host "hi"');
    expect(lines[2]).toBe('}');
  });

  it('trata linhas vazias no reindent', () => {
    const input = 'if ($true) {\n\nWrite-Host "hi"\n}';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');

    expect(lines[0]).toBe('if ($true) {');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('  Write-Host "hi"');
    expect(lines[3]).toBe('}');
  });

  it('reduz linhas em branco consecutivas no reindent', () => {
    const input = 'Write-Host "a"\n\n\n\nWrite-Host "b"';
    const result = formatRange(input, { reindent: true, baseIndent: 0, maxConsecutiveBlankLines: 1 });
    const lines = result.split('\n');

    expect(lines).toEqual(['Write-Host "a"', '', 'Write-Host "b"']);
  });

  it('não colapsa espaços quando collapseSpaces é false (reindent)', () => {
    const input = '$x  =  1';
    const result = formatRange(input, { reindent: true, baseIndent: 0, collapseSpaces: false });
    expect(result).toBe('$x  =  1');
  });
});

describe('PowerShellRangeFormatter.formatSelectedText (no reindent)', () => {
  it('não aplica baseIndent quando reindent é false', () => {
    const input = '  if ($true){\n  Write-Host "hi"\n  }';
    const result = formatRange(input, { reindent: false, baseIndent: 2 });
    const lines = result.split('\n');

    expect(lines[0]).toBe('  if ($true) {');
    expect(lines[1]).toBe('  Write-Host "hi"');
    expect(lines[2]).toBe('  }');
  });

  it('preserva here-string sem reindent', () => {
    const input = [
      '$text = @"',
      '  internal',
      '"@'
    ].join('\n');

    const result = formatRange(input, { reindent: false });
    const lines = result.split('\n');

    expect(lines[0]).toBe('$text = @"');
    expect(lines[1]).toBe('  internal');
    expect(lines[2]).toBe('"@');
  });

  it('trata linhas vazias sem reindent', () => {
    const input = 'Write-Host "a"\n\nWrite-Host "b"';
    const result = formatRange(input, { reindent: false });
    const lines = result.split('\n');

    expect(lines[0]).toBe('Write-Host "a"');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('Write-Host "b"');
  });

  it('aplica trim e redução de linhas no modo sem reindent', () => {
    const input = 'Write-Host "a"  \n\n\n\nWrite-Host "b"  ';
    const result = formatRange(input, { reindent: false, trimTrailingWhitespace: true, maxConsecutiveBlankLines: 1 });
    const lines = result.split('\n');

    expect(lines).toEqual(['Write-Host "a"', '', 'Write-Host "b"']);
  });

  it('aplica spacing mesmo quando trimTrailingWhitespace é false', () => {
    const input = 'function Test{';
    const result = formatRange(input, { reindent: false, trimTrailingWhitespace: false });
    expect(result).toBe('function Test {');
  });
});
