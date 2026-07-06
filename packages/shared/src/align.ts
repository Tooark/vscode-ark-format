/**
 * Tipagem para os metadados de alinhamento de uma linha emitida por um formatador.
 * - `head`: Linha de atribuição de variável (candidata ao alinhamento em bloco).
 * - `aligned-continuation`: Linha de continuação alinhada ao valor da atribuição anterior
 *   (realinhada quando a coluna do valor muda com o alinhamento).
 * - `plain-continuation`: Linha de continuação preservada sem alinhamento (não encerra o bloco).
 * - `other`: Qualquer outra linha (interrompe blocos de alinhamento).
 */
export type AssignmentAlignMeta = 'head' | 'aligned-continuation' | 'plain-continuation' | 'other';

/**
 * Interface para as partes de uma linha de atribuição já formatada, produzidas pelo parser
 * específico de cada linguagem.
 * - `indent`: A indentação da linha (preservada como está).
 * - `name`: O nome da variável, incluindo prefixos da linguagem (ex.: `export` no make).
 * - `operator`: O operador de atribuição (ex.: `=`, `:=`, `?=`, `+=`).
 * - `rest`: O valor da atribuição (incluindo comentário inline, se houver).
 */
export interface AlignableAssignmentParts {
  indent: string;
  name: string;
  operator: string;
  rest: string;
}

/**
 * Tipagem para a função de parse de uma linha de atribuição formatada, específica de cada linguagem.
 * Deve retornar as partes da atribuição, ou null quando a linha não for uma atribuição alinhável.
 */
export type ParseAlignableAssignment = (line: string) => AlignableAssignmentParts | null;

/**
 * Constante para o limite de comprimento do nome (incluindo prefixos) a partir do qual
 * uma linha fica fora do alinhamento em bloco, evitando que um nome muito longo
 * empurre a coluna de alinhamento do bloco inteiro.
 */
export const ALIGNMENT_NAME_LIMIT = 40;

/**
 * Função para alinhar verticalmente os operadores de atribuição em blocos contíguos de variáveis.
 * O alinhamento é feito pelo caractere `=` final do operador (operadores podem ter larguras
 * diferentes), preenchendo à esquerda do operador com ESPAÇOS (nunca TAB) e mantendo exatamente
 * um espaço após o operador.
 *
 * Regras aplicadas:
 * - Um bloco é uma sequência contígua de atribuições com a mesma indentação; qualquer outra
 *   linha (meta `other`) encerra o bloco.
 * - Linhas de continuação pertencem à atribuição anterior e não encerram o bloco; continuações
 *   com meta `aligned-continuation` são realinhadas com a nova coluna do valor.
 * - A coluna do bloco é definida pela linha mais "larga" (nome + um espaço + seu próprio
 *   operador), calculada POR LINHA: o nome mais longo fica com exatamente um espaço antes
 *   do seu operador, mesmo com operadores de larguras diferentes.
 * - Linhas cujo nome excede `ALIGNMENT_NAME_LIMIT` ficam fora do alinhamento, mantendo o
 *   formato padrão de um espaço, sem empurrar a coluna do bloco.
 * - O operador nunca é convertido em outro.
 * @param lines As linhas já formatadas.
 * @param meta Os metadados de alinhamento de cada linha, paralelos a `lines`.
 * @param parseAssignment A função de parse de atribuições da linguagem.
 * @returns As linhas com os operadores de atribuição alinhados por bloco.
 */
export function alignAssignmentBlocks (
  lines: string[],
  meta: AssignmentAlignMeta[],
  parseAssignment: ParseAlignableAssignment
): string[] {
  const result = [...lines];
  let i = 0;

  // Percorre as linhas procurando o início de blocos de atribuições
  while (i < result.length) {
    // Avança até encontrar uma linha de atribuição
    if (meta[i] !== 'head') {
      i++;

      continue;
    }

    const first = parseAssignment(result[i]);

    // Se a linha não puder ser decomposta, avança sem alinhar
    if (!first) {
      i++;

      continue;
    }

    // Coleta o bloco contíguo de atribuições com a mesma indentação,
    // anexando as linhas de continuação à atribuição correspondente
    const heads: Array<{ index: number; parts: AlignableAssignmentParts; continuations: number[] }> = [];
    let j = i;

    // Itera enquanto houver atribuições contíguas no mesmo nível de indentação
    while (j < result.length && meta[j] === 'head') {
      const parts = parseAssignment(result[j]);

      // Interrompe o bloco quando a linha não decompõe ou muda o nível de indentação
      if (!parts || parts.indent !== first.indent) {
        break;
      }

      const entry = { index: j, parts, continuations: [] as number[] };
      j++;

      // Anexa as linhas de continuação da atribuição atual
      while (j < result.length && (meta[j] === 'aligned-continuation' || meta[j] === 'plain-continuation')) {
        // Apenas continuações alinhadas ao valor são realinhadas depois
        if (meta[j] === 'aligned-continuation') {
          entry.continuations.push(j);
        }

        j++;
      }

      heads.push(entry);
    }

    // Considera apenas as linhas dentro do limite de comprimento do nome
    const eligible = heads.filter(head => head.parts.name.length <= ALIGNMENT_NAME_LIMIT);

    // Verifica se há linhas elegíveis para calcular a coluna de alinhamento do bloco
    if (eligible.length > 0) {
      // Largura até o `=` final: a linha mais "larga" (nome + um espaço + seu próprio operador)
      // define a coluna do bloco. Calculada POR LINHA para que o nome mais longo fique com
      // exatamente um espaço antes do seu operador, mesmo com operadores de larguras diferentes.
      const eqWidth = Math.max(...eligible.map(head => head.parts.name.length + 1 + head.parts.operator.length));

      // Reescreve cada linha elegível com o operador alinhado
      for (const head of eligible) {
        const padding = ' '.repeat(eqWidth - head.parts.name.length - head.parts.operator.length);
        result[head.index] = head.parts.rest === ''
          ? `${head.parts.indent}${head.parts.name}${padding}${head.parts.operator}`
          : `${head.parts.indent}${head.parts.name}${padding}${head.parts.operator} ${head.parts.rest}`;

        // Realinha as continuações com a nova coluna de início do valor
        const valueColumn = head.parts.indent.length + eqWidth + 1;

        for (const continuationIndex of head.continuations) {
          result[continuationIndex] = ' '.repeat(valueColumn) + result[continuationIndex].trimStart();
        }
      }
    }

    i = j;
  }

  return result;
}
