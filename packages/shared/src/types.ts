import * as vscode from 'vscode';

/**
 * Constante para esquemas de documento suportados pelos provedores de formatação.
 */
export const SUPPORTED_DOCUMENT_SCHEMES = ['file', 'untitled'] as const;

/**
 * Constante para linguagens suportadas pelo formatador de PowerShell.
 */
export const POWERSHELL_LANGUAGE_IDS = ['powershell'] as const;

/**
 * Constante para linguagens suportadas pelo formatador de Shell.
 */
export const SHELL_LANGUAGE_IDS = ['azcli', 'bash', 'bats', 'ksh', 'sh', 'sh.posix', 'shellscript', 'tcsh'] as const;

/**
 * Tipagem para o final de linha.
 * Pode ser 'lf' (Unix), 'crlf' (Windows) ou 'cr' (Mac antigo).
 */
export type EndOfLine = 'lf' | 'crlf' | 'cr';

/**
 * Tipagem para o estilo de indentação.
 * Pode ser 'space' (espaços) ou 'tab' (tabulação).
 */
export type IndentStyle = 'space' | 'tab';

/**
 * Tipagem de final de linha para formatação de arquivos.
 * Pode ser 'LF' (Unix), 'CRLF' (Windows) ou 'Auto' (detecção automática).
 */
export type LineEnding = 'LF' | 'CRLF' | 'Auto';

/**
 * Tipagem para os esquemas de documento suportados.
 */
export type SupportedDocumentScheme = typeof SUPPORTED_DOCUMENT_SCHEMES[number];

/**
 * Tipagem para os identificadores de linguagem suportados pelo formatador de PowerShell.
 */
export type PowerShellLanguageId = typeof POWERSHELL_LANGUAGE_IDS[number];

/**
 * Tipagem para os identificadores de linguagem suportados pelo formatador de Shell.
 */
export type ShellLanguageId = typeof SHELL_LANGUAGE_IDS[number];

/**
 * Tipagem para marcadores explícitos de continuação de linha por linguagem.
 * - Shell: `\\`
 * - PowerShell: `` ` ``
 */
export type ExplicitLineContinuationMarker = '\\' | '`';

/**
 * Tipagem para operadores que geralmente indicam continuação implícita em nova linha.
 * - Shell: `&&`, `||`, `|`
 * - PowerShell: `|`, `&&`, `||`
 */
export type ImplicitLineContinuationOperator = '|' | '&&' | '||';

/**
 * Tipagem unificada para qualquer tipo de marcador de continuação de linha, seja explícito ou implícito.
 */
export type LineContinuationMarker = ExplicitLineContinuationMarker | ImplicitLineContinuationOperator;

/**
 * Interface para continuação de indentação.
 * - `indent`: O nível de indentação atual.
 * - `continuation`: Indica se a linha atual é uma continuação da linha anterior.
 */
export interface ContinuationIndentState {
  indent: number;
  continuation: boolean;
}

/**
 * Interface para as propriedades relevantes lidas de um `.editorconfig`.
 * - `indent_style`: Define o estilo de indentação (espaços ou tabs).
 * - `indent_size`: Define o número de espaços para cada nível de indentação (aplicável se `indent_style` for 'space').
 * - `end_of_line`: Define o tipo de quebra de linha a ser usada (LF, CRLF ou CR).
 * - `insert_final_newline`: Se deve garantir que o arquivo termine com uma nova linha.
 * - `trim_trailing_whitespace`: Se deve remover espaços em branco no final das linhas.
 */
export interface EditorConfigProperties {
  indent_style?: IndentStyle;
  indent_size?: number;
  trim_trailing_whitespace?: boolean;
  max_consecutive_blank_lines?: number;
  remove_leading_blank_lines?: boolean;
  insert_final_newline?: boolean;
  end_of_line?: EndOfLine;
  collapse_spaces?: boolean;
}

/**
 * Interface para opções de execução de um comando.
 * - `command`: O comando a ser executado.
 * - `args`: Argumentos opcionais para o comando.
 * - `cwd`: Diretório de trabalho para a execução do comando.
 * - `env`: Variáveis de ambiente para o processo.
 * - `stdin`: Entrada padrão a ser fornecida ao processo.
 * - `timeoutMs`: Tempo máximo de execução em milissegundos antes de encerrar o processo.
 */
export interface ExecOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdin?: string;
  timeoutMs?: number;
}

/**
 * Interface para o resultado da execução de um comando.
 * - `command`: O comando que foi executado.
 * - `args`: Os argumentos que foram passados para o comando.
 * - `stdout`: A saída padrão do processo como string.
 * - `stderr`: A saída de erro do processo como string.
 * - `exitCode`: O código de saída do processo, ou null se o processo não terminou normalmente.
 * - `timedOut`: Indica se o processo foi encerrado devido a um tempo limite.
 * - `error`: Qualquer erro que ocorreu durante a execução do processo, como erros de spawn ou execução.
 */
export interface ExecResult {
  command: string;
  args: string[];
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  error?: Error;
}

/**
 * Interface para opções de formatação. Permite configurar:
 * - `indentSize`: Número de espaços para cada nível de indentação.
 * - `indentStyle`: Estilo de indentação (espaço ou tabulação).
 * - `trimTrailingWhitespace`: Se deve remover espaços em branco no final das linhas.
 * - `maxConsecutiveBlankLines`: Número máximo de linhas em branco consecutivas permitidas.
 * - `removeLeadingBlankLines`: Se deve remover linhas em branco no início do documento.
 * - `insertFinalNewline`: Se deve garantir que o documento termine com uma nova linha.
 * - `lineEnding`: Tipo de quebra de linha a ser usada (LF, CRLF ou Auto).
 * - `collapseSpaces`: Se deve colapsar múltiplos espaços em um único espaço, exceto para espaços iniciais (indentação) e espaços em comentários.
 */
export interface FormatterOptions {
  indentSize: number;
  indentStyle: IndentStyle;
  trimTrailingWhitespace: boolean;
  maxConsecutiveBlankLines: number;
  removeLeadingBlankLines: boolean;
  insertFinalNewline: boolean;
  lineEnding: LineEnding;
  collapseSpaces: boolean;
}

/**
 * Interface para configurações de range formatting compartilhadas entre extensões.
 * - `enabled`: Se a formatação de range está habilitada.
 * - `reindent`: Se a formatação de range deve reindentar as linhas formatadas.
 * - `useDocumentContext`: Se a formatação de range deve usar o contexto do documento para calcular a indentação base.
 */
export interface RangeFormattingSettings {
  enabled: boolean;
  reindent: boolean;
  useDocumentContext: boolean;
}

/**
 * Interface para os parâmetros genéricos da função de formatação de texto.
 * - `originalText`: O texto original a ser formatado.
 * - `opts`: As opções de formatação a serem aplicadas.
 * - `createInitialState`: Função para criar o estado inicial da formatação.
 * - `dedentBeforeLine`: Função para ajustar a indentação antes de processar uma linha de código.
 * - `indentAfterLine`: Função para ajustar a indentação após processar uma linha de código.
 * - `isShebang`: Função para verificar se uma linha é um shebang (linha de início de script).
 * - `detectHeredocInCode`: Função para detectar se uma linha inicia um heredoc e retornar o marcador de término do heredoc.
 * - `getCodePartsOnly`: Função para extrair apenas as partes de código de uma linha, ignorando strings e comentários, com base no modo de aspas atual.
 * - `getQuoteModeAfterLine`: Função para determinar o modo de aspas após processar uma linha, para manter o estado correto ao lidar com strings multilinha.
 * - `applySpacing`: Função para aplicar regras de espaçamento específicas à linha de código, de acordo com as opções configuradas.
 * - `detectBlockCommentStart`: Função opcional para detectar o início de um bloco de comentário multilinha (ex.: `<#` no PowerShell).
 * - `isBlockCommentEnd`: Função opcional para detectar o fim de um bloco de comentário multilinha (ex.: `#>` no PowerShell).
 * - `isBlockCommentKeyword`: Função opcional para identificar palavras-chave dentro do bloco de comentário (ex.: `.SYNOPSIS`), usada ao reindentar o bloco.
 * - `formatBlockComments`: Se habilitado, reindenta o conteúdo do bloco de comentário usando o tamanho de indentação configurado; caso contrário, preserva o bloco sem alterações.
 */
export interface FormatTextGenericParams<State extends FormatTextState, QuoteKind extends string, Opts extends FormatterOptions> {
  originalText: string;
  opts: Opts;
  createInitialState: () => State;
  dedentBeforeLine: (controlText: string, st: State) => void;
  indentAfterLine: (controlText: string, st: State) => void;
  isShebang: (line: string) => boolean;
  detectHeredocInCode: (line: string) => string | null;
  getCodePartsOnly: (line: string, quoteMode: QuoteKind) => string;
  getQuoteModeAfterLine: (line: string, quoteMode: QuoteKind) => QuoteKind;
  applySpacing: (line: string, opts: Opts) => string;
  detectBlockCommentStart?: (trimmed: string) => boolean;
  isBlockCommentEnd?: (trimmed: string) => boolean;
  isBlockCommentKeyword?: (trimmed: string) => boolean;
  formatBlockComments?: boolean;
}

/**
 * Interface para o estado da formatação de texto.
 * Estende `ContinuationIndentState` com campos de heredoc comuns a Shell e PowerShell.
 * - `inHeredoc`: Indica se o estado atual está dentro de um heredoc.
 * - `heredocEnd`: O marcador de término do heredoc, para identificar quando o heredoc termina.
 */
export interface FormatTextState extends ContinuationIndentState {
  inHeredoc: boolean;
  heredocEnd: string;
}

/**
 * Interface para o resultado da formatação de um arquivo.
 * - `success`: Indica se a formatação foi bem-sucedida.
 * - `formattedText`: O texto formatado, se a formatação foi bem-sucedida.
 * - `error`: Detalhes do erro, se a formatação falhou.
 */
export interface FormatResult {
  success: boolean;
  formattedText?: string;
  error?: ToolError;
}

/**
 * Interface para um logger de extensão do VS Code.
 * - `channel`: O canal de saída do VS Code onde as mensagens serão registradas.
 * - `info`: Método para registrar mensagens de informação.
 * - `warn`: Método para registrar mensagens de aviso.
 * - `error`: Método para registrar mensagens de erro.
 * - `dispose`: Método para liberar os recursos do logger quando não for mais necessário.
 */
export interface Logger {
  channel: vscode.OutputChannel;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  dispose: () => void;
}

/**
 * Interface base para configurações de ferramentas.
 * - `enabled`: Indica se a ferramenta está habilitada.
 * - Permite propriedades adicionais de qualquer tipo.
 */
export interface SettingsBase {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Interface para erros de ferramentas.
 * - `message`: A mensagem de erro.
 * - `code`: Código de erro opcional, que pode ser um número ou string.
 * - `exitCode`: Código de saída do processo, se aplicável.
 * - `details`: Detalhes adicionais sobre o erro.
 */
export interface ToolError {
  message: string;
  code?: number | string;
  exitCode?: number | null;
  details?: string;
}
