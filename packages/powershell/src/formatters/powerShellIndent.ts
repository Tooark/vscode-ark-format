import { hasContinuationLine } from '@tooark/ark-format-shared/indent';
import { isFullLineComment, isShebang } from './powerShellLex';
import { IndentState } from './types';

/**
 * Função para calcular o saldo de um par de delimitadores em uma linha (aberturas menos fechamentos).
 * Recebe apenas as partes de código da linha (strings, comentários e variáveis `${...}` já removidos
 * pelo chamador via `getCodePartsOnly`), então delimitadores literais não contam. Um delimitador
 * escapado por crase (`` `{ ``) também não conta.
 * @param text O texto de controle da linha (apenas código).
 * @param open O caractere de abertura (`(` ou `{`).
 * @param close O caractere de fechamento (`)` ou `}`).
 * @returns O saldo: positivo quando a linha abre sem fechar, negativo quando fecha.
 */
function netBalance (text: string, open: string, close: string): number {
  let balance = 0;

  // Percorre os caracteres somando aberturas e subtraindo fechamentos
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '`') {
      i++;
    } else if (ch === open) {
      balance++;
    } else if (ch === close) {
      balance--;
    }
  }

  return balance;
}

/**
 * Função para contar os fechamentos (`}` e `)`) que iniciam uma linha, como em `}`, `})` ou `))`.
 * Esses fechamentos alinham a linha com a que abriu o bloco, por isso reduzem o nível antes de a
 * linha ser escrita.
 * @param trimmed A linha de código já trimada.
 * @returns A quantidade de `}` e de `)` na sequência inicial de fechamentos.
 */
function countLeadingClosers (trimmed: string): { braces: number; parens: number } {
  let braces = 0;
  let parens = 0;

  // Percorre a sequência inicial de fechamentos, aceitando espaços entre eles
  for (const ch of trimmed) {
    if (ch === '}') {
      braces++;
    } else if (ch === ')') {
      parens++;
    } else if (ch !== ' ' && ch !== '	') {
      break;
    }
  }

  return { braces, parens };
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
    parenDepth: 0
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
 * Esta função verifica se a linha atual começa fechando blocos (`}`) ou parênteses multilinha (`)`)
 * e, se for o caso, reduz a indentação para que a linha fique alinhada com a que os abriu.
 * Cláusulas `else`, `elseif`, `catch` e `finally` em linha própria não precisam de ajuste: o bloco
 * anterior já foi fechado pelas chaves, seja em `}` isolado, em `... }` ou em `{ ... }` de uma linha.
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

  // Alinha os fechamentos no início da linha: cada `}` fecha um bloco e cada `)` fecha um
  // parêntese multilinha (arrays `@(...)`, subexpressões `$(...)`, chamadas com argumentos
  // quebrados e blocos `param (...)`). A profundidade rastreada evita dedentar em `)` sem
  // abertura pendente.
  const leading = countLeadingClosers(trimmed);
  const closes = leading.braces + Math.min(leading.parens, st.parenDepth);

  if (closes > 0) {
    st.indent = Math.max(0, st.indent - closes);
  }
}

/**
 * Função para ajustar a indentação após processar uma linha de código.
 * Esta função aplica à próxima linha o saldo de chaves e de parênteses da linha atual e a
 * indentação temporária de uma continuação de linha.
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

  // Fechamentos no início da linha já reduziram o nível em dedentBeforeLine — não reduzem de novo
  const leading = countLeadingClosers(trimmed);

  // Blocos PowerShell delimitados por chaves: o nível acompanha o saldo de `{` e `}` da linha.
  // Assim `if ($a) { 1 }` não altera o nível, `function f { param($a)` abre um bloco e
  // `Write-Host 1 }` fecha um. O saldo vale também em linhas de continuação: um bloco aberto
  // em uma linha terminada em crase ou `|` e fechado na linha seguinte precisa fechar a conta.
  st.indent = Math.max(0, st.indent + netBalance(trimmed, '{', '}') + leading.braces);

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

  const leadingParens = Math.min(leading.parens, st.parenDepth);

  // Parênteses multilinha: `(`, `@(` ou `$(` abertos sem fechamento na mesma linha
  // (arrays, subexpressões, chamadas com argumentos quebrados, blocos `param (...)`)
  // aumentam o nível para o conteúdo interno; fechamentos correspondentes reduzem.
  const parenBalance = netBalance(trimmed, '(', ')');

  // Fecha no máximo a profundidade pendente, ignorando `)` sem abertura rastreada
  const parenDelta = parenBalance < 0 ? -Math.min(-parenBalance, st.parenDepth) : parenBalance;

  st.parenDepth += parenDelta;
  st.indent = Math.max(0, st.indent + parenDelta + leadingParens);
}
