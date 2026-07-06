import type { FormatterOptions } from '@tooark/ark-format-shared/types';
export type {
  LineEnding,
  MakefileLanguageId
} from '@tooark/ark-format-shared/types';

export { MAKEFILE_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from '@tooark/ark-format-shared/types';

/**
 * Tipagem para o tipo de uma linha de Makefile, identificada pelo classificador.
 * - `blank`: Linha vazia ou contendo apenas espaços em branco.
 * - `comment`: Comentário de linha inteira (`# ...`).
 * - `target`: Declaração de alvo/regra (`alvo: pré-requisitos`).
 * - `assignment`: Atribuição de variável (`VAR := valor`).
 * - `conditional-open`: Abertura de condicional (`ifeq`, `ifneq`, `ifdef`, `ifndef`).
 * - `conditional-else`: Cláusula `else` (incluindo `else ifeq ...`).
 * - `conditional-end`: Fechamento de condicional (`endif`).
 * - `define-open`: Abertura de definição multilinha (`define NOME`).
 * - `define-end`: Fechamento de definição multilinha (`endef`).
 * - `directive`: Diretiva do make (`include`, `export`, `vpath`, etc.).
 * - `other`: Qualquer outra linha (ex.: chamadas `$(eval ...)`).
 */
export type MakefileLineKind =
  | 'blank'
  | 'comment'
  | 'target'
  | 'assignment'
  | 'conditional-open'
  | 'conditional-else'
  | 'conditional-end'
  | 'define-open'
  | 'define-end'
  | 'directive'
  | 'other';

/**
 * Interface para uma linha de Makefile classificada pelo lexer.
 * - `kind`: O tipo da linha, conforme `MakefileLineKind`.
 * - `raw`: O conteúdo original da linha, sem modificações.
 * - `trimmed`: O conteúdo da linha sem espaços em branco iniciais e finais.
 * - `endsWithContinuation`: Indica se a linha termina com uma continuação de linha (`\`).
 */
export interface ClassifiedLine {
  kind: MakefileLineKind;
  raw: string;
  trimmed: string;
  endsWithContinuation: boolean;
}

/**
 * Interface para configurações de espaçamento para o formatador de Makefile. Permite configurar:
 * - `spaceAroundAssignment`: Se deve normalizar um espaço em torno dos operadores de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`).
 * - `spaceAfterTargetColon`: Se deve garantir um espaço após o `:` em declarações de alvo (e nenhum espaço antes).
 * - `spaceAfterCommentMarker`: Se deve garantir um espaço entre o marcador de comentário (`#`) e o texto do comentário.
 */
export interface MakefileSpacingOptions {
  spaceAroundAssignment: boolean;
  spaceAfterTargetColon: boolean;
  spaceAfterCommentMarker: boolean;
}

/**
 * Interface para opções de formatação de Makefile. Estende as opções gerais de formatação (`FormatterOptions`) e adiciona:
 * - `indentConditionals`: Se deve indentar o conteúdo de blocos condicionais (`ifeq`/`else`/`endif`) usando espaços.
 *   A indentação de condicionais sempre usa espaços, pois TAB tem significado próprio em Makefiles (prefixo de recipe).
 * - `normalizeRecipePrefix`: Se deve converter linhas de recipe indentadas com espaços (erro comum) para o prefixo TAB obrigatório.
 * - `alignAssignments`: Se deve alinhar verticalmente os operadores de atribuição em blocos contíguos de variáveis.
 *   Desligado por padrão: o alinhamento gera ruído de diff quando um nome mais longo é adicionado ao bloco.
 * - `spacing`: Configurações específicas de espaçamento para formatação de Makefile.
 */
export interface MakefileFormatterOptions extends FormatterOptions {
  indentConditionals: boolean;
  normalizeRecipePrefix: boolean;
  alignAssignments: boolean;
  spacing: MakefileSpacingOptions;
}

/**
 * Interface para opções específicas do formatador de intervalo de Makefile.
 * Estende as opções gerais de formatação de Makefile (`MakefileFormatterOptions`) e adiciona:
 * - `reindent`: Se deve reindentar o intervalo selecionado.
 * - `baseIndent`: Profundidade de condicionais calculada a partir do contexto do documento (linhas anteriores à seleção).
 */
export interface MakefileRangeFormatterOptions extends MakefileFormatterOptions {
  reindent: boolean;
  baseIndent: number;
}
