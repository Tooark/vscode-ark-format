import { isFullLineComment, isShebang } from './shellLex';
import { IndentState } from './types';

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
  // ends with `\` but not `\\`
  if (!trimmed.endsWith('\\')) {
    return false;
  }

  let backslashes = 0;

  // Itera de trás para frente contando o número de barras invertidas consecutivas no final da linha
  for (let i = trimmed.length - 1; i >= 0 && trimmed[i] === '\\'; i--) {
    backslashes++;
  }

  // Se o número de barras invertidas for ímpar, então a última barra é uma continuação de linha
  return backslashes % 2 === 1;
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
  if (/^fi\b/.test(trimmed)) {
    st.indent = Math.max(0, st.indent - 1);

    return;
  }

  // Blocos de loop
  if (/^done\b/.test(trimmed)) {
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

  // Comentários de linha inteira não afetam a indentação
  if (isFullLineComment(trimmed)) {
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
  if (/^case\b.*\bin\s*$/.test(trimmed)) {
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
  if (/\bthen\s*$/.test(trimmed) || /^else\b/.test(trimmed) || /^elif\b.*;\s*then\s*$/.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Blocos de loop
  if (/\bdo\s*$/.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Blocos {
  if (/\{\s*$/.test(trimmed)) {
    st.indent += 1;

    return;
  }

  // Padrões de case
  if (st.inCase && !st.inCasePatternBody && /\)\s*$/.test(trimmed) && !/^(;;?&?|;;&)/.test(trimmed)) {
    st.indent += 1;
    st.inCasePatternBody = true;

    return;
  }

  // Labels de switch tcsh
  if (st.inCase && !st.inCasePatternBody && (/^case\b.*:\s*$/.test(trimmed) || /^default:\s*$/.test(trimmed))) {
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
