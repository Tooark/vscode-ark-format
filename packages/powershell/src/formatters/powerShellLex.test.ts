import { describe, it, expect } from 'vitest';
import { splitByQuotesPreserve, getCodePartsOnly, getQuoteModeAfterLine, detectHeredocInCode, isCommentStart, isShebang, isFullLineComment, isHereStringLine } from './powerShellLex';

describe('splitByQuotesPreserve', () => {
  it('retorna código puro sem aspas', () => {
    const result = splitByQuotesPreserve('Write-Host hello');
    expect(result).toEqual([{ kind: 'code', text: 'Write-Host hello' }]);
  });

  it('detecta string de aspas simples', () => {
    const result = splitByQuotesPreserve("Write-Host 'hello'");
    expect(result).toEqual([
      { kind: 'code', text: 'Write-Host ' },
      { kind: 'sq', text: "'hello'" }
    ]);
  });

  it('detecta string de aspas duplas', () => {
    const result = splitByQuotesPreserve('Write-Host "hello"');
    expect(result).toEqual([
      { kind: 'code', text: 'Write-Host ' },
      { kind: 'dq', text: '"hello"' }
    ]);
  });

  it('lida com escape de crase em aspas duplas', () => {
    const result = splitByQuotesPreserve('Write-Host "he`"llo"');
    expect(result).toEqual([
      { kind: 'code', text: 'Write-Host ' },
      { kind: 'dq', text: '"he`"llo"' }
    ]);
  });

  it('detecta comentário inline', () => {
    const result = splitByQuotesPreserve('$x = 1 # comment');
    expect(result).toEqual([{ kind: 'code', text: '$x = 1 # comment' }]);
  });

  it('não trata # escapado com crase como comentário', () => {
    const result = splitByQuotesPreserve('Write-Host `#naoComentario');
    expect(result).toEqual([{ kind: 'code', text: 'Write-Host `#naoComentario' }]);
  });

  it('lida com string não fechada no final da linha', () => {
    const result = splitByQuotesPreserve("Write-Host 'aberta");
    expect(result).toEqual([
      { kind: 'code', text: 'Write-Host ' },
      { kind: 'sq', text: "'aberta" }
    ]);
  });

  it('lida com múltiplas strings na mesma linha', () => {
    const result = splitByQuotesPreserve("'a' + 'b'");
    expect(result).toEqual([
      { kind: 'sq', text: "'a'" },
      { kind: 'code', text: ' + ' },
      { kind: 'sq', text: "'b'" }
    ]);
  });
});

describe('getCodePartsOnly', () => {
  it('retorna código sem strings', () => {
    const result = getCodePartsOnly('$x = "value" + $y');
    expect(result).toBe('$x =  + $y');
  });

  it('ignora conteúdo de string de aspas simples', () => {
    const result = getCodePartsOnly("if ('{ test }') {");
    expect(result).toBe('if () {');
  });

  it('para no comentário inline', () => {
    const result = getCodePartsOnly('$x = 1 # restante');
    expect(result).toBe('$x = 1 ');
  });

  it('lida com here-string @"', () => {
    const result = getCodePartsOnly('$x = @"');
    expect(result).toBe('$x = ');
  });

  it("lida com here-string @'", () => {
    const result = getCodePartsOnly("$x = @'");
    expect(result).toBe('$x = ');
  });

  it('retorna @ como código após terminador hereDq (mode transita para code)', () => {
    // Quando input.trim() === '"@', mode transita para code no '"', e '@' é adicionado como código
    const result = getCodePartsOnly('"@', 'hereDq');
    expect(result).toBe('@');
  });

  it('retorna @ como código após terminador hereSq (mode transita para code)', () => {
    // Quando input.trim() === "'@", mode transita para code no "'", e '@' é adicionado como código
    const result = getCodePartsOnly("'@", 'hereSq');
    expect(result).toBe('@');
  });

  it('respeita initialMode sq - ignora conteúdo até fechar aspas', () => {
    const result = getCodePartsOnly("continuacao' + $x", 'sq');
    expect(result).toBe(' + $x');
  });

  it('respeita initialMode dq - ignora conteúdo até fechar aspas duplas', () => {
    const result = getCodePartsOnly('continuacao" + $x', 'dq');
    expect(result).toBe(' + $x');
  });

  it('escape de crase em aspas duplas não fecha a string', () => {
    const result = getCodePartsOnly('test`" still" + $y', 'dq');
    expect(result).toBe(' + $y');
  });

  it('não trata # escapado com crase como comentário', () => {
    const result = getCodePartsOnly('Write-Host `#tag');
    expect(result).toBe('Write-Host `#tag');
  });
});

describe('getQuoteModeAfterLine', () => {
  it('retorna code para linha sem aspas', () => {
    expect(getQuoteModeAfterLine('Write-Host hello')).toBe('code');
  });

  it('retorna code para string fechada', () => {
    expect(getQuoteModeAfterLine('$x = "valor"')).toBe('code');
  });

  it('retorna dq para string não fechada', () => {
    expect(getQuoteModeAfterLine('$x = "valor')).toBe('dq');
  });

  it('retorna sq para string simples não fechada', () => {
    expect(getQuoteModeAfterLine("$x = 'valor")).toBe('sq');
  });

  it('retorna hereDq para início de here-string @"', () => {
    expect(getQuoteModeAfterLine('$x = @"')).toBe('hereDq');
  });

  it("retorna hereSq para início de here-string @'", () => {
    expect(getQuoteModeAfterLine("$x = @'")).toBe('hereSq');
  });

  it('fecha hereDq ao encontrar "@ como trim da linha', () => {
    expect(getQuoteModeAfterLine('"@', 'hereDq')).toBe('code');
  });

  it("fecha hereSq ao encontrar '@ como trim da linha", () => {
    expect(getQuoteModeAfterLine("'@", 'hereSq')).toBe('code');
  });

  it('mantém hereDq se linha não for terminador', () => {
    expect(getQuoteModeAfterLine('conteúdo interno', 'hereDq')).toBe('hereDq');
  });

  it('mantém hereSq se linha não for terminador', () => {
    expect(getQuoteModeAfterLine('conteúdo interno', 'hereSq')).toBe('hereSq');
  });

  it('lida com escape de crase em aspas duplas', () => {
    expect(getQuoteModeAfterLine('"test`"still"')).toBe('code');
  });

  it('para no comentário inline e retorna code', () => {
    expect(getQuoteModeAfterLine('$x = 1 # comentário')).toBe('code');
  });

  it('não trata # escapado com crase como comentário', () => {
    expect(getQuoteModeAfterLine('Write-Host `#tag')).toBe('code');
  });
});

describe('detectHeredocInCode', () => {
  it("detecta abertura de here-string verbatim @' e retorna o terminador '@", () => {
    expect(detectHeredocInCode("$text = @'")).toBe("'@");
  });

  it('detecta abertura de here-string expansível @" e retorna o terminador "@', () => {
    expect(detectHeredocInCode('$text = @"')).toBe('"@');
  });

  it('detecta here-string mesmo com string comum antes na mesma linha', () => {
    expect(detectHeredocInCode('$x = "prefix" + @"')).toBe('"@');
  });

  it('retorna null quando não há heredoc', () => {
    expect(detectHeredocInCode('Write-Host "hello"')).toBeNull();
  });

  it("não detecta @' dentro de string", () => {
    expect(detectHeredocInCode("Write-Host \"@'\"")).toBeNull();
  });
});

describe('isShebang', () => {
  it('detecta shebang', () => {
    expect(isShebang('#!/usr/bin/env pwsh')).toBe(true);
  });

  it('não detecta linha normal como shebang', () => {
    expect(isShebang('Write-Host "hi"')).toBe(false);
  });

  it('não detecta comentário como shebang', () => {
    expect(isShebang('# comentário')).toBe(false);
  });
});

describe('isFullLineComment', () => {
  it('detecta comentário de linha inteira', () => {
    expect(isFullLineComment('# comentário')).toBe(true);
  });

  it('não detecta código como comentário', () => {
    expect(isFullLineComment('$x = 1 # inline')).toBe(false);
  });

  it('detecta shebang como comentário (código verifica isShebang primeiro)', () => {
    // isFullLineComment retorna true para shebang pois começa com #
    // O código real checa isShebang antes de isFullLineComment
    expect(isFullLineComment('#!/usr/bin/env pwsh')).toBe(true);
  });

  it('detecta comentário com múltiplos #', () => {
    expect(isFullLineComment('## section')).toBe(true);
  });
});

// Regressão (equivalente PowerShell da issue #34): aspas dentro de uma subexpressão $(...) em string
// de aspas duplas formam um novo contexto de aspas e não fecham a string externa.
describe('aspas aninhadas em subexpressão dentro de aspas duplas', () => {
  const line = 'Write-Host "Nome: $($user.Name.Trim(\'"\'))"';

  it('splitByQuotesPreserve mantém a string com a subexpressão como uma única parte dq', () => {
    expect(splitByQuotesPreserve(line)).toEqual([
      { kind: 'code', text: 'Write-Host ' },
      { kind: 'dq', text: '"Nome: $($user.Name.Trim(\'"\'))"' },
    ]);
  });

  it('getCodePartsOnly retorna apenas o código fora de aspas', () => {
    expect(getCodePartsOnly(line)).toBe('Write-Host ');
  });

  it('getQuoteModeAfterLine retorna code, independentemente de quantas vezes a linha se repete', () => {
    let mode = getQuoteModeAfterLine(line);
    expect(mode).toBe('code');
    mode = getQuoteModeAfterLine(line, mode);
    mode = getQuoteModeAfterLine(line, mode);
    expect(mode).toBe('code');
  });

  it('mantém o estado aninhado entre linhas até a subexpressão e a string fecharem', () => {
    const open = getQuoteModeAfterLine('$msg = "Itens: $(');
    expect(open).not.toBe('code');

    const inner = getQuoteModeAfterLine('  $items | ForEach-Object { "\'$_\'" }', open);
    expect(inner).toBe(open);
    expect(getCodePartsOnly(') " ; $x', inner)).toBe(' ; $x');
    expect(getQuoteModeAfterLine(')"', inner)).toBe('code');
  });

  it('fecha a subexpressão somente no parêntese correspondente', () => {
    expect(getQuoteModeAfterLine('"$( (1 + 2) * 3 )"')).toBe('code');
    expect(getQuoteModeAfterLine('"$(\'(\' + ")")"')).toBe('code');
    expect(getQuoteModeAfterLine('"$($(\'"\'))"')).toBe('code');
  });

  it('aceita escape com crase e comentário dentro da subexpressão', () => {
    expect(getQuoteModeAfterLine('"$("`"")"')).toBe('code');

    const open = getQuoteModeAfterLine('$x = "$(');
    const afterComment = getQuoteModeAfterLine("  Get-Date # it's a comment", open);
    expect(afterComment).toBe(open);
    expect(getQuoteModeAfterLine(')"', afterComment)).toBe('code');
  });

  it('trata here-string dentro da subexpressão como literal até o terminador', () => {
    let mode = getQuoteModeAfterLine("$x = \"$(@'");
    expect(isHereStringLine(mode)).toBe(true);

    mode = getQuoteModeAfterLine("it's \" literal", mode);
    expect(isHereStringLine(mode)).toBe(true);

    mode = getQuoteModeAfterLine("'@", mode);
    expect(isHereStringLine(mode)).toBe(false);
    expect(getQuoteModeAfterLine(')"', mode)).toBe('code');
  });

  it('não abre contexto aninhado para $( fora de aspas duplas', () => {
    expect(getQuoteModeAfterLine("$x = $(Get-Item 'a'")).toBe('code');
    expect(getCodePartsOnly("$x = $(Get-Item 'a')")).toBe('$x = $(Get-Item )');
  });

  it('não detecta here-string aninhada como here-string de nível superior', () => {
    expect(detectHeredocInCode("$x = \"$(@'")).toBeNull();
    expect(isHereStringLine('hereSq')).toBe(true);
    expect(isHereStringLine('code')).toBe(false);
  });
});

// Regressão: aspas escapadas com crase fora de strings (`' e `") são literais e não abrem string.
describe('aspas escapadas com crase fora de strings', () => {
  it('não abre string para `\' ou `" no código', () => {
    expect(getQuoteModeAfterLine('Write-Host `"oi')).toBe('code');
    expect(getQuoteModeAfterLine("Write-Host it`'s")).toBe('code');
  });

  it('mantém as aspas escapadas como código', () => {
    expect(splitByQuotesPreserve('Write-Host `"a  b`"')).toEqual([{ kind: 'code', text: 'Write-Host `"a  b`"' }]);
    expect(getCodePartsOnly("Write-Host it`'s")).toBe("Write-Host it`'s");
  });

  it('mantém a crase de continuação no fim da linha como código', () => {
    expect(getCodePartsOnly('Get-Item `')).toBe('Get-Item `');
    expect(getQuoteModeAfterLine('Get-Item `')).toBe('code');
  });
});

describe('# no início de um token, variáveis entre chaves e comentários de bloco', () => {
  it.each(['C#', 'a#b', 'https://x.io/#/api', '--cor=#fff', '$a#b', '`#'])('splitByQuotesPreserve mantém como string o texto após "%s"', (word) => {
    expect(splitByQuotesPreserve(`cmd ${word} "a   b"`)).toEqual([
      { kind: 'code', text: `cmd ${word} ` },
      { kind: 'dq', text: '"a   b"' },
    ]);
  });

  it('splitByQuotesPreserve para no comentário que inicia um token', () => {
    expect(splitByQuotesPreserve('cmd C# # it\'s "a   b"')).toEqual([
      { kind: 'code', text: 'cmd C# # it\'s "a   b"' },
    ]);
    expect(splitByQuotesPreserve('$x = "a"# it\'s')).toEqual([
      { kind: 'code', text: '$x = ' },
      { kind: 'dq', text: '"a"' },
      { kind: 'code', text: '# it\'s' },
    ]);
  });

  it('splitByQuotesPreserve separa variáveis entre chaves e comentários de bloco', () => {
    expect(splitByQuotesPreserve('if (${#x#}) <# it\'s #> { # c')).toEqual([
      { kind: 'code', text: 'if (' },
      { kind: 'verbatim', text: '${#x#}' },
      { kind: 'code', text: ') ' },
      { kind: 'verbatim', text: '<# it\'s #>' },
      { kind: 'code', text: ' { # c' },
    ]);
  });

  it('splitByQuotesPreserve mantém como código o <# no meio de uma palavra', () => {
    expect(splitByQuotesPreserve('Write-Output a<#b#>c')).toEqual([
      { kind: 'code', text: 'Write-Output a<#b#>c' },
    ]);
  });

  it.each([
    ['cmd C# {', 'cmd C# {'],
    ['cmd https://x.io/#/api | ForEach-Object {', 'cmd https://x.io/#/api | ForEach-Object {'],
    ['if (${#x#}) <# c { #> {', 'if ($_)  {'],
    ['$x = 1 <# sem fim {', '$x = 1 '],
    ['$x = "a"# c {', '$x = '],
    ['$x = ${a{b} # c {', '$x = $_ '],
    ['$x = ${a`}b} {', '$x = $_ {'],
  ])('getCodePartsOnly de "%s"', (line, expected) => {
    expect(getCodePartsOnly(line)).toBe(expected);
  });

  it('getQuoteModeAfterLine enxerga a string aberta após um # no meio de uma palavra', () => {
    expect(getQuoteModeAfterLine('cmd C# "aberta')).toBe('dq');
    expect(getQuoteModeAfterLine('cmd # "aberta')).toBe('code');
  });

  it('getQuoteModeAfterLine ignora aspas em variáveis entre chaves e comentários de bloco', () => {
    expect(getQuoteModeAfterLine('cmd ${a"b} x')).toBe('code');
    expect(getQuoteModeAfterLine('cmd <# don\'t #> x')).toBe('code');
    expect(getQuoteModeAfterLine('cmd <# don\'t #> "aberta')).toBe('dq');
    expect(getQuoteModeAfterLine('cmd <# don\'t')).toBe('code');
  });

  it('getQuoteModeAfterLine trata comentário de bloco dentro de subexpressão em string', () => {
    expect(getQuoteModeAfterLine('"a $(cmd <# ) " #> b) c"')).toBe('code');
  });

  it('detectHeredocInCode reconhece a here-string após um # no meio de uma palavra', () => {
    expect(detectHeredocInCode('New-Snippet -Lang C# -Body @"')).toBe('"@');
  });

  it('isCommentStart segue o início de token do PowerShell', () => {
    for (const line of ['# c', 'x # c', 'x;# c', 'f(1)# c', '$a[0]# c', '"a"# c', "'a'# c", '@{# c', '1,# c', '1|# c']) {
      expect(isCommentStart(line, line.indexOf('#'))).toBe(true);
    }

    for (const line of ['C#', 'a#b', 'x/#/y', '--cor=#fff', '$a#b', '`#']) {
      expect(isCommentStart(line, line.indexOf('#'))).toBe(false);
    }
  });
});
