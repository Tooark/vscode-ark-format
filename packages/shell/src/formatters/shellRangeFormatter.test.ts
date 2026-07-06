import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

// Mock do vscode
vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: any, public end: any) { }
  },
  TextEdit: {
    replace: (range: any, newText: string) => ({ range, newText }),
  },
}));

import { ShellRangeFormatter } from './shellRangeFormatter';
import { ShellRangeFormatterOptions } from './types';

const defaultOpts: ShellRangeFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
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

  it('reindents with tabs when indentStyle is tab', () => {
    const input = 'if [ true ]; then\necho "hi"\nfi';
    const result = formatRange(input, { reindent: true, baseIndent: 0, indentStyle: 'tab' });
    const lines = result.split('\n');
    expect(lines[0]).toBe('if [ true ]; then');
    expect(lines[1]).toBe('\techo "hi"');
    expect(lines[2]).toBe('fi');
  });

  it('preserves heredoc content when reindenting', () => {
    const input = 'cat <<EOF\n  hello world\n    indented\nEOF\necho done';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');
    expect(lines[0]).toBe('cat <<EOF');
    expect(lines[1]).toBe('  hello world');
    expect(lines[2]).toBe('    indented');
    expect(lines[3]).toBe('EOF');
    expect(lines[4]).toBe('echo done');
  });

  it('handles blank lines when reindenting', () => {
    const input = 'echo a\n\necho b';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');
    expect(lines[0]).toBe('echo a');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('echo b');
  });

  it('trims trailing whitespace when option is set', () => {
    const input = 'echo hi   \necho bye  ';
    const result = formatRange(input, { reindent: false, trimTrailingWhitespace: true });
    const lines = result.split('\n');
    expect(lines[0]).toBe('echo hi');
    expect(lines[1]).toBe('echo bye');
  });

  it('reduces consecutive blank lines', () => {
    const input = 'echo a\n\n\n\necho b';
    const result = formatRange(input, { reindent: false, maxConsecutiveBlankLines: 1 });
    expect(result).toBe('echo a\n\necho b');
  });
});

describe('ShellRangeFormatter multiline strings and heredocs', () => {
  it('preserves multiline string content when reindenting', () => {
    const input = 'msg="line one\n  raw   content\nlast line"\necho done';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');
    expect(lines[0]).toBe('msg="line one');
    expect(lines[1]).toBe('  raw   content');
    expect(lines[2]).toBe('last line"');
    expect(lines[3]).toBe('echo done');
  });

  it('does not let keywords inside multiline strings affect indentation', () => {
    const input = 'cmd="line1\ndo\n"\necho next';
    const result = formatRange(input, { reindent: true, baseIndent: 0 });
    const lines = result.split('\n');
    expect(lines[1]).toBe('do');
    expect(lines[3]).toBe('echo next');
  });

  it('does not apply spacing inside multiline strings when reindent is false', () => {
    const input = 'msg="a\ncmd  x\nb"';
    const result = formatRange(input, { reindent: false });
    expect(result.split('\n')[1]).toBe('cmd  x');
  });

  it('preserves heredoc content when reindent is false', () => {
    const input = 'cat <<EOF\n  spaced   body\nEOF\necho  done';
    const result = formatRange(input, { reindent: false });
    const lines = result.split('\n');
    expect(lines[1]).toBe('  spaced   body');
    expect(lines[3]).toBe('echo done');
  });
});

describe('ShellRangeFormatter.formatRange', () => {
  it('returns edits when formatting changes the selection', () => {
    const formatter = new ShellRangeFormatter(defaultOpts);
    const selected = 'if[ true ];then\necho hi\nfi';
    const range = { start: { line: 0, character: 0 }, end: { line: 2, character: 2 } };
    const doc = {
      getText: (_range: any) => selected,
    } as any;

    const edits = formatter.formatRange(doc, range as any);
    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('if [ true ]; then\n  echo hi\nfi');
  });

  it('returns empty array when selection is already formatted', () => {
    const formatter = new ShellRangeFormatter(defaultOpts);
    const selected = 'if [ true ]; then\n  echo hi\nfi';
    const range = { start: { line: 0, character: 0 }, end: { line: 2, character: 2 } };
    const doc = {
      getText: (_range: any) => selected,
    } as any;

    const edits = formatter.formatRange(doc, range as any);
    expect(edits).toEqual([]);
  });
});
