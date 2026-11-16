import { QuoteKind, QuoteState } from './types';
export { isShebang, isFullLineComment } from '@tooark/ark-format-shared/lex';

// Palavras-chave de comment-based help (ex.: .SYNOPSIS, .DESCRIPTION, .EXAMPLE) começam com ponto seguido de letra.
const COMMENT_HELP_KEYWORD_RE = /^\.[A-Za-z]/;

/**
 * Verifica se a linha inicia um bloco de comentário PowerShell (`<# ... #>`) que se estende por múltiplas linhas.
 * Comentários de bloco completos em uma única linha (`<# ... #>`) não são considerados início de bloco.
 * @param trimmed - A linha já trimada (sem espaços no início ou no final).
 * @returns `true` se a linha abre um bloco de comentário multilinha, `false` caso contrário.
 */
export function isBlockCommentStart (trimmed: string): boolean {
  return trimmed.startsWith('<#') && !trimmed.slice(2).includes('#>');
}

/**
 * Verifica se a linha encerra um bloco de comentário PowerShell (`#>`).
 * @param trimmed - A linha já trimada (sem espaços no início ou no final).
 * @returns `true` se a linha contém o fechamento do bloco de comentário, `false` caso contrário.
 */
export function isBlockCommentEnd (trimmed: string): boolean {
  return trimmed.includes('#>');
}

/**
 * Verifica se a linha é uma palavra-chave de comment-based help (ex.: `.SYNOPSIS`, `.DESCRIPTION`).
 * Usada para definir o nível de indentação ao reformatar blocos de comentário.
 * @param trimmed - A linha já trimada (sem espaços no início ou no final).
 * @returns `true` se a linha for uma palavra-chave de comment-based help, `false` caso contrário.
 */
export function isCommentHelpKeyword (trimmed: string): boolean {
  return COMMENT_HELP_KEYWORD_RE.test(trimmed);
}


/**
 * Tipagem para um contexto da pilha do lexer PowerShell:
 * - `sq`, `dq`, `hereSq`, `hereDq`: strings e here-strings, com as mesmas regras de `QuoteKind`.
 * - `sub`: subexpressão `$(...)` aberta dentro de uma string de aspas duplas, com a quantidade de
 *   parênteses ainda abertos. Dentro dela as aspas formam um novo contexto, como no código normal.
 * A pilha vazia representa o código normal, fora de qualquer string.
 */
type LexFrame =
  { kind: Exclude<QuoteKind, 'code'> }
  | { kind: 'sub'; depth: number };

/**
 * Função para converter o estado de aspas recebido da linha anterior em uma pilha de contextos.
 * @param state - O estado serializado (`code`, `dq`, `dq>sub1>sq`, ...).
 * @returns A pilha de contextos, do mais externo para o mais interno.
 */
function parseQuoteState (state: QuoteState): LexFrame[] {
  // Código normal não tem contexto aberto
  if (state === 'code') {
    return [];
  }

  return state.split('>').map((token): LexFrame => {
    // Subexpressão: `subN`, onde N é a quantidade de parênteses abertos
    const sub = /^sub(\d+)$/.exec(token);
    if (sub) {
      return { kind: 'sub', depth: Math.max(1, Number(sub[1])) };
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

  return stack.map((frame) => (frame.kind === 'sub' ? `sub${frame.depth}` : frame.kind)).join('>') as QuoteState;
}

/**
 * Função para verificar se a posição informada está no início de um token, onde `#` inicia um
 * comentário dentro de uma subexpressão.
 * @param input - A linha em análise.
 * @param i - A posição do caractere `#`.
 * @returns `true` se o caractere estiver no início da linha ou após espaço ou separador.
 */
function isTokenStart (input: string, i: number): boolean {
  return i === 0 || /[\s;(){}|&,]/.test(input[i - 1]);
}

/**
 * Função para avançar o lexer sobre o caractere na posição `i`, atualizando a pilha de contextos.
 * Regras:
 * - Código normal (pilha vazia): a crase escapa o próximo caractere (`` `" ``, `` `' `` e `` `# ``
 *   são literais); `'` e `"` abrem strings; `@'` e `@"` abrem here-strings quando `hereStrings` é
 *   verdadeiro. Comentários no código normal são tratados por quem chama.
 * - `sq`: tudo é literal até a próxima `'` (`''` fecha e reabre, mantendo o estado).
 * - `dq`: a crase escapa o próximo caractere, `"` fecha a string e `$(` abre uma subexpressão.
 * - `sub`: como o código normal, mas parênteses fora de aspas são contados e o `)` que zera a
 *   contagem fecha a subexpressão; `#` no início de um token é comentário até o fim da linha.
 * - `hereSq`/`hereDq`: a linha cujo conteúdo trimado é o terminador (`'@`/`"@`) fecha o contexto.
 * @param input - A linha em análise.
 * @param i - A posição do caractere atual.
 * @param stack - A pilha de contextos, alterada no lugar.
 * @param hereStrings - Se `@'`/`@"` devem abrir here-strings.
 * @returns A quantidade de caracteres consumidos (pelo menos 1).
 */
function lexStep (input: string, i: number, stack: LexFrame[], hereStrings: boolean): number {
  const ch = input[i];
  const next = input[i + 1];
  const hasNext = i + 1 < input.length;
  const top = stack[stack.length - 1];

  // Código normal ou subexpressão: aspas abrem um novo contexto
  if (top === undefined || top.kind === 'sub') {
    // Crase escapa o próximo caractere
    if (ch === '`' && hasNext) {
      return 2;
    }

    // Comentário dentro da subexpressão: resto da linha não altera o estado
    if (top !== undefined && ch === '#' && isTokenStart(input, i)) {
      return input.length - i;
    }

    // Início de here-string: @' ou @"
    if (hereStrings && ch === '@' && (next === "'" || next === '"')) {
      stack.push({ kind: next === "'" ? 'hereSq' : 'hereDq' });

      return 2;
    }

    // Verificar os caracteres que iniciam strings
    if (ch === "'") {
      stack.push({ kind: 'sq' });

      return 1;
    }

    if (ch === '"') {
      stack.push({ kind: 'dq' });

      return 1;
    }

    // Contagem de parênteses da subexpressão
    if (top !== undefined) {
      if (ch === '(') {
        top.depth++;
      } else if (ch === ')') {
        top.depth--;

        // O parêntese que zera a contagem fecha a subexpressão
        if (top.depth === 0) {
          stack.pop();
        }
      }
    }

    return 1;
  }

  switch (top.kind) {
    case 'sq':  // Aspas simples: tudo é literal até a próxima aspa simples
      if (ch === "'") {
        stack.pop();
      }

      return 1;
    case 'dq':  // Aspas duplas: escape com crase e subexpressões `$(...)`
      if (ch === '`' && hasNext) {
        return 2;
      }

      if (ch === '"') {
        stack.pop();

        return 1;
      }

      if (ch === '$' && next === '(') {
        stack.push({ kind: 'sub', depth: 1 });

        return 2;
      }

      return 1;
    case 'hereSq':  // Here-string verbatim: encerra na linha cujo trim seja `'@`
      if (input.trim() === "'@") {
        stack.pop();
      }

      return 1;
    case 'hereDq':  // Here-string expansível: encerra na linha cujo trim seja `"@`
      if (input.trim() === '"@') {
        stack.pop();
      }

      return 1;
  }
}

/**
 * Função para verificar se, a partir do estado de aspas vindo da linha anterior, a linha atual
 * pertence a uma here-string (corpo ou terminador). Usada para here-strings declaradas dentro de
 * subexpressões em strings multilinha, cujas linhas devem ser preservadas sem reindentação: o
 * conteúdo é literal e o terminador precisa permanecer na coluna 0.
 * @param state - O estado de aspas vindo da linha anterior.
 * @returns `true` se a linha pertence a uma here-string.
 */
export function isHereStringLine (state: QuoteState): boolean {
  const top = parseQuoteState(state).at(-1);

  return top?.kind === 'hereSq' || top?.kind === 'hereDq';
}

/**
 * Função para dividir uma linha de código PowerShell em partes, preservando o tipo de cada parte
 * (código, aspas simples ou aspas duplas). Here-strings não são reconhecidas aqui: `@'`/`@"` só
 * aparecem no fim da linha e o corpo é tratado pelo formatador como bloco literal.
 * Uma string que contém contextos aninhados (ex.: `"$($s.Trim('"'))"`) forma uma única parte, com
 * o tipo da string mais externa.
 * @param input - A linha de código a ser dividida.
 * @returns Um array de objetos, onde cada objeto tem uma propriedade `kind` indicando o
 * tipo da parte (code, sq, dq) e uma propriedade `text` com o conteúdo original dessa parte.
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
    const consumed = lexStep(input, i, stack, false);
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
 * Caracteres literais dentro de strings não devem abrir ou fechar blocos PowerShell.
 * @param input - Linha original de PowerShell.
 * @param initialMode - Estado de aspas de entrada (vindo da linha anterior).
 * @returns O conteúdo concatenado das partes classificadas como código, até um comentário inline.
 */
export function getCodePartsOnly (input: string, initialMode: QuoteState = 'code'): string {
  const stack = parseQuoteState(initialMode);
  let code = '';

  // Iterar pela linha, mantendo apenas o que está fora de qualquer string
  for (let i = 0; i < input.length;) {
    // Comentário inline no código normal: o restante da linha não é código
    if (stack.length === 0 && input[i] === '#') {
      return code;
    }

    const wasCode = stack.length === 0;
    const consumed = lexStep(input, i, stack, true);

    // Somente trechos que começam e terminam no código normal são código
    if (wasCode && stack.length === 0) {
      code += input.slice(i, i + consumed);
    }

    i += consumed;
  }

  return code;
}

/**
 * Função para calcular o estado de aspas final após processar uma linha inteira de código PowerShell.
 * @param input - Linha original (sem trim) para preservar semântica de escapes.
 * @param initialMode - Estado de aspas de entrada (vindo da linha anterior).
 * @returns O estado final após processar a linha: um `QuoteKind` nos casos simples ou a pilha
 * serializada quando a linha termina dentro de contextos aninhados (ver `QuoteState`).
 */
export function getQuoteModeAfterLine (input: string, initialMode: QuoteState = 'code'): QuoteState {
  const stack = parseQuoteState(initialMode);

  // Iterar pela linha, avançando o lexer a cada passo
  for (let i = 0; i < input.length;) {
    // Comentário fora de aspas: resto da linha não altera o estado de aspas
    if (stack.length === 0 && input[i] === '#') {
      break;
    }

    i += lexStep(input, i, stack, true);
  }

  return serializeQuoteState(stack);
}

/**
 * Função para detectar o início de uma here-string do PowerShell na parte de código da linha
 * (ou seja, não dentro de aspas ou comentários). Uma here-string sempre abre com `@'`/`@"` no fim
 * da linha e só encerra numa linha própria cujo conteúdo trimado seja o terminador. Assim, se a
 * linha termina em modo `hereSq`/`hereDq`, ela abriu uma here-string.
 *
 * O corpo de uma here-string é literal e o terminador (`'@`/`"@`) precisa ficar na coluna 0, por
 * isso o bloco é tratado pelo mecanismo de heredoc (preservação verbatim), e não pelo caminho de
 * reindentação de aspas multilinha.
 * @param trimmed - A linha de código já trimada (sem espaços no início ou no final).
 * @returns O terminador da here-string (`'@` ou `"@`) se a linha a abre, ou null caso contrário.
 */
export function detectHeredocInCode (trimmed: string): string | null {
  const mode = getQuoteModeAfterLine(trimmed, 'code');

  // Here-string verbatim `@' ... '@`: encerra com uma linha cujo trim seja `'@`.
  if (mode === 'hereSq') {
    return "'@";
  }

  // Here-string expansível `@" ... "@`: encerra com uma linha cujo trim seja `"@`.
  if (mode === 'hereDq') {
    return '"@';
  }

  return null;
}
