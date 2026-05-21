import { describe, it, expect } from 'vitest';
import { splitByQuotesPreserve, getCodePartsOnly, getQuoteModeAfterLine, detectHeredocInCode, isShebang, isFullLineComment } from './powerShellLex';

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
  it('retorna null para here-string PowerShell (handled by getQuoteModeAfterLine)', () => {
    // splitByQuotesPreserve trata o quote após @ como abertura de string,
    // então detectHeredocInCode não encontra o padrão. Isso é correto porque
    // here-strings PS são tratadas pelo path de multiline quote via getQuoteModeAfterLine.
    expect(detectHeredocInCode("$text = @'")).toBeNull();
    expect(detectHeredocInCode('$text = @"')).toBeNull();
    expect(detectHeredocInCode('$x = "prefix" + @"')).toBeNull();
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
