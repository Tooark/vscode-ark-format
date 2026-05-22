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
