import { describe, it, expect } from 'vitest';
import { normalizeToLf, applyLineEnding, trimTrailingWhitespace, reduceBlankLines, removeLeadingBlankLines, ensureFinalNewline } from './textUtils';

describe('normalizeToLf', () => {
  it('converts CRLF to LF', () => {
    expect(normalizeToLf('a\r\nb\r\n')).toBe('a\nb\n');
  });
  it('keeps LF as-is', () => {
    expect(normalizeToLf('a\nb\n')).toBe('a\nb\n');
  });
});

describe('applyLineEnding', () => {
  it('returns LF for lf mode', () => {
    expect(applyLineEnding('a\nb', 'LF', 'a\nb')).toBe('a\nb');
  });
  it('converts to CRLF for crlf mode', () => {
    const result = applyLineEnding('a\nb', 'CRLF', 'a\nb');
    expect(result.charCodeAt(1)).toBe(13);
  });
  it('auto detects CRLF from original', () => {
    const result = applyLineEnding('a\nb', 'Auto', 'a\r\nb');
    expect(result.charCodeAt(1)).toBe(13);
  });
  it('auto keeps LF when original uses LF', () => {
    expect(applyLineEnding('a\nb', 'Auto', 'a\nb')).toBe('a\nb');
  });
});

describe('trimTrailingWhitespace', () => {
  it('removes trailing spaces and tabs', () => {
    expect(trimTrailingWhitespace(['hello  ', 'world\t'], true)).toEqual(['hello', 'world']);
  });
  it('does nothing when disabled', () => {
    expect(trimTrailingWhitespace(['hello  '], false)).toEqual(['hello  ']);
  });
});

describe('reduceBlankLines', () => {
  it('reduces consecutive blank lines', () => {
    expect(reduceBlankLines(['a', '', '', '', 'b'], 1)).toEqual(['a', '', 'b']);
  });
  it('allows up to maxConsecutive blank lines', () => {
    expect(reduceBlankLines(['a', '', '', 'b'], 2)).toEqual(['a', '', '', 'b']);
  });
});

describe('removeLeadingBlankLines', () => {
  it('removes blank lines at start', () => {
    expect(removeLeadingBlankLines(['', '', 'hello'], true)).toEqual(['hello']);
  });
  it('does nothing when disabled', () => {
    expect(removeLeadingBlankLines(['', 'hello'], false)).toEqual(['', 'hello']);
  });
});

describe('ensureFinalNewline', () => {
  it('adds newline if missing', () => {
    expect(ensureFinalNewline('hello', true)).toBe('hello\n');
  });
  it('does not duplicate newline', () => {
    expect(ensureFinalNewline('hello\n', true)).toBe('hello\n');
  });
  it('does nothing when disabled', () => {
    expect(ensureFinalNewline('hello', false)).toBe('hello');
  });
});
