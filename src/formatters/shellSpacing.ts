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
 * Função auxiliar para transformar o código shell aplicando as regras de espaçamento conforme as opções fornecidas.
 * @param code O trecho de código shell a ser transformado.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns O trecho de código shell transformado com o espaçamento aplicado.
 */
function transformCode (code: string, cfg: ShellSpacingConfig): string {
  let s = code;

  // Aplica as regras de espaçamento conforme as opções fornecidas
  if (cfg.spaceBeforeThenDo) {
    s = s.replace(/;\s*then\b/g, '; then');
    s = s.replace(/;\s*do\b/g, '; do');
  }

  // Aplica espaço após palavras-chave como if, while, until, for
  if (cfg.spaceAfterKeywords) {
    s = s.replace(/\b(if|while|until)\s*\[/g, '$1 [');
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
    // Collapse multiple spaces but preserve leading spaces (handled by indent)
    // and spaces in comment tails
    s = s.replace(/(\S) {2,}(?=\S)/g, '$1 ');
  }

  return s;
}
