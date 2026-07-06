import type * as vscode from 'vscode';
import type { MakefileFormatterOptions } from './types';
import { buildFullDocumentEdits } from '@tooark/ark-format-shared/edits';
import { alignAssignmentBlocks, applyMakefileSpacing, AssignmentAlignMeta, getAssignmentValueColumn, MakefileSpacingConfig } from './makefileSpacing';
import { classifyLine, findCommentStart, hasRecipePrefix, looksLikeRecipeCommand, usesCustomRecipePrefix } from './makefileLex';
import { applyLineEnding, ensureFinalNewline, normalizeToLf, removeLeadingBlankLines } from './utils';

/**
 * Classe principal do formatador de Makefile.
 * Recebe um documento do VSCode, formata seu conteúdo e retorna as edições necessárias para aplicar o formato.
 *
 * Invariantes de segurança do formatador:
 * - Linhas de recipe (prefixadas com TAB) nunca têm o corpo alterado (o conteúdo pertence ao shell).
 * - O conteúdo de blocos `define ... endef` é preservado sem alterações.
 * - Linhas de continuação (após `\`) são preservadas, ajustando apenas espaços finais.
 * - Se o documento redefinir `.RECIPEPREFIX`, o texto é preservado integralmente (a detecção por TAB deixa de valer).
 */
export class MakefileFormatter {
  /**
   * Construtor do formatador de Makefile.
   * @param opts - Opções de formatação que controlam o comportamento do formatador, como indentação de condicionais, regras de espaçamento, etc.
   */
  constructor (private readonly opts: MakefileFormatterOptions) { }

  /**
   * Função para formatar um documento do VSCode, retornando as edições necessárias para aplicar o formato.
   * @param document - O documento do VSCode a ser formatado.
   * @returns Um array de edições de texto que representam as mudanças necessárias para aplicar o formato ao documento.
   */
  public formatDocument (document: vscode.TextDocument): vscode.TextEdit[] {
    return buildFullDocumentEdits(document, (original) => this.formatText(original));
  }

  /**
   * Função para formatar um texto de Makefile, aplicando regras de espaçamento, indentação de condicionais
   * e normalização do prefixo de recipe.
   * @param originalText - O texto original do Makefile a ser formatado.
   * @param baseIndent - Profundidade inicial de condicionais (usada pela formatação de intervalo com contexto do documento).
   * @returns O texto formatado de acordo com as regras e opções configuradas.
   */
  public formatText (originalText: string, baseIndent = 0): string {
    // Normaliza os finais de linha do texto original para LF e divide o texto em linhas.
    const textLf = normalizeToLf(originalText);

    // Preserva o documento integralmente quando o prefixo de recipe é redefinido (.RECIPEPREFIX)
    if (usesCustomRecipePrefix(textLf)) {
      return originalText;
    }

    const rawLines = textLf.split('\n');
    const spacingCfg: MakefileSpacingConfig = {
      ...this.opts.spacing,
      collapseSpaces: this.opts.collapseSpaces
    };

    // Inicializa o estado da formatação: profundidade de condicionais, blocos define, continuação e contexto de recipe.
    let conditionalDepth = Math.max(0, baseIndent);
    let inDefine = false;
    let inContinuation = false;
    let inRecipe = false;
    let blankRun = 0;
    let continuationAlignColumn: number | null = null;
    let continuationInRecipe = false;
    const out: string[] = [];
    const metas: AssignmentAlignMeta[] = [];

    // Função auxiliar para emitir uma linha formatada com o metadado de alinhamento correspondente
    const emit = (line: string, meta: AssignmentAlignMeta = 'other'): void => {
      out.push(line);
      metas.push(meta);
    };

    // Itera sobre cada linha do texto original, aplicando a formatação conforme as regras configuradas.
    for (const raw of rawLines) {
      const classified = classifyLine(raw);

      // Conteúdo da linha para formatação: preserva espaços finais quando o trim está desabilitado
      const lineForFormatting = this.opts.trimTrailingWhitespace ? classified.trimmed : raw.trimStart();

      // Conteúdo de define ... endef é preservado sem alterações (apenas o endef é realinhado)
      if (inDefine) {
        // Verifica se a linha atual encerra o bloco define
        if (classified.kind === 'define-end') {
          emit(this.conditionalIndent(conditionalDepth, raw) + classified.trimmed);
          inDefine = false;
          blankRun = 0;

          continue;
        }

        emit(raw);
        blankRun = 0;

        continue;
      }

      // Linhas de continuação (após `\`): continuações de atribuição são alinhadas com o
      // início do valor da primeira linha; as demais são preservadas, ajustando apenas espaços finais
      if (inContinuation) {
        // Verifica se há alinhamento ativo (continuação de atribuição) e conteúdo na linha
        if (continuationAlignColumn !== null && classified.trimmed !== '') {
          emit(this.maybeTrimTrailing(' '.repeat(continuationAlignColumn) + raw.trimStart()), 'aligned-continuation');
        } else if (continuationInRecipe && classified.trimmed !== '') {
          // Continuações de recipe garantem o prefixo TAB (o make remove um TAB inicial das
          // continuações, então a conversão é segura), preservando a indentação extra após o
          // TAB — ela costuma ser intencional para legibilidade de blocos shell multilinha
          const withoutLeadingSpaces = raw.replace(/^ +/, '');
          const line = withoutLeadingSpaces.startsWith('\t') ? withoutLeadingSpaces : `\t${withoutLeadingSpaces}`;
          emit(this.maybeTrimTrailing(line), 'plain-continuation');
        } else {
          emit(this.maybeTrimTrailing(raw), 'plain-continuation');
        }

        inContinuation = classified.endsWithContinuation;

        // Encerra o alinhamento e o contexto de recipe quando a cadeia de continuações termina
        if (!inContinuation) {
          continuationAlignColumn = null;
          continuationInRecipe = false;
        }

        blankRun = 0;

        continue;
      }

      // Linhas vazias: reduz sequências consecutivas ao máximo configurado, sem encerrar o contexto de recipe
      if (classified.kind === 'blank') {
        blankRun++;

        // Verifica se o número de linhas em branco consecutivas está dentro do limite configurado
        if (blankRun <= this.opts.maxConsecutiveBlankLines) {
          emit('');
        }

        continue;
      }

      blankRun = 0;

      // Linhas de recipe (prefixadas com TAB) dentro do contexto de um alvo: o whitespace
      // inicial da primeira linha de cada comando lógico é normalizado para exatamente 1 TAB
      // (múltiplos TABs ou misturas de espaços e TABs são reduzidos); o corpo é preservado
      if (hasRecipePrefix(raw) && inRecipe) {
        // Verifica se a normalização do prefixo de recipe está habilitada
        if (this.opts.normalizeRecipePrefix) {
          emit(this.maybeTrimTrailing(`\t${raw.replace(/^[ \t]+/, '')}`));
        } else {
          emit(this.maybeTrimTrailing(raw));
        }

        inContinuation = classified.endsWithContinuation;
        continuationInRecipe = inContinuation;

        continue;
      }

      // Linhas de comando sem TAB dentro do contexto de recipe (em coluna 0 ou indentadas com
      // espaços, inclusive dentro de condicionais no corpo da regra): normaliza para TAB apenas
      // quando o conteúdo não é interpretável como sintaxe de Makefile. Linhas classificadas
      // como alvo, mas com cara de comando (modificador @/-/+ ou `:` apenas entre aspas),
      // também são tratadas como recipe.
      if (inRecipe && (classified.kind === 'other' || (classified.kind === 'target' && looksLikeRecipeCommand(classified.trimmed)))) {
        // Verifica se a normalização do prefixo de recipe está habilitada
        if (this.opts.normalizeRecipePrefix) {
          emit(this.maybeTrimTrailing(`\t${raw.replace(/^[ \t]+/, '')}`));
        } else {
          emit(this.maybeTrimTrailing(raw));
        }

        inContinuation = classified.endsWithContinuation;
        continuationInRecipe = inContinuation;

        continue;
      }

      // Comentários de linha inteira: preserva a indentação original e normaliza o marcador,
      // sem encerrar o contexto de recipe (comentários entre recipes são permitidos)
      if (classified.kind === 'comment') {
        const leading = raw.match(/^[ \t]*/)?.[0] ?? '';
        emit(leading + applyMakefileSpacing(lineForFormatting, 'comment', spacingCfg));
        inContinuation = classified.endsWithContinuation;

        continue;
      }

      // Linhas prefixadas com TAB fora do contexto de recipe e sem classificação conhecida: preserva sem reindentar
      if (hasRecipePrefix(raw) && classified.kind === 'other') {
        emit(this.maybeTrimTrailing(raw));
        inContinuation = classified.endsWithContinuation;

        continue;
      }

      // Abertura de bloco define: o conteúdo até endef será preservado sem alterações
      if (classified.kind === 'define-open') {
        emit(this.conditionalIndent(conditionalDepth, raw) + applyMakefileSpacing(lineForFormatting, 'define-open', spacingCfg));
        inDefine = true;
        inRecipe = false;
        inContinuation = false;

        continue;
      }

      // Condicionais: indentação por profundidade, sem encerrar o contexto de recipe
      // (condicionais entre linhas de recipe são um padrão comum em Makefiles)
      if (classified.kind === 'conditional-open') {
        emit(this.conditionalIndent(conditionalDepth, raw) + applyMakefileSpacing(lineForFormatting, 'conditional-open', spacingCfg));
        conditionalDepth++;
        inContinuation = classified.endsWithContinuation;

        continue;
      }
      if (classified.kind === 'conditional-else') {
        emit(this.conditionalIndent(Math.max(0, conditionalDepth - 1), raw) + applyMakefileSpacing(lineForFormatting, 'conditional-else', spacingCfg));
        inContinuation = classified.endsWithContinuation;

        continue;
      }
      if (classified.kind === 'conditional-end') {
        conditionalDepth = Math.max(0, conditionalDepth - 1);
        emit(this.conditionalIndent(conditionalDepth, raw) + applyMakefileSpacing(lineForFormatting, 'conditional-end', spacingCfg));
        inContinuation = classified.endsWithContinuation;

        continue;
      }

      // Declarações de alvo: iniciam o contexto de recipe
      if (classified.kind === 'target') {
        emit(this.conditionalIndent(conditionalDepth, raw) + applyMakefileSpacing(lineForFormatting, 'target', spacingCfg));
        inRecipe = true;
        inContinuation = classified.endsWithContinuation;

        continue;
      }

      // Atribuições, diretivas e demais linhas de sintaxe do make: encerram o contexto de recipe
      const emitted = this.conditionalIndent(conditionalDepth, raw) + applyMakefileSpacing(lineForFormatting, classified.kind, spacingCfg);
      emit(emitted, classified.kind === 'assignment' ? 'head' : 'other');
      inRecipe = false;
      inContinuation = classified.endsWithContinuation;

      // Habilita o alinhamento das continuações com o início do valor da atribuição.
      // Comentários inline são excluídos: o `\` pertence ao comentário, não ao valor.
      if (classified.kind === 'assignment' && inContinuation && findCommentStart(classified.trimmed) === -1) {
        continuationAlignColumn = getAssignmentValueColumn(emitted);
      }
    }

    // Alinhamento vertical dos operadores de atribuição em blocos contíguos, quando habilitado
    let lines = out;
    if (this.opts.alignAssignments) {
      lines = alignAssignmentBlocks(lines, metas);
    }

    // Aplica as transformações finais de formatação
    lines = removeLeadingBlankLines(lines, this.opts.removeLeadingBlankLines);

    // Junta as linhas formatadas em um único texto
    let resultLf = lines.join('\n');
    resultLf = ensureFinalNewline(resultLf, this.opts.insertFinalNewline);

    // Aplica o estilo de final de linha configurado ao texto formatado e retorna o resultado final.
    return applyLineEnding(resultLf, this.opts.lineEnding, originalText);
  }

  /**
   * Função para construir a indentação de uma linha com base na profundidade de condicionais.
   * A indentação de condicionais sempre usa espaços: TAB tem significado próprio em Makefiles
   * (prefixo de recipe) e não pode ser usado com segurança para indentação de diretivas.
   * @param depth A profundidade atual de blocos condicionais.
   * @param raw A linha original, usada para preservar a indentação quando a opção está desabilitada.
   * @returns A string de indentação a ser prefixada na linha.
   */
  private conditionalIndent (depth: number, raw: string): string {
    // Se a indentação de condicionais estiver desabilitada, preserva a indentação original da linha
    if (!this.opts.indentConditionals) {
      return raw.match(/^[ \t]*/)?.[0] ?? '';
    }

    return ' '.repeat(Math.max(0, this.opts.indentSize) * Math.max(0, depth));
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
