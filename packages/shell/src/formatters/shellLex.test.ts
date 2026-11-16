import { describe, it, expect } from 'vitest';
import { isShebang, isFullLineComment, splitByQuotesPreserve, detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine, isNestedHeredocLine } from './shellLex';

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

  it('uses the whole word as the delimiter, with quotes and escapes removed', () => {
    expect(detectHeredocInCode('cat <<END-MSG')).toBe('END-MSG');
    expect(detectHeredocInCode('cat <<-END-MSG')).toBe('END-MSG');
    expect(detectHeredocInCode('cat <<END.txt')).toBe('END.txt');
    expect(detectHeredocInCode("cat <<'END MSG'")).toBe('END MSG');
    expect(detectHeredocInCode('cat <<E"O"F')).toBe('EOF');
    expect(detectHeredocInCode('cat <<\\EOF')).toBe('EOF');
    expect(detectHeredocInCode('cat << EOF')).toBe('EOF');
  });

  it('stops the delimiter at spaces and metacharacters', () => {
    expect(detectHeredocInCode('cat <<EOF | tr a b')).toBe('EOF');
    expect(detectHeredocInCode('cat <<EOF;')).toBe('EOF');
    expect(detectHeredocInCode('x=$(cat <<EOF')).toBe('EOF');
    expect(detectHeredocInCode('n=${#arr[@]}; cat <<EOF')).toBe('EOF');
  });

  it('does not treat here-strings, arithmetic shifts or comments as heredocs', () => {
    expect(detectHeredocInCode('cat <<< word')).toBe(null);
    expect(detectHeredocInCode('cat <<< "word"')).toBe(null);
    expect(detectHeredocInCode('tr a b <<<"$x"')).toBe(null);
    expect(detectHeredocInCode('echo $(( 1 << 2 ))')).toBe(null);
    expect(detectHeredocInCode('echo $(( (1 + 2) << n ))')).toBe(null);
    expect(detectHeredocInCode('(( x = 1 << n ))')).toBe(null);
    expect(detectHeredocInCode('echo hi # see <<EOF')).toBe(null);
    expect(detectHeredocInCode('cat <<')).toBe(null);
    expect(detectHeredocInCode("cat <<'EOF")).toBe(null);
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

// Regressão (issue #34): aspas dentro de substituição de comando $(...) que está entre aspas duplas
// formam um novo contexto de aspas e não fecham a string externa.
describe('quotes nested in command substitution inside double quotes', () => {
  const issueLine = 'x="$(echo \'"Hello"\' | tr -d \'"\')"';

  it('splitByQuotesPreserve keeps the whole quoted substitution as one dq part', () => {
    expect(splitByQuotesPreserve(issueLine)).toEqual([
      { kind: 'code', text: 'x=' },
      { kind: 'dq', text: '"$(echo \'"Hello"\' | tr -d \'"\')"' },
    ]);
  });

  it('getCodePartsOnly returns only the unquoted code', () => {
    expect(getCodePartsOnly(issueLine)).toBe('x=');
  });

  it('getQuoteModeAfterLine returns code when the substitution and the string close', () => {
    expect(getQuoteModeAfterLine(issueLine)).toBe('code');
  });

  it('keeps the state stable regardless of how many times the line repeats', () => {
    let mode = getQuoteModeAfterLine(issueLine);
    mode = getQuoteModeAfterLine(issueLine, mode);
    mode = getQuoteModeAfterLine(issueLine, mode);
    expect(mode).toBe('code');
  });

  it('carries the nested state across lines until the substitution and the string close', () => {
    const afterOpen = getQuoteModeAfterLine('x="$(echo \'"Hello"\' |');
    expect(afterOpen).not.toBe('code');

    const afterInner = getQuoteModeAfterLine("  tr -d '\"' |", afterOpen);
    expect(afterInner).toBe(afterOpen);

    expect(getQuoteModeAfterLine(')"', afterInner)).toBe('code');
  });

  it('reports the outer double quote as the part kind of an unclosed nested line', () => {
    const parts = splitByQuotesPreserve('x="$(echo \'a\'');
    expect(parts).toEqual([
      { kind: 'code', text: 'x=' },
      { kind: 'dq', text: '"$(echo \'a\'' },
    ]);
  });

  it('getCodePartsOnly drops text until the nested context fully closes', () => {
    const state = getQuoteModeAfterLine('x="$(');
    expect(getCodePartsOnly("echo ')' ) \" ; then", state)).toBe(' ; then');
  });

  it('closes the substitution only at the matching parenthesis', () => {
    expect(getQuoteModeAfterLine('x="$(( (1 + 2) * 3 ))"')).toBe('code');
    expect(getQuoteModeAfterLine('x="$(echo "(" \')\' ")")"')).toBe('code');
    expect(getQuoteModeAfterLine('x="$(echo $(echo \'"\'))"')).toBe('code');
  });

  it('handles escapes inside the substitution', () => {
    // Linha shell: x="$(echo \' \) \")"
    expect(getQuoteModeAfterLine('x="$(echo \\\' \\) \\")"')).toBe('code');
  });

  it('treats # as a comment inside the substitution only at the start of a word', () => {
    // $# e ${#x} não são comentários; o ')' entre aspas simples não fecha a substituição.
    expect(getQuoteModeAfterLine('x="$(echo $# ${#arr[@]} \')\')"')).toBe('code');

    // Apóstrofo em comentário dentro da substituição multilinha não abre aspas simples.
    const open = getQuoteModeAfterLine('x="$(');
    const afterComment = getQuoteModeAfterLine("  date # it's a comment", open);
    expect(afterComment).toBe(open);
    expect(getQuoteModeAfterLine(')"', afterComment)).toBe('code');
  });

  it('treats a heredoc body inside the substitution as literal until its delimiter', () => {
    // Apóstrofos e aspas no corpo do heredoc não abrem strings.
    let mode = getQuoteModeAfterLine("msg=\"$(cat <<'EOF'");
    expect(mode).not.toBe('code');
    expect(getCodePartsOnly("Don't \" do this", mode)).toBe('');

    mode = getQuoteModeAfterLine("Don't \" do this", mode);
    mode = getQuoteModeAfterLine(')" not yet', mode);
    mode = getQuoteModeAfterLine('EOF', mode);
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');
  });

  it('isNestedHeredocLine is true only for lines inside a heredoc declared in the substitution', () => {
    expect(isNestedHeredocLine('code')).toBe(false);
    expect(isNestedHeredocLine('dq')).toBe(false);

    const open = getQuoteModeAfterLine('x="$(cat <<EOF');
    expect(isNestedHeredocLine(open)).toBe(true);

    const body = getQuoteModeAfterLine('body', open);
    expect(isNestedHeredocLine(body)).toBe(true);

    const afterDelimiter = getQuoteModeAfterLine('EOF', body);
    expect(isNestedHeredocLine(afterDelimiter)).toBe(false);
    expect(afterDelimiter).not.toBe('code');
  });

  it('handles <<- heredocs, several heredocs on one line and here-strings', () => {
    let mode = getQuoteModeAfterLine('x="$(cat <<-END');
    mode = getQuoteModeAfterLine("\tit's tabbed", mode);
    mode = getQuoteModeAfterLine('\tEND', mode);
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');

    mode = getQuoteModeAfterLine('x="$(paste - - <<A 3<<"B"');
    for (const line of ["a's", 'A', "b's", 'B']) {
      mode = getQuoteModeAfterLine(line, mode);
    }
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');

    // Delimitador sem aspas é a palavra inteira (ex.: END-MSG, não só END).
    mode = getQuoteModeAfterLine('x="$(cat <<END-MSG');
    mode = getQuoteModeAfterLine("it's fine", mode);
    expect(isNestedHeredocLine(mode)).toBe(true);
    mode = getQuoteModeAfterLine('END', mode);
    expect(isNestedHeredocLine(mode)).toBe(true);
    mode = getQuoteModeAfterLine('END-MSG', mode);
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');

    // <<< é here-string: as aspas seguintes continuam sendo aspas.
    expect(getQuoteModeAfterLine('x="$(tr -d a <<< "it\'s")"')).toBe('code');
  });

  it('does not treat << as a heredoc inside arithmetic expansion', () => {
    const mode = getQuoteModeAfterLine('x="$(( 1 <<');
    expect(getQuoteModeAfterLine(' EOF ))"', mode)).toBe('code');
  });

  it('does not treat here-strings or nested arithmetic as heredocs in a multiline substitution', () => {
    // O segundo `<` de `<<<` não pode ser relido como início de `<<`.
    let mode = getQuoteModeAfterLine('x="$(');
    const open = mode;
    mode = getQuoteModeAfterLine('  jq -r .a <<< "$json"', mode);
    expect(mode).toBe(open);
    mode = getQuoteModeAfterLine('  jq -r .b <<<word', mode);
    expect(mode).toBe(open);

    // `$((` aninhado na substituição é aritmética: `<< n` é deslocamento.
    mode = getQuoteModeAfterLine('  echo $(( 1 << n ))', mode);
    expect(mode).toBe(open);
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');
  });

  it('does not open a nested context for $( outside double quotes', () => {
    expect(getQuoteModeAfterLine('x=$(echo "a"')).toBe('code');
    expect(getCodePartsOnly('x=$(echo \'a\')')).toBe('x=$(echo )');
  });
});

// Regressão: aspas escapadas com barra invertida fora de aspas (\' e \") são literais e não abrem string.
describe('escaped quotes outside of quotes', () => {
  it('does not open a string for escaped single or double quotes in code', () => {
    expect(getQuoteModeAfterLine("echo it\\'s")).toBe('code');
    expect(getQuoteModeAfterLine('echo \\"hi')).toBe('code');
    expect(getQuoteModeAfterLine("case $x in (*\\'*) ;; esac")).toBe('code');
  });

  it('keeps escaped quotes as code parts', () => {
    expect(splitByQuotesPreserve('echo \\"a  b\\"')).toEqual([{ kind: 'code', text: 'echo \\"a  b\\"' }]);
    expect(getCodePartsOnly("echo it\\'s")).toBe("echo it\\'s");
  });

  it('still opens a string after an escaped backslash', () => {
    expect(getQuoteModeAfterLine('echo \\\\"open')).toBe('dq');
  });

  it('keeps a trailing backslash (line continuation) as code', () => {
    expect(getQuoteModeAfterLine('echo a \\')).toBe('code');
    expect(getCodePartsOnly('echo a \\')).toBe('echo a \\');
  });
});
