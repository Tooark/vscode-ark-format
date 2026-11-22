import { collapseDoubleSpaces, normalizeCommentSpacing } from '@tooark/ark-format-shared/spacing';
import { isCommentStart, splitByQuotesPreserve } from './powerShellLex';
import { PowerShellFormatterOptions, PowerShellSpacingConfig } from './types';

// Diretivas que só valem sem espaço após o `#`: `#Requires`, `#region` e `#endregion`.
const COMMENT_DIRECTIVE_RE = /^#(?:requires|region|endregion)(?![A-Za-z0-9_])/i;

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

  return parts.map((p, idx) => {
    // Strings, variáveis `${...}` e comentários de bloco são mantidos como estão
    if (p.kind !== 'code') {
      return p.text;
    }

    let text = transformCode(p.text, cfg);

    // Uma variável `${...}` ou um comentário de bloco divide o código em partes; os espaços
    // repetidos ao redor deles são colapsados aqui, como no restante do código.
    if (cfg.collapseSpaces) {
      if (parts[idx - 1]?.kind === 'verbatim') {
        text = text.replace(/^ {2,}/, ' ');
      }

      if (parts[idx + 1]?.kind === 'verbatim') {
        text = text.replace(/ {2,}$/, ' ');
      }
    }

    return text;
  }).join('');
}

/**
 * Função auxiliar para transformar o código PowerShell aplicando as regras de espaçamento conforme as opções fornecidas.
 * @param code O trecho de código PowerShell a ser transformado.
 * @param cfg Configurações de espaçamento a serem aplicadas.
 * @returns O trecho de código PowerShell transformado com o espaçamento aplicado.
 */
function transformCode (code: string, cfg: PowerShellSpacingConfig): string {
  // Separa o texto do comentário para que as regras de espaçamento não o alterem: alinhamentos em
  // colunas, exemplos de uso e trechos de código citados em comentários devem ser preservados.
  // O `#` permanece no trecho de código para que o espaço entre o código e o comentário inline
  // também seja colapsado (ex.: `$x = 1    # texto` -> `$x = 1 # texto`).
  const commentStart = findCommentStart(code);
  const codeEnd = commentStart === -1 ? code.length : commentStart + 1;
  const comment = code.slice(codeEnd);
  let s = code.slice(0, codeEnd);

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

  // Diretivas escritas como comentário não aceitam espaço após o `#`: `# Requires` deixa de ser a
  // instrução `#Requires` e `# region`/`# endregion` deixam de marcar uma região dobrável.
  if (commentStart !== -1 && COMMENT_DIRECTIVE_RE.test(code.slice(commentStart))) {
    return s + comment;
  }

  // Normaliza o espaçamento em comentários, preservando o fechamento de comentário em bloco (#>)
  return normalizeCommentSpacing(s + comment, findCommentStart, ['>']);
}

/**
 * Função para encontrar a posição do início de um comentário em um trecho de código PowerShell.
 * Usa a mesma regra do lexer (`isCommentStart`): o `#` só é comentário no início de um token,
 * então `C#`, `a#b` e `` `# `` não iniciam comentário.
 * @param code O trecho de código PowerShell a ser analisado (fora de strings).
 * @returns A posição do início do comentário ou -1 se não houver comentário.
 */
function findCommentStart (code: string): number {
  // Itera sobre o trecho para encontrar um `#` que seja um comentário
  for (let i = 0; i < code.length; i++) {
    // Crase escapa o próximo caractere
    if (code[i] === '`') {
      i++;
      continue;
    }

    if (code[i] === '#' && isCommentStart(code, i)) {
      return i;
    }
  }

  return -1;
}
