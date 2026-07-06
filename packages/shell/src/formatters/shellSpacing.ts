import { collapseDoubleSpaces, normalizeCommentSpacing } from '@tooark/ark-format-shared/spacing';
import { splitByQuotesPreserve } from './shellLex';
import { ShellFormatterOptions, ShellSpacingConfig } from './types';

/**
 * Função para construir a configuração de espaçamento efetiva a partir das opções do formatador.
 * @param opts As opções de formatação de shell (documento ou intervalo).
 * @returns A configuração de espaçamento a ser aplicada às linhas de código.
 */
export function toShellSpacingConfig (opts: ShellFormatterOptions): ShellSpacingConfig {
  return {
    ...opts.spacing,
    collapseSpaces: opts.collapseSpaces
  };
}

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
    s = collapseDoubleSpaces(s);
  }

  // Normaliza o espaçamento em comentários
  s = normalizeCommentSpacing(s, findCommentStart);

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
