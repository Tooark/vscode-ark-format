import { alignAssignmentBlocks as alignAssignmentBlocksGeneric, AlignableAssignmentParts, AssignmentAlignMeta } from '@tooark/ark-format-shared/align';
import { findCommentStart, findTargetSeparator, maskReferences } from './makefileLex';
import type { MakefileLineKind, MakefileSpacingOptions } from './types';

export type { AssignmentAlignMeta } from '@tooark/ark-format-shared/align';

/**
 * Interface para a configuração de espaçamento efetiva aplicada a uma linha.
 * Estende as opções de espaçamento (`MakefileSpacingOptions`) com:
 * - `collapseSpaces`: Se deve colapsar múltiplos espaços internos em um único espaço (nunca aplicado a comentários).
 */
export interface MakefileSpacingConfig extends MakefileSpacingOptions {
  collapseSpaces: boolean;
}

/**
 * Expressão regular para capturar uma atribuição: prefixos opcionais, nome da variável,
 * operador e valor. Grupos: 1 = prefixos (`export` etc.), 2 = nome, 3 = operador, 4 = valor.
 */
const ASSIGNMENT_PARTS_RE = /^((?:(?:export|override|private|unexport)\s+)*)([^\s:#=]+?)\s*(:{1,3}=|\?=|\+=|!=|=)[ \t]*(.*)$/d;

/**
 * Expressão regular para capturar o trecho de uma linha de atribuição que antecede o valor:
 * indentação, prefixos opcionais, nome da variável, operador e o espaçamento até o valor.
 */
const ASSIGNMENT_VALUE_COLUMN_RE = /^([ \t]*(?:(?:export|override|private|unexport)\s+)*[^\s:#=]+?\s*(?::{1,3}=|\?=|\+=|!=|=)[ \t]*)/;

/**
 * Tipagem para as partes de uma linha de atribuição de Makefile já formatada.
 * - `indent`: A indentação da linha (espaços, ou o conteúdo original preservado).
 * - `name`: O nome da variável, incluindo prefixos (`export`, `override`, etc.).
 * - `operator`: O operador de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`).
 * - `rest`: O valor da atribuição (incluindo comentário inline, se houver).
 */
export type FormattedAssignmentParts = AlignableAssignmentParts;

/**
 * Expressão regular para decompor uma linha de atribuição formatada em indentação,
 * nome (com prefixos), operador e valor.
 */
const FORMATTED_ASSIGNMENT_RE = /^([ \t]*)((?:(?:export|override|private|unexport)\s+)*[^\s:#=]+?)\s*(:{1,3}=|\?=|\+=|!=|=)[ \t]*(.*)$/d;

/**
 * Função para aplicar uma expressão regular (com a flag `d`) à linha com as referências mascaradas
 * e devolver os grupos com o texto original. Assim `=`, `:`, `#` e espaços dentro de `$(...)` não
 * são confundidos com o operador de atribuição nem com o início do valor.
 * @param re A expressão regular, com a flag `d` (índices dos grupos).
 * @param text O texto original.
 * @returns Os grupos capturados (índice 0 = casamento completo) com o texto original, ou null.
 */
function matchOutsideReferences (re: RegExp, text: string): string[] | null {
  const match = re.exec(maskReferences(text));

  // Sem casamento (ou sem índices) não há grupos a devolver
  if (!match?.indices) {
    return null;
  }

  return match.indices.map((range) => (range ? text.slice(range[0], range[1]) : ''));
}

/**
 * Função para decompor uma linha de atribuição já formatada em suas partes.
 * @param line A linha de atribuição completa, incluindo a indentação.
 * @returns As partes da atribuição, ou null se a linha não for uma atribuição.
 */
export function parseFormattedAssignment (line: string): FormattedAssignmentParts | null {
  const match = matchOutsideReferences(FORMATTED_ASSIGNMENT_RE, line);

  // Se a linha não corresponder ao padrão de atribuição, retorna null
  if (!match) {
    return null;
  }

  return {
    indent: match[1],
    name: match[2],
    operator: match[3],
    rest: match[4]
  };
}

/**
 * Função para alinhar verticalmente os operadores de atribuição em blocos contíguos de variáveis.
 * Delega ao motor genérico de alinhamento do pacote compartilhado, injetando o parser de
 * atribuições do Makefile. O preenchimento usa ESPAÇOS (nunca TAB, que tem significado
 * próprio no make) e o operador nunca é convertido em outro.
 * @param lines As linhas já formatadas.
 * @param meta Os metadados de alinhamento de cada linha, paralelos a `lines`.
 * @returns As linhas com os operadores de atribuição alinhados por bloco.
 */
export function alignAssignmentBlocks (lines: string[], meta: AssignmentAlignMeta[]): string[] {
  return alignAssignmentBlocksGeneric(lines, meta, parseFormattedAssignment);
}

/**
 * Função para calcular a coluna onde o valor de uma atribuição começa em uma linha já formatada.
 * Usada para alinhar linhas de continuação (`\`) de atribuições com o início do valor:
 * ```
 * SRCS = main.c \
 *        util.c \
 *        io.c
 * ```
 * @param line A linha de atribuição completa, incluindo a indentação.
 * @returns A coluna (base 0) onde o valor começa, ou null se a linha não for uma atribuição.
 */
export function getAssignmentValueColumn (line: string): number | null {
  const match = maskReferences(line).match(ASSIGNMENT_VALUE_COLUMN_RE);

  return match ? match[1].length : null;
}

/**
 * Função para aplicar espaçamento consistente em uma linha de Makefile, de acordo com as opções fornecidas.
 * A linha é dividida em parte de código e comentário inline; regras de código nunca são aplicadas ao comentário.
 * Linhas de recipe e conteúdo de `define ... endef` não devem passar por esta função (responsabilidade do formatador).
 * @param trimmedLine A linha já sem espaços iniciais e finais.
 * @param kind O tipo da linha, conforme classificado pelo lexer.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha com o espaçamento aplicado conforme as regras definidas.
 */
export function applyMakefileSpacing (trimmedLine: string, kind: MakefileLineKind, cfg: MakefileSpacingConfig): string {
  // Comentários de linha inteira recebem apenas a normalização do marcador
  if (kind === 'comment') {
    return normalizeCommentMarker(trimmedLine, cfg.spaceAfterCommentMarker);
  }

  // Separa a parte de código do comentário inline (o `#` não escapado e fora de referências
  // inicia comentário fora de recipes)
  const commentStart = findCommentStart(trimmedLine);
  const beforeComment = commentStart >= 0 ? trimmedLine.slice(0, commentStart) : trimmedLine;
  let code = commentStart >= 0 ? beforeComment.trimEnd() : trimmedLine;
  const comment = commentStart >= 0 ? normalizeCommentMarker(trimmedLine.slice(commentStart), cfg.spaceAfterCommentMarker) : '';

  // Espaço entre o código e o comentário inline: um único espaço. Em uma atribuição com valor, o
  // make inclui no valor os espaços antes do `#` (`DIR := /usr # x` vale `/usr ` e `DIR := /usr#x`
  // vale `/usr`), então o espaçamento original é mantido exatamente.
  let separator = ' ';

  // Aplica as regras específicas por tipo de linha
  switch (kind) {
    case 'assignment':
      if ((matchOutsideReferences(ASSIGNMENT_PARTS_RE, code)?.[4] ?? '') !== '') {
        separator = beforeComment.slice(code.length);
      }

      code = transformAssignment(code, cfg);
      break;
    case 'target':
      code = transformTarget(code, cfg);
      break;
    case 'conditional-open':
    case 'conditional-else':
      code = transformConditional(code, cfg);
      break;
    default:
      code = collapseInternalSpaces(code, cfg.collapseSpaces);
      break;
  }

  // Junta código e comentário inline
  if (comment !== '') {
    return code === '' ? comment : `${code}${separator}${comment}`;
  }

  return code;
}

/**
 * Função para normalizar o espaçamento em atribuições de variável.
 * Quando habilitado, garante um espaço em torno do operador (`VAR := valor`).
 * O valor da atribuição é preservado sem colapsar espaços internos, pois espaços em valores são significativos no make.
 * @param code A parte de código da linha de atribuição.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha de atribuição com o espaçamento normalizado.
 */
function transformAssignment (code: string, cfg: MakefileSpacingConfig): string {
  // Se a normalização de atribuição não estiver habilitada, retorna o código original
  if (!cfg.spaceAroundAssignment) {
    return code;
  }

  const match = matchOutsideReferences(ASSIGNMENT_PARTS_RE, code);

  // Se a linha não corresponder ao padrão de atribuição, retorna o código original
  if (!match) {
    return code;
  }

  const prefixes = match[1].replace(/\s+/g, ' ');
  const name = match[2];
  const operator = match[3];
  const value = match[4];

  // Atribuições sem valor terminam no operador, sem espaço final
  if (value === '') {
    return `${prefixes}${name} ${operator}`;
  }

  return `${prefixes}${name} ${operator} ${value}`;
}

/**
 * Função para normalizar o espaçamento em declarações de alvo.
 * Quando habilitado, remove espaços antes do `:` (ou `::`) e garante um único espaço após, quando há pré-requisitos.
 * @param code A parte de código da linha de alvo.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha de alvo com o espaçamento normalizado.
 */
function transformTarget (code: string, cfg: MakefileSpacingConfig): string {
  let s = code;

  // Verifica se a normalização do separador de alvo está habilitada
  if (cfg.spaceAfterTargetColon) {
    // Localiza o primeiro `:` que separa alvos de pré-requisitos (fora de referências, de
    // operadores de atribuição e de letras de unidade)
    const separator = findTargetSeparator(s);

    // Aplica a normalização apenas se houver alvo antes do separador
    if (separator && s.slice(0, separator.index).trim() !== '') {
      const targets = collapseInternalSpaces(s.slice(0, separator.index).trimEnd(), cfg.collapseSpaces);
      const colon = s.slice(separator.index, separator.index + separator.length);
      const rest = collapseInternalSpaces(s.slice(separator.index + separator.length).replace(/^[ \t]+/, ''), cfg.collapseSpaces);

      s = rest === '' ? `${targets}${colon}` : `${targets}${colon} ${rest}`;

      return s;
    }
  }

  return collapseInternalSpaces(s, cfg.collapseSpaces);
}

/**
 * Função para normalizar o espaçamento em condicionais do make.
 * Garante um único espaço entre a palavra-chave (`ifeq`, `ifneq`, `else ifeq`, etc.) e os
 * argumentos, conforme exigido pela sintaxe do GNU make. Os argumentos de `ifeq`/`ifneq` são
 * mantidos como estão: os espaços dentro deles fazem parte da comparação (`ifeq (a  b,a b)` é falso).
 * @param code A parte de código da linha condicional.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha condicional com o espaçamento normalizado.
 */
function transformConditional (code: string, cfg: MakefileSpacingConfig): string {
  const comparison = /^(else\s+)?(ifeq|ifneq)\s*(.*)$/.exec(code);

  // Comparações: normaliza apenas a palavra-chave e o espaço antes dos argumentos
  if (comparison) {
    const keyword = `${comparison[1] ? 'else ' : ''}${comparison[2]}`;

    return comparison[3] === '' ? keyword : `${keyword} ${comparison[3]}`;
  }

  return collapseInternalSpaces(code, cfg.collapseSpaces);
}

/**
 * Função para normalizar o espaçamento do marcador de comentário, garantindo um espaço
 * entre os caracteres `#` e o texto do comentário. Preserva marcadores múltiplos (`##`)
 * e linhas no estilo shebang (`#!`).
 * @param comment O comentário completo, iniciando em `#`.
 * @param enabled Um booleano indicando se a normalização deve ser aplicada.
 * @returns O comentário com o espaçamento do marcador normalizado.
 */
function normalizeCommentMarker (comment: string, enabled: boolean): string {
  // Se a normalização do marcador não estiver habilitada, retorna o comentário original
  if (!enabled) {
    return comment;
  }

  let markerEnd = 0;

  // Percorre os caracteres `#` consecutivos do marcador
  while (markerEnd < comment.length && comment[markerEnd] === '#') {
    markerEnd++;
  }

  // Preserva linhas no estilo shebang (`#!`)
  if (comment[markerEnd] === '!') {
    return comment;
  }

  // Se o marcador é seguido por espaço ou está no final da linha, não adiciona espaço extra
  if (markerEnd >= comment.length || /\s/.test(comment[markerEnd])) {
    return comment;
  }

  return `${comment.slice(0, markerEnd)} ${comment.slice(markerEnd)}`;
}

/**
 * Função para colapsar múltiplos espaços internos em um único espaço, preservando TABs.
 * TABs internos são preservados pois podem ser significativos em valores do make. Espaços dentro
 * de referências (`$(...)`, `${...}`) também são preservados: são argumentos de funções, como o
 * texto de `$(info a   b)`.
 * @param code O trecho de código a ser processado.
 * @param enabled Um booleano indicando se o colapso de espaços deve ser aplicado.
 * @returns O trecho de código com os espaços internos colapsados, se habilitado.
 */
function collapseInternalSpaces (code: string, enabled: boolean): string {
  // Se o colapso de espaços não estiver habilitado, retorna o código original
  if (!enabled) {
    return code;
  }

  let result = '';
  let last = 0;

  // As sequências de espaços são localizadas na máscara e removidas do texto original
  for (const match of maskReferences(code).matchAll(/(?<=\S) {2,}(?=\S)/g)) {
    result += `${code.slice(last, match.index)} `;
    last = match.index + match[0].length;
  }

  return result + code.slice(last);
}
