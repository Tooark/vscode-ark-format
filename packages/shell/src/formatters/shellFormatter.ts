import * as vscode from 'vscode';
import { QuoteKind, ShellFormatterOptions } from './types';
import { applyShellSpacing } from './shellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine, isLineContinuation } from './shellIndent';
import { isShebang } from '@tooark/ark-format-shared/lex';
import { detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine } from './shellLex';
import { formatTextGeneric } from './utils';

/**
 * Classe principal do formatador de shell script.
 * Recebe um documento do VSCode, formata seu conteúdo e retorna as edições necessárias para aplicar o formato.
 */
export class ShellFormatter {
  /**
   * Construtor do formatador de shell script.
   * @param opts - Opções de formatação que controlam o comportamento do formatador, como tamanho de indentação, regras de espaçamento, etc.
   */
  constructor (private readonly opts: ShellFormatterOptions) { }

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
   * Função para formatar um texto de shell script, aplicando regras de espaçamento, indentação e outras formatações específicas.
   * @param originalText - O texto original do shell script a ser formatado.
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string): string {
    return formatTextGeneric<ReturnType<typeof createInitialState>, QuoteKind, ShellFormatterOptions>({
      originalText,
      opts: this.opts,
      createInitialState,
      dedentBeforeLine,
      indentAfterLine,
      isShebang,
      detectHeredocInCode,
      getCodePartsOnly: (line: string, initialMode) => {
        const codeParts = getCodePartsOnly(line, initialMode);

        // Preserva sinal de continuação no texto de controle mesmo quando ocorre dentro de string multilinha.
        // Isso permite aplicar recuo correto em comandos quebrados dentro de "$(...)" entre aspas.
        if (isLineContinuation(line.trim())) {
          return `${codeParts} \\`;
        }

        return codeParts;
      },
      getQuoteModeAfterLine,
      applySpacing: (line: string, opts: ShellFormatterOptions) => applyShellSpacing(line, {
        spaceBeforeThenDo: opts.spacing.spaceBeforeThenDo,
        spaceAfterKeywords: opts.spacing.spaceAfterKeywords,
        spaceBeforeFunctionBrace: opts.spacing.spaceBeforeFunctionBrace,
        collapseSpaces: opts.collapseSpaces
      })
    });
  }
}
