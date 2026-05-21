import { describe, it, expect } from 'vitest';
import { isShebang, isFullLineComment, splitByQuotesPreserve, detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine } from './shellLex';

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

  it('handles escaped characters inside backticks', () => {
    // \n inside backtick is preserved as escape pair
    const parts = splitByQuotesPreserve('echo `cmd \\n end`');
    expect(parts[0]).toEqual({ kind: 'code', text: 'echo ' });
    expect(parts[1]).toEqual({ kind: 'bt', text: '`cmd \\n end`' });
  });

  it('handles unclosed quote modes at end of line', () => {
    const parts = splitByQuotesPreserve("echo 'unclosed");
    expect(parts).toEqual([
      { kind: 'code', text: 'echo ' },
      { kind: 'sq', text: "'unclosed" },
    ]);
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

  it('detects heredoc with quoted delimiter split across parts', () => {
    // << followed by 'EOF' as a separate quote part
    expect(detectHeredocInCode("cat <<'MARKER'")).toBe('MARKER');
    expect(detectHeredocInCode('cat <<"MARKER"')).toBe('MARKER');
  });

  it('detects heredoc with dash (<<-)', () => {
    expect(detectHeredocInCode('cat <<-INDENT')).toBe('INDENT');
  });
});

describe('getCodePartsOnly', () => {
  it('returns full line for plain code', () => {
    expect(getCodePartsOnly('echo hello')).toBe('echo hello');
  });

  it('strips single-quoted strings', () => {
    expect(getCodePartsOnly("echo 'hello' world")).toBe('echo  world');
  });

  it('strips double-quoted strings', () => {
    expect(getCodePartsOnly('echo "hello" world')).toBe('echo  world');
  });

  it('strips ANSI-C quoted strings', () => {
    expect(getCodePartsOnly("echo $'hello' world")).toBe('echo  world');
  });

  it('strips backtick strings', () => {
    expect(getCodePartsOnly('echo `date` done')).toBe('echo  done');
  });

  it('handles escape sequences in double quotes', () => {
    expect(getCodePartsOnly('echo "a\\"b" end')).toBe('echo  end');
  });

  it('handles escape sequences in ANSI-C quoting', () => {
    expect(getCodePartsOnly("echo $'a\\'b' end")).toBe('echo  end');
  });

  it('handles escape sequences in backticks', () => {
    expect(getCodePartsOnly('echo `a\\`b` end')).toBe('echo  end');
  });

  it('respects initialMode=dq (starts inside double quote)', () => {
    // Starting inside a double-quoted string that closes at "
    expect(getCodePartsOnly('still quoted" code after', 'dq')).toBe(' code after');
  });

  it('respects initialMode=sq (starts inside single quote)', () => {
    expect(getCodePartsOnly("still quoted' code after", 'sq')).toBe(' code after');
  });

  it('respects initialMode=ansi (starts inside ansi quote)', () => {
    expect(getCodePartsOnly("still quoted' code after", 'ansi')).toBe(' code after');
  });

  it('respects initialMode=bt (starts inside backtick)', () => {
    expect(getCodePartsOnly('still quoted` code after', 'bt')).toBe(' code after');
  });
});

describe('getQuoteModeAfterLine', () => {
  it('returns code for plain code line', () => {
    expect(getQuoteModeAfterLine('echo hello')).toBe('code');
  });

  it('returns sq for unclosed single quote', () => {
    expect(getQuoteModeAfterLine("echo 'unclosed")).toBe('sq');
  });

  it('returns dq for unclosed double quote', () => {
    expect(getQuoteModeAfterLine('echo "unclosed')).toBe('dq');
  });

  it('returns ansi for unclosed ANSI-C quote', () => {
    expect(getQuoteModeAfterLine("echo $'unclosed")).toBe('ansi');
  });

  it('returns bt for unclosed backtick', () => {
    expect(getQuoteModeAfterLine('echo `unclosed')).toBe('bt');
  });

  it('returns code when all quotes are closed', () => {
    expect(getQuoteModeAfterLine('echo "hello" world')).toBe('code');
  });

  it('handles escaped quote inside double quotes', () => {
    expect(getQuoteModeAfterLine('echo "hello \\"still"')).toBe('code');
  });

  it('handles escaped quote inside ANSI-C quotes', () => {
    expect(getQuoteModeAfterLine("echo $'hello \\'still'")).toBe('code');
  });

  it('handles escaped char inside backticks', () => {
    expect(getQuoteModeAfterLine('echo `hello \\` still`')).toBe('code');
  });

  it('respects initialMode parameter (starting inside dq)', () => {
    expect(getQuoteModeAfterLine('still in dq" now code', 'dq')).toBe('code');
  });

  it('respects initialMode parameter (starting inside sq)', () => {
    expect(getQuoteModeAfterLine("still in sq' now code", 'sq')).toBe('code');
  });

  it('comment in code mode stops quote tracking', () => {
    // # in code mode means rest of line is comment, does not change quote state
    expect(getQuoteModeAfterLine('echo hello # "not a quote')).toBe('code');
  });

  it('handles bt mode with escape inside', () => {
    expect(getQuoteModeAfterLine('still in bt\\x', 'bt')).toBe('bt');
  });
});
