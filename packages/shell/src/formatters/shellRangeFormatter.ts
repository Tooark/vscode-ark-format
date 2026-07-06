import type * as vscode from 'vscode';
import { QuoteKind, ShellRangeFormatterOptions } from './types';
import { buildRangeEdits } from '@tooark/ark-format-shared/edits';
import { normalizeToLf, trimTrailingWhitespace, reduceBlankLines, updateIndentAfterLineWithContinuation } from './utils';
import { applyShellSpacing, toShellSpacingConfig } from './shellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine, isLineContinuation } from './shellIndent';
import { detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine } from './shellLex';

/**
 * Classe para formatar um intervalo de texto em um documento do Visual Studio Code usando as opções fornecidas.
 */
export class ShellRangeFormatter {
  /**
   * Construtor da classe ShellRangeFormatter.
   * @param opts - As opções de formatação para o shell, incluindo reindentação, espaçamento e outras configurações.
   */
  constructor (private readonly opts: ShellRangeFormatterOptions) { }

  /**
   * Formata um intervalo de texto em um documento do Visual Studio Code.
   * @param document - O documento do Visual Studio Code que contém o texto a ser formatado.
   * @param range - O intervalo de texto a ser formatado.
   * @returns Um array de TextEdit contendo as edições necessárias para formatar o intervalo de texto.
   */
  public formatRange (document: vscode.TextDocument, range: vscode.Range): vscode.TextEdit[] {
    return buildRangeEdits(document, range, (selected) => this.formatSelectedText(selected));
  }

  /**
   * Formata o texto selecionado de acordo com as opções fornecidas.
   * @param originalSelection O texto original selecionado a ser formatado.
   * @returns O texto formatado de acordo com as opções de formatação.
   */
  public formatSelectedText (originalSelection: string): string {
    // Normaliza as quebras de linha para LF e divide o texto em linhas individuais
    const textLf = normalizeToLf(originalSelection);
    const rawLines = textLf.split('\n');
    const indentUnit = this.opts.indentStyle === 'tab' ? '\t' : ' '.repeat(Math.max(0, this.opts.indentSize));
    const out: string[] = [];
    let quoteMode: QuoteKind = 'code';

    // Verifica se a opção de reindentação está desativada.
    if (!this.opts.reindent) {
      let inHeredoc = false;
      let heredocEnd = '';

      // Itera sobre cada linha do texto selecionado
      for (const raw of rawLines) {
        const rawTrimmed = raw.trim();

        // Conteúdo de heredoc é preservado sem alterações
        if (inHeredoc) {
          out.push(raw);

          // Verifica se a linha atual é o final do heredoc
          if (rawTrimmed === heredocEnd) {
            inHeredoc = false;
            heredocEnd = '';
          }

          continue;
        }

        const nextQuoteMode = getQuoteModeAfterLine(raw, quoteMode);

        // Preserva conteúdo literal de strings multilinha sem reprocessamento.
        if (quoteMode !== 'code') {
          out.push(raw);
          quoteMode = nextQuoteMode;

          continue;
        }

        // Detecta se há um heredoc na linha atual
        const detectedHeredocEnd = detectHeredocInCode(rawTrimmed);

        // Carrega a linha sem espaços à direita para formatação
        const m = raw.match(/^(\s*)(.*)$/);
        const leading = m ? m[1] : '';
        const rest = m ? m[2] : raw;
        const trimmedRest = rest.trim();

        // Verifica se a parte restante da linha é vazia
        if (trimmedRest === '') {
          out.push('');
          quoteMode = nextQuoteMode;

          continue;
        }

        // Aplica o espaçamento de acordo com as opções fornecidas.
        const spaced = applyShellSpacing(trimmedRest, toShellSpacingConfig(this.opts));

        out.push(leading + spaced);

        // Verifica se foi detectado um heredoc na linha atual
        if (detectedHeredocEnd) {
          inHeredoc = true;
          heredocEnd = detectedHeredocEnd;
        }

        quoteMode = nextQuoteMode;
      }

      // Aplica o trim de espaços em branco e a redução de linhas em branco consecutivas, se necessário.
      let lines = out;
      lines = trimTrailingWhitespace(lines, this.opts.trimTrailingWhitespace);
      lines = reduceBlankLines(lines, this.opts.maxConsecutiveBlankLines);

      return lines.join('\n');
    }

    // Cria um estado inicial para o processo de formatação, incorporando o baseIndent calculado do contexto do documento
    const st = createInitialState();
    st.indent = this.opts.baseIndent;

    // Itera sobre cada linha do texto selecionado
    for (const raw of rawLines) {
      // Carrega a linha sem espaços à direita para formatação
      const rawTrimmed = raw.trim();
      const lineForFormatting = this.opts.trimTrailingWhitespace ? rawTrimmed : raw.trimStart();

      // Verifica se o estado atual está dentro de um heredoc
      if (st.inHeredoc) {
        out.push(raw);

        // Verifica se a linha atual é o final do heredoc
        if (rawTrimmed === st.heredocEnd) {
          st.inHeredoc = false;
          st.heredocEnd = '';
        }

        continue;
      }

      const nextQuoteMode = getQuoteModeAfterLine(raw, quoteMode);

      // Preserva conteúdo literal de strings multilinha sem reprocessamento.
      if (quoteMode !== 'code') {
        out.push(raw);
        quoteMode = nextQuoteMode;

        continue;
      }

      // Texto de controle da linha: apenas as partes de código (fora de aspas), preservando o
      // sinal de continuação, para que caracteres literais em strings não abram/fechem blocos
      const controlText = this.controlTextFor(raw, quoteMode);

      // Detecta se há um heredoc na linha atual
      const heredocEnd = detectHeredocInCode(rawTrimmed);

      // Verifica se a linha atual é vazia após a remoção de espaços em branco
      if (rawTrimmed === '') {
        out.push('');
        quoteMode = nextQuoteMode;

        continue;
      }

      // Aplica a dedentação antes de processar a linha
      dedentBeforeLine(controlText, st);

      // Aplica o espaçamento de acordo com as opções fornecidas.
      const spaced = applyShellSpacing(lineForFormatting, toShellSpacingConfig(this.opts));

      // Aplica a indentação de acordo com o estado atual
      const indentStr = indentUnit.repeat(Math.max(0, st.indent));
      out.push(indentStr + spaced);

      // Aplica a indentação após processar a linha, considerando o estado de continuação
      updateIndentAfterLineWithContinuation(controlText, st, indentAfterLine);

      // Verifica se foi detectado um heredoc na linha atual
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }

      quoteMode = nextQuoteMode;
    }

    // Aplica o trim de espaços em branco e a redução de linhas em branco consecutivas, se necessário.
    let lines = out;
    lines = trimTrailingWhitespace(lines, this.opts.trimTrailingWhitespace);
    lines = reduceBlankLines(lines, this.opts.maxConsecutiveBlankLines);

    // Retorna o texto formatado como uma string, unindo as linhas com quebras de linha.
    return lines.join('\n');
  }

  /**
   * Função para extrair o texto de controle de uma linha: apenas as partes de código (fora de
   * aspas), preservando o sinal de continuação quando ele ocorre dentro de string multilinha.
   * Mesma regra usada pelo formatador de documento (ShellFormatter).
   * @param raw A linha original.
   * @param quoteMode O modo de aspas vindo da linha anterior.
   * @returns O texto de controle da linha, já trimado.
   */
  private controlTextFor (raw: string, quoteMode: QuoteKind): string {
    const codeParts = getCodePartsOnly(raw, quoteMode).trim();

    // Preserva sinal de continuação no texto de controle mesmo quando ocorre dentro de string multilinha.
    if (isLineContinuation(raw.trim())) {
      return `${codeParts} \\`;
    }

    return codeParts;
  }
}
