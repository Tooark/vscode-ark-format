import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { findCommentStartInLine, isFullLineComment, isShebang } from './shellLex';
import { IndentState, QuoteState } from './types';

// Limites de palavra shell. Uma palavra só termina em espaço ou metacaractere (`;&|()<>`), e não em
// `-`, `=`, `.` etc. como o `\b` de regex: `end-of-line`, `end=5` e `done-task` são palavras comuns,
// não as palavras reservadas `end` e `done`.
const WORD_START = '(?<![^\\s;&|()<>])';
const WORD_END = '(?![^\\s;&|()<>])';
// Fim de `if`/`elif`: aceita também `[` colado (`if[ ... ]`), que o espaçamento separa em seguida.
const IF_WORD_END = '(?![^\\s;&|()<>[])';
// Fim de linha após uma palavra, com comentário inline opcional. O `#` só inicia um comentário no
// início de uma palavra, então precisa de espaço antes: `${#var}` no fim da linha não é `{` + comentário.
const END_AFTER_WORD = '(?:\\s+#.*|\\s*)$';
// Fim de linha após um metacaractere (`)`, `;;`), onde o comentário pode vir colado.
const END_AFTER_METACHAR = '\\s*(?:#.*)?$';

// Expressões regulares para identificar padrões de início de blocos e outros elementos que afetam a indentação
const CASE_BRANCH_TERMINATOR_RE = /^(?:;;|;&|;;&)\s*(?:#.*)?$/;
const CASE_BRANCH_TERMINATOR_INLINE_RE = /(?:;;|;&|;;&)\s*(?:#.*)?$/;
const CASE_IN_START_RE = new RegExp(`^case${WORD_END}.*${WORD_START}in${END_AFTER_WORD}`);
const THEN_LINE_RE = new RegExp(`${WORD_START}then${END_AFTER_WORD}`);
const ELIF_THEN_LINE_RE = new RegExp(`^elif${IF_WORD_END}.*;\\s*then${END_AFTER_WORD}`);
const DO_LINE_RE = new RegExp(`${WORD_START}do${END_AFTER_WORD}`);
const OPEN_BRACE_LINE_RE = new RegExp(`\\{${END_AFTER_WORD}`);
const CASE_PATTERN_LINE_RE = new RegExp(`\\)${END_AFTER_METACHAR}`);
const TCSH_CASE_LABEL_RE = new RegExp(`^case${WORD_END}.*:${END_AFTER_WORD}`);
const TCSH_DEFAULT_LABEL_RE = new RegExp(`^default:${END_AFTER_WORD}`);
const TCSH_CASE_LABEL_ONLY_RE = new RegExp(`^case${WORD_END}.*:\\s*$`);
const TCSH_DEFAULT_LABEL_ONLY_RE = /^default:\s*$/;
const IF_START_RE = new RegExp(`^(?:if|elif)${IF_WORD_END}`);
const ELSE_START_RE = new RegExp(`^else${WORD_END}`);
const ELSE_ELIF_START_RE = new RegExp(`^(?:else${WORD_END}|elif${IF_WORD_END})`);
const IF_END_START_RE = new RegExp(`^(?:fi|endif)${WORD_END}`);
const LOOP_END_START_RE = new RegExp(`^(?:done|end)${WORD_END}`);
const CASE_END_START_RE = new RegExp(`^(?:esac|endsw)${WORD_END}`);
const SWITCH_START_RE = new RegExp(`^switch${WORD_END}`);
const FOREACH_START_RE = new RegExp(`^foreach${WORD_END}`);
const WHILE_START_RE = new RegExp(`^while${WORD_END}`);
const DO_ONLY_LINE_RE = new RegExp(`^do${END_AFTER_WORD}`);
const DO_WORD_RE = new RegExp(`${WORD_START}do${WORD_END}`);
const DONE_WORD_RE = new RegExp(`${WORD_START}done${WORD_END}`);
const BREAKSW_START_RE = new RegExp(`^breaksw${WORD_END}`);
const THEN_WORD_RE = new RegExp(`${WORD_START}then${WORD_END}`);
const FI_WORD_RE = new RegExp(`${WORD_START}fi${WORD_END}`);
const INLINE_IF_END_RE = new RegExp(`;\\s*(?:fi|endif)${WORD_END}`);
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
  const thenMatch = IF_START_RE.test(trimmed) ? THEN_WORD_RE.exec(trimmed) : null;

  if (!thenMatch) {
    return false;
  }

  const afterThen = trimmed.slice(thenMatch.index + thenMatch[0].length);

  return !FI_WORD_RE.test(afterThen);
}

/**
 * Função para verificar se uma linha de código abre um bloco de corpo de `else` na próxima linha.
 * Esta função é necessária para lidar com casos onde o `else` está presente na mesma linha do `if` ou `elif`,
 * mas o corpo do bloco começa na próxima linha.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @returns `true` se a linha abrir um bloco de corpo de `else` na próxima linha, `false` caso contrário.
 */
function opensElseBodyOnNextLine (trimmed: string): boolean {
  return ELSE_START_RE.test(trimmed) && !FI_WORD_RE.test(trimmed);
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
  if (IF_END_START_RE.test(trimmed)) {
    return false;
  }

  const withoutInlineComment = trimmed.replace(/\s+#.*$/, '');
  const inlineCloseMatch = INLINE_IF_END_RE.exec(withoutInlineComment);

  // Se não encontrar um fechamento inline de `fi` ou `endif`, retorna false.
  if (!inlineCloseMatch) {
    return false;
  }

  // Linhas começando com else/elif já fazem dedent em dedentBeforeLine.
  if (ELSE_ELIF_START_RE.test(withoutInlineComment)) {
    return false;
  }

  const beforeInlineClose = withoutInlineComment.slice(0, inlineCloseMatch.index);

  // if/elif completo em uma única linha (abre e fecha na mesma linha) não deve alterar a indentação da próxima linha.
  if (IF_START_RE.test(beforeInlineClose) && THEN_WORD_RE.test(beforeInlineClose)) {
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
 * Função para verificar se uma linha original continua na linha seguinte, desconsiderando o texto
 * de um comentário: `x=1 # a | b |` e `x=1 # C:\` terminam em `|` e `\`, mas não continuam.
 * @param raw A linha original (sem trim).
 * @param quoteMode O estado de aspas vindo da linha anterior.
 * @returns `true` se o código da linha terminar com continuação, `false` caso contrário.
 */
export function continuesOnNextLine (raw: string, quoteMode: QuoteState = 'code'): boolean {
  const commentStart = findCommentStartInLine(raw, quoteMode);

  return isLineContinuation((commentStart === -1 ? raw : raw.slice(0, commentStart)).trim());
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

  // Primeira linha de código após um `while` sem `do`: se for o `do` (estilo Bash, com o `do` na
  // linha seguinte), ele fica no nível do `while` e abre o corpo; o nível dado pelo `while` é desfeito.
  if (st.whileAwaitingDo) {
    st.whileAwaitingDo = false;

    if (DO_ONLY_LINE_RE.test(trimmed)) {
      st.indent = Math.max(0, st.indent - 1);

      return;
    }
  }

  // Linha no meio de um comando continuado (vem de uma continuação e também continua) é argumento,
  // e não o fechamento de um bloco: em `for w in \`, itens como `end \` e `done \` são apenas palavras.
  // A última linha do comando não entra aqui, pois o estado de continuação pode ter ficado pendente
  // (ex.: após um argumento só com string ou um comentário) e a linha ser um fechamento real.
  if (st.continuation && isLineContinuation(trimmed)) {
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
  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && (TCSH_CASE_LABEL_ONLY_RE.test(trimmed) || TCSH_DEFAULT_LABEL_ONLY_RE.test(trimmed))) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);

    return;
  }

  // Blocos de controle
  if (IF_END_START_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de loop - suporte legado tcsh (foreach/while)
  if (LOOP_END_START_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de case
  if (CASE_END_START_RE.test(trimmed)) {
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
  if (ELSE_ELIF_START_RE.test(trimmed)) {
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
  if (SWITCH_START_RE.test(trimmed)) {
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
  if (DO_LINE_RE.test(trimmed) || FOREACH_START_RE.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Laço while sem `do` no fim da linha
  if (WHILE_START_RE.test(trimmed)) {
    const doMatch = DO_WORD_RE.exec(trimmed);

    // `while ...; do ...` com corpo na mesma linha (Bash): só abre bloco se o `done` não estiver nela
    if (doMatch) {
      if (!DONE_WORD_RE.test(trimmed.slice(doMatch.index + doMatch[0].length))) {
        st.indent += 1;
      }

      return;
    }

    // Sem `do` na linha: `while (expr)` do tcsh, cujo corpo começa na próxima linha, ou `while` do
    // Bash com o `do` na linha seguinte. Nesse último caso o `do` desfaz este nível (dedentBeforeLine).
    st.indent += 1;
    st.whileAwaitingDo = true;

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
  if (caseStack.length > 0 && caseStack[caseStack.length - 1] && BREAKSW_START_RE.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
    caseStack[caseStack.length - 1] = false;
    syncCaseFlagsFromStack(st, caseStack);
  }
}
