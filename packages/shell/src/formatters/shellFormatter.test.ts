import { describe, it, expect } from 'vitest';

// Não pode importar o vscode nos testes, então utiliza formatText por meio de um wrapper simples
// que não depende das APIs do vscode.
// ShellFormatter.formatText é público e usa apenas operações de string.
// É simulado o módulo vscode para que a importação seja bem-sucedida.

import { vi } from 'vitest';
vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: any, public end: any) { }
  },
  TextEdit: {
    replace: (range: any, newText: string) => ({ range, newText }),
  },
  Position: class {
    constructor (public line: number, public character: number) { }
  },
}));

import { ShellFormatter } from './shellFormatter';
import { ShellFormatterOptions } from './types';

const defaultOpts: ShellFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: true,
  insertFinalNewline: true,
  lineEnding: 'LF',
  collapseSpaces: true,
  spacing: {
    spaceBeforeThenDo: true,
    spaceAfterKeywords: true,
    spaceBeforeFunctionBrace: true,
  },
};

function format (input: string, opts?: Partial<ShellFormatterOptions>): string {
  return new ShellFormatter({ ...defaultOpts, ...opts }).formatText(input);
}

describe('ShellFormatter.formatText', () => {
  it('formats basic if/then/fi', () => {
    const input = 'if[ "$1" = "ok" ];then\necho "ok"\nfi\n';
    const result = format(input);
    expect(result).toBe('if [ "$1" = "ok" ]; then\n  echo "ok"\nfi\n');
  });

  it('preserves shebang line', () => {
    const result = format('#!/bin/bash\necho hi\n');
    expect(result).toBe('#!/bin/bash\necho hi\n');
  });

  it('preserves alignment spaces inside a comment header block', () => {
    const input = [
      '#!/usr/bin/env bash',
      '# ============================================================',
      '# Usage:',
      '#   scripts/check.sh                      fast profile: backend, frontend, cli',
      '#   scripts/check.sh --changed[=REF]      only the stacks touched since REF',
      "#                                         (default: the branch's upstream, else origin/main)",
      '#',
      '# Env:',
      '#   ARKUEST_SKIP_CHECKS=1   the hooks that call this script return at once',
      '# ============================================================',
      'set -uo pipefail',
      '',
    ].join('\n');

    expect(format(input)).toBe(input);
  });

  it('formats nested if/else', () => {
    const input = 'if [ 1 ]; then\nif [ 2 ]; then\necho "deep"\nelse\necho "alt"\nfi\nfi\n';
    const result = format(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('if [ 1 ]; then');
    expect(lines[1]).toBe('  if [ 2 ]; then');
    expect(lines[2]).toBe('    echo "deep"');
    expect(lines[3]).toBe('  else');
    expect(lines[4]).toBe('    echo "alt"');
    expect(lines[5]).toBe('  fi');
    expect(lines[6]).toBe('fi');
  });

  it('handles case/esac', () => {
    const input = 'case "$1" in\nstart)\necho "start"\n;;\nstop)\necho "stop"\n;;\nesac\n';
    const result = format(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('case "$1" in');
    expect(lines[1]).toBe('  start)');
    expect(lines[2]).toBe('    echo "start"');
    expect(lines[3]).toBe('  ;;');
    expect(lines[4]).toBe('  stop)');
    expect(lines[5]).toBe('    echo "stop"');
    expect(lines[6]).toBe('  ;;');
    expect(lines[7]).toBe('esac');
  });

  it('handles for loop', () => {
    const input = 'for i in 1 2 3; do\necho $i\ndone\n';
    const result = format(input);
    expect(result).toBe('for i in 1 2 3; do\n  echo $i\ndone\n');
  });

  it('handles while loop', () => {
    const input = 'while [ true ]; do\necho loop\ndone\n';
    const result = format(input);
    expect(result).toBe('while [ true ]; do\n  echo loop\ndone\n');
  });

  it('handles tcsh foreach loop', () => {
    const input = 'foreach svc ($services)\necho "Service: $svc"\nend\n';
    const result = format(input);
    expect(result).toBe('foreach svc ($services)\n  echo "Service: $svc"\nend\n');
  });

  it('handles function definition', () => {
    const input = 'myfunc(){\necho "hi"\n}\n';
    const result = format(input);
    expect(result).toBe('myfunc() {\n  echo "hi"\n}\n');
  });

  it('handles function keyword', () => {
    const input = 'function myfunc{\necho "hi"\n}\n';
    const result = format(input);
    expect(result).toBe('function myfunc {\n  echo "hi"\n}\n');
  });

  it('preserves heredoc content', () => {
    const input = 'cat <<EOF\n  hello world\n    indented\nEOF\n';
    const result = format(input);
    expect(result).toBe('cat <<EOF\n  hello world\n    indented\nEOF\n');
  });

  it('does not detect heredoc inside quotes', () => {
    const input = 'echo "cat <<EOF"\necho "normal"\n';
    const result = format(input);
    // Both lines should be formatted normally (no heredoc mode)
    expect(result).toBe('echo "cat <<EOF"\necho "normal"\n');
  });

  it('handles line continuation', () => {
    const input = 'echo hello \\\nworld\necho done\n';
    const result = format(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('echo hello \\');
    expect(lines[1]).toBe('  world');
    expect(lines[2]).toBe('echo done');
  });

  it('indents aws stepfunctions multiline command inside quoted command substitution', () => {
    const input = [
      'STATE_MACHINE_ARN="$(aws stepfunctions create-state-machine \\',
      '--name "$STATE_MACHINE_NAME" \\',
      '--role-arn "$STEP_FUNCTION_ROLE_ARN" \\',
      '--definition "file://$definition_path" \\',
      '--type STANDARD \\',
      '--region "$AWS_REGION" \\',
      "--query 'stateMachineArn' --output text)\"",
      '',
    ].join('\n');

    const expected = [
      'STATE_MACHINE_ARN="$(aws stepfunctions create-state-machine \\',
      '  --name "$STATE_MACHINE_NAME" \\',
      '  --role-arn "$STEP_FUNCTION_ROLE_ARN" \\',
      '  --definition "file://$definition_path" \\',
      '  --type STANDARD \\',
      '  --region "$AWS_REGION" \\',
      "  --query 'stateMachineArn' --output text)\"",
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  describe('issue #34: double quotes inside single quotes inside "$(...)"', () => {
    const issueLine = 'x="$(echo \'"Hello"\' | tr -d \'"\')"';

    it.each([1, 2, 3])('keeps the following lines with %i occurrence(s) of the line', (count) => {
      const input = [...Array<string>(count).fill(issueLine), 'echo "Test"', ''].join('\n');

      const result = format(input);
      expect(result).toBe(input);
      expect(format(result)).toBe(result);
    });

    it('keeps the octal workaround from the issue unchanged', () => {
      const input = ['x="$(echo \'"Hello"\' | tr -d \'\\042\')"', 'echo "Test"', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it('formats code after the line and inside blocks normally', () => {
      const input = [
        'if true;then',
        issueLine,
        'echo   Test',
        'fi',
        '',
      ].join('\n');

      const expected = [
        'if true; then',
        `  ${issueLine}`,
        '  echo Test',
        'fi',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('preserves a multiline quoted substitution with nested quotes', () => {
      const input = [
        'x="$(',
        '  echo \'"Hello"\' |',
        '    tr -d \'"\'',
        ')"',
        'echo "Test"',
        '',
      ].join('\n');

      expect(format(input)).toBe(input);
    });

    it('keeps formatting after a heredoc with an apostrophe inside "$(...)"', () => {
      const input = [
        "msg=\"$(cat <<'EOF'",
        "Don't do this",
        'EOF',
        ')"',
        'if true;then',
        'echo   ok',
        'fi',
        '',
      ].join('\n');

      const expected = [
        "msg=\"$(cat <<'EOF'",
        "Don't do this",
        'EOF',
        ')"',
        'if true; then',
        '  echo ok',
        'fi',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('preserves heredoc body and delimiter inside "$(...)" in an indented block', () => {
      // O delimitador de <<EOF precisa permanecer na coluna 0; o restante do bloco é reindentado.
      const input = [
        'f() {',
        "msg=\"$(cat <<'EOF'",
        "Don't do this",
        '  indented body',
        'EOF',
        ')"',
        'echo   ok',
        '}',
        '',
      ].join('\n');

      const expected = [
        'f() {',
        "  msg=\"$(cat <<'EOF'",
        "Don't do this",
        '  indented body',
        'EOF',
        '  )"',
        '  echo ok',
        '}',
        '',
      ].join('\n');

      const result = format(input);
      expect(result).toBe(expected);
      expect(format(result)).toBe(result);
    });

    it('preserves <<- heredoc body inside "$(...)" while reindenting the surrounding lines', () => {
      const input = [
        'if true;then',
        'z="$(cat <<-END',
        '\tit\'s tabbed',
        '\tEND',
        'echo done',
        ')"',
        'fi',
        '',
      ].join('\n');

      const expected = [
        'if true; then',
        '  z="$(cat <<-END',
        '\tit\'s tabbed',
        '\tEND',
        '  echo done',
        '  )"',
        'fi',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('uses the whole word as the delimiter of a heredoc inside "$(...)"', () => {
      const input = ['x="$(cat <<END-MSG', "it's fine", 'END-MSG', ')"', 'echo   ok', ''].join('\n');
      const expected = ['x="$(cat <<END-MSG', "it's fine", 'END-MSG', ')"', 'echo ok', ''].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('keeps formatting after here-strings and arithmetic inside a multiline "$(...)"', () => {
      const input = [
        'x="$(',
        '  jq -r .a <<< "$json"',
        '  echo $(( 1 << n ))',
        ')"',
        'echo   ok',
        '',
      ].join('\n');

      const expected = [
        'x="$(',
        '  jq -r .a <<< "$json"',
        '  echo $(( 1 << n ))',
        ')"',
        'echo ok',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });
  });

  describe('issue #39: ${#var} at end of line and words that start with a keyword', () => {
    // Script da issue (zsh), já formatado: deve ser um ponto fixo do formatador.
    const issueScript = [
      'function user_sage_vi_forward_word() {',
      '  if [[ $KEYMAP != (main|viins) ||',
      '    -z ${_SAGE_CURRENT_SUGGESTION:-} ||',
      '    -z ${POSTDISPLAY:-} ]] ||',
      '    (( CURSOR != ${#BUFFER} )); then',
      '    zle user-sage-original-vi-forward-word -- "$@"',
      '    return $?',
      '  fi',
      '',
      '  local original_buffer="$BUFFER"',
      '  local -i original_cursor=$CURSOR',
      '',
      '  suggestion_style="${suggestion_style##* }"',
      '  BUFFER+="$POSTDISPLAY"',
      '',
      '  if (( accepted_length > ${#original_buffer} )); then',
      '',
      '    POSTDISPLAY="${BUFFER:$(( accepted_length ))}"',
      '    BUFFER="${BUFFER:0:$(( accepted_length ))}"',
      '    CURSOR=${#BUFFER}',
      '',
      '    if [[ -z $POSTDISPLAY ]]; then',
      '      _sage_clear_state',
      '    fi',
      '  else',
      '    BUFFER="$original_buffer"',
      '    CURSOR=$original_cursor',
      '  fi',
      '',
      '  _sage_highlight_apply "${suggestion_style:-fg=245}"',
      '  zle -R',
      '  return $movement_status',
      '}',
      '',
      'function user_sage_end_of_line() {',
      '  user_sage_accept_or_move \\',
      '    sage-accept user-sage-original-end-of-line "$@"',
      '}',
      '',
      'function user_sage_install_vi_wrapper() {',
      '  local movement_widget saved_widget wrapper_function',
      '',
      '  for movement_widget in \\',
      '    vi-forward-char \\',
      '    vi-forward-word \\',
      '    end-of-line \\',
      '    vi-end-of-line',
      '  do',
      '    saved_widget="user-sage-original-${movement_widget}"',
      '    wrapper_function="user_sage_${movement_widget//-/_}"',
      '',
      '    if (( ! ${+widgets[$saved_widget]} )); then',
      '      zle -A "$movement_widget" "$saved_widget"',
      '      zle -N "$movement_widget" "$wrapper_function"',
      '    fi',
      '  done',
      '}',
      '',
    ].join('\n');

    it('keeps the script from the issue unchanged', () => {
      const result = format(issueScript);
      expect(result).toBe(issueScript);
      expect(format(result)).toBe(result);
    });

    it('rebuilds the indentation of the script from the issue', () => {
      const flattened = issueScript.split('\n').map((line) => line.trimStart()).join('\n');
      expect(format(flattened)).toBe(issueScript);
    });

    it.each([
      'CURSOR=${#BUFFER}',
      'echo ${#}',
      'n=${#items[@]}',
    ])('does not open a block after "%s" at the end of a line', (line) => {
      const input = ['f() {', `  ${line}`, '  echo ok', '}', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it('still opens a block after "{" followed by an inline comment', () => {
      const input = ['f() { # ${#x}', 'echo ok', '}', ''].join('\n');
      const expected = ['f() { # ${#x}', '  echo ok', '}', ''].join('\n');
      expect(format(input)).toBe(expected);
    });

    it.each([
      'end-of-line',
      'end=5',
      'end="$(date +%s)"',
      'end.sh',
      'done=1',
      'done-task --all',
      'fi-tool',
      'endif=1',
      'esac-x',
      'endsw=1',
      'else-x',
      'elif=1',
    ])('does not close a block on the word "%s"', (line) => {
      const input = ['f() {', `  ${line}`, '  echo ok', '}', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it.each([
      'while-x',
      'foreach-x',
      'switch-user root',
      'case-x in',
      'echo foo-then',
      'echo foo-do',
      'to-do',
    ])('does not open a block on the word in "%s"', (line) => {
      const input = ['f() {', `  ${line}`, '  echo ok', '}', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it('treats keywords as plain words in a line-continuation list', () => {
      const input = [
        'for w in \\',
        'end \\',
        'done \\',
        'esac \\',
        'fi \\',
        'last',
        'do',
        'echo "$w"',
        'done',
        'echo end',
        '',
      ].join('\n');

      const expected = [
        'for w in \\',
        '  end \\',
        '  done \\',
        '  esac \\',
        '  fi \\',
        '  last',
        'do',
        '  echo "$w"',
        'done',
        'echo end',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it.each(['# --three', ''])('closes the block after a continued command that ends in "%s"', (lastLine) => {
      const input = [
        'for x in a b; do',
        '  cmd --one \\',
        '    --two \\',
        lastLine,
        'done',
        'echo after',
        'if true; then',
        '  echo ok',
        'fi',
        '',
      ].join('\n');

      // O restante do arquivo não pode ficar deslocado
      expect(format(input).split('\n').slice(-5)).toEqual(['echo after', 'if true; then', '  echo ok', 'fi', '']);
    });

    it('still closes blocks on keywords followed by a shell metacharacter', () => {
      const input = [
        'f() {',
        'if[ -f a ];then',
        'echo a',
        'fi;',
        'for x in a b;do',
        'echo "$x"',
        'done|sort',
        'while read -r l; do',
        'echo "$l"',
        'done<f',
        'y=$(for x in a b; do',
        'echo "$x"',
        'done)',
        'for x in a b; do',
        'echo "$x"',
        'done &',
        '} ;',
        'echo end',
        '',
      ].join('\n');

      const expected = [
        'f() {',
        '  if [ -f a ]; then',
        '    echo a',
        '  fi;',
        '  for x in a b; do',
        '    echo "$x"',
        '  done|sort',
        '  while read -r l; do',
        '    echo "$l"',
        '  done<f',
        '  y=$(for x in a b; do',
        '    echo "$x"',
        '  done)',
        '  for x in a b; do',
        '    echo "$x"',
        '  done &',
        '} ;',
        'echo end',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it.each(['$#', '${#x}'])('keeps the content of a string after %s on the same line', (expansion) => {
      const input = `echo ${expansion} "a   b" 'c   d'\n`;
      expect(format(input)).toBe(input);
    });

    it('tracks a multi-line string opened after $# on the same line', () => {
      const input = [
        'f() {',
        '  [ $# -eq 0 ] && echo "Usage:',
        '  if   then   do"',
        '  echo   ok',
        '}',
        '',
      ].join('\n');

      const expected = [
        'f() {',
        '  [ $# -eq 0 ] && echo "Usage:',
        '  if   then   do"',
        '  echo ok',
        '}',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });
  });

  describe('while loops without "do" at the end of the line', () => {
    it('keeps "do" on the line after "while" at the level of the loop', () => {
      const input = [
        'f() {',
        'while read -r x',
        'do',
        'while (( i < 3 ))',
        '',
        'do',
        'echo "$x"',
        'done',
        'done < file',
        '}',
        'echo end',
        '',
      ].join('\n');

      const expected = [
        'f() {',
        '  while read -r x',
        '  do',
        '    while (( i < 3 ))',
        '',
        '    do',
        '      echo "$x"',
        '    done',
        '  done < file',
        '}',
        'echo end',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
      expect(format(expected)).toBe(expected);
    });

    it.each([
      'while true; do sleep 1; done',
      'while read -r l; do echo "$l"; done < file',
      'while read -r l; do echo "$l"; done | sort # do',
    ])('does not open a block after the one-line loop "%s"', (line) => {
      const input = ['f() {', `  ${line}`, '  echo ok', '}', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it('opens a block when the loop body starts on the "while ...; do" line', () => {
      const input = ['while true; do sleep 1', 'echo ok', 'done', 'echo end', ''].join('\n');
      const expected = ['while true; do sleep 1', '  echo ok', 'done', 'echo end', ''].join('\n');
      expect(format(input)).toBe(expected);
    });

    it('still indents the body of a tcsh while loop', () => {
      const input = ['while ($i < 5)', 'echo $i', '@ i++', 'end', 'echo end', ''].join('\n');
      const expected = ['while ($i < 5)', '  echo $i', '  @ i++', 'end', 'echo end', ''].join('\n');
      expect(format(input)).toBe(expected);
    });
  });

  describe('text of an inline comment does not affect indentation', () => {
    it.each([
      'exit 0 # nothing to do',
      'x=1 # and then',
      'x=1 # {',
      'x=1 # }',
      'x=1 # see case x in',
      'x=1 # | a | b |',
      'x=1 # a && b &&',
      'x=1 # path C:\\',
      'x=1 # it\'s done; fi',
      'echo "a # b" # nothing to do',
    ])('keeps the level after "%s"', (line) => {
      const input = ['f() {', `  ${line}`, '  echo ok', '}', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });

    it('does not close a case branch on ";;" inside a comment', () => {
      const input = [
        'case $x in',
        '  a)',
        '    echo a # see ;;',
        '    echo b',
        '  ;;',
        'esac',
        'echo end',
        '',
      ].join('\n');

      expect(format(input)).toBe(input);
    });

    it('still reads the code before the comment', () => {
      const input = ['if true;then # then', 'for x in a b;do # do', 'f(){ # {', 'echo ok # }', '}', 'done', 'fi', ''].join('\n');

      const expected = [
        'if true; then # then',
        '  for x in a b; do # do',
        '    f() { # {',
        '      echo ok # }',
        '    }',
        '  done',
        'fi',
        '',
      ].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('does not read zsh glob flags and operators with "#" as comments', () => {
      const input = [
        'f() {',
        '  if [[ $x == (#b)(*)=(*) ]]; then',
        '    echo a',
        '  fi',
        '  for f in *(#qN); do',
        '    echo $f',
        '  done',
        '  [[ $x == (*/)#foo ]] &&',
        '    echo b',
        '  files=(*(#i)readme*) # then',
        '  echo c',
        '}',
        'echo end',
        '',
      ].join('\n');

      expect(format(input)).toBe(input);
    });

    it('keeps a full-line comment inside a continued command from ending the continuation', () => {
      const input = ['cmd --one \\', '  # note', '  --two', 'echo end', ''].join('\n');
      expect(format(input)).toBe(input);
    });
  });

  describe('top-level heredoc detection', () => {
    it('keeps formatting after a heredoc whose delimiter has other characters', () => {
      const input = ['cat <<END-MSG', "  it's literal", 'END-MSG', 'if true;then', 'echo ok', 'fi', ''].join('\n');
      const expected = ['cat <<END-MSG', "  it's literal", 'END-MSG', 'if true; then', '  echo ok', 'fi', ''].join('\n');

      expect(format(input)).toBe(expected);
    });

    it('preserves the body of heredocs with quoted or escaped delimiters', () => {
      // O corpo é literal: não pode receber espaçamento nem reindentação.
      const input = ["cat <<'END MSG'", 'if[ x ];then', '    keep   spacing', 'END MSG', 'cat <<\\EOF', 'for(( ;; ))', 'EOF', ''].join('\n');

      expect(format(input)).toBe(input);
    });

    it('keeps formatting after here-strings and arithmetic shifts', () => {
      const input = ['tr a b <<< word', 'x=$(( 1 << 2 ))', '(( y = 1 << n ))', 'if true;then', 'echo ok', 'fi', ''].join('\n');
      const expected = ['tr a b <<< word', 'x=$(( 1 << 2 ))', '(( y = 1 << n ))', 'if true; then', '  echo ok', 'fi', ''].join('\n');

      expect(format(input)).toBe(expected);
    });
  });

  it('keeps lines after an escaped quote outside of quotes', () => {
    const input = ['echo it\\\'s', 'case $x in', '(*\\\'*) echo quote;;', 'esac', 'echo "Test"', ''].join('\n');
    const expected = ['echo it\\\'s', 'case $x in', '  (*\\\'*) echo quote;;', 'esac', 'echo "Test"', ''].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('never drops lines when a string is left open until the end of the file', () => {
    const input = ['echo "unterminated', 'line2', '  line3', ''].join('\n');
    expect(format(input)).toBe(input);
  });

  it('removes leading blank lines', () => {
    const result = format('\n\n#!/bin/bash\necho hi\n');
    expect(result).toBe('#!/bin/bash\necho hi\n');
  });

  it('reduces consecutive blank lines', () => {
    const result = format('echo a\n\n\n\necho b\n');
    expect(result).toBe('echo a\n\necho b\n');
  });

  it('trims trailing whitespace', () => {
    const result = format('echo hi   \necho bye  \n');
    expect(result).toBe('echo hi\necho bye\n');
  });

  it('ensures final newline', () => {
    const result = format('echo hi');
    expect(result).toBe('echo hi\n');
  });

  it('handles CRLF line ending option', () => {
    const result = format('echo hi\n', { lineEnding: 'CRLF' });
    expect(result).toBe('echo hi\r\n');
  });

  it('uses tabs when indentStyle is tab', () => {
    const input = 'if [ true ]; then\necho hi\nfi\n';
    const result = format(input, { indentStyle: 'tab' });
    expect(result).toBe('if [ true ]; then\n\techo hi\nfi\n');
  });

  it('does not match "final" as "fi"', () => {
    const input = 'final_var=1\n';
    const result = format(input);
    expect(result).toBe('final_var=1\n');
  });

  it('preserves double-quoted escaped content', () => {
    const input = 'echo "hello \\"world\\""\n';
    const result = format(input);
    expect(result).toBe('echo "hello \\"world\\""\n');
  });

  it('handles case with ;& fallthrough', () => {
    const input = 'case "$1" in\na)\necho "a"\n;&\nb)\necho "b"\n;;\nesac\n';
    const result = format(input);
    const lines = result.split('\n');
    expect(lines[3]).toBe('  ;&');
    expect(lines[4]).toBe('  b)');
  });

  it('does not treat ) in commands as case pattern (break in case inside while)', () => {
    const input = [
      'while [[ $# -gt 0 ]]; do',
      'case "${1}" in',
      '--path)',
      'scan_path="${2}"',
      'shift 2',
      ';;',
      '--)',
      'shift',
      'trivy_extras=("$@")',
      'break',
      ';;',
      '*)',
      'echo "unknown"',
      ';;',
      'esac',
      'done',
      '',
    ].join('\n');
    const result = format(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('while [[ $# -gt 0 ]]; do');
    expect(lines[1]).toBe('  case "${1}" in');
    expect(lines[2]).toBe('    --path)');
    expect(lines[3]).toBe('      scan_path="${2}"');
    expect(lines[4]).toBe('      shift 2');
    expect(lines[5]).toBe('    ;;');
    expect(lines[6]).toBe('    --)');
    expect(lines[7]).toBe('      shift');
    expect(lines[8]).toBe('      trivy_extras=("$@")');
    expect(lines[9]).toBe('      break');
    expect(lines[10]).toBe('    ;;');
    expect(lines[11]).toBe('    *)');
    expect(lines[12]).toBe('      echo "unknown"');
    expect(lines[13]).toBe('    ;;');
    expect(lines[14]).toBe('  esac');
    expect(lines[15]).toBe('done');
  });

  it('dedents next case label after inline branch terminator', () => {
    const input = [
      'parse_metadata_flags() {',
      'local remaining=()',
      'while [[ $# -gt 0 ]]; do',
      'case "${1}" in',
      '--branch)',
      '[[ -z "${2:-}" ]] && { log_err "Missing value for --branch"; return 2; }',
      'CLI_BRANCH="${2}"; shift 2 ;;',
      '--branch=*)',
      'CLI_BRANCH="${1#--branch=}"; shift ;;',
      '*)',
      'remaining+=("$1"); shift ;;',
      'esac',
      'done',
      '}',
      '',
    ].join('\n');

    const expected = [
      'parse_metadata_flags() {',
      '  local remaining=()',
      '  while [[ $# -gt 0 ]]; do',
      '    case "${1}" in',
      '      --branch)',
      '        [[ -z "${2:-}" ]] && { log_err "Missing value for --branch"; return 2; }',
      '        CLI_BRANCH="${2}"; shift 2 ;;',
      '      --branch=*)',
      '        CLI_BRANCH="${1#--branch=}"; shift ;;',
      '      *)',
      '        remaining+=("$1"); shift ;;',
      '    esac',
      '  done',
      '}',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('preserves nested if indentation before inline case terminator', () => {
    const input = [
      'do_config_scan() {',
      'local args=()',
      'while [[ $# -gt 0 ]]; do',
      'case "${1}" in',
      '*)',
      'if [[ "$target_set" == "false" ]]; then target="$1"; target_set="true"; shift',
      'else break; fi ;;',
      'esac',
      'done',
      '}',
      '',
    ].join('\n');

    const expected = [
      'do_config_scan() {',
      '  local args=()',
      '  while [[ $# -gt 0 ]]; do',
      '    case "${1}" in',
      '      *)',
      '        if [[ "$target_set" == "false" ]]; then target="$1"; target_set="true"; shift',
      '        else break; fi ;;',
      '    esac',
      '  done',
      '}',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('dedents following sibling if after inline fi terminator', () => {
    const input = [
      'auto_detect_path() {',
      'if [[ -n "${CI_PROJECT_DIR:-}" ]]; then',
      'echo "$CI_PROJECT_DIR";',
      'return; fi',
      'if [[ -n "${GITHUB_WORKSPACE:-}" ]]; then',
      'echo "$GITHUB_WORKSPACE";',
      'return; fi',
      'echo "$PWD"',
      '}',
      '',
    ].join('\n');

    const expected = [
      'auto_detect_path() {',
      '  if [[ -n "${CI_PROJECT_DIR:-}" ]]; then',
      '    echo "$CI_PROJECT_DIR";',
      '    return; fi',
      '  if [[ -n "${GITHUB_WORKSPACE:-}" ]]; then',
      '    echo "$GITHUB_WORKSPACE";',
      '    return; fi',
      '  echo "$PWD"',
      '}',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('keeps outer case structure after nested case closes', () => {
    const input = [
      'parse_args() {',
      'while [ "$#" -gt 0 ]; do',
      'case "$1" in',
      '-e|--env)',
      'case "$2" in',
      '-e|--env)',
      'ENVIRONMENT="${2:-}"',
      'shift 2',
      ';;',
      '*)',
      'echo "invalid"',
      ';;',
      'esac',
      ';;',
      '-t|--timeout)',
      'TIMEOUT="${2:-}"',
      'shift 2',
      ';;',
      'esac',
      'done',
      '}',
      '',
    ].join('\n');

    const expected = [
      'parse_args() {',
      '  while [ "$#" -gt 0 ]; do',
      '    case "$1" in',
      '      -e|--env)',
      '        case "$2" in',
      '          -e|--env)',
      '            ENVIRONMENT="${2:-}"',
      '            shift 2',
      '          ;;',
      '          *)',
      '            echo "invalid"',
      '          ;;',
      '        esac',
      '      ;;',
      '      -t|--timeout)',
      '        TIMEOUT="${2:-}"',
      '        shift 2',
      '      ;;',
      '    esac',
      '  done',
      '}',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('preserves indentation inside multiline jq filter string', () => {
    const input = [
      'for sev in "${fail_sev_array[@]}"; do',
      'local sev_upper="${sev^^}"',
      'local sev_count',
      'sev_count=$(jq -r ' + '\\',
      '--arg sev "$sev_upper" ' + '\\',
      "'[",
      '  .Results[]? |',
      '  (',
      '    (.Vulnerabilities[]? // empty),',
      '    (.Misconfigurations[]? // empty),',
      '    (.Secrets[]? // empty)',
      '  ) | select(.Severity == $sev)',
      "] | length' " + '\\',
      '"$output" 2>/dev/null || echo "0")',
      'vuln_found_count=$((vuln_found_count + sev_count))',
      'done',
      '',
    ].join('\n');

    const expected = [
      'for sev in "${fail_sev_array[@]}"; do',
      '  local sev_upper="${sev^^}"',
      '  local sev_count',
      '  sev_count=$(jq -r ' + '\\',
      '    --arg sev "$sev_upper" ' + '\\',
      "    '[",
      '      .Results[]? |',
      '      (',
      '        (.Vulnerabilities[]? // empty),',
      '        (.Misconfigurations[]? // empty),',
      '        (.Secrets[]? // empty)',
      '      ) | select(.Severity == $sev)',
      "    ] | length' " + '\\',
      '    "$output" 2>/dev/null || echo "0")',
      '  vuln_found_count=$((vuln_found_count + sev_count))',
      'done',
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  it('preserves jq json object indentation inside multiline single quote', () => {
    const input = [
      'jq -n ' + '\\',
      '--arg schema "ci-tools-report" ' + '\\',
      '--arg version "1.0" ' + '\\',
      "'{",
      '  schema: $schema,',
      '  version: $version',
      "}' > \"$output_file\"",
      '',
    ].join('\n');

    const expected = [
      'jq -n ' + '\\',
      '  --arg schema "ci-tools-report" ' + '\\',
      '  --arg version "1.0" ' + '\\',
      "  '{",
      '    schema: $schema,',
      '    version: $version',
      "  }' > \"$output_file\"",
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  it('does not keep extra block indentation after multiline quoted object closes', () => {
    const input = [
      'wrap_ci_report() {',
      'local output_file="$1"',
      'jq -n ' + '\\',
      '--arg schema "ci-tools-report" ' + '\\',
      "'{",
      '  schema: $schema',
      "}' > \"$output_file\"",
      'log "Wrapped report saved"',
      '}',
      '',
    ].join('\n');

    const expected = [
      'wrap_ci_report() {',
      '  local output_file="$1"',
      '  jq -n ' + '\\',
      '    --arg schema "ci-tools-report" ' + '\\',
      "    '{",
      '      schema: $schema',
      "    }' > \"$output_file\"",
      '  log "Wrapped report saved"',
      '}',
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  it('normalizes excessive indentation in multiline jq summary string', () => {
    const input = [
      'severity_summary=$(jq -r ' + '\\',
      '  --arg sevs "$fail_severity" \'' ,
      '        ($sevs | split(",") | map(gsub("^\\\\s+|\\\\s+$"; "") | ascii_upcase)) as $slist',
      '        | [ .Results[]? | ((.Vulnerabilities[]? // empty), (.Misconfigurations[]? // empty), (.Secrets[]? // empty)) ] as $v',
      '        | $slist',
      '        | map(. as $sev | "\\($sev): \\($v | map(select(.Severity == $sev)) | length)")',
      '        | .[]',
      '        \'' + ' "$output" 2>/dev/null || true)',
      '',
    ].join('\n');

    const expected = [
      'severity_summary=$(jq -r ' + '\\',
      '  --arg sevs "$fail_severity" \'' ,
      '  ($sevs | split(",") | map(gsub("^\\\\s+|\\\\s+$"; "") | ascii_upcase)) as $slist',
      '  | [ .Results[]? | ((.Vulnerabilities[]? // empty), (.Misconfigurations[]? // empty), (.Secrets[]? // empty)) ] as $v',
      '  | $slist',
      '  | map(. as $sev | "\\($sev): \\($v | map(select(.Severity == $sev)) | length)")',
      '  | .[]',
      '  \'' + ' "$output" 2>/dev/null || true)',
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  it('formats tcsh switch/case blocks with proper nesting', () => {
    const input = [
      'switch ($1)',
      'case "start":',
      'echo "Starting $application..."',
      'breaksw',
      'case "stop":',
      'echo "Stopping $application..."',
      'breaksw',
      'case "restart":',
      'echo "Restarting $application..."',
      'breaksw',
      'default:',
      'echo "Unknown command"',
      'breaksw',
      'endsw',
      '',
    ].join('\n');

    const expected = [
      'switch ($1)',
      '  case "start":',
      '    echo "Starting $application..."',
      '    breaksw',
      '  case "stop":',
      '    echo "Stopping $application..."',
      '    breaksw',
      '  case "restart":',
      '    echo "Restarting $application..."',
      '    breaksw',
      '  default:',
      '    echo "Unknown command"',
      '    breaksw',
      'endsw',
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });

  it('formats tcsh if/else/endif blocks without trailing indentation drift', () => {
    const input = [
      '# Conditional expression',
      'if (-d $configdir) then',
      'echo "Config directory exists"',
      'else',
      'echo "Creating config directory"',
      'mkdir -p $configdir',
      'endif',
      '',
      '# Test file permissions',
      'if (-r $configdir && -w $configdir) then',
      'echo "Config directory is readable and writable"',
      'endif',
      '',
      '# Function definition',
      'set cleanupfiles = 0',
      'alias cleanup "rm -f /tmp/myapp_*; @ cleanupfiles++"',
      '',
      '# Use alias',
      'cleanup',
      '',
      'echo "Cleaned up $cleanupfiles operations"',
      '',
    ].join('\n');

    const expected = [
      '# Conditional expression',
      'if (-d $configdir) then',
      '  echo "Config directory exists"',
      'else',
      '  echo "Creating config directory"',
      '  mkdir -p $configdir',
      'endif',
      '',
      '# Test file permissions',
      'if (-r $configdir && -w $configdir) then',
      '  echo "Config directory is readable and writable"',
      'endif',
      '',
      '# Function definition',
      'set cleanupfiles = 0',
      'alias cleanup "rm -f /tmp/myapp_*; @ cleanupfiles++"',
      '',
      '# Use alias',
      'cleanup',
      '',
      'echo "Cleaned up $cleanupfiles operations"',
      '',
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
  });
});

describe('ShellFormatter.formatDocument', () => {
  it('returns edits when formatting changes the document', () => {
    const formatter = new ShellFormatter(defaultOpts);
    const original = 'if[ true ];then\necho hi\nfi\n';
    const doc = {
      getText: () => original,
      positionAt: (offset: number) => ({ line: 0, character: offset }),
    } as any;

    const edits = formatter.formatDocument(doc);
    expect(edits.length).toBe(1);
    expect(edits[0].newText).toBe('if [ true ]; then\n  echo hi\nfi\n');
  });

  it('returns empty array when document is already formatted', () => {
    const formatter = new ShellFormatter(defaultOpts);
    const original = 'if [ true ]; then\n  echo hi\nfi\n';
    const doc = {
      getText: () => original,
      positionAt: (offset: number) => ({ line: 0, character: offset }),
    } as any;

    const edits = formatter.formatDocument(doc);
    expect(edits).toEqual([]);
  });
});
