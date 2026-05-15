/**
 * Tipagem para os tipos de quebra de linha suportados em formatação de shell
 */
export type LineEnding = 'LF' | 'CRLF' | 'Auto';

/**
 * Tipagem para os tipos de partes de uma linha de código shell, usada na função `splitByQuotesPreserve`
 * para identificar se um trecho é código normal (code), entre aspas simples (sq), entre aspas duplas (dq), ANSI-C quoting (ansi) ou entre crases (bt).
 * Isso é útil para preservar o conteúdo original durante a formatação, especialmente para evitar colapsar espaços dentro de strings ou comandos.
 */
export type QuoteKind = 'code' | 'sq' | 'dq' | 'ansi' | 'bt';

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
 * Interface para opções de formatação de shell. Permite configurar:
 * - `indentSize`: Número de espaços para cada nível de indentação.
 * - `trimTrailingWhitespace`: Se deve remover espaços em branco no final das linhas.
 * - `maxConsecutiveBlankLines`: Número máximo de linhas em branco consecutivas permitidas.
 * - `removeLeadingBlankLines`: Se deve remover linhas em branco no início do documento.
 * - `insertFinalNewline`: Se deve garantir que o documento termine com uma nova linha.
 * - `lineEnding`: Tipo de quebra de linha a ser usada (LF, CRLF ou Auto).
 * - `collapseSpaces`: Se deve colapsar múltiplos espaços em um único espaço, exceto para espaços iniciais (indentação) e espaços em comentários.
 * - `spacing`: Configurações adicionais de espaçamento para comandos específicos (definidos na interface `SpacingOptions`).
 */
export interface ShellFormatterOptions {
  indentSize: number;
  trimTrailingWhitespace: boolean;
  maxConsecutiveBlankLines: number;
  removeLeadingBlankLines: boolean;
  insertFinalNewline: boolean;
  lineEnding: LineEnding;
  collapseSpaces: boolean;
  spacing: SpacingOptions;
}

/**
 * Interface para configurações de espaçamento para o formatador de shell. Permite configurar:
 * - `spaceBeforeThenDo`: Se deve adicionar um espaço antes de `then` e `do` em comandos como `if` e `while`.
 * - `spaceAfterKeywords`: Se deve adicionar um espaço após palavras-chave como `if`, `while`, `until` antes de colchetes ou parênteses.
 * - `spaceBeforeFunctionBrace`: Se deve adicionar um espaço antes da chave de abertura em definições de função.
 * - `collapseSpaces`: Se deve colapsar múltiplos espaços em um único espaço, exceto para espaços iniciais (indentação) e espaços em comentários.
 */
export interface ShellSpacingConfig {
  spaceBeforeThenDo: boolean;
  spaceAfterKeywords: boolean;
  spaceBeforeFunctionBrace: boolean;
  collapseSpaces: boolean;
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
