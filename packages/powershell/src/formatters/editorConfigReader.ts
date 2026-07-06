export { formatterConfigKeys, getConfig } from '@tooark/ark-format-shared/config';
export { parseEditorConfig, applyEditorConfigOverrides } from '@tooark/ark-format-shared/editorConfig';

/**
 * Constantes de chaves de configuração específicas para a extensão de PowerShell.
 * - `formatBlockComments`: Se habilitado, reindenta o conteúdo de blocos de comentário (`<# ... #>`)
 *   com o tamanho de indentação configurado; caso contrário, preserva o bloco sem alterações.
 * - `alignAssignments`: Se habilitado, alinha verticalmente os operadores de atribuição em blocos
 *   contíguos de variáveis e entradas de hashtable.
 */
export const powerShellConfigKeys = {
  formatBlockComments: 'formatBlockComments',
  alignAssignments: 'alignAssignments'
} as const;
