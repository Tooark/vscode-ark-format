import * as vscode from 'vscode';

/**
 * Constante para as chaves comuns de configuração usadas pelos formatadores.
 * - `enabled`: Se a formatação está habilitada.
 * - `effectLanguages`: Quais linguagens a formatação deve afetar.
 * - `useEditorConfig`: Se as configurações do EditorConfig devem ser usadas para sobrepor as configurações do formatador.
 * - `indentStyle`: O estilo de indentação (espaços ou tabulações).
 * - `indentSize`: O número de espaços por nível de indentação (se `indentStyle` for "space").
 * - `lineEnding`: O tipo de quebra de linha a ser usado (LF, CRLF, CR).
 * - `trimTrailingWhitespace`: Se os espaços em branco no final das linhas devem ser removidos.
 * - `maxConsecutiveBlankLines`: O número máximo de linhas em branco consecutivas permitidas.
 * - `removeLeadingBlankLines`: Se as linhas em branco no início do arquivo devem ser removidas.
 * - `insertFinalNewline`: Se um caractere de nova linha deve ser inserido no final do arquivo, se não houver.
 * - `collapseSpaces`: Se múltiplos espaços devem ser colapsados em um único espaço, exceto para espaços iniciais (indentação) e espaços em comentários.
 * - `rangeFormatting.enabled`: Se a formatação de intervalo está habilitada.
 * - `rangeFormatting.reindent`: Se a formatação de intervalo deve reindentar as linhas formatadas.
 * - `rangeFormatting.useDocumentContext`: Se a formatação de intervalo deve usar o contexto do documento para calcular a indentação base.
 */
export const formatterConfigKeys = {
  enabled: 'enabled',
  effectLanguages: 'effectLanguages',
  useEditorConfig: 'useEditorConfig',
  indentStyle: 'indentStyle',
  indentSize: 'indentSize',
  lineEnding: 'lineEnding',
  trimTrailingWhitespace: 'trimTrailingWhitespace',
  maxConsecutiveBlankLines: 'maxConsecutiveBlankLines',
  removeLeadingBlankLines: 'removeLeadingBlankLines',
  insertFinalNewline: 'insertFinalNewline',
  collapseSpaces: 'collapseSpaces',
  rangeFormattingEnabled: 'rangeFormatting.enabled',
  rangeFormattingReindent: 'rangeFormatting.reindent',
  rangeFormattingUseDocumentContext: 'rangeFormatting.useDocumentContext'
} as const;

/**
 * Função para obter a configuração do VS Code para uma seção específica.
 * @param section A seção da configuração (ex: "editor", "files").
 * @param scope O escopo da configuração (opcional).
 * @returns A configuração do VS Code para a seção especificada.
 */
export function getConfig (section: string, scope?: vscode.ConfigurationScope): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(section, scope);
}

/**
 * Função para obter um valor booleano da configuração do VS Code.
 * @param config A configuração do VS Code.
 * @param key A chave da configuração a ser obtida.
 * @param defaultValue O valor padrão a ser retornado se a chave não estiver definida (opcional).
 * @returns O valor booleano da configuração ou o valor padrão.
 */
export function getBoolean (config: vscode.WorkspaceConfiguration, key: string, defaultValue = false): boolean {
  return config.get<boolean>(key) ?? defaultValue;
}

/**
 * Função para obter um valor string da configuração do VS Code.
 * @param config A configuração do VS Code.
 * @param key A chave da configuração a ser obtida.
 * @param defaultValue O valor padrão a ser retornado se a chave não estiver definida (opcional).
 * @returns O valor string da configuração ou o valor padrão.
 */
export function getString (config: vscode.WorkspaceConfiguration, key: string, defaultValue = ''): string {
  return config.get<string>(key) ?? defaultValue;
}

/**
 * Função para obter um valor numérico da configuração do VS Code.
 * @param config A configuração do VS Code.
 * @param key A chave da configuração a ser obtida.
 * @param defaultValue O valor padrão a ser retornado se a chave não estiver definida (opcional).
 * @returns O valor numérico da configuração ou o valor padrão.
 */
export function getNumber (config: vscode.WorkspaceConfiguration, key: string, defaultValue = 0): number {
  return config.get<number>(key) ?? defaultValue;
}

/**
 * Função para mesclar as configurações padrão com as configurações personalizadas, dando prioridade às personalizadas.
 * @param defaults As configurações padrão.
 * @param overrides As configurações personalizadas (opcional).
 * @returns A configuração resultante da mesclagem.
 */
export function mergeDefaults<T extends object> (defaults: T, overrides?: Partial<T>): T {
  return {
    ...defaults,
    ...overrides
  };
}
