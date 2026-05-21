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

  it('não trata # escapado com crase como comentário', () => {
    const input = 'Write-Host `#naoComentario\n';
    const result = format(input);
    expect(result).toBe('Write-Host `#naoComentario\n');
  });

  it('aplica CRLF quando configurado', () => {
    const result = format('Write-Host "ok"\n', { lineEnding: 'CRLF' });
    expect(result).toBe('Write-Host "ok"\r\n');
  });

  it('não colapsa espaços quando collapseSpaces é false', () => {
    const result = format('$x  =  1\n', { collapseSpaces: false });
    expect(result).toBe('$x  =  1\n');
  });
});
