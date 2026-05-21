import type { FormatterOptions } from '@tooark/ark-format-shared/types';
export type {
  EditorConfigProperties,
  ExecResult,
  FormatResult,
  IndentStyle,
  LineEnding,
  PowerShellLanguageId,
  SettingsBase,
  ToolError
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
 */
export interface IndentState {
  indent: number;
  inHeredoc: boolean;
  heredocEnd: string;
  continuation: boolean;
  inParamBlock: boolean;
}

/**
 * Interface para opções de formatação de PowerShell.
 * Estende as opções gerais de formatação (`FormatterOptions`).
 */
export interface PowerShellFormatterOptions extends FormatterOptions { }

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
