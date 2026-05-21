import { splitByQuotesPreserve } from './shellLex';
import { ShellSpacingConfig } from './types';

/**
 * Função para aplicar espaçamento consistente em código shell, de acordo com as opções fornecidas.
 * @param trimmedLine A linha de código shell já sem espaços iniciais e finais.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha de código shell com o espaçamento aplicado conforme as regras definidas.
 */
export function applyShellSpacing (trimmedLine: string, cfg: ShellSpacingConfig): string {
  const parts = splitByQuotesPreserve(trimmedLine);

  return parts.map(p => (p.kind === 'code' ? transformCode(p.text, cfg) : p.text)).join('');
}

/**
 * Função para normalizar o espaçamento em comentários, garantindo que haja um espaço
 * entre o marcador de comentário (`#`) e o texto do comentário, exceto para shebangs
 * e casos onde o `#` é seguido por outro `#` (comentários com múltiplos marcadores).
 * @param code O trecho de código shell a ser normalizado.
 * @returns O trecho de código shell com o espaçamento normalizado em comentários.
 */
function normalizeCommentSpacing (code: string): string {
  const commentStart = findCommentStart(code);

  // Se não houver comentário, retorna o código original
  if (commentStart === -1) {
    return code;
  }

  // Preserva shebang.
  if (commentStart === 0 && code[1] === '!') {
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

  // Insere um espaço entre o marcador de comentário e o texto do comentário
  return code.slice(0, markerEnd) + ' ' + code.slice(markerEnd);
}

/**
 * Função auxiliar para transformar o código shell aplicando as regras de espaçamento conforme as opções fornecidas.
 * @param code O trecho de código shell a ser transformado.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns O trecho de código shell transformado com o espaçamento aplicado.
 */
function transformCode (code: string, cfg: ShellSpacingConfig): string {
  let s = code;

  // Aplica espaço após ';' em 'then' e 'do'
  if (cfg.spaceBeforeThenDo) {
    // Normaliza ';then' ou ';   then' para '; then'.
    s = s.replace(/;\s*then\b/g, '; then');
    // Normaliza ';do' ou ';   do' para '; do'.
    s = s.replace(/;\s*do\b/g, '; do');
  }

  // Aplica espaço após palavras-chave como if, while, until, for
  if (cfg.spaceAfterKeywords) {
    // Garante espaço entre if/while/until e '[' em testes no estilo POSIX.
    s = s.replace(/\b(if|while|until)\s*\[/g, '$1 [');
    // Garante espaço entre 'for' e '(' em laços no estilo C.
    s = s.replace(/\bfor\s*\(/g, 'for (');
  }

  // Aplica espaço antes da chave de abertura em definições de função, se configurado
  if (cfg.spaceBeforeFunctionBrace) {
    // name() {
    s = s.replace(/([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*\{/g, '$1() {');
    // function name() {
    s = s.replace(/\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*\{/g, 'function $1() {');
    // function name {
    s = s.replace(/\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g, 'function $1 {');
  }

  // Colapsa múltiplos espaços em um único espaço, mas preserva os espaços iniciais (que são tratados pela indentação)
  if (cfg.collapseSpaces) {
    // Colapsa espaços internos duplicados entre caracteres não-espaço.
    // Isso evita mexer na indentação inicial e não remove espaço final.
    s = s.replace(/(\S) {2,}(?=\S)/g, '$1 ');
  }

  // Normaliza o espaçamento em comentários
  s = normalizeCommentSpacing(s);

  return s;
}

/**
 * Função para encontrar a posição do início de um comentário em uma linha de código shell.
 * Retorna a posição do início de comentário shell (`#`) quando ele de fato atua como comentário.
 * Ignora `#` usados em expansões como `${#var}` e `${var##pattern}`.
 * @param code A linha de código shell a ser analisada.
 * @returns A posição do início do comentário ou -1 se não houver comentário.
 */
function findCommentStart (code: string): number {
  // Itera sobre a linha para encontrar um `#` que seja um comentário
  for (let i = 0; i < code.length; i++) {
    // Verifica se o caractere atual é `#`
    if (code[i] !== '#') {
      continue;
    }

    // Comentário em linha inteira
    if (i === 0) {
      return i;
    }

    // Comentário inline típico: precisa ser precedido por espaço/tab.
    if (/\s/.test(code[i - 1])) {
      return i;
    }
  }

  return -1;
}
