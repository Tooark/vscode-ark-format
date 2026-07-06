import type { FormatterOptions } from '@tooark/ark-format-shared/types';
export type {
  IndentStyle,
  LineEnding,
  ShellLanguageId
} from '@tooark/ark-format-shared/types';

export { SHELL_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from '@tooark/ark-format-shared/types';

/**
 * Tipagem para o motor de formatação utilizado.
 * - `internal`: Usa o formatador interno puro em TypeScript.
 * - `shfmt`: Usa o binário externo `shfmt` para formatação.
 */
export type FormatterEngine = 'internal' | 'shfmt';

/**
 * Tipagem para o modo de aspas ativo durante o processamento linha a linha do lexer Shell.
 * Indica se o formatador está em código normal ou dentro de um literal de string.
 * O conteúdo em modo de string não deve ser reprocessado como código (sem spacing, sem reindentação).
 * - `code`: código normal, fora de qualquer string.
 * - `sq`: dentro de uma string de aspas simples `'...'` (verbatim, sem interpolação).
 * - `dq`: dentro de uma string de aspas duplas `"..."` (com interpolação e escapes).
 * - `ansi`: dentro de ANSI-C quoting `$'...'` (escapes estilo C: `\n`, `\t`, etc.).
 * - `bt`: dentro de substituição de comando por crases `` `...` `` (equivalente a `$(...)`).
 */
export type QuoteKind =
  'code' // código normal, fora de aspas
  | 'sq'   // 'single-quoted string'
  | 'dq'   // "double-quoted string"
  | 'ansi' // ANSI-C quoting: $'...'
  | 'bt';  // backtick quoting: `...`

/**
 * Interface para representar o estado de indentação durante a formatação de shell. Permite rastrear:
 * - `indent`: Nível atual de indentação.
 * - `inHeredoc`: Se o processador está atualmente dentro de um heredoc.
 * - `heredocEnd`: O marcador de término do heredoc atual, se estiver dentro de um.
 * - `inCase`: Se o processador está atualmente dentro de um bloco `case`.
 * - `inCasePatternBody`: Se o processador está dentro do corpo de um padrão em um bloco `case`.
 * - `continuation`: Se a linha anterior terminou com uma continuação (`\`).
 */
export interface IndentState {
  indent: number;
  inHeredoc: boolean;
  heredocEnd: string;
  inCase: boolean;
  inCasePatternBody: boolean;
  continuation: boolean;
}

/**
 * Interface para opções de formatação de shell. Estende as opções gerais de formatação (`FormatterOptions`) e adiciona:
 * - `spacing`: Configurações específicas de espaçamento para formatação de shell.
 */
export interface ShellFormatterOptions extends FormatterOptions {
  spacing: SpacingOptions;
}

/**
 * Interface para opções específicas do formatador de intervalo de shell.
 * Estende as opções gerais de formatação de shell (`ShellFormatterOptions`) e adiciona:
 * - `reindent`: Se deve reindentar o intervalo selecionado.
 * - `baseIndent`: Nível de indentação base calculado a partir do contexto do documento (linhas anteriores à seleção).
 */
export interface ShellRangeFormatterOptions extends ShellFormatterOptions {
  reindent: boolean;
  baseIndent: number;
}

/**
 * Interface para a configuração de espaçamento efetiva aplicada a uma linha.
 * Estende as opções de espaçamento (`SpacingOptions`) com:
 * - `collapseSpaces`: Se deve colapsar múltiplos espaços em um único espaço, exceto para espaços iniciais (indentação) e espaços em comentários.
 */
export interface ShellSpacingConfig extends SpacingOptions {
  collapseSpaces: boolean;
}

/**
 * Interface para o resultado da execução do binário `shfmt` para formatação de shell. Permite representar:
 * - `success`: Se a formatação foi bem-sucedida.
 * - `formatted`: O texto formatado, presente apenas se `success` for true.
 * - `errorLine`: A linha onde ocorreu um erro de sintaxe, presente apenas se `success` for false.
 * - `errorColumn`: A coluna onde ocorreu um erro de sintaxe, presente apenas se `success` for false.
 * - `errorMessage`: A mensagem de erro detalhada, presente apenas se `success` for false.
 */
export interface ShfmtResult {
  success: boolean;
  formatted?: string;
  errorLine?: number;
  errorColumn?: number;
  errorMessage?: string;
}

/**
 * Interface para configurações de espaçamento em formatação de shell. Permite configurar:
 * - `spaceBeforeThenDo`: Se deve adicionar um espaço antes de `then` e `do` em comandos como `if` e `while`.
 * - `spaceAfterKeywords`: Se deve adicionar um espaço após palavras-chave como `if`, `while`, `until` antes de colchetes ou parênteses.
 * - `spaceBeforeFunctionBrace`: Se deve adicionar um espaço antes da chave de abertura em definições de função.
 */
export interface SpacingOptions {
  spaceBeforeThenDo: boolean;
  spaceAfterKeywords: boolean;
  spaceBeforeFunctionBrace: boolean;
}
