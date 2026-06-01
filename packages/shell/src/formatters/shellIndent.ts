import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { isFullLineComment, isShebang } from './shellLex';
import { IndentState } from './types';

// Expressões regulares para identificar padrões de início de blocos e outros elementos que afetam a indentação
const END_WITH_OPTIONAL_INLINE_COMMENT = '(?:\\s*(?:#.*)?)$';
const CASE_BRANCH_TERMINATOR_RE = /^(?:;;|;&|;;&)\s*(?:#.*)?$/;
const CASE_BRANCH_TERMINATOR_INLINE_RE = /(?:;;|;&|;;&)\s*(?:#.*)?$/;
const CASE_IN_START_RE = new RegExp(`^case\\b.*\\bin${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const THEN_LINE_RE = new RegExp(`\\bthen${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const ELIF_THEN_LINE_RE = new RegExp(`^elif\\b.*;\\s*then${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const DO_LINE_RE = new RegExp(`\\bdo${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const OPEN_BRACE_LINE_RE = new RegExp(`\\{${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const CASE_PATTERN_LINE_RE = new RegExp(`\\)${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const TCSH_CASE_LABEL_RE = new RegExp(`^case\\b.*:${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const TCSH_DEFAULT_LABEL_RE = new RegExp(`^default:${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const CASE_STACK_BY_STATE = new WeakMap<IndentState, boolean[]>();

/**
 * Função para obter a pilha de estados de case associada ao estado de indentação atual.
 * A pilha de estados de case é usada para rastrear se estamos dentro de um bloco de case e
 * se estamos dentro do corpo de um padrão específico.
 * @param st O estado atual de indentação.
 * @returns A pilha de estados de case associada ao estado de indentação atual.
 */
function getCaseStack (st: IndentState): boolean[] {
  let stack = CASE_STACK_BY_STATE.get(st);

  // Verifica se já existe uma pilha de estados de case para o estado de indentação atual.
  if (!stack) {
    stack = st.inCase ? [Boolean(st.inCasePatternBody)] : [];
    CASE_STACK_BY_STATE.set(st, stack);
  }

  return stack;
}

/**
 * Função para sincronizar os flags de estado de case no estado de indentação com a pilha de estados de case.
 * Esta função é chamada sempre que a pilha de estados de case é modificada para garantir que os flags `inCase`
 * e `inCasePatternBody` no estado de indentação estejam sempre consistentes com o conteúdo da pilha.
 * @param st O estado atual de indentação.
 * @param stack A pilha de estados de case que deve ser sincronizada com o estado de indentação.
 */
function syncCaseFlagsFromStack (st: IndentState, stack: boolean[]): void {
  st.inCase = stack.length > 0;
  st.inCasePatternBody = stack.length > 0 ? stack[stack.length - 1] : false;
}

/**
 * Função para verificar se uma linha de código abre um bloco de corpo de `if` ou `else` na próxima linha.
 * Esta função é necessária para lidar com casos onde o `then` está presente na mesma linha do `if` ou `elif`,
 * mas o corpo do bloco começa na próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha abrir um bloco de corpo de `if` ou `else` na próxima linha, `false` caso contrário.
 */
function opensIfBodyOnNextLine (trimmed: string): boolean {
  // Verifica se a linha começa com `if` ou `elif` e contém `then`, mas não tem `fi` após o `then`.
  if (!/^(if|elif)\b/.test(trimmed) || !/\bthen\b/.test(trimmed)) {
    return false;
  }

  const thenIndex = trimmed.indexOf('then');
  const afterThen = thenIndex >= 0 ? trimmed.slice(thenIndex + 4) : '';

  return !/\bfi\b/.test(afterThen);
}

/**
 * Função para verificar se uma linha de código abre um bloco de corpo de `else` na próxima linha.
 * Esta função é necessária para lidar com casos onde o `else` está presente na mesma linha do `if` ou `elif`,
 * mas o corpo do bloco começa na próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha abrir um bloco de corpo de `else` na próxima linha, `false` caso contrário.
 */
function opensElseBodyOnNextLine (trimmed: string): boolean {
  return /^else\b/.test(trimmed) && !/\bfi\b/.test(trimmed);
}

/**
 * Função para verificar se uma linha de código fecha um bloco de corpo de `if` ou `elif` que foi aberto na mesma linha.
 * Esta função é necessária para lidar com casos onde o `then` está presente na mesma linha do `if` ou `elif`,
 * e o bloco de corpo é fechado na mesma linha com `fi` ou `endif`.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha fechar um bloco de corpo de `if` ou `elif` que foi aberto na mesma linha, `false` caso contrário.
 */
function closesIfBodyInlineOnCurrentLine (trimmed: string): boolean {
  // Linhas que terminam com `fi` ou `endif` não devem ser consideradas como fechamento de bloco inline, pois já são tratadas em dedentBeforeLine.
  if (/^(fi|endif)\b/.test(trimmed)) {
    return false;
  }

  const withoutInlineComment = trimmed.replace(/\s+#.*$/, '');
  const inlineCloseMatch = /;\s*(fi|endif)\b/.exec(withoutInlineComment);

  // Se não encontrar um fechamento inline de `fi` ou `endif`, retorna false.
  if (!inlineCloseMatch) {
    return false;
  }

  // Linhas começando com else/elif já fazem dedent em dedentBeforeLine.
  if (/^(else|elif)\b/.test(withoutInlineComment)) {
    return false;
  }

  const beforeInlineClose = withoutInlineComment.slice(0, inlineCloseMatch.index);

  // if/elif completo em uma única linha (abre e fecha na mesma linha) não deve alterar a indentação da próxima linha.
  if (/^(if|elif)\b/.test(beforeInlineClose) && /\bthen\b/.test(beforeInlineClose)) {
    return false;
  }

  return true;
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
    inCase: false,
    inCasePatternBody: false,
    continuation: false
  };
}

/**
 * Função para verificar se uma linha é uma continuação de linha (line continuation) em shell script.
 * Uma linha é considerada uma continuação de linha se termina com uma barra invertida (`\`) que não é escapada por outra barra invertida.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha for uma continuação de linha, `false` caso contrário.
 */
export function isLineContinuation (trimmed: string): boolean {
  return hasContinuationLine(trimmed, '\\');
}

/**
 * Função para ajustar a indentação antes de processar uma linha de código.
 * Esta função verifica se a linha atual é um terminador de bloco (como `fi`, `done`, `esac`, etc.)
 * e, se for, reduz a indentação para a próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param st O estado atual de indentação.
 */
export function dedentBeforeLine (trimmed: string, st: IndentState): void {
  const caseStack = getCaseStack(st);

  // Shebang e linhas vazias não afetam a indentação
  if (isShebang(trimmed) || trimmed === '') {
    return;
  }

  // Comentários de linha inteira não afetam a indentação
  if (isFullLineComment(trimmed)) {
    return;
  }

  // caso termine com: ;; ; ;& ;;&
  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && (/^(;;?&?|;;&)/.test(trimmed) || CASE_BRANCH_TERMINATOR_RE.test(trimmed))) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // tcsh switch labels: dedenta o corpo anterior para alinhar novo case/default
  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && (/^case\b.*:\s*$/.test(trimmed) || /^default:\s*$/.test(trimmed))) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Blocos de controle
  if (/^(fi|endif)\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de loop - suporte legado tcsh (foreach/while)
  if (/^(done)\b/.test(trimmed) || /^(end)\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de case
  if (/^esac\b/.test(trimmed) || /^endsw\b/.test(trimmed)) {
    // Se estiver dentro de um bloco de case, precisa verificar se está dentro do corpo de um padrão
    if (caseStack.length > 0 && caseStack[caseStack.length - 1]) {
      st.indent = Math.max(0, st.indent - 1);
      caseStack[caseStack.length - 1] = false;
    }

    if (caseStack.length > 0) {
      caseStack.pop();
    }

    st.indent = Math.max(0, st.indent - 1);
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Blocos de função
  if (/^(else|elif)\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de código
  if (/^\}/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }
}

/**
 * Função para ajustar a indentação após processar uma linha de código.
 * Esta função verifica se a linha atual é um iniciador de bloco (como `if`, `for`, `case`, etc.) e, se for, aumenta a indentação para a próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param st O estado atual de indentação.
 */
export function indentAfterLine (trimmed: string, st: IndentState): void {
  const caseStack = getCaseStack(st);

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

  // Verifica se a linha fecha um bloco de corpo de `if` ou `elif` que foi aberto na mesma linha
  if (closesIfBodyInlineOnCurrentLine(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
  }

  // Blocos de controle - bloco case
  if (CASE_IN_START_RE.test(trimmed)) {
    st.indent += 1;
    caseStack.push(false);
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Bloco switch (tcsh)
  if (/^switch\b/.test(trimmed)) {
    st.indent += 1;
    caseStack.push(false);
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Blocos then, else, elif
  if (THEN_LINE_RE.test(trimmed) || ELIF_THEN_LINE_RE.test(trimmed) || opensIfBodyOnNextLine(trimmed) || opensElseBodyOnNextLine(trimmed)) {
    st.indent += 1;

    return;
  }

  // Blocos de loop - suporte legado tcsh (foreach, while)
  if (DO_LINE_RE.test(trimmed) || /^foreach\b/.test(trimmed) || /^while\b/.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Blocos {
  if (OPEN_BRACE_LINE_RE.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Padrões de case
  if (caseStack.length > 0 && !caseStack[caseStack.length - 1] && CASE_PATTERN_LINE_RE.test(trimmed) && !/^(;;?&?|;;&)/.test(trimmed)) {
    st.indent += 1;
    caseStack[caseStack.length - 1] = true;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && CASE_BRANCH_TERMINATOR_INLINE_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Labels de switch tcsh
  if (caseStack.length > 0 && !caseStack[caseStack.length - 1] && (TCSH_CASE_LABEL_RE.test(trimmed) || TCSH_DEFAULT_LABEL_RE.test(trimmed))) {
    st.indent += 1;
    caseStack[caseStack.length - 1] = true;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Terminador de bloco de label tcsh
  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && /^breaksw\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);
  }
}
