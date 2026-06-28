import type * as vscode from 'vscode';
import { ContinuationIndentState, FormatterOptions, FormatTextGenericParams, FormatTextState, LineEnding } from './types';

const CR_RE = /\r/g;
const LF_RE = /\n/g;
const CRLF_RE = /\r\n/g;

/**
 * Função para normalizar os finais de linha em um texto, convertendo CRLF e CR para LF.
 * @param text O texto a ser normalizado.
 * @returns O texto com finais de linha normalizados para LF.
 */
export function normalizeToLf (text: string): string {
  return text.replace(CRLF_RE, '\n').replace(CR_RE, '\n');
}

/**
 * Função para aplicar o estilo de final de linha especificado a um texto, com base no modo selecionado e no texto original.
 * @param textLf O texto com finais de linha normalizados para LF.
 * @param mode O modo de final de linha a ser aplicado (Auto, CRLF ou LF).
 * @param originalText O texto original, usado para detectar o estilo de final de linha quando o modo é Auto.
 * @returns O texto com o estilo de final de linha aplicado.
 */
export function applyLineEnding (textLf: string, mode: LineEnding, originalText: string): string {
  // Se o modo for Auto, detecta o estilo de final de linha do texto original e aplica ao texto normalizado.
  switch (mode) {
    case 'Auto':  // Detecta o estilo de final de linha do texto original.
      return CRLF_RE.test(originalText) ? textLf.replace(LF_RE, '\r\n') : textLf;
    case 'CRLF':  // Aplica o estilo de final de linha CRLF ao texto normalizado.
      return textLf.replace(LF_RE, '\r\n');
    default:  // Aplica o estilo de final de linha LF ao texto normalizado.
      return textLf;
  }
}

/**
 * Função para remover os espaços em branco no final de cada linha de um array de linhas, se a opção estiver habilitada.
 * @param lines O array de linhas a ser processado.
 * @param enabled Um booleano indicando se a remoção de espaços em branco no final das linhas deve ser aplicada.
 * @returns O array de linhas com os espaços em branco no final removidos, se a opção estiver habilitada; caso contrário, retorna as linhas originais.
 */
export function trimTrailingWhitespace (lines: string[], enabled: boolean): string[] {
  // Se a opção de remoção de espaços em branco no final das linhas não estiver habilitada, retorna as linhas originais.
  if (!enabled) {
    return lines;
  }

  // Remove os espaços em branco no final de cada linha usando uma expressão regular.
  return lines.map(line => line.trimEnd());
}

/**
 * Função para remover as linhas em branco no início de um array de linhas, se a opção estiver habilitada.
 * @param lines O array de linhas a ser processado.
 * @param enabled Um booleano indicando se a remoção de linhas em branco no início deve ser aplicada.
 * @returns O array de linhas com as linhas em branco no início removidas, se a opção estiver habilitada; caso contrário, retorna as linhas originais.
 */
export function removeLeadingBlankLines (lines: string[], enabled: boolean): string[] {
  // Se a opção de remoção de linhas em branco no início não estiver habilitada, retorna as linhas originais.
  if (!enabled) {
    return lines;
  }

  let index = 0;

  // Itera sobre as linhas do array de linhas para encontrar o índice da primeira linha que não é vazia ou contém apenas espaços em branco.
  while (index < lines.length && lines[index].trim() === '') {
    index++;
  }

  return lines.slice(index);
}

/**
 * Função para reduzir o número de linhas em branco consecutivas em um array de linhas, limitando o número máximo de linhas em branco consecutivas.
 * @param lines O array de linhas a ser processado.
 * @param maxConsecutive O número máximo de linhas em branco consecutivas permitido.
 * @returns O array de linhas com o número de linhas em branco consecutivas reduzido, limitando ao número máximo especificado.
 */
export function reduceBlankLines (lines: string[], maxConsecutive: number): string[] {
  const out: string[] = [];
  let blanks = 0;

  // Itera sobre cada linha do array de linhas para reduzir o número de linhas em branco consecutivas.
  for (const line of lines) {
    // Verifica se a linha é vazia ou contém apenas espaços em branco.
    if (line.trim() === '') {
      blanks++;

      // Verifica se o número de linhas em branco consecutivas é menor ou igual ao número máximo permitido
      if (blanks <= maxConsecutive) {
        out.push('');
      }

      continue;
    }

    blanks = 0;
    out.push(line);
  }

  return out;
}

/**
 * Função para garantir que um texto termine com uma nova linha, se a opção estiver habilitada.
 * @param text O texto a ser processado.
 * @param enabled Um booleano indicando se a adição de uma nova linha no final deve ser aplicada.
 * @returns O texto com uma nova linha no final, se a opção estiver habilitada; caso contrário, retorna o texto original.
 */
export function ensureFinalNewline (text: string, enabled = true): string {
  // Se a opção de garantir uma nova linha no final não estiver habilitada, retorna o texto original.
  if (!enabled) {
    return text;
  }

  return text.endsWith('\n') ? text : `${text}\n`;
}

/**
 * Função para detectar o estilo de indentação (tabs ou espaços) e o tamanho da indentação em um texto.
 * @param text O texto a ser analisado para detectar o estilo de indentação.
 * @returns Um objeto contendo uma propriedade useTabs (boolean) indicando se o estilo de indentação é tabs,
 * e uma propriedade size (number) indicando o tamanho da indentação em espaços (ou 1 se for tabs).
 */
export function detectIndent (text: string): { useTabs: boolean; size: number } {
  const lines = normalizeToLf(text).split('\n');
  let tabIndented = 0;
  const spacedIndents: number[] = [];

  // Itera sobre cada linha do texto para detectar o estilo de indentação.
  for (const line of lines) {
    // Verifica se a linha é vazia ou contém apenas espaços em branco.
    if (line.trim().length === 0) {
      continue;
    }

    const match = /^(\s+)/.exec(line);

    // Verifica se a linha tem indentação (espaços ou tabs) e, se tiver, determina o tipo de indentação.
    if (!match) {
      continue;
    }

    const indent = match[1];

    // Verifica se a linha contém tabs na indentação.
    if (indent.includes('\t')) {
      tabIndented++;

      continue;
    }

    spacedIndents.push(indent.length);
  }

  // Verifica se o número de linhas com indentação por tabs é maior do que o número de linhas com indentação por espaços.
  if (tabIndented > spacedIndents.length) {
    return { useTabs: true, size: 1 };
  }

  // Calcula o menor tamanho de indentação em espaços encontrado nas linhas do texto.
  const size = spacedIndents
    .filter(value => value > 0)
    .reduce((smallest, value) => {
      return smallest === 0 ? value : Math.min(smallest, value);
    }, 0);

  return { useTabs: false, size: size || 2 };
}

/**
 * Função para obter o texto de um documento do VS Code com base em um intervalo opcional, retornando o intervalo efetivo e o texto correspondente.
 * @param document O documento do VS Code do qual o texto deve ser obtido.
 * @param range Um intervalo opcional que especifica a parte do documento a ser obtida. Se não for fornecido, o intervalo abrangerá todo o documento.
 * @returns Um objeto contendo o intervalo efetivo e o texto correspondente ao intervalo no documento.
 */
export function parseRange (document: vscode.TextDocument, range?: vscode.Range): { range: vscode.Range; text: string } {
  const effectiveRange = range ?? ({
    start: document.positionAt(0),
    end: document.positionAt(document.getText().length)
  } as vscode.Range);

  return {
    range: effectiveRange,
    text: document.getText(effectiveRange)
  };
}

/**
 * Função auxiliar para calcular a quantidade mínima de espaços em branco no início de um
 * array de linhas, ignorando linhas vazias ou contendo apenas espaços em branco.
 * @param lines O array de linhas a ser analisado para calcular a quantidade mínima de espaços em branco no início.
 * @returns O número mínimo de espaços em branco no início das linhas, ou 0 se todas as linhas forem
 * vazias ou conterem apenas espaços em branco.
 */
export function getMinimumLeadingWhitespace (lines: string[]): number {
  let min = Number.POSITIVE_INFINITY;

  // Itera sobre cada linha do array de linhas
  for (const line of lines) {
    // Ignora linhas vazias ou contendo apenas espaços em branco
    if (line.trim() === '') {
      continue;
    }

    // Expressão regular para encontrar a quantidade de espaços em branco no início da linha
    const match = line.match(/^[ \t]*/);
    const count = match ? match[0].length : 0;
    if (count < min) {
      min = count;
    }
  }

  // Retorna o número mínimo de espaços em branco no início das linhas
  return Number.isFinite(min) ? min : 0;
}

/**
 * Função auxiliar para atualizar a indentação após processar uma linha de código,
 * com base no texto de controle da linha e no estado atual do formatador.
 * @param controlText O texto de controle da linha atual, usado para determinar se a indentação deve ser ajustada.
 * @param st O estado atual do formatador, que inclui a indentação e o status de continuação.
 * @param indentAfter A função de callback que ajusta a indentação com base no texto de controle e no estado.
 * @remark Estende o estado de indentação para incluir uma propriedade de continuação, indicando se a
 * linha atual é uma continuação da linha anterior.
 */
export function updateIndentAfterLineWithContinuation<T extends ContinuationIndentState> (
  controlText: string,
  st: T,
  indentAfter: (text: string, state: T) => void
): void {
  // Verifica se a linha atual é uma continuação da linha anterior (texto de controle vazio e estado de continuação ativo).
  if (controlText === '' && st.continuation) {
    st.indent = Math.max(0, st.indent - 1);
    st.continuation = false;

    return;
  }

  // Chama a função de callback para ajustar a indentação com base no texto de controle e no estado atual.
  indentAfter(controlText, st);
}

/**
 * Função genérica para formatar um texto com base em regras de formatação configuráveis,
 * aplicando indentação, espaçamento e outras transformações específicas.
 * @param params Um objeto contendo os parâmetros necessários para a formatação, incluindo
 * o texto original, as opções de formatação, funções para criar o estado inicial, ajustar
 * a indentação antes e depois de processar uma linha, detectar shebangs e heredocs, extrair
 * partes de código, determinar o modo de aspas e aplicar regras de espaçamento.
 * @returns O texto formatado de acordo com as regras e opções configuradas.
 */
export function formatTextGeneric<State extends FormatTextState, QuoteKind extends string, Opts extends FormatterOptions> (
  params: FormatTextGenericParams<State, QuoteKind, Opts>
): string {
  // Desestrutura os parâmetros necessários para a formatação do texto.
  const {
    originalText,
    opts,
    createInitialState,
    dedentBeforeLine,
    indentAfterLine,
    isShebang,
    detectHeredocInCode,
    getCodePartsOnly,
    getQuoteModeAfterLine,
    applySpacing,
    detectBlockCommentStart,
    isBlockCommentEnd,
    isBlockCommentKeyword,
    formatBlockComments
  } = params;

  // Normaliza os finais de linha do texto original para LF e divide o texto em linhas.
  const textLf = normalizeToLf(originalText);
  const rawLines = textLf.split('\n');
  const indentUnit = opts.indentStyle === 'tab' ? '\t' : ' '.repeat(Math.max(0, opts.indentSize));

  // Inicializa o estado da formatação, o modo de aspas, os buffers e o array de saída para as linhas formatadas.
  const st = createInitialState();
  let quoteMode: QuoteKind = 'code' as QuoteKind;
  let quoteIndentOffset = 0;
  let quoteBlockIndentLevel = 0;
  let quoteBuffer: string[] = [];
  let inBlockComment = false;
  let blockCommentBuffer: string[] = [];
  let blockCommentIndentLevel = 0;
  const out: string[] = [];

  // Função auxiliar para descarregar o buffer de um bloco de comentário (<# ... #>) na saída.
  // Quando `formatBlockComments` está desabilitado, o bloco é preservado sem alterações;
  // caso contrário, o conteúdo é reindentado com base no tamanho de indentação configurado.
  const flushBlockComment = (): void => {
    // Preserva o bloco de comentário literalmente quando a reformatação está desabilitada.
    if (!formatBlockComments) {
      for (const bline of blockCommentBuffer) {
        out.push(bline);
      }

      blockCommentBuffer = [];

      return;
    }

    const baseIndent = indentUnit.repeat(Math.max(0, blockCommentIndentLevel));
    const lastIndex = blockCommentBuffer.length - 1;
    let sawKeyword = false;

    // Itera sobre cada linha do bloco aplicando a indentação adequada.
    for (let idx = 0; idx < blockCommentBuffer.length; idx++) {
      const btrim = blockCommentBuffer[idx].trim();

      // Delimitadores <# e #> ficam alinhados ao nível do código ao redor.
      if (idx === 0 || idx === lastIndex) {
        out.push(baseIndent + btrim);

        continue;
      }

      // Linhas vazias permanecem vazias.
      if (btrim === '') {
        out.push('');

        continue;
      }

      // Palavras-chave da comment-based help recebem um nível; o conteúdo abaixo delas recebe dois.
      if (isBlockCommentKeyword?.(btrim)) {
        sawKeyword = true;
        out.push(baseIndent + indentUnit + btrim);

        continue;
      }

      out.push(baseIndent + indentUnit.repeat(sawKeyword ? 2 : 1) + btrim);
    }

    blockCommentBuffer = [];
  };

  // Itera sobre cada linha do texto original, aplicando a formatação conforme as regras configuradas.
  for (const raw of rawLines) {
    // Trim da linha para análise de controle, mas mantém o raw original para formatação e saída.
    const rawTrimmed = raw.trim();
    const lineForFormatting = opts.trimTrailingWhitespace ? rawTrimmed : raw.trimStart();
    const controlText = getCodePartsOnly(raw, quoteMode).trim();
    const nextQuoteMode = getQuoteModeAfterLine(raw, quoteMode);

    // Heredoc
    if (st.inHeredoc) {
      out.push(raw);

      // Verifica se a linha atual é o marcador de término do heredoc para sair do modo de heredoc.
      if (rawTrimmed === st.heredocEnd) {
        st.inHeredoc = false;
        st.heredocEnd = '';
      }

      continue;
    }

    // Bloco de comentário multilinha (<# ... #>) tratado como bloco opaco.
    if (inBlockComment) {
      blockCommentBuffer.push(raw);

      // Verifica se a linha atual encerra o bloco de comentário para descarregar o buffer.
      if (isBlockCommentEnd?.(rawTrimmed)) {
        flushBlockComment();
        inBlockComment = false;
      }

      continue;
    }

    // Multiline string/quote
    if (quoteMode !== 'code') {
      quoteBuffer.push(raw);

      // Verifica se o modo de aspas mudou para 'code', indicando o fim de um bloco de aspas multilinha, e processa o buffer de aspas.
      if (nextQuoteMode === 'code') {
        const minLeading = getMinimumLeadingWhitespace(quoteBuffer);
        const indentStr = indentUnit.repeat(Math.max(0, quoteBlockIndentLevel));

        // Itera sobre cada linha do buffer de aspas para aplicar a indentação correta
        for (const qline of quoteBuffer) {
          const qtrimmed = qline.trim();

          // Se a linha for vazia ou contiver apenas espaços em branco
          if (qtrimmed === '') {
            out.push('');

            continue;
          }

          out.push(indentStr + qline.slice(Math.min(minLeading, qline.length)));
        }

        // Limpa o buffer de aspas e atualiza a indentação após processar o bloco de aspas multilinha.
        quoteBuffer = [];
        updateIndentAfterLineWithContinuation(controlText, st, indentAfterLine);
        quoteIndentOffset = 0;
      }

      quoteMode = nextQuoteMode;

      continue;
    }

    // Detecta heredoc
    const heredocEnd = detectHeredocInCode(rawTrimmed);
    const entersMultilineQuote = quoteMode === 'code' && nextQuoteMode !== 'code';
    const nextQuoteIndentOffset = st.continuation ? 1 : 0;

    // Linhas vazias ou contendo apenas espaços em branco são tratadas como linhas vazias, sem aplicar formatação ou indentação.
    if (rawTrimmed === '') {
      out.push('');

      continue;
    }

    // Início de um bloco de comentário multilinha (<# ... #>). O bloco não altera o estado de indentação do código.
    if (detectBlockCommentStart?.(rawTrimmed)) {
      inBlockComment = true;
      blockCommentIndentLevel = st.indent;
      blockCommentBuffer = [raw];
      quoteMode = nextQuoteMode;

      continue;
    }

    // Aplica dedent antes de processar a linha atual.
    dedentBeforeLine(controlText, st);

    // Verifica se a linha atual é um shebang e, se for, não aplica formatação ou indentação.
    if (isShebang(rawTrimmed)) {
      out.push(lineForFormatting);
    } else {
      // Aplica regras de espaçamento específicas à linha de código
      const spaced = applySpacing(lineForFormatting, opts);
      const indentStr = indentUnit.repeat(Math.max(0, st.indent));
      out.push(indentStr + spaced);
    }

    // Aplica indentação após processar a linha atual, considerando o texto de controle e o estado de continuação.
    updateIndentAfterLineWithContinuation(controlText, st, indentAfterLine);

    // Verifica se a linha atual inicia um heredoc para entrar no modo de heredoc.
    if (heredocEnd) {
      st.inHeredoc = true;
      st.heredocEnd = heredocEnd;
    }

    // Verifica se a linha atual inicia um bloco de aspas multilinha.
    if (entersMultilineQuote) {
      quoteIndentOffset = nextQuoteIndentOffset;
      quoteBlockIndentLevel = st.indent + quoteIndentOffset;
    }

    quoteMode = nextQuoteMode;
  }

  // Descarrega um bloco de comentário não terminado ao final do texto.
  if (inBlockComment) {
    flushBlockComment();
    inBlockComment = false;
  }

  // Aplica as transformações finais de formatação
  let lines = out;
  lines = trimTrailingWhitespace(lines, opts.trimTrailingWhitespace);
  lines = reduceBlankLines(lines, opts.maxConsecutiveBlankLines);
  lines = removeLeadingBlankLines(lines, opts.removeLeadingBlankLines);

  // Junta as linhas formatadas em um único texto
  let resultLf = lines.join('\n');
  resultLf = ensureFinalNewline(resultLf, opts.insertFinalNewline);

  // Aplica o estilo de final de linha configurado ao texto formatado e retorna o resultado final.
  return applyLineEnding(resultLf, opts.lineEnding, originalText);
}
