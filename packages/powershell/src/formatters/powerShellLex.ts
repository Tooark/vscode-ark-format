import { QuoteKind } from './types';
import { hasOddTrailingExplicitMarker } from '@tooark/ark-format-shared/indent';
export { isShebang, isFullLineComment } from '@tooark/ark-format-shared/lex';

/**
 * Função para dividir uma linha de código PowerShell em partes, preservando o tipo de cada parte
 * (código, aspas simples, aspas duplas, here-strings ou crases).
 * @param input - A linha de código a ser dividida.
 * @returns Um array de objetos, onde cada objeto tem uma propriedade `kind` indicando o
 * tipo da parte (code, sq, dq, hereSq, hereDq, bt) e uma propriedade `text` com o conteúdo original dessa parte.
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
        case '#': // Verificar se o caractere é um comentário inline (começa com #)
          if (!hasOddTrailingExplicitMarker(input.slice(0, i), '`')) {
            buf += input.slice(i);
            break;
          }

          buf += ch;
          break;
        default:  // É outro tipo de código
          buf += ch;
          break;
      }

      // Se o caractere for um comentário inline, não processar mais caracteres e adicionar o restante da linha como parte de código
      if (ch === '#' && !hasOddTrailingExplicitMarker(input.slice(0, i), '`')) {
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
      // Verificar se o caractere é uma crase, indicando uma sequência de escape dentro das aspas duplas
      if (ch === '`' && i + 1 < input.length) {
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
  }

  // Verificar se há um buffer acumulado ao final da linha e adicioná-lo como parte de código
  if (buf) {
    parts.push({ kind: mode, text: buf });
  }

  return parts;
}

/**
 * Retorna apenas as partes de código fora de aspas, útil para decisões de indentação.
 * Caracteres literais dentro de strings não devem abrir ou fechar blocos PowerShell.
 * @param input - Linha original de PowerShell.
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
      // Início de here-string: @' ou @"
      if (ch === '@' && input[i + 1] === "'") {
        mode = 'hereSq';
        i++;

        continue;
      }

      if (ch === '@' && input[i + 1] === '"') {
        mode = 'hereDq';
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
        case '#': // Verificar se o caractere é um comentário inline (começa com #)
          if (!hasOddTrailingExplicitMarker(input.slice(0, i), '`')) {
            return code;
          }

          code += ch;
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
      // Escape em PowerShell usa crase
      if (ch === '`' && i + 1 < input.length) {
        i++;
        continue;
      }

      // Verificar se o caractere é uma aspa dupla, indicando o fim do modo de aspas duplas
      if (ch === '"') {
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de here-string
    if (mode === 'hereSq') {
      // Verificar se a linha atual é o terminador do here-string de aspas simples
      if (input.trim() === "'@") {
        mode = 'code';
      }

      continue;
    }

    // Verifica os modos de here-string
    if (mode === 'hereDq') {
      // Verificar se a linha atual é o terminador do here-string de aspas duplas
      if (input.trim() === '"@') {
        mode = 'code';
      }

      continue;
    }
  }

  return code;
}

/**
 * Função para calcular o modo de aspas final após processar uma linha inteira de código PowerShell.
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
        // Here-string: @'
        if (ch === '@' && input[i + 1] === "'") {
          mode = 'hereSq';
          i++;

          continue;
        }

        // Here-string: @"
        if (ch === '@' && input[i + 1] === '"') {
          mode = 'hereDq';
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
          case '#': // Comentário fora de aspas: resto da linha não altera estado de aspas.
            // Verificar se o caractere de comentário não está escapado por uma crase
            if (!hasOddTrailingExplicitMarker(input.slice(0, i), '`')) {
              break;
            }

            continue;
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
        // Escape em PowerShell usa crase.
        if (ch === '`' && i + 1 < input.length) {
          i++;
          continue;
        }

        // Verificar se o caractere é uma aspa dupla, indicando o fim do modo de aspas duplas
        if (ch === '"') {
          mode = 'code';
        }

        continue;
      case 'hereSq':// Modo de here-string de aspas simples
        // Verificar se a linha atual é o terminador do here-string de aspas simples
        if (input.trim() === "'@") {
          mode = 'code';
        }

        continue;
      case 'hereDq':// Modo de here-string de aspas duplas
        // Verificar se a linha atual é o terminador do here-string de aspas duplas
        if (input.trim() === '"@') {
          mode = 'code';
        }

        continue;
    }

    break;
  }

  return mode;
}

/**
 * Função para detectar início de here-string do PowerShell na parte de código da linha
 * (ou seja, não dentro de aspas ou comentários).
 * Lida com os seguintes casos: `@'` e `@"` no fim da linha.
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

    // Here-string PowerShell: início com @' ou @" (tipicamente ao final da linha).
    if (/@'\s*$/.test(p.text)) {
      return "'@";
    }

    if (/@"\s*$/.test(p.text)) {
      return '"@';
    }
  }

  return null;
}
