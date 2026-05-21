export { formatterConfigKeys, getConfig } from '@tooark/ark-format-shared/config';
export { parseEditorConfig, applyEditorConfigOverrides } from '@tooark/ark-format-shared/editorConfig';

/**
 * Constantes de chaves de configuração específicas para a extensão de Shell Script.
 * - `engine`: A engine de formatação a ser usada (ex: "shfmt").
 * - `shfmtPath`: O caminho para o executável do shfmt, se a engine selecionada for "shfmt".
 * - `shfmtFlags`: Flags adicionais a serem passadas para o shfmt.
 * - `spacingSpaceBeforeThenDo`: Se deve haver um espaço antes de "then" e "do".
 * - `spacingSpaceAfterKeywords`: Se deve haver um espaço após palavras-chave como "if", "for", etc.
 * - `spacingSpaceBeforeFunctionBrace`: Se deve haver um espaço antes da chave de abertura em definições de função.
 */
export const shellConfigKeys = {
  engine: 'engine',
  shfmtPath: 'shfmt.path',
  shfmtFlags: 'shfmt.flags',
  spacingSpaceBeforeThenDo: 'spacing.spaceBeforeThenDo',
  spacingSpaceAfterKeywords: 'spacing.spaceAfterKeywords',
  spacingSpaceBeforeFunctionBrace: 'spacing.spaceBeforeFunctionBrace'
} as const;
