import { describe, it, expect } from 'vitest';
import { isShebang, isFullLineComment, splitByQuotesPreserve, detectHeredocInCode } from './shellLex';

describe('isShebang', () => {
  it('detects shebang lines', () => {
    expect(isShebang('#!/bin/bash')).toBe(true);
    expect(isShebang('#!/usr/bin/env bash')).toBe(true);
  });
  it('rejects non-shebang', () => {
    expect(isShebang('# comment')).toBe(false);
    expect(isShebang('echo hello')).toBe(false);
  });
});

describe('isFullLineComment', () => {
  it('detects comments', () => {
    expect(isFullLineComment('# this is a comment')).toBe(true);
    expect(isFullLineComment('#comment')).toBe(true);
  });
  it('rejects non-comments', () => {
    expect(isFullLineComment('echo # inline')).toBe(false);
  });
});

describe('splitByQuotesPreserve', () => {
  it('handles plain code', () => {
    const parts = splitByQuotesPreserve('echo hello');
    expect(parts).toEqual([{ kind: 'code', text: 'echo hello' }]);
  });

  it('handles single quotes', () => {
    const parts = splitByQuotesPreserve("echo 'hello world'");
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'sq', text: "'hello world'" },
    ]);
  });

  it('handles double quotes', () => {
    const parts = splitByQuotesPreserve('echo "hello world"');
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'dq', text: '"hello world"' },
    ]);
  });

  it('handles escaped quotes inside double quotes', () => {
    const parts = splitByQuotesPreserve('echo "hello \\"world\\""');
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'dq', text: '"hello \\"world\\""' },
    ]);
  });

  it('handles $\'...\' ANSI-C quoting', () => {
    const parts = splitByQuotesPreserve("echo $'hello\\nworld'");
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'ansi', text: "$'hello\\nworld'" },
    ]);
  });

  it('handles backtick strings', () => {
    const parts = splitByQuotesPreserve('echo `date`');
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'bt', text: '`date`' },
    ]);
  });

  it('handles inline comments', () => {
    const parts = splitByQuotesPreserve('echo hello # comment');
    expect(parts).toEqual([{ kind: 'code', text: 'echo hello # comment' }]);
  });

  it('does not treat # inside quotes as comment', () => {
    const parts = splitByQuotesPreserve('echo "hello # world"');
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'dq', text: '"hello # world"' },
    ]);
  });

  it('handles mixed quotes', () => {
    const parts = splitByQuotesPreserve(`echo "a" 'b' "c"`);
    expect(parts.length).toBe(6);
    expect(parts[0]).toEqual({ kind: 'code', text: 'echo ' });
    expect(parts[1]).toEqual({ kind: 'dq', text: '"a"' });
    expect(parts[2]).toEqual({ kind: 'code', text: ' ' });
    expect(parts[3]).toEqual({ kind: 'sq', text: "'b'" });
    expect(parts[4]).toEqual({ kind: 'code', text: ' ' });
    expect(parts[5]).toEqual({ kind: 'dq', text: '"c"' });
  });
});

describe('detectHeredocInCode', () => {
  it('detects heredoc in plain code', () => {
    expect(detectHeredocInCode('cat <<EOF')).toBe('EOF');
    expect(detectHeredocInCode('cat <<-EOF')).toBe('EOF');
    expect(detectHeredocInCode("cat <<'EOF'")).toBe('EOF');
  });

  it('ignores heredoc inside quotes', () => {
    expect(detectHeredocInCode('echo "cat <<EOF"')).toBe(null);
    expect(detectHeredocInCode("echo 'cat <<EOF'")).toBe(null);
  });

  it('returns null when no heredoc', () => {
    expect(detectHeredocInCode('echo hello')).toBe(null);
  });
});
