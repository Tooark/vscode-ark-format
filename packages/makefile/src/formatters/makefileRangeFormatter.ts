import type * as vscode from 'vscode';
import type { MakefileRangeFormatterOptions } from './types';
import { buildRangeEdits } from '@tooark/ark-format-shared/edits';
import { alignAssignmentBlocks, applyMakefileSpacing, AssignmentAlignMeta, MakefileSpacingConfig } from './makefileSpacing';
import { classifyLine, hasRecipePrefix, usesCustomRecipePrefix } from './makefileLex';
import { MakefileFormatter } from './makefileFormatter';
import { normalizeToLf } from './utils';

/**
 * Classe para formatar um intervalo de texto em um documento do Visual Studio Code usando as opções fornecidas.
 */
export class MakefileRangeFormatter {
  /**
   * Construtor da classe MakefileRangeFormatter.
   * @param opts - As opções de formatação para o Makefile, incluindo reindentação, espaçamento e outras configurações.
   */
  constructor (private readonly opts: MakefileRangeFormatterOptions) { }

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
    // Com reindentação habilitada, delega ao formatador de documento usando a profundidade
    // de condicionais calculada a partir do contexto do documento (baseIndent)
    if (this.opts.reindent) {
      const formatter = new MakefileFormatter(this.opts);

      return formatter.formatText(originalSelection, this.opts.baseIndent);
    }

    // Normaliza as quebras de linha para LF e divide o texto em linhas individuais
    const textLf = normalizeToLf(originalSelection);

    // Preserva a seleção integralmente quando o prefixo de recipe é redefinido (.RECIPEPREFIX)
    if (usesCustomRecipePrefix(textLf)) {
      return originalSelection;
    }

    const rawLines = textLf.split('\n');
    const spacingCfg: MakefileSpacingConfig = {
      ...this.opts.spacing,
      collapseSpaces: this.opts.collapseSpaces
    };

    // Estado mínimo para preservar blocos define e linhas de continuação dentro da seleção
    let inDefine = false;
    let inContinuation = false;
    let blankRun = 0;
    const out: string[] = [];
    const metas: AssignmentAlignMeta[] = [];

    // Função auxiliar para emitir uma linha formatada com o metadado de alinhamento correspondente
    const emit = (line: string, meta: AssignmentAlignMeta = 'other'): void => {
      out.push(line);
      metas.push(meta);
    };

    // Itera sobre cada linha do texto selecionado, aplicando apenas regras de espaçamento
    // e preservando a indentação original de cada linha
    for (const raw of rawLines) {
      const classified = classifyLine(raw);

      // Conteúdo de define ... endef é preservado sem alterações
      if (inDefine) {
        emit(raw);
        blankRun = 0;

        // Verifica se a linha atual encerra o bloco define
        if (classified.kind === 'define-end') {
          inDefine = false;
        }

        continue;
      }

      // Linhas de continuação (após `\`) são preservadas, ajustando apenas espaços finais
      if (inContinuation) {
        emit(this.maybeTrimTrailing(raw), 'plain-continuation');
        inContinuation = classified.endsWithContinuation;
        blankRun = 0;

        continue;
      }

      // Linhas vazias: reduz sequências consecutivas ao máximo configurado
      if (classified.kind === 'blank') {
        blankRun++;

        // Verifica se o número de linhas em branco consecutivas está dentro do limite configurado
        if (blankRun <= this.opts.maxConsecutiveBlankLines) {
          emit('');
        }

        continue;
      }

      blankRun = 0;

      // Linhas prefixadas com TAB são potenciais recipes: o corpo pertence ao shell e não é alterado
      if (hasRecipePrefix(raw)) {
        emit(this.maybeTrimTrailing(raw));
        inContinuation = classified.endsWithContinuation;

        continue;
      }

      // Verifica se a linha abre um bloco define para preservar o conteúdo até endef
      if (classified.kind === 'define-open') {
        inDefine = true;
      }

      // Aplica o espaçamento preservando a indentação original da linha
      const leading = raw.match(/^[ \t]*/)?.[0] ?? '';
      emit(leading + applyMakefileSpacing(classified.trimmed, classified.kind, spacingCfg), classified.kind === 'assignment' ? 'head' : 'other');
      inContinuation = classified.endsWithContinuation;
    }

    // Alinhamento vertical dos operadores de atribuição em blocos contíguos, quando habilitado
    const lines = this.opts.alignAssignments ? alignAssignmentBlocks(out, metas) : out;

    // Retorna o texto formatado como uma string, unindo as linhas com quebras de linha.
    return lines.join('\n');
  }

  /**
   * Função para remover espaços em branco no final de uma linha, se a opção estiver habilitada.
   * @param line A linha a ser processada.
   * @returns A linha sem espaços finais, se a opção estiver habilitada; caso contrário, a linha original.
   */
  private maybeTrimTrailing (line: string): string {
    return this.opts.trimTrailingWhitespace ? line.replace(/[ \t]+$/, '') : line;
  }
}
