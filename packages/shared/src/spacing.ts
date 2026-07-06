/**
 * Função para colapsar múltiplos espaços internos em um único espaço.
 * Atua apenas entre caracteres não-espaço, preservando a indentação inicial e o espaço final.
 * @param code O trecho de código a ser processado.
 * @returns O trecho de código com os espaços internos colapsados.
 */
export function collapseDoubleSpaces (code: string): string {
  return code.replace(/(\S) {2,}(?=\S)/g, '$1 ');
}

/**
 * Função para normalizar o espaçamento em comentários, garantindo que haja um espaço
 * entre o marcador de comentário (`#`, incluindo sequências como `##`) e o texto do
 * comentário. Preserva shebangs (`#!` no início da linha).
 * @param code O trecho de código a ser normalizado.
 * @param findCommentStart Função específica da linguagem que localiza o início do comentário na linha (ou -1).
 * @param preserveWhenFollowedBy Caracteres após o marcador que impedem a inserção de espaço (ex.: `>` para `#>` no PowerShell).
 * @returns O trecho de código com o espaçamento do comentário normalizado.
 */
export function normalizeCommentSpacing (
  code: string,
  findCommentStart: (code: string) => number,
  preserveWhenFollowedBy: readonly string[] = []
): string {
  const commentStart = findCommentStart(code);

  // Se não houver comentário, retorna o código original; preserva shebang.
  if (commentStart === -1 || (commentStart === 0 && code[1] === '!')) {
    return code;
  }

  let markerEnd = commentStart;

  // Itera a partir do marcador de comentário para encontrar o final dos caracteres `#` consecutivos
  while (markerEnd < code.length && code[markerEnd] === '#') {
    markerEnd++;
  }

  // Se o marcador de comentário for seguido por um espaço ou estiver no final da linha, não adiciona espaço extra
  if (markerEnd >= code.length || /\s/.test(code[markerEnd])) {
    return code;
  }

  // Preserva marcadores seguidos por caracteres especiais da linguagem (ex.: `#>` no PowerShell)
  if (preserveWhenFollowedBy.includes(code[markerEnd])) {
    return code;
  }

  // Insere um espaço entre o marcador de comentário e o texto do comentário
  return code.slice(0, markerEnd) + ' ' + code.slice(markerEnd);
}
