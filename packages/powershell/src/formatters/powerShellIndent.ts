import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { isFullLineComment, isShebang } from './powerShellLex';
import { IndentState } from './types';

// Expressões regulares para identificar padrões de início de blocos e outros elementos que afetam a indentação
const END_WITH_OPTIONAL_INLINE_COMMENT = '(?:\\s*(?:#.*)?)$';
const CLOSE_BRACE_LINE_RE = /^\}/;
const SAME_LEVEL_CLAUSE_RE = /^(else|elseif|catch|finally)\b/i;
const OPEN_BRACE_LINE_RE = new RegExp(`\\{${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const CLOSE_PAREN_LINE_RE = /^\)/;

/**
 * Função para calcular o saldo de parênteses de uma linha (aberturas menos fechamentos).
 * Recebe apenas as partes de código da linha (strings e comentários já removidos pelo
 * chamador via `getCodePartsOnly`), então parênteses literais não contam.
 * @param text O texto de controle da linha (apenas código).
 * @returns O saldo: positivo quando a linha abre parênteses sem fechar, negativo quando fecha.
 */
function netParenBalance (text: string): number {
  let balance = 0;

  // Percorre os caracteres somando aberturas e subtraindo fechamentos
  for (const ch of text) {
    if (ch === '(') {
      balance++;
    } else if (ch === ')') {
      balance--;
    }
  }

  return balance;
}

/**
 * Função para criar o estado inicial de indentação.
 * @returns O estado inicial de indentação.
 */
export function createInitialState (): IndentState {
  return {
    indent: 0,
    inHeredoc: false,
    heredocEnd: '',
    continuation: false,
    parenDepth: 0,
    afterCloseBrace: false
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

  // Alinha o fechamento de parênteses multilinha (`)` de arrays `@(...)`, subexpressões
  // `$(...)`, chamadas com argumentos quebrados e blocos `param (...)`), no mesmo nível
  // da linha que abriu. A profundidade rastreada evita dedentar em `)` sem abertura pendente.
  if (st.parenDepth > 0 && CLOSE_PAREN_LINE_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Cláusulas que fecham e abrem bloco no mesmo nível. Quando a cláusula está escrita
  // na mesma linha do fechamento (`} catch {`), o dedent vem do próprio `}`; quando vem
  // em linha própria após um `}` isolado, o dedent já aconteceu na linha anterior e não
  // deve ser aplicado de novo.
  if (SAME_LEVEL_CLAUSE_RE.test(trimmed)) {
    // Aplica o dedent apenas quando a linha anterior não foi um `}` isolado
    if (!st.afterCloseBrace) {
      st.indent = Math.max(0, st.indent - 1);
    }

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

  // Registra se esta linha foi um `}` isolado (fechamento que já dedentou e não abriu
  // outro bloco), para a cláusula `else`/`catch`/`finally` em linha própria não dedentar de novo
  st.afterCloseBrace = CLOSE_BRACE_LINE_RE.test(trimmed) && !OPEN_BRACE_LINE_RE.test(trimmed);

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

  // Parênteses multilinha: `(`, `@(` ou `$(` abertos sem fechamento na mesma linha
  // (arrays, subexpressões, chamadas com argumentos quebrados, blocos `param (...)`)
  // aumentam o nível para o conteúdo interno; fechamentos correspondentes reduzem.
  const parenBalance = netParenBalance(trimmed);

  // Verifica se a linha abre ou fecha parênteses multilinha
  if (parenBalance > 0) {
    st.indent += parenBalance;
    st.parenDepth += parenBalance;
  } else if (parenBalance < 0) {
    // Fecha no máximo a profundidade pendente, ignorando `)` sem abertura rastreada
    const closes = Math.min(-parenBalance, st.parenDepth);

    // O `)` no início da linha já dedentou em dedentBeforeLine — não reduz de novo
    const alreadyDedented = closes > 0 && CLOSE_PAREN_LINE_RE.test(trimmed) ? 1 : 0;
    st.parenDepth -= closes;
    st.indent = Math.max(0, st.indent - Math.max(0, closes - alreadyDedented));
  }

  // Blocos PowerShell delimitados por chaves.
  if (OPEN_BRACE_LINE_RE.test(trimmed)) {
    st.indent += 1;
  }
}
