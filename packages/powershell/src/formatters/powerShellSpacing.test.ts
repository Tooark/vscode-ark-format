import { describe, it, expect } from 'vitest';
import { applyPowerShellSpacing } from './powerShellSpacing';

describe('applyPowerShellSpacing', () => {
  describe('spaceBeforeFunctionBrace', () => {
    it('adiciona espaço antes de { em function', () => {
      const result = applyPowerShellSpacing('function Test{', { spaceBeforeFunctionBrace: true, collapseSpaces: false });
      expect(result).toBe('function Test {');
    });

    it('adiciona espaço antes de { em function com hífen no nome', () => {
      const result = applyPowerShellSpacing('function Get-Item{', { spaceBeforeFunctionBrace: true, collapseSpaces: false });
      expect(result).toBe('function Get-Item {');
    });

    it('adiciona espaço antes de { após parênteses', () => {
      const result = applyPowerShellSpacing('if ($true){', { spaceBeforeFunctionBrace: true, collapseSpaces: false });
      expect(result).toBe('if ($true) {');
    });

    it('adiciona espaço antes de { em try/catch/finally/else', () => {
      expect(applyPowerShellSpacing('try{', { spaceBeforeFunctionBrace: true, collapseSpaces: false })).toBe('try {');
      expect(applyPowerShellSpacing('catch{', { spaceBeforeFunctionBrace: true, collapseSpaces: false })).toBe('catch {');
      expect(applyPowerShellSpacing('finally{', { spaceBeforeFunctionBrace: true, collapseSpaces: false })).toBe('finally {');
      expect(applyPowerShellSpacing('else{', { spaceBeforeFunctionBrace: true, collapseSpaces: false })).toBe('else {');
    });

    it('não modifica quando já há espaço', () => {
      const result = applyPowerShellSpacing('function Test {', { spaceBeforeFunctionBrace: true, collapseSpaces: false });
      expect(result).toBe('function Test {');
    });

    it('não modifica quando desabilitado', () => {
      const result = applyPowerShellSpacing('function Test{', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('function Test{');
    });
  });

  describe('collapseSpaces', () => {
    it('colapsa múltiplos espaços entre tokens', () => {
      const result = applyPowerShellSpacing('$x  =  1', { spaceBeforeFunctionBrace: false, collapseSpaces: true });
      expect(result).toBe('$x = 1');
    });

    it('não colapsa espaços dentro de strings', () => {
      const result = applyPowerShellSpacing('"hello   world"', { spaceBeforeFunctionBrace: false, collapseSpaces: true });
      expect(result).toBe('"hello   world"');
    });

    it('não modifica quando desabilitado', () => {
      const result = applyPowerShellSpacing('$x  =  1', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('$x  =  1');
    });

    it('preserva espaço único', () => {
      const result = applyPowerShellSpacing('$x = 1', { spaceBeforeFunctionBrace: false, collapseSpaces: true });
      expect(result).toBe('$x = 1');
    });
  });

  describe('normalizeCommentSpacing', () => {
    it('adiciona espaço entre # e texto do comentário', () => {
      const result = applyPowerShellSpacing('#comentário', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('# comentário');
    });

    it('não adiciona espaço se já existe', () => {
      const result = applyPowerShellSpacing('# comentário', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('# comentário');
    });

    it('não modifica shebang', () => {
      const result = applyPowerShellSpacing('#!/usr/bin/env pwsh', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('#!/usr/bin/env pwsh');
    });

    it('não adiciona espaço para múltiplos # seguidos de espaço', () => {
      const result = applyPowerShellSpacing('## seção', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('## seção');
    });

    it('adiciona espaço em comentário inline', () => {
      const result = applyPowerShellSpacing('$x = 1 #valor', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('$x = 1 # valor');
    });

    it('preserva fechamento de comentário em bloco (#>)', () => {
      const result = applyPowerShellSpacing('#>', { spaceBeforeFunctionBrace: false, collapseSpaces: false });
      expect(result).toBe('#>');
    });

    it('preserva alinhamento em colunas dentro de comentário de linha inteira', () => {
      const input = '#   ./build.ps1 -Target Test      executa apenas os testes';
      const result = applyPowerShellSpacing(input, { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe(input);
    });

    it('preserva alinhamento em colunas dentro de comentário inline', () => {
      const result = applyPowerShellSpacing('$x = 1    #   valor   padrão', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('$x = 1 #   valor   padrão');
    });

    it('não aplica regras de chaves ao texto do comentário', () => {
      const input = '# ex.: function Test{ ou if ($x){';
      const result = applyPowerShellSpacing(input, { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe(input);
    });

    it('continua aplicando as regras ao código antes do comentário inline', () => {
      const result = applyPowerShellSpacing('if ($x){   #   mantém  isto', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('if ($x) { #   mantém  isto');
    });

    it('adiciona o espaço do marcador sem alterar o restante do comentário', () => {
      const result = applyPowerShellSpacing('#foo   bar', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('# foo   bar');
    });

    it('não trata # escapado por crase como comentário', () => {
      const result = applyPowerShellSpacing('Write-Host  `#tag   x', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('Write-Host `#tag x');
    });
  });

  describe('combinações', () => {
    it('aplica ambas as regras simultaneamente', () => {
      const result = applyPowerShellSpacing('function  Test{', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('function Test {');
    });

    it('preserva conteúdo de strings enquanto formata código', () => {
      // collapseSpaces só atua entre \S dentro do mesmo segmento de código.
      // Espaços adjacentes a fronteiras de string não são colapsados.
      const result = applyPowerShellSpacing('$x  +  $y', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('$x + $y');
    });

    it('não modifica espaços múltiplos dentro de strings', () => {
      const result = applyPowerShellSpacing('"hello   world"', { spaceBeforeFunctionBrace: true, collapseSpaces: true });
      expect(result).toBe('"hello   world"');
    });
  });
});

describe('applyPowerShellSpacing: diretivas, # no meio de palavras e trechos mantidos', () => {
  const cfg = { spaceBeforeFunctionBrace: true, collapseSpaces: true };

  it.each([
    '#Requires -Version 7.0',
    '#requires -RunAsAdministrator',
    '#region Setup',
    '#REGION Setup',
    '#endregion',
    '#endregion Setup',
  ])('não insere espaço na diretiva "%s"', (line) => {
    expect(applyPowerShellSpacing(line, cfg)).toBe(line);
  });

  it('insere espaço em comentários comuns, mesmo parecidos com diretivas', () => {
    expect(applyPowerShellSpacing('#regional', cfg)).toBe('# regional');
    expect(applyPowerShellSpacing('#requirements', cfg)).toBe('# requirements');
    expect(applyPowerShellSpacing('$x = 1 #region', cfg)).toBe('$x = 1 #region');
    expect(applyPowerShellSpacing('$x = 1 #nota', cfg)).toBe('$x = 1 # nota');
  });

  it('não trata o # no meio de uma palavra como comentário', () => {
    expect(applyPowerShellSpacing('dotnet   new -lang C# -o "My   App"', cfg)).toBe('dotnet new -lang C# -o "My   App"');
    expect(applyPowerShellSpacing('cmd   a#b   c', cfg)).toBe('cmd a#b c');
    expect(applyPowerShellSpacing('cmd   `#   c', cfg)).toBe('cmd `# c');
  });

  it('preserva o texto do comentário que inicia um token', () => {
    expect(applyPowerShellSpacing('$x = 1   # a   b', cfg)).toBe('$x = 1 # a   b');
    expect(applyPowerShellSpacing('$a = @(1,#a   b', cfg)).toBe('$a = @(1,# a   b');
  });

  it('mantém variáveis entre chaves e comentários de bloco e colapsa os espaços ao redor', () => {
    expect(applyPowerShellSpacing('cmd   ${a  b}   ${#c}   -P   1', cfg)).toBe('cmd ${a  b} ${#c} -P 1');
    expect(applyPowerShellSpacing('if ($a)   <# c   d #>   {', cfg)).toBe('if ($a) <# c   d #> {');
    expect(applyPowerShellSpacing('cmd   ${a  b}   -P', { ...cfg, collapseSpaces: false })).toBe('cmd   ${a  b}   -P');
  });
});
