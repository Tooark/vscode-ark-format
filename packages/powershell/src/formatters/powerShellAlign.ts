import { alignAssignmentBlocks, AlignableAssignmentParts, AssignmentAlignMeta } from '@tooark/ark-format-shared/align';
import { hasOddTrailingExplicitMarker } from '@tooark/ark-format-shared/indent';
import { getCodePartsOnly, getQuoteModeAfterLine, isBlockCommentEnd, isBlockCommentStart } from './powerShellLex';
import type { QuoteKind } from './types';

/**
 * Expressão regular para atribuições de variável do PowerShell, com escopo opcional
 * (`$env:PATH`, `$script:nome`) e os operadores compostos (`+=`, `-=`, `*=`, `/=`, `%=`, `??=`).
 */
const VARIABLE_ASSIGNMENT_RE = /^([ \t]*)(\$(?:[A-Za-z_][\w]*:)?[A-Za-z_][\w]*)[ \t]*(\+=|-=|\*=|\/=|%=|\?\?=|=)[ \t]*(.*)$/;

/**
 * Expressão regular para entradas de hashtable (`Chave = valor`), com chave em bareword
 * ou entre aspas. Fora de um literal `@{ ... }` esse padrão não é código PowerShell válido,
 * então o risco de falso positivo é baixo.
 */
const HASHTABLE_ENTRY_RE = /^([ \t]*)([A-Za-z_][\w-]*|'[^']*'|"[^"]*")[ \t]*(=)[ \t]*(.*)$/;

/**
 * Função para decompor uma linha de atribuição PowerShell já formatada em suas partes.
 * Reconhece atribuições de variável (`$var = valor`) e entradas de hashtable (`Chave = valor`).
 * @param line A linha completa, incluindo a indentação.
 * @returns As partes da atribuição, ou null se a linha não for uma atribuição alinhável.
 */
export function parsePowerShellAssignment (line: string): AlignableAssignmentParts | null {
  const match = line.match(VARIABLE_ASSIGNMENT_RE) ?? line.match(HASHTABLE_ENTRY_RE);

  // Se a linha não corresponder a nenhum padrão de atribuição, retorna null
  if (!match) {
    return null;
  }

  return {
    indent: match[1],
    name: match[2],
    operator: match[3],
    rest: match[4]
  };
}

/**
 * Função para alinhar verticalmente os operadores de atribuição em um texto PowerShell já formatado.
 * Percorre o texto rastreando strings multilinha (here-strings) e blocos de comentário
 * (`<# ... #>`) para nunca alterar conteúdo literal, classifica cada linha (atribuição,
 * continuação ou outra) e delega o alinhamento em blocos ao motor genérico compartilhado.
 *
 * Regras aplicadas:
 * - Blocos contíguos de atribuições com a mesma indentação alinham entre si; linhas em branco,
 *   comentários e demais instruções encerram o bloco.
 * - Linhas de continuação (a linha anterior termina com crase ou pipe fora de strings)
 *   pertencem à atribuição anterior e não encerram o bloco, mas não são realinhadas.
 * - Conteúdo de here-strings e blocos de comentário nunca é alterado.
 * @param formattedText O texto PowerShell já formatado.
 * @returns O texto com os operadores de atribuição alinhados por bloco.
 */
export function alignPowerShellAssignments (formattedText: string): string {
  // O texto já formatado pode usar CRLF (padrão da extensão); normaliza para LF antes da
  // varredura, pois o `\r` no fim das linhas impede o reconhecimento das atribuições e
  // dos delimitadores de here-string, e restaura o CRLF ao final.
  const usesCrlf = formattedText.includes('\r\n');
  const normalizedText = usesCrlf ? formattedText.replace(/\r\n/g, '\n') : formattedText;
  const lines = normalizedText.split('\n');
  const meta: AssignmentAlignMeta[] = [];
  let quoteMode: QuoteKind = 'code';
  let inBlockComment = false;
  let previousContinues = false;

  // Percorre as linhas classificando cada uma para o motor de alinhamento
  for (const raw of lines) {
    const trimmed = raw.trim();

    // Conteúdo de blocos de comentário (<# ... #>) nunca participa do alinhamento
    if (inBlockComment) {
      meta.push('other');

      // Verifica se a linha atual encerra o bloco de comentário
      if (isBlockCommentEnd(trimmed)) {
        inBlockComment = false;
      }

      continue;
    }

    // Conteúdo de strings multilinha (here-strings) nunca participa do alinhamento
    if (quoteMode !== 'code') {
      meta.push('other');
      quoteMode = getQuoteModeAfterLine(raw, quoteMode);
      previousContinues = false;

      continue;
    }

    // Início de um bloco de comentário multilinha
    if (isBlockCommentStart(trimmed)) {
      meta.push('other');
      inBlockComment = true;
      previousContinues = false;

      continue;
    }

    // Extrai apenas as partes de código (sem strings e comentários) para detectar continuações
    const codeParts = getCodePartsOnly(raw, quoteMode).trimEnd();

    // Classifica a linha: continuação da anterior, atribuição ou outra
    if (previousContinues) {
      meta.push('plain-continuation');
    } else if (trimmed !== '' && parsePowerShellAssignment(raw) !== null) {
      meta.push('head');
    } else {
      meta.push('other');
    }

    // A linha atual continua na próxima quando o código termina com crase (`) ou pipe (|)
    previousContinues = codeParts !== ''
      && (codeParts.endsWith('|') || hasOddTrailingExplicitMarker(codeParts, '`'));
    quoteMode = getQuoteModeAfterLine(raw, quoteMode);
  }

  const aligned = alignAssignmentBlocks(lines, meta, parsePowerShellAssignment).join('\n');

  return usesCrlf ? aligned.replace(/\n/g, '\r\n') : aligned;
}
