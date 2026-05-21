import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { isFullLineComment, isShebang } from './powerShellLex';
import { IndentState } from './types';

// Expressões regulares para identificar padrões de início de blocos e outros elementos que afetam a indentação
const END_WITH_OPTIONAL_INLINE_COMMENT = '(?:\\s*(?:#.*)?)$';
const CLOSE_BRACE_LINE_RE = /^\}/;
const SAME_LEVEL_CLAUSE_RE = /^(else|elseif|catch|finally)\b/i;
const OPEN_BRACE_LINE_RE = new RegExp(`\\{${END_WITH_OPTIONAL_INLINE_COMMENT}`);

/**
 * Função para criar o estado inicial de indentação.
 * @returns O estado inicial de indentação.
 */
export function createInitialState (): IndentState {
  return {
    indent: 0,
    inHeredoc: false,
    heredocEnd: '',
    continuation: false
  };
}

/**
 * Função para verificar se uma linha é uma continuação de linha (line continuation) em PowerShell.
 * Uma linha é considerada uma continuação de linha se termina com uma crase (`) que não é escapada por outra crase.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha for uma continuação de linha, `false` caso contrário.
 */
export function isLineContinuation (trimmed: string): boolean {
  return hasContinuationLine(trimmed, '`');
}

/**
 * Função para ajustar a indentação antes de processar uma linha de código.
 * Esta função verifica se a linha atual é um terminador de bloco (como `else`, `elseif`, `catch`, `finally` ou `}`) e,
 * se for, reduz a indentação para a próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param st O estado atual de indentação.
 */
export function dedentBeforeLine (trimmed: string, st: IndentState): void {
  // Shebang e linhas vazias não afetam a indentação
  if (isShebang(trimmed) || trimmed === '') {
    return;
  }

  // Comentários de linha inteira não afetam a indentação
  if (isFullLineComment(trimmed)) {
    return;
  }

  // Alinha o fechamento de bloco.
  if (CLOSE_BRACE_LINE_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Cláusulas que fecham e abrem bloco no mesmo nível.
  if (SAME_LEVEL_CLAUSE_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }
}

/**
 * Função para ajustar a indentação após processar uma linha de código.
 * Esta função verifica se a linha atual é um iniciador de bloco (como `{`, `continuation`) e,
 * se for, aumenta a indentação para a próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param st O estado atual de indentação.
 */
export function indentAfterLine (trimmed: string, st: IndentState): void {
  // Shebang e linhas vazias não afetam a indentação
  if (isShebang(trimmed) || trimmed === '') {
    return;
  }

  // Comentários de linha inteira não afetam a indentação
  if (isFullLineComment(trimmed)) {
    return;
  }

  // Continuação de linha — mantém o estado de indentação para a próxima linha
  if (isLineContinuation(trimmed)) {
    // Primeira linha de continuação — adiciona indentação para a próxima linha
    if (!st.continuation) {
      st.indent += 1;
      st.continuation = true;
    }

    return;
  }

  // Fim da continuação — remove a indentação temporária após esta linha ser processada
  if (st.continuation) {
    st.indent = Math.max(0, st.indent - 1);
    st.continuation = false;
  }

  // Blocos PowerShell delimitados por chaves.
  if (OPEN_BRACE_LINE_RE.test(trimmed)) {
    st.indent += 1;
  }
}
