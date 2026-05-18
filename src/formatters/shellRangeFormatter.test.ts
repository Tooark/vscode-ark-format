import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

// Mock do vscode
vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: any, public end: any) { }
  },
  TextEdit: {
    replace: (range: any, text: string) => ({ range, text }),
  },
}));

import { ShellRangeFormatter } from './shellRangeFormatter';
import { ShellRangeFormatterOptions } from './types';

const defaultOpts: ShellRangeFormatterOptions = {
  indentSize: 2,
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: false,
  insertFinalNewline: false,
  lineEnding: 'Auto',
  collapseSpaces: true,
  spacing: {
    spaceBeforeThenDo: true,
    spaceAfterKeywords: true,
    spaceBeforeFunctionBrace: true,
  },
  reindent: true,
  baseIndent: 0,
};

function formatRange (input: string, opts?: Partial<ShellRangeFormatterOptions>): string {
  return new ShellRangeFormatter({ ...defaultOpts, ...opts }).formatSelectedText(input);
}

describe('ShellRangeFormatter with baseIndent (Feature 5)', () => {
  it('applies baseIndent offset when reindenting', () => {
    const input = 'if [ true ]; then\necho "hi"\nfi';
    // Com baseIndent=1, primeira linha também ganha 1 espaço, e echo fica com 3 (1 base + 2 do if)
    const result = formatRange(input, { reindent: true, baseIndent: 1 });
    const lines = result.split('\n');
    expect(lines[0]).toBe('  if [ true ]; then');
    expect(lines[1]).toBe('    echo "hi"');
    expect(lines[2]).toBe('  fi');
  });

  it('does NOT apply baseIndent when reindent is false', () => {
    const input = '  if [ true ]; then\n  echo "hi"\n  fi';
    const result = formatRange(input, { reindent: false, baseIndent: 2 });
    // Sem reindent, preserva a indentação existente
    const lines = result.split('\n');
    expect(lines[0]).toBe('  if [ true ]; then');
    expect(lines[1]).toBe('  echo "hi"');
  });

  it('handles nested structures with baseIndent', () => {
    const input = 'case "$1" in\nstart)\necho "start"\n;;\nesac';
    const result = formatRange(input, { reindent: true, baseIndent: 1 });
    const lines = result.split('\n');
    expect(lines[0]).toBe('  case "$1" in');
    expect(lines[1]).toBe('    start)');
    expect(lines[2]).toBe('      echo "start"');
    expect(lines[3]).toBe('    ;;');
    expect(lines[4]).toBe('  esac');
  });

  it('respects baseIndent=0 (default)', () => {
    const input = 'if [ true ]; then\necho "hi"\nfi';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');
    expect(lines[1]).toBe('  echo "hi"');
  });
});
