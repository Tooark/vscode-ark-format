import { hasOddTrailingExplicitMarker } from '@tooark/ark-format-shared/indent';
import { isFullLineComment } from '@tooark/ark-format-shared/lex';
import type { ClassifiedLine, MakefileLineKind } from './types';

export { isFullLineComment } from '@tooark/ark-format-shared/lex';

/** Expressão regular para abertura de condicionais do make (`ifeq`, `ifneq`, `ifdef`, `ifndef`). */
const CONDITIONAL_OPEN_RE = /^(ifeq|ifneq|ifdef|ifndef)(\s|\(|$)/;

/** Expressão regular para a cláusula `else` de condicionais (incluindo `else ifeq ...`). */
const CONDITIONAL_ELSE_RE = /^else(\s|$)/;

/** Expressão regular para o fechamento de condicionais (`endif`). */
const CONDITIONAL_END_RE = /^endif(\s|$)/;

/** Expressão regular para a abertura de definição multilinha (`define NOME`). */
const DEFINE_OPEN_RE = /^(override\s+)?define(\s|$)/;

/** Expressão regular para o fechamento de definição multilinha (`endef`). */
const DEFINE_END_RE = /^endef(\s|$)/;

/** Expressão regular para diretivas do make que não são atribuições nem alvos. */
const DIRECTIVE_RE = /^(-?include|sinclude|export|unexport|override|undefine|private|vpath|load|-load)(\s|$)/;

/**
 * Expressão regular para atribuições de variável, com prefixos opcionais (`export`, `override`, `private`).
 * Suporta os operadores `=`, `:=`, `::=`, `:::=`, `?=`, `+=` e `!=`.
 */
const ASSIGNMENT_RE = /^(?:(?:export|override|private|unexport)\s+)*[^\s:#=]+\s*(:{1,3}=|\?=|\+=|!=|=)/;

/**
 * Expressão regular para declarações de alvo (`alvo: pré-requisitos`).
 * Aceita múltiplos alvos separados por espaço e regras de padrão (`%.o: %.c`),
 * exigindo `:` ou `::` que não faça parte de um operador de atribuição (`:=`, `::=`).
 */
const TARGET_RE = /^[^\s#=][^#=]*?::?(?!=)/;

/**
 * Função para verificar se uma linha termina com uma continuação de linha (`\`).
 * Um número par de barras invertidas representa barras literais escapadas, não continuação.
 * @param line A linha a ser verificada (pode conter espaços finais, que são ignorados).
 * @returns Verdadeiro se a linha terminar com um número ímpar de barras invertidas.
 */
export function endsWithLineContinuation (line: string): boolean {
  return hasOddTrailingExplicitMarker(line.trimEnd(), '\\');
}

/**
 * Função para verificar se uma linha usa o prefixo de recipe (TAB) do make.
 * @param raw A linha original, com a indentação preservada.
 * @returns Verdadeiro se a linha começar com TAB.
 */
export function hasRecipePrefix (raw: string): boolean {
  return raw.startsWith('\t');
}

/**
 * Função para encontrar a posição do início de um comentário em uma linha de Makefile.
 * Ignora `#` escapados com `\` (que o make trata como caractere literal).
 * @param code A linha de código a ser analisada.
 * @returns A posição do início do comentário ou -1 se não houver comentário.
 */
export function findCommentStart (code: string): number {
  // Itera sobre a linha para encontrar um `#` não escapado
  for (let i = 0; i < code.length; i++) {
    // Verifica se o caractere atual é `#`
    if (code[i] !== '#') {
      continue;
    }

    // Conta as barras invertidas imediatamente anteriores para detectar escape (`\#`)
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && code[j] === '\\'; j--) {
      backslashes++;
    }

    // Um número ímpar de barras invertidas indica um `#` escapado (literal)
    if (backslashes % 2 === 1) {
      continue;
    }

    return i;
  }

  return -1;
}

/**
 * Função para verificar se uma linha classificada como alvo é, na verdade, um comando de recipe.
 * Usada apenas dentro do contexto de recipe, para desambiguar comandos de shell que contêm `:`
 * (ex.: `@echo "Projeto: $(NAME)"` ou `docker run -p 8080:80`).
 * Sinais de comando:
 * - A linha começa com um modificador de recipe do make (`@`, `-` ou `+`).
 * - O `:` aparece apenas dentro de aspas (em um alvo real, o separador fica fora de aspas).
 * @param trimmed A linha sem espaços em branco iniciais e finais.
 * @returns Verdadeiro se a linha deve ser tratada como comando de recipe.
 */
export function looksLikeRecipeCommand (trimmed: string): boolean {
  // Modificadores de recipe do make no início da linha indicam comando
  if (/^[@+-]/.test(trimmed)) {
    return true;
  }

  // Remove os trechos entre aspas e verifica se ainda há um separador de alvo
  const unquoted = trimmed.replace(/"[^"]*"|'[^']*'/g, '');

  return !TARGET_RE.test(unquoted);
}

/**
 * Função para determinar o tipo de uma linha de Makefile a partir do conteúdo sem indentação.
 * A classificação é livre de contexto: o formatador é responsável por aplicar o contexto
 * (ex.: linhas com prefixo TAB dentro de um bloco de recipe são recipes, não importa o conteúdo).
 * @param trimmed A linha sem espaços em branco iniciais e finais.
 * @returns O tipo da linha, conforme `MakefileLineKind`.
 */
export function classifyTrimmedLine (trimmed: string): MakefileLineKind {
  // Linha vazia ou contendo apenas espaços em branco
  if (trimmed === '') {
    return 'blank';
  }

  // Comentário de linha inteira
  if (isFullLineComment(trimmed)) {
    return 'comment';
  }

  // Definições multilinha (define ... endef) — verificadas antes das demais diretivas
  if (DEFINE_OPEN_RE.test(trimmed)) {
    return 'define-open';
  }
  if (DEFINE_END_RE.test(trimmed)) {
    return 'define-end';
  }

  // Condicionais (ifeq/ifneq/ifdef/ifndef ... else ... endif)
  if (CONDITIONAL_OPEN_RE.test(trimmed)) {
    return 'conditional-open';
  }
  if (CONDITIONAL_ELSE_RE.test(trimmed)) {
    return 'conditional-else';
  }
  if (CONDITIONAL_END_RE.test(trimmed)) {
    return 'conditional-end';
  }

  // Atribuições de variável — verificadas antes de diretivas para capturar `export VAR := valor`
  if (ASSIGNMENT_RE.test(trimmed)) {
    return 'assignment';
  }

  // Diretivas do make (include, export, vpath, etc.)
  if (DIRECTIVE_RE.test(trimmed)) {
    return 'directive';
  }

  // Declarações de alvo (regras)
  if (TARGET_RE.test(trimmed)) {
    return 'target';
  }

  return 'other';
}

/**
 * Função para classificar uma linha de Makefile, produzindo o tipo e metadados úteis para o formatador.
 * @param raw A linha original, com a indentação preservada.
 * @returns Um objeto `ClassifiedLine` com o tipo da linha, o conteúdo original, o conteúdo sem
 * espaços em branco e a indicação de continuação de linha.
 */
export function classifyLine (raw: string): ClassifiedLine {
  const trimmed = raw.trim();

  return {
    kind: classifyTrimmedLine(trimmed),
    raw,
    trimmed,
    endsWithContinuation: endsWithLineContinuation(raw)
  };
}

/**
 * Função para detectar se o texto redefine o prefixo de recipe do make (`.RECIPEPREFIX`).
 * Quando o prefixo é redefinido, a detecção de recipes por TAB deixa de ser válida e o
 * formatador deve preservar o documento sem alterações por segurança.
 * @param textLf O texto completo do documento, com finais de linha normalizados para LF.
 * @returns Verdadeiro se o texto contiver uma atribuição de `.RECIPEPREFIX`.
 */
export function usesCustomRecipePrefix (textLf: string): boolean {
  return /^\s*\.RECIPEPREFIX\s*(:{1,3}=|\?=|\+=|!=|=)/m.test(textLf);
}
