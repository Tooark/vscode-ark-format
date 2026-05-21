import * as vscode from 'vscode';
import { ShellRangeFormatterOptions } from './types';
import { normalizeToLf, trimTrailingWhitespace, reduceBlankLines } from './utils';
import { applyShellSpacing } from './shellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './shellIndent';
import { detectHeredocInCode } from './shellLex';

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
    const selected = document.getText(range);
    const formatted = this.formatSelectedText(selected);

    // Verifica se o texto formatado é igual ao texto selecionado.
    if (formatted === selected) {
      return [];
    }

    return [vscode.TextEdit.replace(range, formatted)];
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

    // Verifica se a opção de reindentação está desativada.
    if (!this.opts.reindent) {
      // Itera sobre cada linha do texto selecionado
      for (const raw of rawLines) {
        // Carrega a linha sem espaços à direita para formatação
        const m = raw.match(/^(\s*)(.*)$/);
        const leading = m ? m[1] : '';
        const rest = m ? m[2] : raw;
        const trimmedRest = rest.trim();

        // Verifica se a parte restante da linha é vazia
        if (trimmedRest === '') {
          out.push('');

          continue;
        }

        // Aplica o espaçamento de acordo com as opções fornecidas.
        const spaced = applyShellSpacing(trimmedRest, {
          spaceBeforeThenDo: this.opts.spacing.spaceBeforeThenDo,
          spaceAfterKeywords: this.opts.spacing.spaceAfterKeywords,
          spaceBeforeFunctionBrace: this.opts.spacing.spaceBeforeFunctionBrace,
          collapseSpaces: this.opts.collapseSpaces
        });

        out.push(leading + spaced);
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

      // Detecta se há um heredoc na linha atual
      const heredocEnd = detectHeredocInCode(rawTrimmed);

      // Verifica se a linha atual é vazia após a remoção de espaços em branco
      if (rawTrimmed === '') {
        out.push('');

        continue;
      }

      // Aplica a dedentação antes de processar a linha
      dedentBeforeLine(rawTrimmed, st);

      // Aplica o espaçamento de acordo com as opções fornecidas.
      const spaced = applyShellSpacing(lineForFormatting, {
        spaceBeforeThenDo: this.opts.spacing.spaceBeforeThenDo,
        spaceAfterKeywords: this.opts.spacing.spaceAfterKeywords,
        spaceBeforeFunctionBrace: this.opts.spacing.spaceBeforeFunctionBrace,
        collapseSpaces: this.opts.collapseSpaces
      });

      // Aplica a indentação de acordo com o estado atual
      const indentStr = indentUnit.repeat(Math.max(0, st.indent));
      out.push(indentStr + spaced);

      // Aplica a indentação após processar a linha
      indentAfterLine(rawTrimmed, st);

      // Verifica se foi detectado um heredoc na linha atual
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }
    }

    // Aplica o trim de espaços em branco e a redução de linhas em branco consecutivas, se necessário.
    let lines = out;
    lines = trimTrailingWhitespace(lines, this.opts.trimTrailingWhitespace);
    lines = reduceBlankLines(lines, this.opts.maxConsecutiveBlankLines);

    // Retorna o texto formatado como uma string, unindo as linhas com quebras de linha.
    return lines.join('\n');
  }
}
