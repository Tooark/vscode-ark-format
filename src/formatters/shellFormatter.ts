import * as vscode from 'vscode';
import { ShellFormatterOptions } from './types';
import { normalizeToLf, applyLineEnding, trimTrailingWhitespace, reduceBlankLines, removeLeadingBlankLines, ensureFinalNewline } from './textUtils';
import { applyShellSpacing } from './shellSpacing';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './shellIndent';
import { isShebang, detectHeredocInCode } from './shellLex';

/**
 * Função principal do formatador de shell script.
 * Recebe um documento do VSCode, formata seu conteúdo e retorna as edições necessárias para aplicar o formato.
 * O método `formatText` é responsável por processar o texto original, aplicando regras de espaçamento,
 * indentação e outras formatações específicas para shell script, além de lidar com casos especiais como heredocs e shebangs.
 * O resultado final é ajustado para os finais de linha e outras opções configuráveis antes de ser retornado.
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
    const original = document.getText();
    const formatted = this.formatText(original);

    // Verifica se o texto formatado é diferente do original. Se for igual, não há edições a serem feitas.
    if (formatted === original) {
      return [];
    }

    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));

    return [vscode.TextEdit.replace(fullRange, formatted)];
  }

  /**
   * Formata um texto de shell script, aplicando regras de espaçamento, indentação e outras formatações específicas.
   * O método processa o texto linha por linha, lidando com casos especiais como heredocs e shebangs, e aplica as opções de formatação configuradas.
   * O resultado final é ajustado para os finais de linha e outras opções antes de ser retornado.
   * @param originalText - O texto original do shell script a ser formatado.
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string): string {
    const textLf = normalizeToLf(originalText);
    const rawLines = textLf.split('\n');

    const st = createInitialState();
    const out: string[] = [];

    // Itera sobre cada linha do texto original
    for (const raw of rawLines) {
      const trimmed = raw.trim();

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

      // Detecta se a linha atual inicia um heredoc e armazena o marcador de fim do heredoc no estado
      const heredocEnd = detectHeredocInCode(trimmed);

      // Se a linha estiver vazia, adiciona uma linha em branco ao resultado e continua para a próxima linha
      if (trimmed === '') {
        out.push('');

        continue;
      }

      // Ajusta a indentação antes de processar a linha atual
      dedentBeforeLine(trimmed, st);

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
      indentAfterLine(trimmed, st);

      // Se um heredoc foi detectado, atualiza o estado para indicar que estamos dentro de um heredoc e armazena o marcador de fim do heredoc
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }
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
}
