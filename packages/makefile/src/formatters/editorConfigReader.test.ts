import { describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

// Simula o módulo vscode para que a importação transitiva seja bem-sucedida.
vi.mock('vscode', () => ({}));

import { applyEditorConfigOverrides, makefileConfigKeys, parseEditorConfig } from './editorConfigReader';
import type { MakefileFormatterOptions } from './types';

const baseOpts: MakefileFormatterOptions = {
  indentSize: 2,
  indentStyle: 'space',
  trimTrailingWhitespace: true,
  maxConsecutiveBlankLines: 1,
  removeLeadingBlankLines: true,
  insertFinalNewline: true,
  lineEnding: 'LF',
  collapseSpaces: true,
  indentConditionals: true,
  normalizeRecipePrefix: true,
  alignAssignments: false,
  spacing: {
    spaceAroundAssignment: true,
    spaceAfterTargetColon: true,
    spaceAfterCommentMarker: true
  }
};

describe('editorConfigReader - chaves específicas do Makefile', () => {
  it('expõe as chaves de configuração da extensão', () => {
    expect(makefileConfigKeys.indentConditionals).toBe('indentConditionals');
    expect(makefileConfigKeys.normalizeRecipePrefix).toBe('normalizeRecipePrefix');
    expect(makefileConfigKeys.spacingSpaceAroundAssignment).toBe('spacing.spaceAroundAssignment');
    expect(makefileConfigKeys.spacingSpaceAfterTargetColon).toBe('spacing.spaceAfterTargetColon');
    expect(makefileConfigKeys.spacingSpaceAfterCommentMarker).toBe('spacing.spaceAfterCommentMarker');
  });
});

describe('editorConfigReader - integração com .editorconfig', () => {
  it('aplica propriedades do .editorconfig sobre as opções do formatador', () => {
    // Cria um diretório temporário com um .editorconfig cobrindo Makefiles
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ark-mk-ec-'));

    try {
      fs.writeFileSync(path.join(dir, '.editorconfig'), [
        'root = true',
        '',
        '[{Makefile,makefile,GNUmakefile,*.mk}]',
        'indent_style = space',
        'indent_size = 4',
        'end_of_line = crlf',
        'insert_final_newline = false',
        'trim_trailing_whitespace = false',
        ''
      ].join('\n'), 'utf-8');

      const props = parseEditorConfig(path.join(dir, 'Makefile'));
      const opts = applyEditorConfigOverrides(baseOpts, props);

      expect(opts.indentSize).toBe(4);
      expect(opts.lineEnding).toBe('CRLF');
      expect(opts.insertFinalNewline).toBe(false);
      expect(opts.trimTrailingWhitespace).toBe(false);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('aplica a seção *.mk a arquivos de include', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ark-mk-ec-'));

    try {
      fs.writeFileSync(path.join(dir, '.editorconfig'), [
        'root = true',
        '',
        '[*.mk]',
        'indent_size = 8',
        ''
      ].join('\n'), 'utf-8');

      const props = parseEditorConfig(path.join(dir, 'config.mk'));

      expect(props.indent_size).toBe(8);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('não altera as opções quando o .editorconfig não define propriedades', () => {
    const opts = applyEditorConfigOverrides(baseOpts, {});

    expect(opts).toEqual(baseOpts);
  });

  it('mantém as opções específicas do Makefile intactas após o override', () => {
    const opts = applyEditorConfigOverrides(baseOpts, { indent_size: 4, indent_style: 'space' });

    expect(opts.indentConditionals).toBe(true);
    expect(opts.normalizeRecipePrefix).toBe(true);
    expect(opts.spacing).toEqual(baseOpts.spacing);
  });
});
