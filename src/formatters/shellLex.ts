import { QuoteKind } from "./types";

/**
 * Função para detectar se uma linha é um shebang (começa com #!) ou um comentário completo (começa com #).
 * @param lineTrimmed - A linha de código já trimada (sem espaços no início ou no final).
 * @returns true se for um shebang ou um comentário completo, false caso contrário.
 */
export function isShebang (lineTrimmed: string): boolean {
  return lineTrimmed.startsWith('#!');
}

/**
 * Função para detectar se uma linha é um comentário completo (começa com #).
 * @param lineTrimmed - A linha de código já trimada (sem espaços no início ou no final).
 * @returns true se for um comentário completo, false caso contrário.
 */
export function isFullLineComment (lineTrimmed: string): boolean {
  return lineTrimmed.startsWith('#');
}

/**
 * Função para dividir uma linha de código shell em partes, preservando o tipo de cada parte
 * (código, aspas simples, aspas duplas, ANSI-C quoting ou crases).
 * @param input - A linha de código a ser dividida.
 * @returns Um array de objetos, onde cada objeto tem uma propriedade `kind` indicando o
 * tipo da parte (code, sq, dq, ansi, bt) e uma propriedade `text` com o conteúdo original dessa parte.
 */
export function splitByQuotesPreserve (input: string): Array<{ kind: QuoteKind; text: string }> {
  const parts: Array<{ kind: QuoteKind; text: string }> = [];
  let buf = '';
  let mode: QuoteKind = 'code';

  // Iterar por cada caractere da linha
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Verifica se é o modo de código normal
    if (mode === 'code') {
      // $'...' ANSI-C quoting
      if (ch === '$' && input[i + 1] === "'") {
        // Verificar se há um buffer acumulado e adicioná-lo como parte de código antes de iniciar o modo ANSI-C quoting
        if (buf) {
          parts.push({ kind: 'code', text: buf });
        }

        buf = ch + input[i + 1];
        i++;
        mode = 'ansi';

        continue;
      }

      // Verificar os caracteres que iniciam modos de aspas ou comentários
      switch (ch) {
        case "'": // Verificar se o caractere é uma aspa simples
          // Verificar se há um buffer acumulado e adicioná-lo como parte de código antes de iniciar o modo de aspas simples
          if (buf) {
            parts.push({ kind: 'code', text: buf });
          }

          buf = ch;
          mode = 'sq';
          break;
        case '"': // Verificar se o caractere é uma aspa dupla
          // Verificar se há um buffer acumulado e adicioná-lo como parte de código antes de iniciar o modo de aspas duplas
          if (buf) {
            parts.push({ kind: 'code', text: buf });
          }

          buf = ch;
          mode = 'dq';
          break;
        case '`': // Verificar se o caractere é uma crase
          // Verificar se há um buffer acumulado e adicioná-lo como parte de código antes de iniciar o modo de crase
          if (buf) {
            parts.push({ kind: 'code', text: buf });
          }

          buf = ch;
          mode = 'bt';
          break;
        case '#': // Verificar se o caractere é um comentário inline (começa com #)
          // inline comment — rest of line is not code
          buf += input.slice(i);
          break;
        default:  // É outro tipo de código
          buf += ch;
          break;
      }

      // Se o caractere for um comentário inline, não processar mais caracteres como código
      if (ch === '#') {
        break;
      }

      continue;
    }

    // Verifica os modos de aspas simples
    if (mode === 'sq') {
      buf += ch;

      // Verificar se o caractere é uma aspa simples, indicando o fim do modo de aspas simples
      if (ch === "'") {
        parts.push({ kind: 'sq', text: buf });
        buf = '';
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de aspas duplas
    if (mode === 'dq') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        buf += ch + input[i + 1];
        i++;

        continue;
      }

      buf += ch;

      // Verificar se o caractere é uma aspa dupla, indicando o fim do modo de aspas duplas
      if (ch === '"') {
        parts.push({ kind: 'dq', text: buf });
        buf = '';
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de ANSI-C quoting
    if (mode === 'ansi') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        buf += ch + input[i + 1];
        i++;

        continue;
      }

      buf += ch;

      // Verificar se o caractere é uma aspa simples, indicando o fim do modo de ANSI-C quoting
      if (ch === "'") {
        parts.push({ kind: 'ansi', text: buf });
        buf = '';
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de crase
    if (mode === 'bt') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        buf += ch + input[i + 1];
        i++;

        continue;
      }

      buf += ch;

      // Verificar se o caractere é uma crase, indicando o fim do modo de crase
      if (ch === '`') {
        parts.push({ kind: 'bt', text: buf });
        buf = '';
        mode = 'code';
      }

      continue;
    }
  }

  // Verificar se há um buffer acumulado ao final da linha e adicioná-lo como parte de código
  if (buf) {
    parts.push({ kind: mode, text: buf });
  }

  return parts;
}

/**
 * Retorna apenas as partes de código fora de aspas, útil para decisões de indentação.
 * Caracteres literais dentro de strings não devem abrir ou fechar blocos shell.
 * @param input - Linha original de shell.
 * @returns O conteúdo concatenado das partes classificadas como código.
 */
export function getCodePartsOnly (input: string, initialMode: QuoteKind = 'code'): string {
  let mode: QuoteKind = initialMode;
  let code = '';

  // Iterar por cada caractere da linha para extrair apenas as partes de código
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Verifica o modo atual e as transições de estado com base nos caracteres encontrados
    if (mode === 'code') {
      // $'...' ANSI-C quoting
      if (ch === '$' && input[i + 1] === "'") {
        mode = 'ansi';
        i++;
        continue;
      }

      // Verificar os caracteres que iniciam modos de aspas ou comentários
      switch (ch) {
        case "'": // Verificar se o caractere é uma aspa simples, indicando o início do modo de aspas simples
          mode = 'sq';
          continue;
        case '"': // Verificar se o caractere é uma aspa dupla, indicando o início do modo de aspas duplas
          mode = 'dq';
          continue;
        case '`': // Verificar se o caractere é uma crase, indicando o início do modo de crase
          mode = 'bt';
          continue;
        default:
          code += ch;
          continue;
      }
    }

    // Verifica os modos de aspas simples
    if (mode === 'sq') {
      // Verificar se o caractere é uma aspa simples, indicando o fim do modo de aspas simples
      if (ch === "'") {
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de aspas duplas
    if (mode === 'dq') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        i++;
        continue;
      }

      // Verificar se o caractere é uma aspa dupla, indicando o fim do modo de aspas duplas
      if (ch === '"') {
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de ANSI-C quoting
    if (mode === 'ansi') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        i++;
        continue;
      }

      // Verificar se o caractere é uma aspa simples, indicando o fim do modo de ANSI-C quoting
      if (ch === "'") {
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de crase
    if (mode === 'bt') {
      // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
      if (ch === '\\' && i + 1 < input.length) {
        i++;
        continue;
      }

      // Verificar se o caractere é uma crase, indicando o fim do modo de crase
      if (ch === '`') {
        mode = 'code';
      }
    }
  }

  return code;
}

/**
 * Função para calcular o modo de aspas final após processar uma linha inteira de código shell.
 * @param input - Linha original (sem trim) para preservar semântica de escapes.
 * @param initialMode - Modo de aspas de entrada (estado vindo da linha anterior).
 * @returns O modo final após processar a linha.
 */
export function getQuoteModeAfterLine (input: string, initialMode: QuoteKind = 'code'): QuoteKind {
  let mode: QuoteKind = initialMode;

  // Iterar por cada caractere da linha para determinar o modo de aspas final
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    // Verificar o modo atual e as transições de estado com base nos caracteres encontrados
    switch (mode) {
      case 'code':  // Modo de código
        // $'...' ANSI-C quoting
        if (ch === '$' && input[i + 1] === "'") {
          mode = 'ansi';
          i++;
          continue;
        }

        // Verificar os caracteres que iniciam modos de aspas ou comentários
        switch (ch) {
          case "'": // Verificar se o caractere é uma aspa simples, indicando o início do modo de aspas simples
            mode = 'sq';
            continue;
          case '"': // Verificar se o caractere é uma aspa dupla, indicando o início do modo de aspas duplas
            mode = 'dq';
            continue;
          case '`': // Verificar se o caractere é uma crase, indicando o início do modo de crase
            mode = 'bt';
            continue;
          case '#': // Comentário fora de aspas: resto da linha não altera estado de aspas.
            break;
          default:
            continue;
        }

        break;
      case 'sq':    // Modo de aspas simples
        // Verificar se o caractere é uma aspa simples, indicando o fim do modo de aspas simples
        if (ch === "'") {
          mode = 'code';
        }

        continue;
      case 'dq':    // Modo de aspas duplas
        // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
        if (ch === '\\' && i + 1 < input.length) {
          i++;
          continue;
        }

        // Verificar se o caractere é uma aspa dupla, indicando o fim do modo de aspas duplas
        if (ch === '"') {
          mode = 'code';
        }

        continue;
      case 'ansi':  // Modo de ANSI-C quoting
        // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
        if (ch === '\\' && i + 1 < input.length) {
          i++;
          continue;
        }

        // Verificar se o caractere é uma aspa simples, indicando o fim do modo de ANSI-C quoting
        if (ch === "'") {
          mode = 'code';
        }

        continue;
      case 'bt':    // Modo de crase
        // Verificar se o caractere é uma barra invertida, indicando uma possível sequência de escape
        if (ch === '\\' && i + 1 < input.length) {
          i++;
          continue;
        }

        // Verificar se o caractere é uma crase, indicando o fim do modo de crase
        if (ch === '`') {
          mode = 'code';
        }

        continue;
    }

    break;
  }

  return mode;
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
