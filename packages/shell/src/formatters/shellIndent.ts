import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { isFullLineComment, isShebang } from './shellLex';
import { IndentState } from './types';

// Expressões regulares para identificar padrões de início de blocos e outros elementos que afetam a indentação
const END_WITH_OPTIONAL_INLINE_COMMENT = '(?:\\s*(?:#.*)?)$';
const CASE_IN_START_RE = new RegExp(`^case\\b.*\\bin${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const THEN_LINE_RE = new RegExp(`\\bthen${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const ELIF_THEN_LINE_RE = new RegExp(`^elif\\b.*;\\s*then${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const DO_LINE_RE = new RegExp(`\\bdo${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const OPEN_BRACE_LINE_RE = new RegExp(`\\{${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const CASE_PATTERN_LINE_RE = new RegExp(`\\)${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const TCSH_CASE_LABEL_RE = new RegExp(`^case\\b.*:${END_WITH_OPTIONAL_INLINE_COMMENT}`);
const TCSH_DEFAULT_LABEL_RE = new RegExp(`^default:${END_WITH_OPTIONAL_INLINE_COMMENT}`);

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
  // Shebang e linhas vazias não afetam a indentação
  if (isShebang(trimmed) || trimmed === '') {
    return;
  }

  // Comentários de linha inteira não afetam a indentação
  if (isFullLineComment(trimmed)) {
    return;
  }

  // caso termine com: ;; ; ;& ;;&
  if (st.inCase && st.inCasePatternBody && /^(;;?&?|;;&)/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
    st.inCasePatternBody = false;

    return;
  }

  // tcsh switch labels: dedenta o corpo anterior para alinhar novo case/default
  if (st.inCase && st.inCasePatternBody && (/^case\b.*:\s*$/.test(trimmed) || /^default:\s*$/.test(trimmed))) {
    st.indent = Math.max(0, st.indent - 1);
    st.inCasePatternBody = false;

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
    if (st.inCasePatternBody) {
      st.indent = Math.max(0, st.indent - 1);
      st.inCasePatternBody = false;
    }

    st.indent = Math.max(0, st.indent - 1);
    st.inCase = false;

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

  // Blocos de controle - bloco case
  if (CASE_IN_START_RE.test(trimmed)) {
    st.indent += 1;
    st.inCase = true;
    st.inCasePatternBody = false;

    return;
  }

  // Bloco switch (tcsh)
  if (/^switch\b/.test(trimmed)) {
    st.indent += 1;
    st.inCase = true;
    st.inCasePatternBody = false;

    return;
  }

  // Blocos then, else, elif
  if (THEN_LINE_RE.test(trimmed) || /^else\b/.test(trimmed) || ELIF_THEN_LINE_RE.test(trimmed)) {
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
  if (st.inCase && !st.inCasePatternBody && CASE_PATTERN_LINE_RE.test(trimmed) && !/^(;;?&?|;;&)/.test(trimmed)) {
    st.indent += 1;
    st.inCasePatternBody = true;

    return;
  }

  // Labels de switch tcsh
  if (st.inCase && !st.inCasePatternBody && (TCSH_CASE_LABEL_RE.test(trimmed) || TCSH_DEFAULT_LABEL_RE.test(trimmed))) {
    st.indent += 1;
    st.inCasePatternBody = true;

    return;
  }

  // Terminador de bloco de label tcsh
  if (st.inCase && st.inCasePatternBody && /^breaksw\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);
    st.inCasePatternBody = false;
  }
}
