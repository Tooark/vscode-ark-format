import { describe, expect, it, vi } from 'vitest';
import {
  applyLineEnding,
  detectIndent,
  ensureFinalNewline,
  formatTextGeneric,
  getMinimumLeadingWhitespace,
  normalizeToLf,
  parseRange,
  reduceBlankLines,
  removeLeadingBlankLines,
  trimTrailingWhitespace,
  updateIndentAfterLineWithContinuation
} from './document';
import type { FormatterOptions, FormatTextState } from './types';

describe('document helpers', () => {
  it('normalizeToLf converts CRLF and CR into LF', () => {
    expect(normalizeToLf('a\r\nb\rc\n')).toBe('a\nb\nc\n');
  });

  it('applyLineEnding respects LF, CRLF and Auto modes', () => {
    expect(applyLineEnding('a\nb', 'LF', 'a\nb')).toBe('a\nb');
    expect(applyLineEnding('a\nb', 'CRLF', 'a\nb')).toBe('a\r\nb');
    expect(applyLineEnding('a\nb', 'Auto', 'a\r\nb')).toBe('a\r\nb');
    expect(applyLineEnding('a\nb', 'Auto', 'a\rb')).toBe('a\nb');
  });

  it('detectIndent detects tabs and smallest space indentation', () => {
    expect(detectIndent('\tfoo\n\tbar\n  baz')).toEqual({ useTabs: true, size: 1 });
    expect(detectIndent('    one\n  two\nno-indent')).toEqual({ useTabs: false, size: 2 });
    expect(detectIndent('plain\ntext')).toEqual({ useTabs: false, size: 2 });
  });

  it('detectIndent skips blank lines and whitespace-only lines', () => {
    expect(detectIndent('  foo\n\n  \n  bar')).toEqual({ useTabs: false, size: 2 });
  });

  it('trimTrailingWhitespace removes trailing spaces when enabled', () => {
    expect(trimTrailingWhitespace(['a  ', 'b\t', 'c'], true)).toEqual(['a', 'b', 'c']);
    expect(trimTrailingWhitespace(['a  '], false)).toEqual(['a  ']);
  });

  it('reduceBlankLines limits consecutive blanks', () => {
    expect(reduceBlankLines(['a', '', '', '', 'b', '', ''], 1)).toEqual(['a', '', 'b', '']);
    expect(reduceBlankLines(['a', '', '', 'b'], 2)).toEqual(['a', '', '', 'b']);
  });

  it('removeLeadingBlankLines strips blank prefix only when enabled', () => {
    expect(removeLeadingBlankLines(['', '  ', 'a'], true)).toEqual(['a']);
    expect(removeLeadingBlankLines(['', 'a'], false)).toEqual(['', 'a']);
  });

  it('ensureFinalNewline appends newline when needed', () => {
    expect(ensureFinalNewline('a', true)).toBe('a\n');
    expect(ensureFinalNewline('a\n', true)).toBe('a\n');
    expect(ensureFinalNewline('a', false)).toBe('a');
  });

  it('parseRange returns full range by default and requested range when provided', () => {
    const text = 'hello world';
    const document = {
      getText: (range?: { start: number; end: number }) => {
        if (!range) {
          return text;
        }

        return text.slice(range.start, range.end);
      },
      positionAt: (offset: number) => offset
    } as any;

    const full = parseRange(document);
    expect(full.range).toEqual({ start: 0, end: 11 });
    expect(full.text).toBe('hello world');

    const partialRange = { start: 1, end: 5 } as any;
    const partial = parseRange(document, partialRange);
    expect(partial.range).toBe(partialRange);
    expect(partial.text).toBe('ello');
  });
});

describe('getMinimumLeadingWhitespace', () => {
  it('returns minimum indent ignoring blank lines', () => {
    expect(getMinimumLeadingWhitespace(['  a', '    b', '', '   c'])).toBe(2);
  });

  it('returns 0 when all lines start at column 0', () => {
    expect(getMinimumLeadingWhitespace(['a', 'b', 'c'])).toBe(0);
  });

  it('returns 0 for all blank lines', () => {
    expect(getMinimumLeadingWhitespace(['', '  ', '\t'])).toBe(0);
  });

  it('handles tabs as leading whitespace', () => {
    expect(getMinimumLeadingWhitespace(['\ta', '\t\tb'])).toBe(1);
  });
});

describe('updateIndentAfterLineWithContinuation', () => {
  it('decrements indent and clears continuation when controlText is empty and continuation is active', () => {
    const st = { indent: 3, continuation: true };
    const indentAfter = vi.fn();

    updateIndentAfterLineWithContinuation('', st, indentAfter);

    expect(st.indent).toBe(2);
    expect(st.continuation).toBe(false);
    expect(indentAfter).not.toHaveBeenCalled();
  });

  it('does not go below 0 on decrement', () => {
    const st = { indent: 0, continuation: true };
    const indentAfter = vi.fn();

    updateIndentAfterLineWithContinuation('', st, indentAfter);

    expect(st.indent).toBe(0);
    expect(st.continuation).toBe(false);
  });

  it('calls indentAfter callback when controlText is not empty', () => {
    const st = { indent: 1, continuation: false };
    const indentAfter = vi.fn();

    updateIndentAfterLineWithContinuation('if true', st, indentAfter);

    expect(indentAfter).toHaveBeenCalledWith('if true', st);
  });

  it('calls indentAfter callback when continuation is false even with empty controlText', () => {
    const st = { indent: 2, continuation: false };
    const indentAfter = vi.fn();

    updateIndentAfterLineWithContinuation('', st, indentAfter);

    expect(indentAfter).toHaveBeenCalledWith('', st);
  });
});

describe('formatTextGeneric', () => {
  const defaultOpts: FormatterOptions = {
    indentSize: 2,
    indentStyle: 'space',
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    removeLeadingBlankLines: true,
    insertFinalNewline: true,
    lineEnding: 'LF',
    collapseSpaces: false
  };

  function createState (): FormatTextState {
    return { indent: 0, continuation: false, inHeredoc: false, heredocEnd: '' };
  }

  it('applies basic indentation with dedent/indent callbacks', () => {
    const input = 'if true\necho ok\nfi\n';
    const result = formatTextGeneric({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: (text, st) => {
        if (text === 'fi') st.indent = Math.max(0, st.indent - 1);
      },
      indentAfterLine: (text, st) => {
        if (text === 'if true') st.indent++;
      },
      isShebang: (line) => line.startsWith('#!'),
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('if true\n  echo ok\nfi\n');
  });

  it('preserves shebang lines without indentation', () => {
    const input = '#!/bin/bash\necho hello\n';
    const result = formatTextGeneric({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: (line) => line.startsWith('#!'),
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('#!/bin/bash\necho hello\n');
  });

  it('preserves heredoc content verbatim', () => {
    const input = 'cat <<EOF\n  hello\n  world\nEOF\n';
    const result = formatTextGeneric({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: (line) => {
        const m = line.match(/<<(\w+)/);
        return m ? m[1] : null;
      },
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('cat <<EOF\n  hello\n  world\nEOF\n');
  });

  it('applies tab indentation', () => {
    const opts: FormatterOptions = { ...defaultOpts, indentStyle: 'tab' };
    const input = 'if true\necho ok\nfi\n';
    const result = formatTextGeneric({
      originalText: input,
      opts,
      createInitialState: createState,
      dedentBeforeLine: (text, st) => {
        if (text === 'fi') st.indent = Math.max(0, st.indent - 1);
      },
      indentAfterLine: (text, st) => {
        if (text === 'if true') st.indent++;
      },
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('if true\n\techo ok\nfi\n');
  });

  it('applies lineEnding CRLF', () => {
    const opts: FormatterOptions = { ...defaultOpts, lineEnding: 'CRLF' };
    const input = 'a\nb\n';
    const result = formatTextGeneric({
      originalText: input,
      opts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('a\r\nb\r\n');
  });

  it('handles removeLeadingBlankLines and reduceBlankLines', () => {
    const input = '\n\na\n\n\n\nb\n';
    const result = formatTextGeneric({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('a\n\nb\n');
  });

  it('handles multiline quote blocks with blank lines', () => {
    const input = 'x="line1\n\nline2"\necho done\n';

    const result = formatTextGeneric<FormatTextState, string, FormatterOptions>({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line, mode) => {
        if (mode !== 'code') return '';
        return line;
      },
      getQuoteModeAfterLine: (line, mode) => {
        const dq = (line.match(/"/g) || []).length;
        if (mode === 'code' && dq % 2 === 1) return 'double';
        if (mode === 'double' && dq % 2 === 1) return 'code';
        return mode;
      },
      applySpacing: (line) => line
    });

    // The multiline quote block should be preserved with blank line
    expect(result).toContain('line2"');
    expect(result).toContain('echo done');
    expect(result.split('\n').some(l => l === '')).toBe(true);
  });

  it('applies spacing function to code lines', () => {
    const input = 'echo   hello\n';
    const result = formatTextGeneric({
      originalText: input,
      opts: defaultOpts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line.replace(/\s+/g, ' ')
    });

    expect(result).toBe('echo hello\n');
  });

  it('does not insert final newline when disabled', () => {
    const opts: FormatterOptions = { ...defaultOpts, insertFinalNewline: false };
    const input = 'echo hello';
    const result = formatTextGeneric({
      originalText: input,
      opts,
      createInitialState: createState,
      dedentBeforeLine: () => {},
      indentAfterLine: () => {},
      isShebang: () => false,
      detectHeredocInCode: () => null,
      getCodePartsOnly: (line) => line,
      getQuoteModeAfterLine: () => 'code',
      applySpacing: (line) => line
    });

    expect(result).toBe('echo hello');
  });
});
