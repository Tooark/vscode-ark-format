export { formatterConfigKeys, getConfig } from '@tooark/ark-format-shared/config';
export { parseEditorConfig, applyEditorConfigOverrides } from '@tooark/ark-format-shared/editorConfig';

/**
 * Constantes de chaves de configuração específicas para a extensão de Makefile.
 * - `indentConditionals`: Se deve indentar o conteúdo de blocos condicionais (`ifeq`/`else`/`endif`).
 * - `normalizeRecipePrefix`: Se deve converter linhas de recipe indentadas com espaços para o prefixo TAB obrigatório.
 * - `alignAssignments`: Se deve alinhar verticalmente os operadores de atribuição em blocos contíguos de variáveis.
 * - `spacingSpaceAroundAssignment`: Se deve normalizar um espaço em torno dos operadores de atribuição.
 * - `spacingSpaceAfterTargetColon`: Se deve garantir um espaço após o `:` em declarações de alvo.
 * - `spacingSpaceAfterCommentMarker`: Se deve garantir um espaço entre o marcador de comentário (`#`) e o texto.
 */
export const makefileConfigKeys = {
  indentConditionals: 'indentConditionals',
  normalizeRecipePrefix: 'normalizeRecipePrefix',
  alignAssignments: 'alignAssignments',
  spacingSpaceAroundAssignment: 'spacing.spaceAroundAssignment',
  spacingSpaceAfterTargetColon: 'spacing.spaceAfterTargetColon',
  spacingSpaceAfterCommentMarker: 'spacing.spaceAfterCommentMarker'
} as const;
