import type { FormatterOptions } from '@tooark/ark-format-shared/types';
export type {
  IndentStyle,
  LineEnding,
  PowerShellLanguageId
} from '@tooark/ark-format-shared/types';

export { POWERSHELL_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from '@tooark/ark-format-shared/types';

/**
 * Tipagem para o modo de aspas ativo durante o processamento linha a linha do lexer PowerShell.
 * Indica se o formatador está em código normal ou dentro de um literal de string multilinha.
 * Apenas literais que podem se estender por múltiplas linhas precisam de modo próprio,
 * pois seu conteúdo não deve ser reprocessado como código (sem spacing, sem reindentação).
 * - `code`: código normal, fora de qualquer string.
 * - `sq`: dentro de uma string de aspas simples `'...'` (verbatim, sem interpolação).
 * - `dq`: dentro de uma string de aspas duplas `"..."` (expansível, com interpolação).
 * - `hereSq`: dentro de uma here-string verbatim `@'...'@`.
 * - `hereDq`: dentro de uma here-string expansível `@"..."@`.
 * Subexpressões `$(...)` e arrays `@(...)` são tratados como código normal pelo indentador.
 */
export type QuoteKind =
  'code'    // código normal, fora de aspas
  | 'sq'      // 'single-quoted string'
  | 'dq'      // "double-quoted string"
  | 'hereSq'  // @' ... '@
  | 'hereDq'; // @" ... "@

/**
 * Estado de indentação para o formatador PowerShell.
 * - `parenDepth`: Profundidade de parênteses multilinha pendentes (`(`, `@(`, `$(`, `param (`),
 *   usada para indentar o conteúdo interno e alinhar o `)` de fechamento com a linha que abriu.
 * - `afterCloseBrace`: Indica se a última linha de código foi um `}` isolado (que já dedentou),
 *   evitando que uma cláusula `else`/`elseif`/`catch`/`finally` em linha própria dedentar de novo.
 */
export interface IndentState {
  indent: number;
  inHeredoc: boolean;
  heredocEnd: string;
  continuation: boolean;
  parenDepth: number;
  afterCloseBrace: boolean;
}

/**
 * Interface para opções de formatação de PowerShell.
 * Estende as opções gerais de formatação (`FormatterOptions`).
 * - `formatBlockComments`: Se habilitado, reindenta o conteúdo de blocos de comentário (`<# ... #>`)
 *   usando o tamanho de indentação configurado; caso contrário, preserva o bloco sem alterações.
 * - `alignAssignments`: Se habilitado, alinha verticalmente os operadores de atribuição em blocos
 *   contíguos de variáveis (`$var = ...`) e entradas de hashtable (`Chave = valor`).
 *   Desligado por padrão: o alinhamento gera ruído de diff quando um nome mais longo é adicionado ao bloco.
 */
export interface PowerShellFormatterOptions extends FormatterOptions {
  formatBlockComments?: boolean;
  alignAssignments?: boolean;
}

/**
 * Interface para opções específicas do formatador de intervalo de PowerShell.
 * Estende as opções gerais de formatação (`PowerShellFormatterOptions`) e adiciona:
 * - `reindent`: Se deve reindentar o intervalo selecionado.
 * - `baseIndent`: Nível de indentação base calculado a partir do contexto do documento.
 */
export interface PowerShellRangeFormatterOptions extends PowerShellFormatterOptions {
  reindent: boolean;
  baseIndent: number;
}

/**
 * Configurações internas de espaçamento do PowerShell.
 */
export interface PowerShellSpacingConfig {
  spaceBeforeFunctionBrace: boolean;
  collapseSpaces: boolean;
}
