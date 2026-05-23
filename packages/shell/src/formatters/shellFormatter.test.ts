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
