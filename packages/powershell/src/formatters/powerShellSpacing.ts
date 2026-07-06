import { collapseDoubleSpaces, normalizeCommentSpacing } from '@tooark/ark-format-shared/spacing';
import { splitByQuotesPreserve } from './powerShellLex';
import { PowerShellFormatterOptions, PowerShellSpacingConfig } from './types';

/**
 * Função para construir a configuração de espaçamento efetiva a partir das opções do formatador.
 * O `spaceBeforeFunctionBrace` é sempre habilitado: a extensão de PowerShell não expõe essa
 * opção como configuração (diferente da extensão de Shell).
 * @param opts As opções de formatação de PowerShell (documento ou intervalo).
 * @returns A configuração de espaçamento a ser aplicada às linhas de código.
 */
export function toPowerShellSpacingConfig (opts: PowerShellFormatterOptions): PowerShellSpacingConfig {
  return {
    spaceBeforeFunctionBrace: true,
    collapseSpaces: opts.collapseSpaces ?? true
  };
}

/**
 * Função para aplicar espaçamento consistente em código PowerShell, de acordo com as opções fornecidas.
 * @param trimmedLine A linha de código PowerShell já sem espaços iniciais e finais.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns A linha de código PowerShell com o espaçamento aplicado conforme as regras definidas.
 */
export function applyPowerShellSpacing (trimmedLine: string, cfg: PowerShellSpacingConfig): string {
  const parts = splitByQuotesPreserve(trimmedLine);

  return parts.map(p => (p.kind === 'code' ? transformCode(p.text, cfg) : p.text)).join('');
}

/**
 * Função auxiliar para transformar o código PowerShell aplicando as regras de espaçamento conforme as opções fornecidas.
 * @param code O trecho de código PowerShell a ser transformado.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns O trecho de código PowerShell transformado com o espaçamento aplicado.
 */
function transformCode (code: string, cfg: PowerShellSpacingConfig): string {
  let s = code;

  // Aplica espaço antes da chave de abertura em definições de função, se configurado
  if (cfg.spaceBeforeFunctionBrace) {
    // function Name{ -> function Name {
    s = s.replace(/\b(function\s+[A-Za-z_][A-Za-z0-9_-]*)\s*\{/gi, '$1 {');
    // if (...) {, foreach (...) {, switch (...) {
    s = s.replace(/(\))\s*\{/g, '$1 {');
    // try{ catch{ finally{ else{
    s = s.replace(/\b(try|catch|finally|else)\s*\{/gi, '$1 {');
  }

  // Colapsa múltiplos espaços em um único espaço, mas preserva os espaços iniciais (que são tratados pela indentação)
  if (cfg.collapseSpaces) {
    s = collapseDoubleSpaces(s);
  }

  // Normaliza o espaçamento em comentários, preservando o fechamento de comentário em bloco (#>)
  s = normalizeCommentSpacing(s, findCommentStart, ['>']);

  return s;
}

/**
 * Função para encontrar a posição do início de um comentário em uma linha de código PowerShell.
 * Retorna a posição do início de comentário PowerShell (`#`) quando ele de fato atua como comentário.
 * Ignora `#` usados em expansões como `${#var}` e `${var##pattern}`.
 * @param code A linha de código PowerShell a ser analisada.
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

    // `#` escapado por crase não inicia comentário.
    if (code[i - 1] === '`') {
      continue;
    }

    // Comentário inline típico: espaço/tab ou separadores de instrução/bloco.
    if (/[\s;{}()\[\]]/.test(code[i - 1])) {
      return i;
    }
  }

  return -1;
}
