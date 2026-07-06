import type * as vscode from 'vscode';
import { QuoteKind, PowerShellFormatterOptions } from './types';
import { applyPowerShellSpacing, toPowerShellSpacingConfig } from './powerShellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './powerShellIndent';
import { buildFullDocumentEdits } from '@tooark/ark-format-shared/edits';
import { isShebang } from '@tooark/ark-format-shared/lex';
import { alignPowerShellAssignments } from './powerShellAlign';
import { detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine, isBlockCommentStart, isBlockCommentEnd, isCommentHelpKeyword } from './powerShellLex';
import { formatTextGeneric } from './utils';

/**
 * Classe principal do formatador de PowerShell.
 * Recebe um documento do VSCode, formata seu conteúdo e retorna as edições necessárias para aplicar o formato.
 */
export class PowerShellFormatter {
  /**
   * Construtor do formatador de PowerShell.
   * @param opts - Opções de formatação que controlam o comportamento do formatador, como tamanho de indentação, regras de espaçamento, etc.
   */
  constructor (private readonly opts: PowerShellFormatterOptions) { }

  /**
   * Função para formatar um documento do VSCode, retornando as edições necessárias para aplicar o formato.
   * @param document - O documento do VSCode a ser formatado.
   * @returns Um array de edições de texto que representam as mudanças necessárias para aplicar o formato ao documento.
   */
  public formatDocument (document: vscode.TextDocument): vscode.TextEdit[] {
    return buildFullDocumentEdits(document, (original) => this.formatText(original));
  }

  /**
   * Função para formatar um texto de PowerShell, aplicando regras de espaçamento, indentação e outras formatações específicas.
   * @param originalText - O texto original do PowerShell a ser formatado.
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string): string {
    const formatted = formatTextGeneric<ReturnType<typeof createInitialState>, QuoteKind, PowerShellFormatterOptions>({
      originalText,
      opts: this.opts,
      createInitialState,
      dedentBeforeLine,
      indentAfterLine,
      isShebang,
      detectHeredocInCode,
      getCodePartsOnly,
      getQuoteModeAfterLine,
      applySpacing: (line: string, opts: PowerShellFormatterOptions) => applyPowerShellSpacing(line, toPowerShellSpacingConfig(opts)),
      detectBlockCommentStart: isBlockCommentStart,
      isBlockCommentEnd,
      isBlockCommentKeyword: isCommentHelpKeyword,
      formatBlockComments: this.opts.formatBlockComments ?? false
    });

    // Alinhamento vertical dos operadores de atribuição em blocos contíguos, quando habilitado
    if (this.opts.alignAssignments === true) {
      return alignPowerShellAssignments(formatted);
    }

    return formatted;
  }
}
