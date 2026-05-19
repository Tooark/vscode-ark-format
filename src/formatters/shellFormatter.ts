import * as vscode from 'vscode';
import { QuoteKind, ShellFormatterOptions } from './types';
import { normalizeToLf, applyLineEnding, trimTrailingWhitespace, reduceBlankLines, removeLeadingBlankLines, ensureFinalNewline } from './textUtils';
import { applyShellSpacing } from './shellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './shellIndent';
import { isShebang, detectHeredocInCode, getCodePartsOnly, getQuoteModeAfterLine } from './shellLex';

/**
 * Função principal do formatador de shell script.
 * Recebe um documento do VSCode, formata seu conteúdo e retorna as edições necessárias para aplicar o formato.
 */
export class ShellFormatter {
  /**
   * Construtor do formatador de shell script.
   * @param opts - Opções de formatação que controlam o comportamento do formatador, como tamanho de indentação, regras de espaçamento, etc.
   */
  constructor (private readonly opts: ShellFormatterOptions) { }

  /**
   * Formata um documento do VSCode, retornando as edições necessárias para aplicar o formato.
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
   * Formata um texto de shell script, aplicando regras de espaçamento, indentação e outras formatações específicas.
   * @param originalText - O texto original do shell script a ser formatado.
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string): string {
    const textLf = normalizeToLf(originalText);
    const rawLines = textLf.split('\n');

    const st = createInitialState();
    let quoteMode: QuoteKind = 'code';
    let quoteIndentOffset = 0;
    let quoteBlockIndentLevel = 0;
    let quoteBuffer: string[] = [];
    const out: string[] = [];

    // Itera sobre cada linha do texto original
    for (const raw of rawLines) {
      const trimmed = raw.trim();
      const controlText = getCodePartsOnly(raw, quoteMode).trim();
      const nextQuoteMode = getQuoteModeAfterLine(raw, quoteMode);

      // Verifica se é um heredoc
      if (st.inHeredoc) {
        out.push(raw);

        // Verifica se a linha atual é o final do heredoc
        if (trimmed === st.heredocEnd) {
          st.inHeredoc = false;
          st.heredocEnd = '';
        }

        continue;
      }

      // Preserva conteúdo literal de strings multilinha sem reescrever espaços/indentação.
      if (quoteMode !== 'code') {
        quoteBuffer.push(raw);

        // Se a linha atual sai do modo de aspas, ajusta a indentação para as próximas linhas de código.
        if (nextQuoteMode === 'code') {
          const minLeading = this.getMinimumLeadingWhitespace(quoteBuffer);
          const indentStr = ' '.repeat(Math.max(0, quoteBlockIndentLevel) * Math.max(0, this.opts.indentSize));

          // Itera sobre as linhas do bloco de aspas, removendo a indentação comum e aplicando a indentação correta para o bloco de aspas
          for (const qline of quoteBuffer) {
            const qtrimmed = qline.trim();

            // Se a linha do bloco de aspas estiver vazia, adiciona uma linha em branco ao resultado
            if (qtrimmed === '') {
              out.push('');
              continue;
            }

            out.push(indentStr + qline.slice(Math.min(minLeading, qline.length)));
          }

          quoteBuffer = [];
          this.updateIndentAfterLine(controlText, st);
          quoteIndentOffset = 0;
        }

        quoteMode = nextQuoteMode;

        continue;
      }

      // Detecta se a linha atual inicia um heredoc e armazena o marcador de fim do heredoc no estado
      const heredocEnd = detectHeredocInCode(trimmed);
      const entersMultilineQuote = quoteMode === 'code' && nextQuoteMode !== 'code';
      const nextQuoteIndentOffset = st.continuation ? 1 : 0;

      // Se a linha estiver vazia, adiciona uma linha em branco ao resultado e continua para a próxima linha
      if (trimmed === '') {
        out.push('');

        continue;
      }

      // Ajusta a indentação antes de processar a linha atual
      dedentBeforeLine(controlText, st);

      // Verifica se a linha é um shebang (linha de comando que indica o interpretador do script)
      if (isShebang(trimmed)) {
        out.push(trimmed);
      } else {
        // Aplica as regras de espaçamento
        const spaced = applyShellSpacing(trimmed, {
          spaceBeforeThenDo: this.opts.spacing.spaceBeforeThenDo,
          spaceAfterKeywords: this.opts.spacing.spaceAfterKeywords,
          spaceBeforeFunctionBrace: this.opts.spacing.spaceBeforeFunctionBrace,
          collapseSpaces: this.opts.collapseSpaces
        });

        const indentStr = ' '.repeat(Math.max(0, st.indent) * Math.max(0, this.opts.indentSize));
        out.push(indentStr + spaced);
      }

      // Ajusta a indentação depois de processar a linha atual
      this.updateIndentAfterLine(controlText, st);

      // Se um heredoc foi detectado, atualiza o estado para indicar que estamos dentro de um heredoc e armazena o marcador de fim do heredoc
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }

      // Se a linha atual entra em um modo de aspas multilinha
      if (entersMultilineQuote) {
        quoteIndentOffset = nextQuoteIndentOffset;
        quoteBlockIndentLevel = st.indent + quoteIndentOffset;
      }

      quoteMode = nextQuoteMode;
    }

    // Aplica ajustes finais nas linhas, como remoção de espaços em branco e redução de linhas em branco consecutivas
    let lines = out;
    lines = trimTrailingWhitespace(lines, this.opts.trimTrailingWhitespace);
    lines = reduceBlankLines(lines, this.opts.maxConsecutiveBlankLines);
    lines = removeLeadingBlankLines(lines, this.opts.removeLeadingBlankLines);

    // Junta as linhas em um único texto, garantindo que haja um final de linha no final do texto se a opção estiver configurada
    let resultLf = lines.join('\n');
    resultLf = ensureFinalNewline(resultLf, this.opts.insertFinalNewline);

    // Aplica o tipo de final de linha configurado (LF, CRLF, etc.) ao resultado final antes de retornar
    return applyLineEnding(resultLf, this.opts.lineEnding, originalText);
  }

  /**
   * Função auxiliar para atualizar a indentação após processar uma linha de código,
   * com base no texto de controle da linha e no estado atual do formatador.
   * @param controlText O texto de controle da linha, que é a parte do código sem as aspas ou comentários.
   * @param st O estado atual do formatador, que inclui informações sobre a indentação, se estamos dentro de um heredoc, etc.
   */
  private updateIndentAfterLine (controlText: string, st: ReturnType<typeof createInitialState>): void {
    // Se o texto de controle estiver vazio e estivermos em uma linha de continuação, reduz a indentação e desativa a continuação
    if (controlText === '' && st.continuation) {
      st.indent = Math.max(0, st.indent - 1);
      st.continuation = false;

      return;
    }

    // Caso contrário, atualiza a indentação com base no texto de controle da linha
    indentAfterLine(controlText, st);
  }

  /**
   * Função auxiliar para calcular a quantidade mínima de espaços em branco à esquerda entre um conjunto de linhas.
   * @param lines O array de linhas a ser analisado para encontrar a quantidade mínima de espaços em branco à esquerda.
   * @returns A quantidade mínima de espaços em branco à esquerda encontrada entre as linhas,
   * ou 0 se todas as linhas estiverem vazias ou não tiverem espaços à esquerda.
   */
  private getMinimumLeadingWhitespace (lines: string[]): number {
    let min = Number.POSITIVE_INFINITY;

    // Itera sobre as linhas para encontrar a quantidade mínima de espaços em branco à esquerda
    for (const line of lines) {
      // Ignora linhas vazias, pois elas não contribuem para a indentação comum
      if (line.trim() === '') {
        continue;
      }

      const match = line.match(/^[ \t]*/);
      const count = match ? match[0].length : 0;

      // Atualiza o valor mínimo se a contagem atual for menor do que o mínimo encontrado até agora
      if (count < min) {
        min = count;
      }
    }

    return Number.isFinite(min) ? min : 0;
  }
}
