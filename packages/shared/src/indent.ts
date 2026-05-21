import type { ExplicitLineContinuationMarker, ImplicitLineContinuationOperator } from './types';

/**
 * Função que verifica se a linha termina com uma sequência ímpar de um marcador explícito.
 * Ex.: "foo\\" com marcador "\\" => true; "foo\\\\" => false.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param marker O marcador explícito a ser verificado (ex.: '\\' ou '`').
 * @returns `true` se a linha termina com uma sequência ímpar do marcador, `false` caso contrário.
 */
export function hasOddTrailingExplicitMarker (
  trimmed: string,
  marker: ExplicitLineContinuationMarker
): boolean {
  const line = trimmed.trimEnd();

  // Verifica se o marcador é um único caractere
  if (marker.length !== 1) {
    return false;
  }

  // Verifica se a linha termina com o marcador
  if (!line.endsWith(marker)) {
    return false;
  }

  let trailingCount = 0;

  // Itera de trás para frente contando quantos marcadores consecutivos existem no final da linha
  for (let i = line.length - 1; i >= 0 && line[i] === marker; i--) {
    trailingCount++;
  }

  return trailingCount % 2 === 1;
}

/**
 * Função que verifica se a linha termina com operador que indica continuação implícita.
 * Ex.: "echo a &&" => true.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param operators Operadores que indicam continuação implícita (ex.: '&&', '||', '|').
 * @returns `true` se a linha termina com um operador de continuação implícita, `false` caso contrário.
 */
export function hasTrailingContinuationOperator (
  trimmed: string,
  operators: readonly ImplicitLineContinuationOperator[] = ['&&', '||', '|']
): boolean {
  const line = trimmed.trimEnd();

  // Prioriza operadores longos para evitar que "||" case como "|".
  const ordered = [...operators].sort((a, b) => b.length - a.length);

  return ordered.some((operator) => line.endsWith(operator));
}

/**
 * Função que verifica se a linha é uma continuação de linha, seja por marcador explícito ou operador implícito.
 * Ex.: "echo a \\" => true; "echo a &&" => true.
 * @param trimmed A linha de código já trimada (sem espaços em branco no início e no fim).
 * @param marker O marcador explícito a ser verificado (ex.: '\\' ou '`').
 * @param operators Operadores que indicam continuação implícita (ex.: '&&', '||', '|').
 * @returns `true` se a linha é uma continuação de linha, `false` caso contrário.
 */
export function hasContinuationLine (
  trimmed: string,
  marker: ExplicitLineContinuationMarker,
  operators: readonly ImplicitLineContinuationOperator[] = ['&&', '||', '|']
): boolean {
  return hasOddTrailingExplicitMarker(trimmed, marker) || hasTrailingContinuationOperator(trimmed, operators);
}
