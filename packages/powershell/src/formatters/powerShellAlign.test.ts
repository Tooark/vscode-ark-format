import { describe, expect, it, vi } from 'vitest';

vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: unknown, public end: unknown) { }
  },
  TextEdit: {
    replace: (range: unknown, newText: string) => ({ range, newText }),
  },
}));

import { alignPowerShellAssignments, parsePowerShellAssignment } from './powerShellAlign';
import { PowerShellFormatter } from './powerShellFormatter';
import { PowerShellFormatterOptions } from './types';

const defaultOptions: PowerShellFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: true,
  insertFinalNewline: true,
  lineEnding: 'LF',
  collapseSpaces: true
};

function format (input: string, opts?: Partial<PowerShellFormatterOptions>): string {
  return new PowerShellFormatter({ ...defaultOptions, ...opts }).formatText(input);
}

describe('parsePowerShellAssignment', () => {
  it('reconhece atribuições de variável', () => {
    expect(parsePowerShellAssignment('$name = "app"')).toEqual({ indent: '', name: '$name', operator: '=', rest: '"app"' });
    expect(parsePowerShellAssignment('  $total += 1')).toEqual({ indent: '  ', name: '$total', operator: '+=', rest: '1' });
    expect(parsePowerShellAssignment('$env:PATH = "x"')).toEqual({ indent: '', name: '$env:PATH', operator: '=', rest: '"x"' });
    expect(parsePowerShellAssignment('$x ??= 5')).toEqual({ indent: '', name: '$x', operator: '??=', rest: '5' });
  });

  it('reconhece entradas de hashtable', () => {
    expect(parsePowerShellAssignment('  Name = "app"')).toEqual({ indent: '  ', name: 'Name', operator: '=', rest: '"app"' });
    expect(parsePowerShellAssignment("  'Full Name' = 1")).toEqual({ indent: '  ', name: "'Full Name'", operator: '=', rest: '1' });
  });

  it('não reconhece comparações, comandos e defaults de param', () => {
    expect(parsePowerShellAssignment('$x -eq 5')).toBeNull();
    expect(parsePowerShellAssignment('Write-Host "a = b"')).toBeNull();
    expect(parsePowerShellAssignment('[string]$Name = "x"')).toBeNull();
    expect(parsePowerShellAssignment('if ($x) {')).toBeNull();
  });
});

describe('alignPowerShellAssignments - blocos de variáveis', () => {
  it('alinha operadores pelo caractere = final', () => {
    const input = '$name = "app"\n$version = "1.0.0"\n$x += 1\n';
    const expected = '$name    = "app"\n$version = "1.0.0"\n$x      += 1\n';

    expect(alignPowerShellAssignments(input)).toBe(expected);
  });

  it('linhas em branco e comentários encerram o bloco', () => {
    const input = '$a = 1\n\n$longer = 2\n';

    expect(alignPowerShellAssignments(input)).toBe(input);
  });

  it('indentação diferente separa os blocos', () => {
    const input = '$a = 1\n  $longer = 2\n';

    expect(alignPowerShellAssignments(input)).toBe(input);
  });

  it('continuações com crase não encerram o bloco', () => {
    const input = '$abc = Get-Item `\n  -Path x\n$de = 1\n';
    const expected = '$abc = Get-Item `\n  -Path x\n$de  = 1\n';

    expect(alignPowerShellAssignments(input)).toBe(expected);
  });

  it('não altera conteúdo de here-strings', () => {
    const input = '$a = @"\nx = 1\nlonger = 2\n"@\n$bb = 1\n';

    expect(alignPowerShellAssignments(input)).toBe(input);
  });

  it('não altera conteúdo de blocos de comentário', () => {
    const input = '<#\nx = 1\nlonger = 2\n#>\n';

    expect(alignPowerShellAssignments(input)).toBe(input);
  });

  it('alinha texto com quebras de linha CRLF, preservando o CRLF', () => {
    const input = '$name = "app"\r\n$version = "1.0.0"\r\n';
    const expected = '$name    = "app"\r\n$version = "1.0.0"\r\n';

    expect(alignPowerShellAssignments(input)).toBe(expected);
  });

  it('com CRLF, here-strings continuam intocadas', () => {
    const input = '$a = @"\r\nx = 1\r\nlonger = 2\r\n"@\r\n';

    expect(alignPowerShellAssignments(input)).toBe(input);
  });
});

describe('PowerShellFormatter - alignAssignments', () => {
  it('desligado (padrão): collapseSpaces normaliza alinhamento existente', () => {
    const input = '$name    = "app"\n$version = "1.0.0"\n';

    expect(format(input)).toBe('$name = "app"\n$version = "1.0.0"\n');
  });

  it('ligado: alinha blocos de variáveis', () => {
    const input = '$name = "app"\n$version = "1.0.0"\n';

    expect(format(input, { alignAssignments: true })).toBe('$name    = "app"\n$version = "1.0.0"\n');
  });

  it('ligado: alinha entradas de hashtable no nível de indentação delas', () => {
    const input = '$config = @{\nName = "app"\nVersion = "1.0.0"\nDescription = "x"\n}\n';
    const expected = '$config = @{\n  Name        = "app"\n  Version     = "1.0.0"\n  Description = "x"\n}\n';

    expect(format(input, { alignAssignments: true })).toBe(expected);
  });

  it('ligado: não altera here-strings nem comentários de bloco', () => {
    const input = '$a = @"\nx = 1\nlonger = 2\n"@\n<#\ny = 1\nmuitolongo = 2\n#>\n';

    expect(format(input, { alignAssignments: true })).toBe(input);
  });

  it('nome acima do limite fica fora do alinhamento', () => {
    const huge = `$${'x'.repeat(45)}`;
    const input = `$a = 1\n$bb = 2\n${huge} = 3\n`;

    expect(format(input, { alignAssignments: true })).toBe(`$a  = 1\n$bb = 2\n${huge} = 3\n`);
  });

  it('é idempotente com a opção ligada', () => {
    const input = '$name = "app"\n$version = "1.0.0"\n\n$config = @{\nName = 1\nLongKey = 2\n}\n';
    const once = format(input, { alignAssignments: true });

    expect(format(once, { alignAssignments: true })).toBe(once);
  });

  it('desligado remove o alinhamento produzido anteriormente (normaliza, não ignora)', () => {
    const aligned = format('$name = "app"\n$version = "1.0.0"\n', { alignAssignments: true });

    expect(format(aligned)).toBe('$name = "app"\n$version = "1.0.0"\n');
  });

  it('ligado com lineEnding CRLF (padrão da extensão): alinha os blocos', () => {
    const input = '$config = @{\nRetryCount = 3\nDelayMs = 250\nOwner = "time-plataforma"\n}\n';
    const expected = '$config = @{\r\n  RetryCount = 3\r\n  DelayMs    = 250\r\n  Owner      = "time-plataforma"\r\n}\r\n';

    expect(format(input, { alignAssignments: true, lineEnding: 'CRLF' })).toBe(expected);
  });

  it('é idempotente com a opção ligada e CRLF', () => {
    const input = '$name = "app"\r\n$version = "1.0.0"\r\n';
    const once = format(input, { alignAssignments: true, lineEnding: 'CRLF' });

    expect(format(once, { alignAssignments: true, lineEnding: 'CRLF' })).toBe(once);
  });

  it('nunca converte um operador em outro', () => {
    const output = format('$a = 1\n$total += 2\n$rest ??= 3\n', { alignAssignments: true });

    expect(output).toContain(' = 1');
    expect(output).toContain('+= 2');
    expect(output).toContain('??= 3');
  });
});
