import { QuoteKind, QuoteState } from "./types";
export { isShebang, isFullLineComment } from '@tooark/ark-format-shared/lex';

/**
 * Tipagem para um contexto da pilha do lexer Shell:
 * - `sq`, `dq`, `ansi`, `bt`: strings e crases, com as mesmas regras de `QuoteKind`.
 * - `cs`: substituição de comando `$(...)` aberta dentro de aspas duplas. Dentro dela as aspas
 *   formam um novo contexto, como no código normal. Guarda a quantidade de parênteses ainda
 *   abertos (`depth`), se é uma expansão aritmética `$((...))` (`arith`) e os delimitadores dos
 *   heredocs declarados na linha atual (`heredocs`), cujo corpo começa na linha seguinte.
 * - `hd`: corpo de heredoc declarado dentro de uma substituição de comando; as linhas são
 *   literais até a linha que contém apenas o delimitador.
 * A pilha vazia representa o código normal, fora de qualquer string.
 */
type LexFrame =
  { kind: Exclude<QuoteKind, 'code'> }
  | { kind: 'cs'; depth: number; arith: boolean; heredocs: string[] }
  | { kind: 'hd'; delimiter: string };

/**
 * Expressão regular para o operador de heredoc e seu delimitador: `<<EOF`, `<<-EOF`, `<<'EOF'`,
 * `<<"EOF"` e `<<\EOF`. Sem aspas, o delimitador é a palavra inteira, como no Bash (ex.:
 * `<<END-MSG`), desde que não seja só numérica. O here-string `<<<` é excluído por quem chama.
 */
const HEREDOC_OPERATOR_RE = /^<<-?[ \t]*(?:'([^']*)'|"([^"]*)"|\\?((?![0-9]+(?:[\s;&|<>()]|$))[^\s;&|<>()'"`\\]+))/;

/**
 * Função para converter o estado de aspas recebido da linha anterior em uma pilha de contextos.
 * @param state - O estado serializado (`code`, `dq`, `dq>cs1>sq`, `dq>cs1>hd:EOF`, ...).
 * @returns A pilha de contextos, do mais externo para o mais interno.
 */
function parseQuoteState (state: QuoteState): LexFrame[] {
  // Código normal não tem contexto aberto
  if (state === 'code') {
    return [];
  }

  return state.split('>').map((token): LexFrame => {
    // Corpo de heredoc: `hd:<delimitador codificado>`
    if (token.startsWith('hd:')) {
      return { kind: 'hd', delimiter: decodeURIComponent(token.slice(3)) };
    }

    // Substituição de comando (`csN`) ou expansão aritmética (`arN`), com N parênteses abertos
    const subst = /^(cs|ar)(\d+)$/.exec(token);
    if (subst) {
      return { kind: 'cs', depth: Math.max(1, Number(subst[2])), arith: subst[1] === 'ar', heredocs: [] };
    }

    return { kind: token as Exclude<QuoteKind, 'code'> };
  });
}

/**
 * Função para serializar a pilha de contextos como estado de aspas para a próxima linha.
 * Pilhas de um único nível geram exatamente o `QuoteKind` correspondente.
 * @param stack - A pilha de contextos, do mais externo para o mais interno.
 * @returns O estado serializado.
 */
function serializeQuoteState (stack: LexFrame[]): QuoteState {
  // Pilha vazia representa código normal
  if (stack.length === 0) {
    return 'code';
  }

  return stack.map((frame) => {
    switch (frame.kind) {
      case 'cs':
        return `${frame.arith ? 'ar' : 'cs'}${frame.depth}`;
      case 'hd':
        return `hd:${encodeURIComponent(frame.delimiter)}`;
      default:
        return frame.kind;
    }
  }).join('>') as QuoteState;
}

/**
 * Função para verificar se a posição informada está no início de uma palavra shell, onde `#`
 * inicia um comentário. `$#`, `${#var}` e `a#b`, por exemplo, não são comentários.
 * @param input - A linha em análise.
 * @param i - A posição do caractere `#`.
 * @returns `true` se o caractere estiver no início da linha ou após espaço ou metacaractere.
 */
function isWordStart (input: string, i: number): boolean {
  return i === 0 || /[\s;&|()<>]/.test(input[i - 1]);
}

/**
 * Função para consumir, no início de uma linha, o corpo de um heredoc aberto dentro de uma
 * substituição de comando: a linha inteira é literal, e a linha que contém apenas o
 * delimitador encerra o heredoc.
 * @param input - A linha em análise.
 * @param stack - A pilha de contextos, alterada no lugar.
 * @returns `true` se a linha pertence ao heredoc (e já foi consumida).
 */
function consumeHeredocLine (input: string, stack: LexFrame[]): boolean {
  const top = stack[stack.length - 1];

  // Fora de heredoc a linha é processada normalmente
  if (top?.kind !== 'hd') {
    return false;
  }

  // A linha do delimitador encerra o heredoc (mesma tolerância a espaços do formatador)
  if (input.trim() === top.delimiter) {
    stack.pop();
  }

  return true;
}

/**
 * Função para abrir, ao final de uma linha, os heredocs declarados nela dentro de substituições
 * de comando. O corpo começa na linha seguinte; com mais de um heredoc, o primeiro declarado
 * fica no topo da pilha, pois é lido primeiro.
 * @param stack - A pilha de contextos, alterada no lugar.
 */
function openPendingHeredocs (stack: LexFrame[]): void {
  const delimiters: string[] = [];

  // Coletar os heredocs pendentes de todas as substituições abertas
  for (const frame of stack) {
    if (frame.kind === 'cs' && frame.heredocs.length > 0) {
      delimiters.push(...frame.heredocs);
      frame.heredocs = [];
    }
  }

  // Empilhar na ordem inversa para que o primeiro declarado fique no topo
  for (let k = delimiters.length - 1; k >= 0; k--) {
    stack.push({ kind: 'hd', delimiter: delimiters[k] });
  }
}

/**
 * Função para avançar o lexer sobre o caractere na posição `i`, atualizando a pilha de contextos.
 * Regras:
 * - Código normal (pilha vazia): `\x` é um escape; `'`, `"`, `` ` `` e `$'` abrem strings.
 *   Comentários no código normal são tratados por quem chama, pois cada função tem sua regra.
 * - `sq`: tudo é literal até a próxima `'`.
 * - `dq`, `ansi`, `bt`: `\x` é um escape; o delimitador correspondente fecha o contexto.
 *   Em `dq`, `$(` abre uma substituição de comando (`cs`) e `$((`, uma expansão aritmética.
 * - `cs`: como o código normal, mas parênteses fora de aspas são contados e o `)` que zera a
 *   contagem fecha a substituição; `$((` aninhado abre uma expansão aritmética própria. Fora de
 *   expansão aritmética, `#` no início de uma palavra é comentário até o fim da linha, `<<DELIM`
 *   declara um heredoc e `<<<` (here-string) é consumido inteiro.
 * - `hd`: linhas de heredoc são consumidas inteiras por `consumeHeredocLine`.
 * @param input - A linha em análise.
 * @param i - A posição do caractere atual.
 * @param stack - A pilha de contextos, alterada no lugar.
 * @returns A quantidade de caracteres consumidos (pelo menos 1).
 */
function lexStep (input: string, i: number, stack: LexFrame[]): number {
  const ch = input[i];
  const next = input[i + 1];
  const hasNext = i + 1 < input.length;
  const top = stack[stack.length - 1];

  // Código normal ou substituição de comando: aspas abrem um novo contexto
  if (top === undefined || top.kind === 'cs') {
    // Barra invertida escapa o próximo caractere (ex.: \' e \" são literais)
    if (ch === '\\' && hasNext) {
      return 2;
    }

    // Regras exclusivas de substituição de comando (fora de expansão aritmética)
    if (top !== undefined && !top.arith) {
      // Comentário: resto da linha não altera o estado
      if (ch === '#' && isWordStart(input, i)) {
        return input.length - i;
      }

      // Heredoc: o corpo começa na próxima linha
      if (ch === '<' && next === '<') {
        // Here-string `<<<` não é heredoc: consumido inteiro para que o segundo `<` não seja relido
        if (input[i + 2] === '<') {
          return 3;
        }

        const m = HEREDOC_OPERATOR_RE.exec(input.slice(i));

        if (m) {
          top.heredocs.push(m[1] ?? m[2] ?? m[3]);

          return m[0].length;
        }
      }
    }

    // Expansão aritmética aninhada em uma substituição: `<<` é deslocamento, não heredoc
    if (top !== undefined && ch === '$' && next === '(' && input[i + 2] === '(') {
      stack.push({ kind: 'cs', depth: 1, arith: true, heredocs: [] });

      return 2;
    }

    // $'...' ANSI-C quoting
    if (ch === '$' && next === "'") {
      stack.push({ kind: 'ansi' });

      return 2;
    }

    // Verificar os caracteres que iniciam strings
    switch (ch) {
      case "'":
        stack.push({ kind: 'sq' });

        return 1;
      case '"':
        stack.push({ kind: 'dq' });

        return 1;
      case '`':
        stack.push({ kind: 'bt' });

        return 1;
    }

    // Contagem de parênteses da substituição de comando
    if (top !== undefined) {
      if (ch === '(') {
        top.depth++;
      } else if (ch === ')') {
        top.depth--;

        // O parêntese que zera a contagem fecha a substituição
        if (top.depth === 0) {
          stack.pop();
        }
      }
    }

    return 1;
  }

  // Corpo de heredoc: literal (normalmente consumido linha a linha por consumeHeredocLine)
  if (top.kind === 'hd') {
    return 1;
  }

  // Aspas simples: tudo é literal até a próxima aspa simples
  if (top.kind === 'sq') {
    if (ch === "'") {
      stack.pop();
    }

    return 1;
  }

  // Aspas duplas, ANSI-C quoting e crases aceitam escapes com barra invertida
  if (ch === '\\' && hasNext) {
    return 2;
  }

  // Aspas duplas: `$(` abre uma substituição de comando, onde as aspas formam um novo contexto
  if (top.kind === 'dq') {
    if (ch === '"') {
      stack.pop();

      return 1;
    }

    if (ch === '$' && next === '(') {
      stack.push({ kind: 'cs', depth: 1, arith: input[i + 2] === '(', heredocs: [] });

      return 2;
    }

    return 1;
  }

  // ANSI-C quoting fecha com aspa simples; crase fecha com crase
  if ((top.kind === 'ansi' && ch === "'") || (top.kind === 'bt' && ch === '`')) {
    stack.pop();
  }

  return 1;
}

/**
 * Função para verificar se, a partir do estado de aspas vindo da linha anterior, a linha atual
 * pertence a um heredoc declarado dentro de uma substituição de comando (corpo ou delimitador).
 * Essas linhas devem ser preservadas sem reindentação: o conteúdo do heredoc é literal e o
 * delimitador de `<<EOF` só é reconhecido pelo shell na coluna original.
 * @param state - O estado de aspas vindo da linha anterior.
 * @returns `true` se a linha pertence a um heredoc aninhado.
 */
export function isNestedHeredocLine (state: QuoteState): boolean {
  const stack = parseQuoteState(state);

  return stack[stack.length - 1]?.kind === 'hd';
}

/**
 * Função para dividir uma linha de código shell em partes, preservando o tipo de cada parte
 * (código, aspas simples, aspas duplas, ANSI-C quoting ou crases).
 * Uma string que contém contextos aninhados (ex.: `"$(echo '"')"`) forma uma única parte, com o
 * tipo da string mais externa.
 * @param input - A linha de código a ser dividida.
 * @returns Um array de objetos, onde cada objeto tem uma propriedade `kind` indicando o
 * tipo da parte (code, sq, dq, ansi, bt) e uma propriedade `text` com o conteúdo original dessa parte.
 */
export function splitByQuotesPreserve (input: string): Array<{ kind: QuoteKind; text: string }> {
  const parts: Array<{ kind: QuoteKind; text: string }> = [];
  const stack: LexFrame[] = [];
  let buf = '';
  let kind: QuoteKind = 'code';

  // Iterar pela linha, avançando o lexer a cada passo
  for (let i = 0; i < input.length;) {
    // Comentário inline no código normal: resto da linha não é processado como código
    if (stack.length === 0 && input[i] === '#') {
      buf += input.slice(i);
      break;
    }

    const wasCode = stack.length === 0;
    const consumed = lexStep(input, i, stack);
    const chunk = input.slice(i, i + consumed);
    i += consumed;

    // Abertura de uma string: fecha a parte de código acumulada e inicia a parte da string
    if (wasCode && stack.length > 0) {
      if (buf) {
        parts.push({ kind: 'code', text: buf });
      }

      buf = chunk;
      kind = stack[0].kind as QuoteKind;
      continue;
    }

    buf += chunk;

    // Fechamento da string mais externa: registra a parte e volta ao código normal
    if (!wasCode && stack.length === 0) {
      parts.push({ kind, text: buf });
      buf = '';
      kind = 'code';
    }
  }

  // Verificar se há um buffer acumulado ao final da linha (código ou string não fechada)
  if (buf) {
    parts.push({ kind, text: buf });
  }

  return parts;
}

/**
 * Retorna apenas as partes de código fora de aspas, útil para decisões de indentação.
 * Caracteres literais dentro de strings não devem abrir ou fechar blocos shell.
 * @param input - Linha original de shell.
 * @param initialMode - Estado de aspas de entrada (vindo da linha anterior).
 * @returns O conteúdo concatenado das partes classificadas como código.
 */
export function getCodePartsOnly (input: string, initialMode: QuoteState = 'code'): string {
  const stack = parseQuoteState(initialMode);
  let code = '';

  // Linha de corpo de heredoc dentro de substituição de comando: não há código
  if (consumeHeredocLine(input, stack)) {
    return code;
  }

  // Iterar pela linha, mantendo apenas o que está fora de qualquer string
  for (let i = 0; i < input.length;) {
    const wasCode = stack.length === 0;
    const consumed = lexStep(input, i, stack);

    // Somente trechos que começam e terminam no código normal são código
    if (wasCode && stack.length === 0) {
      code += input.slice(i, i + consumed);
    }

    i += consumed;
  }

  return code;
}

/**
 * Função para calcular o estado de aspas final após processar uma linha inteira de código shell.
 * @param input - Linha original (sem trim) para preservar semântica de escapes.
 * @param initialMode - Estado de aspas de entrada (vindo da linha anterior).
 * @returns O estado final após processar a linha: um `QuoteKind` nos casos simples ou a pilha
 * serializada quando a linha termina dentro de contextos aninhados (ver `QuoteState`).
 */
export function getQuoteModeAfterLine (input: string, initialMode: QuoteState = 'code'): QuoteState {
  const stack = parseQuoteState(initialMode);

  // Linha de corpo de heredoc dentro de substituição de comando: só o delimitador muda o estado
  if (consumeHeredocLine(input, stack)) {
    return serializeQuoteState(stack);
  }

  // Iterar pela linha, avançando o lexer a cada passo
  for (let i = 0; i < input.length;) {
    // Comentário fora de aspas: resto da linha não altera o estado de aspas
    if (stack.length === 0 && input[i] === '#') {
      break;
    }

    i += lexStep(input, i, stack);
  }

  // Heredocs declarados nesta linha começam na próxima
  openPendingHeredocs(stack);

  return serializeQuoteState(stack);
}

/**
 * Função para detectar se um operador `<<` de heredoc aparece na parte de código da linha
 * (ou seja, não dentro de aspas ou comentários).
 * Lida com os seguintes casos: `<<EOF`, `<<-EOF`, `<<'EOF'`, `<<"EOF"`, `<<-'EOF'`
 * @param trimmed - A linha de código já trimada (sem espaços no início ou no final).
 * @returns O identificador do heredoc se encontrado, ou null caso contrário.
 */
export function detectHeredocInCode (trimmed: string): string | null {
  const parts = splitByQuotesPreserve(trimmed);

  // Iterar por cada parte da linha, procurando por operadores de heredoc na parte de código
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    // Verificar apenas a parte de código, ignorando aspas e comentários
    if (p.kind !== 'code') {
      continue;
    }

    // Caso 1: identificador diretamente no código: <<EOF ou <<-EOF ou <<"EOF" ou <<'EOF'
    const m = p.text.match(/<<-?\s*["']?([A-Za-z0-9_]+)["']?/);
    if (m) {
      return m[1];
    }

    // Caso 2: << no final da parte do código, identificador na próxima parte entre aspas: <<'EOF' ou <<"EOF"
    const trailingHeredoc = p.text.match(/<<-?\s*$/);
    if (trailingHeredoc && i + 1 < parts.length) {
      const next = parts[i + 1];

      // Verificar se a próxima parte é uma string entre aspas simples ou duplas contendo um identificador válido
      if (next.kind === 'sq' || next.kind === 'dq') {
        // remover aspas ao redor
        const inner = next.text.slice(1, -1);

        // Verificar se o conteúdo interno é um identificador válido (composto por letras, números ou underscores)
        if (/^[A-Za-z0-9_]+$/.test(inner)) {
          return inner;
        }
      }
    }
  }

  return null;
}
