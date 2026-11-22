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
  it('preserva espaços de alinhamento em bloco de comentários de cabeçalho', () => {
    const input = [
      '#!/usr/bin/env pwsh',
      '# ============================================================',
      '# Uso:',
      '#   ./build.ps1                        perfil rápido: build + testes',
      '#   ./build.ps1 -Target Test           executa apenas os testes',
      '#                                      (padrão: todos os projetos)',
      '#',
      '# Env:',
      '#   BUILD_SKIP_TESTS=1   pula a etapa de testes',
      '# ============================================================',
      'Set-StrictMode -Version Latest',
      '',
    ].join('\n');

    expect(format(input)).toBe(input);
  });

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

  describe('aspas aninhadas em subexpressão "$(...)" (equivalente PowerShell da issue #34)', () => {
    const line = 'Write-Host "Nome: $($user.Name.Trim(\'"\'))"';

    it.each([1, 2, 3])('formata as linhas seguintes com %i ocorrência(s) da linha', (count) => {
      const input = [...Array<string>(count).fill(line), 'if ($true) {', 'Write-Host   next', '}', ''].join('\n');
      const expected = [...Array<string>(count).fill(line), 'if ($true) {', '  Write-Host next', '}', ''].join('\n');

      const result = format(input);
      expect(result).toBe(expected);
      expect(format(result)).toBe(result);
    });

    it('preserva subexpressão multilinha com aspas aninhadas', () => {
      const input = [
        '$msg = "Itens: $(',
        '  $items | ForEach-Object { "\'$_\'" }',
        ')"',
        'Write-Host $msg',
        ''
      ].join('\n');

      expect(format(input)).toBe(input);
    });

    it('preserva corpo e terminador de here-string dentro de subexpressão em bloco indentado', () => {
      const input = [
        'if ($true) {',
        "$msg = \"Texto: $(@'",
        "it's literal",
        "'@",
        ')"',
        'Write-Host   ok',
        '}',
        ''
      ].join('\n');

      const expected = [
        'if ($true) {',
        "  $msg = \"Texto: $(@'",
        "it's literal",
        "'@",
        '  )"',
        '  Write-Host ok',
        '}',
        ''
      ].join('\n');

      const result = format(input);
      expect(result).toBe(expected);
      expect(format(result)).toBe(result);
    });
  });

  it('formata as linhas seguintes a aspas escapadas com crase fora de strings', () => {
    const input = ['Write-Host it`\'s', 'if ($true) {', 'Write-Host   next', '}', ''].join('\n');
    const expected = ['Write-Host it`\'s', 'if ($true) {', '  Write-Host next', '}', ''].join('\n');

    expect(format(input)).toBe(expected);
  });

  it('não descarta linhas quando uma string fica aberta até o fim do arquivo', () => {
    // Regressão (issue #34, correção no pacote compartilhado): o buffer de string multilinha
    // só era descarregado quando a string fechava.
    const input = [
      'Write-Host "sem fechamento',
      'linha2',
      '  linha3',
      ''
    ].join('\n');

    expect(format(input)).toBe(input);
  });
});

describe('PowerShellFormatter.formatText: blocos de uma linha, # no meio de palavras e diretivas', () => {
  // Os casos ficam dentro de uma função: no nível 0 o deslocamento para a esquerda não aparece.
  const inFunction = (...lines: string[]): string => ['function Test {', ...lines.map((line) => `  ${line}`), '}', 'Write-Host end', ''].join('\n');

  it.each([
    [['try { Get-Item x }', 'catch { Write-Host err }', 'finally { Write-Host done }']],
    [['if ($a) { 1 }', 'elseif ($b) { 2 }', 'else { 3 }']],
    [['if ($a) { 1 }', 'else {', '  2', '}']],
    [['try {', '  Get-Item x', '}', 'catch {', '  Write-Host err', '}']],
    [['try {', '  Get-Item x', '} catch { Write-Host err }']],
    [['if ($a) { 1 } else {', '  2', '}']],
    [['switch ($x) {', "  'a' { 1 }", "  'b' { 2 }", '  default { 3 }', '}']],
  ])('mantém o nível das cláusulas em %j', (lines) => {
    const input = inFunction(...lines, 'Write-Host after');
    expect(format(input)).toBe(input);
  });

  it('reconstrói a indentação de cláusulas após blocos de uma linha', () => {
    const expected = inFunction('try { Get-Item x }', 'catch { Write-Host err }', 'if ($a) { 1 }', 'else { 2 }', 'Write-Host after');
    const flattened = expected.split('\n').map((line) => line.trimStart()).join('\n');
    expect(format(flattened)).toBe(expected);
  });

  it.each([
    'Catch-Errors $x',
    'Finally-Cleanup',
    'else-branch 1',
    'ElseIf-Thing',
  ])('não trata o comando "%s" como cláusula', (line) => {
    const input = inFunction(line, 'Write-Host after');
    expect(format(input)).toBe(input);
  });

  it('não trata chaves de hashtable com nome de palavra-chave como cláusulas', () => {
    const input = inFunction('$map = @{', '  If = 1', '  Else = 2', '  Catch = 3', '  Finally = 4', '}', 'Write-Host after');
    expect(format(input)).toBe(input);
  });

  it('acompanha o saldo de chaves quando o bloco abre ou fecha no meio da linha', () => {
    const input = [
      'function Test { param($a)',
      'Write-Host $a }',
      '$items | Where-Object { $_.A -and',
      '$_.B }',
      'Write-Host end',
      '',
    ].join('\n');

    const expected = [
      'function Test { param($a)',
      '  Write-Host $a }',
      '$items | Where-Object { $_.A -and',
      '  $_.B }',
      'Write-Host end',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it('alinha "})" e "}}" com a linha que abriu os blocos', () => {
    const input = [
      'function Test {',
      '$items.ForEach({',
      'Write-Host $_',
      '})',
      'if ($a) { if ($b) {',
      'Write-Host 1',
      '}}',
      '$x = (Get-Item a',
      ') -join (',
      "','",
      ')',
      '}',
      'Write-Host end',
      '',
    ].join('\n');

    const expected = [
      'function Test {',
      '  $items.ForEach({',
      '      Write-Host $_',
      '  })',
      '  if ($a) { if ($b) {',
      '      Write-Host 1',
      '  }}',
      '  $x = (Get-Item a',
      '  ) -join (',
      "    ','",
      '  )',
      '}',
      'Write-Host end',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });

  it.each([
    'dotnet new console -lang C# -o "My   App"',
    'Write-Host a#b "x   y"',
    'git config color.ui=#ff0000 "a   b"',
    'Invoke-RestMethod https://x.io/#/api -Body "a   b"',
    'Write-Host `# "a   b"',
  ])('não trata o # no meio de uma palavra como comentário em "%s"', (line) => {
    const input = `${line}\n`;
    expect(format(input)).toBe(input);
  });

  it('abre o bloco em uma linha com # no meio de uma palavra', () => {
    const input = ['Invoke-RestMethod https://x.io/#/api | ForEach-Object {', '$_', '}', 'Write-Host end', ''].join('\n');
    const expected = ['Invoke-RestMethod https://x.io/#/api | ForEach-Object {', '  $_', '}', 'Write-Host end', ''].join('\n');
    expect(format(input)).toBe(expected);
  });

  it('reconhece a here-string aberta em uma linha com # no meio de uma palavra', () => {
    const input = [
      'function Test {',
      '  $code = New-Snippet -Lang C# -Body @"',
      'class   A { }',
      "    // it's kept",
      '"@',
      '  Write-Host after',
      '}',
      '',
    ].join('\n');

    expect(format(input)).toBe(input);
  });

  it.each([
    '$x = 1    # texto   alinhado',
    '$x = "a"# cola   na string',
    'foo(1)# após   parêntese',
    '$a = @(1,# após   vírgula',
  ])('continua tratando como comentário em "%s"', (line) => {
    const result = format(`${line}\n2)\n`).split('\n')[0];
    expect(result.slice(result.indexOf('#'))).toBe(line.slice(line.indexOf('#')));
  });

  it.each([
    '#Requires -Version 7.0',
    '#requires -Modules Az',
    '#region Setup',
    '#Region Setup',
    '#endregion',
    '#endregion Setup',
  ])('mantém a diretiva "%s" sem espaço após o #', (line) => {
    const input = inFunction(line, 'Write-Host after');
    expect(format(input)).toBe(input);
  });

  it('continua inserindo espaço em comentários comuns que começam como uma diretiva', () => {
    expect(format('#regional settings\n#requirements\n#comentário\n')).toBe('# regional settings\n# requirements\n# comentário\n');
  });

  it('mantém variáveis entre chaves como estão', () => {
    const input = inFunction('if (${#CANCAPTUREARGS#}) {', '  ${a  b} = ${env:ProgramFiles(x86)}', '}', '${x} = ${function:Test} -Params @{ A = 1 }', 'Write-Host after');
    expect(format(input)).toBe(input);
  });

  it('colapsa espaços ao redor de variáveis entre chaves', () => {
    expect(format('Start-Thread   ${function:Detail}   -Params   ${p}   # c   d\n')).toBe('Start-Thread ${function:Detail} -Params ${p} # c   d\n');
  });

  it('trata comentários de bloco no meio da linha como comentário', () => {
    const input = [
      'function Test {',
      'if ($a) { <# why   {{ #>',
      'Write-Host 1',
      '}',
      "if ($b) <# don't   } #> {",
      'Write-Host 2',
      '}',
      '$x = 1 <# c   d #> + 2   # e   f',
      '}',
      'Write-Host end',
      '',
    ].join('\n');

    const expected = [
      'function Test {',
      '  if ($a) { <# why   {{ #>',
      '    Write-Host 1',
      '  }',
      "  if ($b) <# don't   } #> {",
      '    Write-Host 2',
      '  }',
      '  $x = 1 <# c   d #> + 2 # e   f',
      '}',
      'Write-Host end',
      '',
    ].join('\n');

    expect(format(input)).toBe(expected);
    expect(format(expected)).toBe(expected);
  });
});

describe('PowerShellFormatter.formatText: chaves em linhas de continuação', () => {
  it.each([
    [['Invoke-Command -ScriptBlock { Get-Service `', '    -Name foo }']],
    [['$a = $items | Where-Object { $_.A -and', '  $_.B } |', '  Sort-Object']],
    [['$items | ForEach-Object { $_.Group |', '    Sort-Object Name }']],
    [['$x = @{ A = 1 `', '    B = 2 }']],
    [['$items | ForEach-Object {', '  $_', '} |', '  Sort-Object']],
    [['$x = (Get-Item a |', '  Sort-Object)']],
  ])('mantém o restante da função no nível em %j', (lines) => {
    const input = ['function Test {', ...lines.map((line) => `  ${line}`), '  Write-Host after', '}', 'Write-Host end', ''].join('\n');

    expect(format(input)).toBe(input);
  });

  it('reconstrói a indentação de um bloco aberto em linha de continuação', () => {
    const expected = [
      'function Test {',
      '  Invoke-Command -ScriptBlock { Get-Service `',
      '      -Name foo }',
      '  $a = $items | Where-Object { $_.A -and',
      '    $_.B } |',
      '    Sort-Object',
      '  Write-Host after',
      '}',
      'Write-Host end',
      '',
    ].join('\n');

    const flattened = expected.split('\n').map((line) => line.trimStart()).join('\n');

    expect(format(flattened)).toBe(expected);
  });
});
