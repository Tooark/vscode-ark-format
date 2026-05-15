import { LineEnding } from './types';

// Regular expression para detectar quebras de linha CRLF
const CRLF_RE = /\r\n/g;

/**
 * Função para normalizar o texto para usar apenas LF como quebra de linha
 * @param text O texto a ser normalizado
 * @returns O texto normalizado com quebras de linha LF
 */
export function normalizeToLf (text: string): string {
  return text.replace(CRLF_RE, '\n');
}

/**
 * Função para aplicar o estilo de quebra de linha ao texto
 * @param textLf O texto com quebras de linha LF
 * @param mode O modo de quebra de linha a ser aplicado
 * @param originalText O texto original para referência no modo 'Auto'
 * @returns O texto com o estilo de quebra de linha aplicado
 */
export function applyLineEnding (textLf: string, mode: LineEnding, originalText: string): string {
  // Se o modo for 'Auto', detecta o estilo de quebra de linha usado no texto original
  if (mode === 'Auto') {
    const usesCrlf = CRLF_RE.test(originalText);
    
    return usesCrlf ? textLf.replace(/\n/g, '\r\n') : textLf;
  }

  // Se o modo for 'CRLF', converte as quebras de linha LF para CRLF
  if (mode === 'CRLF') {
    return textLf.replace(/\n/g, '\r\n');
  }

  return textLf;
}

/**
 * Função para remover espaços em branco no final de cada linha
 * @param lines As linhas de texto
 * @param enabled Se a remoção deve ser aplicada
 * @returns As linhas de texto com espaços em branco removidos
 */
export function trimTrailingWhitespace (lines: string[], enabled: boolean): string[] {
  // Se a remoção de espaços em branco no final das linhas não estiver habilitada, retorna as linhas originais
  if (!enabled) {
    return lines;
  }

  return lines.map(l => l.replace(/\s+$/g, ''));
}

/**
 * Função para reduzir linhas em branco consecutivas
 * @param lines As linhas de texto
 * @param maxConsecutive O número máximo de linhas em branco consecutivas permitidas
 * @returns As linhas de texto com linhas em branco reduzidas
 */
export function reduceBlankLines (lines: string[], maxConsecutive: number): string[] {
  const out: string[] = [];
  let blanks = 0;

  // Itera sobre as linhas do texto
  for (const line of lines) {
    // Se a linha for em branco, incrementa o contador de linhas em branco
    if (line.trim() === '') {
      blanks++;

      // Se o número de linhas em branco consecutivas for menor ou igual ao máximo permitido, adiciona uma linha em branco ao resultado
      if (blanks <= maxConsecutive) {
        out.push('');
      }
    } else {
      blanks = 0;
      out.push(line);
    }
  }

  return out;
}

/**
 * Função para remover linhas em branco no início do texto
 * @param lines As linhas de texto
 * @param enabled Se a remoção deve ser aplicada
 * @returns As linhas de texto com linhas em branco removidas do início
 */
export function removeLeadingBlankLines (lines: string[], enabled: boolean): string[] {
  // Se a remoção de linhas em branco no início do texto não estiver habilitada, retorna as linhas originais
  if (!enabled) {
    return lines;
  }

  let i = 0;

  // Itera sobre as linhas do texto até encontrar a primeira linha que não seja em branco
  while (i < lines.length && lines[i].trim() === '') {
    i++;
  }

  return lines.slice(i);
}

/**
 * Função para garantir que o texto termine com uma nova linha
 * @param text O texto a ser verificado
 * @param enabled Se a garantia deve ser aplicada
 * @returns O texto com uma nova linha final, se necessário
 */
export function ensureFinalNewline (text: string, enabled: boolean): string {
  // Se a garantia de nova linha final não estiver habilitada, retorna o texto original
  if (!enabled) {
    return text;
  }

  return text.endsWith('\n') ? text : text + '\n';
}
