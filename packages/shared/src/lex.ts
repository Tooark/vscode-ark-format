/**
 * Função para detectar se uma linha é um shebang (começa com #!).
 * @param lineTrimmed - A linha de código já trimada (sem espaços no início ou no final).
 * @returns true se for um shebang, false caso contrário.
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
