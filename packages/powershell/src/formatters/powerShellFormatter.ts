import * as vscode from 'vscode';
import { QuoteKind, PowerShellFormatterOptions } from './types';
import { applyPowerShellSpacing } from './powerShellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './powerShellIndent';
import { isShebang } from '@tooark/ark-format-shared/lex';
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
    // Carrega o texto original do documento e formata-o usando o método formatText
    const original = document.getText();
    const formatted = this.formatText(original);

    // Verifica se o texto formatado é diferente do original. Se for igual, não há edições a serem feitas.
    if (formatted === original) {
      return [];
    }

    // Cria um intervalo que abrange todo o documento para substituir o conteúdo inteiro pelo texto formatado
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));

    // Retorna uma edição de texto que substitui o conteúdo inteiro do documento pelo texto formatado
    return [vscode.TextEdit.replace(fullRange, formatted)];
  }

  /**
   * Função para formatar um texto de PowerShell, aplicando regras de espaçamento, indentação e outras formatações específicas.
   * @param originalText - O texto original do PowerShell a ser formatado.
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string): string {
    return formatTextGeneric<ReturnType<typeof createInitialState>, QuoteKind, PowerShellFormatterOptions>({
      originalText,
      opts: this.opts,
      createInitialState,
      dedentBeforeLine,
      indentAfterLine,
      isShebang,
      detectHeredocInCode,
      getCodePartsOnly,
      getQuoteModeAfterLine,
      applySpacing: (line: string, opts: PowerShellFormatterOptions) => applyPowerShellSpacing(line, {
        spaceBeforeFunctionBrace: true,
        collapseSpaces: opts.collapseSpaces ?? true
      }),
      detectBlockCommentStart: isBlockCommentStart,
      isBlockCommentEnd,
      isBlockCommentKeyword: isCommentHelpKeyword,
      formatBlockComments: this.opts.formatBlockComments ?? false
    });
  }
}
