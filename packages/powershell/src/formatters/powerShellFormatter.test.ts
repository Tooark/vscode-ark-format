import { describe, expect, it, vi } from 'vitest';

vi.mock('vscode', () => ({
  Range: class {
    constructor (public start: unknown, public end: unknown) { }
  },
  TextEdit: {
    replace: (range: unknown, newText: string) => ({ range, newText }),
  },
}));

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

describe('PowerShellFormatter.formatDocument', () => {
  it('retorna edição quando texto muda', () => {
    const formatter = new PowerShellFormatter(defaultOptions);
    const doc = {
      getText: () => 'function Test{\nWrite-Host "ok"\n}\n',
      positionAt: (offset: number) => ({ offset }),
    } as any;
    const edits = formatter.formatDocument(doc);
    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe('function Test {\n  Write-Host "ok"\n}\n');
  });

  it('retorna array vazio quando texto não muda', () => {
    const formatter = new PowerShellFormatter(defaultOptions);
    const doc = {
      getText: () => 'Write-Host "ok"\n',
      positionAt: (offset: number) => ({ offset }),
    } as any;
    const edits = formatter.formatDocument(doc);
    expect(edits).toHaveLength(0);
  });
});

describe('PowerShellFormatter.formatText', () => {
  it('indenta conteúdo dentro de bloco param multilinha', () => {
    const input = [
      'param (',
      '[Parameter(Mandatory = $false)]',
      '[string]$Name = "Mundo",',
      '',
      '[Parameter(Mandatory = $false)]',
      '[string]$Greeting = "Olá"',
      ')',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      'param (',
      '  [Parameter(Mandatory = $false)]',
      '  [string]$Name = "Mundo",',
      '',
      '  [Parameter(Mandatory = $false)]',
      '  [string]$Greeting = "Olá"',
      ')',
      ''
    ].join('\n'));
  });

  it('formata bloco de função com indentação', () => {
    const input = 'function Test{\nWrite-Host "ok"\n}\n';
    const result = format(input);

    expect(result).toBe('function Test {\n  Write-Host "ok"\n}\n');
  });

  it('alinha else/catch/finally no mesmo nível do bloco anterior', () => {
    const input = [
      'try {',
      'Write-Host "a"',
      '} catch {',
      'Write-Host "b"',
      '} finally {',
      'Write-Host "c"',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      'try {',
      '  Write-Host "a"',
      '} catch {',
      '  Write-Host "b"',
      '} finally {',
      '  Write-Host "c"',
      '}',
      ''
    ].join('\n'));
  });

  it('não dedenta duas vezes catch/finally em linha própria após } isolado', () => {
    const input = [
      'function Invoke-X {',
      '  try {',
      '    $a = 1',
      '  }',
      'catch {',
      '  Write-Warning "x"',
      '}',
      'finally {',
      '  Write-Host "y"',
      '}',
      '}',
      ''
    ].join('\n');

    const expected = [
      'function Invoke-X {',
      '  try {',
      '    $a = 1',
      '  }',
      '  catch {',
      '    Write-Warning "x"',
      '  }',
      '  finally {',
      '    Write-Host "y"',
      '  }',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
    expect(format(result)).toBe(expected);
  });

  it('não dedenta duas vezes else em linha própria após } isolado', () => {
    const input = [
      'if ($x) {',
      '  Write-Host "a"',
      '}',
      'else {',
      '  Write-Host "b"',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(input);
  });

  it('indenta conteúdo de array @( ) multilinha dentro de hashtable', () => {
    const input = [
      '@{',
      '  FunctionsToExport = @(',
      "  'Get-EnvironmentInfo'",
      "  'Invoke-Backup'",
      '  )',
      '}',
      ''
    ].join('\n');

    const expected = [
      '@{',
      '  FunctionsToExport = @(',
      "    'Get-EnvironmentInfo'",
      "    'Invoke-Backup'",
      '  )',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
    expect(format(result)).toBe(expected);
  });

  it('indenta conteúdo de array @( ) multilinha no nível raiz', () => {
    const input = [
      '$lista = @(',
      "'item1'",
      "'item2'",
      ')',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      '$lista = @(',
      "  'item1'",
      "  'item2'",
      ')',
      ''
    ].join('\n'));
  });

  it('indenta hashtable dentro de array multilinha acumulando níveis', () => {
    const input = [
      '$itens = @(',
      '@{',
      "Nome = 'a'",
      'Valor = 1',
      '}',
      '@{',
      "Nome = 'b'",
      'Valor = 2',
      '}',
      ')',
      ''
    ].join('\n');

    const expected = [
      '$itens = @(',
      '  @{',
      "    Nome = 'a'",
      '    Valor = 1',
      '  }',
      '  @{',
      "    Nome = 'b'",
      '    Valor = 2',
      '  }',
      ')',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(expected);
    expect(format(result)).toBe(expected);
  });

  it('indenta subexpressão $( ) e chamada com argumentos quebrados em várias linhas', () => {
    const input = [
      '$x = $(',
      'Get-Date',
      ')',
      'Write-Host (',
      '"a"',
      ')',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      '$x = $(',
      '  Get-Date',
      ')',
      'Write-Host (',
      '  "a"',
      ')',
      ''
    ].join('\n'));
  });

  it('não altera array @( ) em linha única', () => {
    const input = "$tags = @('a', 'b')\n";

    expect(format(input)).toBe(input);
  });

  it('preserva here-string contendo @( e ) no texto', () => {
    const input = [
      '$texto = @"',
      'exemplo com @(',
      'e fechamento )',
      '"@',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(input);
    expect(format(result)).toBe(input);
  });

  it('preserva conteúdo de here-string', () => {
    const input = [
      '$text = @"',
      '  linha interna',
      '    mantém indentação literal',
      '"@',
      'Write-Host $text',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      '$text = @"',
      '  linha interna',
      '    mantém indentação literal',
      '"@',
      'Write-Host $text',
      ''
    ].join('\n'));
  });

  it('preserva here-string @\' indentada dentro de bloco (terminador na coluna 0)', () => {
    const input = [
      "if (-not ('Win32Job' -as [type])) {",
      "  Add-Type -TypeDefinition @'",
      'using System;',
      'public static class Win32Job {',
      '    static extern IntPtr CreateJobObject(IntPtr a, string n);',
      '}',
      "'@",
      '}',
      ''
    ].join('\n');

    const result = format(input);
    // O corpo e o terminador '@ devem permanecer verbatim (sem reindentação).
    expect(result).toBe([
      "if (-not ('Win32Job' -as [type])) {",
      "  Add-Type -TypeDefinition @'",
      'using System;',
      'public static class Win32Job {',
      '    static extern IntPtr CreateJobObject(IntPtr a, string n);',
      '}',
      "'@",
      '}',
      ''
    ].join('\n'));
    // Idempotência: formatar de novo não altera nada.
    expect(format(result)).toBe(result);
  });

  it('preserva here-string @" indentada dentro de bloco (terminador na coluna 0)', () => {
    const input = [
      'function Get-Report {',
      '  $body = @"',
      '  conteúdo literal',
      '    com indentação própria',
      '"@',
      '  return $body',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      'function Get-Report {',
      '  $body = @"',
      '  conteúdo literal',
      '    com indentação própria',
      '"@',
      '  return $body',
      '}',
      ''
    ].join('\n'));
    expect(format(result)).toBe(result);
  });

  it('não trata # escapado com crase como comentário', () => {
    const input = 'Write-Host `#naoComentario\n';
    const result = format(input);
    expect(result).toBe('Write-Host `#naoComentario\n');
  });

  it('mantém comentário em bloco sem alteração por padrão (formatBlockComments desabilitado)', () => {
    const input = [
      '<#',
      '    .SYNOPSIS',
      '        Exemplo de script.',
      '',
      '    .DESCRIPTION',
      '        Descrição detalhada.',
      '#>',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe(input);
  });

  it('reindenta comentário em bloco quando formatBlockComments está habilitado', () => {
    const input = [
      '<#',
      '        .SYNOPSIS',
      '    Exemplo de script.',
      '',
      '            .DESCRIPTION',
      '  Descrição detalhada.',
      '#>',
      ''
    ].join('\n');

    const result = format(input, { formatBlockComments: true });
    expect(result).toBe([
      '<#',
      '  .SYNOPSIS',
      '    Exemplo de script.',
      '',
      '  .DESCRIPTION',
      '    Descrição detalhada.',
      '#>',
      ''
    ].join('\n'));
  });

  it('reindenta comentário em bloco respeitando a indentação do código ao redor', () => {
    const input = [
      'function Test {',
      '<#',
      '.SYNOPSIS',
      'Resumo.',
      '#>',
      'Write-Host "ok"',
      '}',
      ''
    ].join('\n');

    const result = format(input, { formatBlockComments: true });
    expect(result).toBe([
      'function Test {',
      '  <#',
      '    .SYNOPSIS',
      '      Resumo.',
      '  #>',
      '  Write-Host "ok"',
      '}',
      ''
    ].join('\n'));
  });

  it('não trata comentário de bloco em linha única (<# ... #>) como bloco multilinha', () => {
    const input = 'Write-Host "ok" <# inline #>\n';
    const result = format(input, { formatBlockComments: true });
    expect(result).toBe('Write-Host "ok" <# inline #>\n');
  });

  it('aplica CRLF quando configurado', () => {
    const result = format('Write-Host "ok"\n', { lineEnding: 'CRLF' });
    expect(result).toBe('Write-Host "ok"\r\n');
  });

  it('não colapsa espaços quando collapseSpaces é false', () => {
    const result = format('$x  =  1\n', { collapseSpaces: false });
    expect(result).toBe('$x  =  1\n');
  });

  it('mantém indentação correta em switch aninhado', () => {
    const input = [
      'switch ($mode) {',
      'default {',
      'switch ($submode) {',
      '"A" {',
      'Write-Host "A"',
      '}',
      'default {',
      'Write-Host "default"',
      '}',
      '}',
      '}',
      '}',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      'switch ($mode) {',
      '  default {',
      '    switch ($submode) {',
      '      "A" {',
      '        Write-Host "A"',
      '      }',
      '      default {',
      '        Write-Host "default"',
      '      }',
      '    }',
      '  }',
      '}',
      ''
    ].join('\n'));
  });

  it('não gera drift após if/else em uma linha', () => {
    const input = [
      'if ($ok) { Write-Host "ok" } else { Write-Host "fail" }',
      'Write-Host "next"',
      ''
    ].join('\n');

    const result = format(input);
    expect(result).toBe([
      'if ($ok) { Write-Host "ok" } else { Write-Host "fail" }',
      'Write-Host "next"',
      ''
    ].join('\n'));
  });
});
