import * as vscode from 'vscode';
import { applyEditorConfigOverrides, formatterConfigKeys, getConfig, makefileConfigKeys, parseEditorConfig } from './formatters/editorConfigReader';
import { MakefileFormatter } from './formatters/makefileFormatter';
import { classifyTrimmedLine, hasRecipePrefix } from './formatters/makefileLex';
import { MakefileRangeFormatter } from './formatters/makefileRangeFormatter';
import { MAKEFILE_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from './formatters/types';
import type { LineEnding, MakefileFormatterOptions, MakefileLanguageId } from './formatters/types';

/**
 * Função de ativação da extensão. Registra os provedores de formatação para documentos e intervalos.
 * @param context O contexto de extensão fornecido pelo VS Code, usado para registrar os provedores e gerenciar suas assinaturas.
 */
export function activate (context: vscode.ExtensionContext) {
  // Escopo de linguagens configurável
  const config = getConfig('arkFormatMakefile');
  const effectLanguages = config.get<MakefileLanguageId[]>(formatterConfigKeys.effectLanguages) ?? [...MAKEFILE_LANGUAGE_IDS];

  // Cria um seletor de documentos combinando os idiomas e esquemas configurados
  const selector: vscode.DocumentSelector = effectLanguages.flatMap(lang =>
    SUPPORTED_DOCUMENT_SCHEMES.map(scheme => ({ scheme, language: lang }))
  );

  // Registra o provedor de formatação de documento
  const docProvider = vscode.languages.registerDocumentFormattingEditProvider(selector, {
    provideDocumentFormattingEdits (
      document: vscode.TextDocument,
      options: vscode.FormattingOptions,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
      // Carrega a configuração para a extensão
      const cfg = getConfig('arkFormatMakefile');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>(formatterConfigKeys.enabled) === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      // Constrói as opções do formatador interno a partir da configuração do VS Code e do EditorConfig
      let formatterOptions = buildFormatterOptions(cfg, options);

      // Suporte EditorConfig
      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        formatterOptions = applyEditorConfigOverrides(formatterOptions, ecProps);
      }

      // Cria o formatador interno com as opções construídas
      const formatter = new MakefileFormatter(formatterOptions);

      // Formata o documento usando o formatador interno e retorna as edições necessárias
      return formatter.formatDocument(document);
    }
  });

  // Registra o provedor de formatação de intervalo
  const rangeProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
    provideDocumentRangeFormattingEdits (
      document: vscode.TextDocument,
      range: vscode.Range,
      options: vscode.FormattingOptions,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
      // Carrega a configuração para a extensão
      const cfg = getConfig('arkFormatMakefile');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>(formatterConfigKeys.enabled) === false) {
        return [];
      }

      // Verifica se a formatação de intervalo está habilitada
      if (cfg.get<boolean>(formatterConfigKeys.rangeFormattingEnabled) === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      const reindent = cfg.get<boolean>(formatterConfigKeys.rangeFormattingReindent) ?? false;
      const useDocumentContext = cfg.get<boolean>(formatterConfigKeys.rangeFormattingUseDocumentContext) ?? true;

      // Constrói as opções do formatador interno a partir da configuração do VS Code e do EditorConfig
      let formatterOptions = buildFormatterOptions(cfg, options);

      // Verifica se o uso do EditorConfig está habilitado e se o documento é um arquivo
      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        formatterOptions = applyEditorConfigOverrides(formatterOptions, ecProps);
      }

      // Calcula baseIndent (profundidade de condicionais) a partir das linhas anteriores à seleção
      const baseIndent = reindent && useDocumentContext ? computeBaseIndent(document, range.start.line) : 0;

      // Cria o formatador de intervalo com as opções construídas, incluindo baseIndent
      const formatter = new MakefileRangeFormatter({
        ...formatterOptions,
        removeLeadingBlankLines: false,
        insertFinalNewline: false,
        lineEnding: 'Auto' as LineEnding,
        reindent,
        baseIndent
      });

      return formatter.formatRange(document, range);
    }
  });

  // Adiciona os provedores de formatação às assinaturas do contexto para gerenciamento de ciclo de vida
  context.subscriptions.push(docProvider, rangeProvider);
}

/**
 * Função para construir as opções do formatador interno a partir da configuração do VS Code e do EditorConfig.
 * As opções do EditorConfig sobrescrevem as opções padrão apenas quando definidas.
 * @param cfg Configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @param editorOptions Opções de formatação fornecidas pelo editor (ex: tabSize), usadas como fallback para algumas configurações.
 * @returns As opções de formatação construídas a partir da configuração do VS Code e do EditorConfig.
 */
function buildFormatterOptions (cfg: vscode.WorkspaceConfiguration, editorOptions: vscode.FormattingOptions): MakefileFormatterOptions {
  return {
    indentStyle: 'tab', // Campo exigido pelo tipo compartilhado e ignorado pelo formatador de Makefile
    indentSize: cfg.get<number>(formatterConfigKeys.indentSize) ?? editorOptions.tabSize,
    lineEnding: cfg.get<LineEnding>(formatterConfigKeys.lineEnding) ?? 'LF',
    trimTrailingWhitespace: cfg.get<boolean>(formatterConfigKeys.trimTrailingWhitespace) ?? true,
    maxConsecutiveBlankLines: cfg.get<number>(formatterConfigKeys.maxConsecutiveBlankLines) ?? 1,
    removeLeadingBlankLines: cfg.get<boolean>(formatterConfigKeys.removeLeadingBlankLines) ?? true,
    insertFinalNewline: cfg.get<boolean>(formatterConfigKeys.insertFinalNewline) ?? true,
    collapseSpaces: cfg.get<boolean>(formatterConfigKeys.collapseSpaces) ?? true,
    indentConditionals: cfg.get<boolean>(makefileConfigKeys.indentConditionals) ?? true,
    normalizeRecipePrefix: cfg.get<boolean>(makefileConfigKeys.normalizeRecipePrefix) ?? true,
    alignAssignments: cfg.get<boolean>(makefileConfigKeys.alignAssignments) ?? false,
    spacing: {
      spaceAroundAssignment: cfg.get<boolean>(makefileConfigKeys.spacingSpaceAroundAssignment) ?? true,
      spaceAfterTargetColon: cfg.get<boolean>(makefileConfigKeys.spacingSpaceAfterTargetColon) ?? true,
      spaceAfterCommentMarker: cfg.get<boolean>(makefileConfigKeys.spacingSpaceAfterCommentMarker) ?? true
    }
  };
}

/**
 * Função para calcular a profundidade de condicionais base a partir do contexto do documento,
 * analisando as linhas anteriores à seleção.
 * @param document O documento a ser analisado.
 * @param startLine A linha inicial da seleção.
 * @returns A profundidade de condicionais no início da seleção.
 */
function computeBaseIndent (document: vscode.TextDocument, startLine: number): number {
  let depth = 0;
  let inDefine = false;

  // Itera sobre as linhas anteriores à seleção para calcular a profundidade de condicionais
  for (let i = 0; i < startLine; i++) {
    const raw = document.lineAt(i).text;
    const trimmed = raw.trim();

    // Ignora linhas de recipe (prefixadas com TAB), que não afetam a profundidade de condicionais
    if (hasRecipePrefix(raw)) {
      continue;
    }

    const kind = classifyTrimmedLine(trimmed);

    // Ignora o conteúdo de blocos define ... endef
    if (inDefine) {
      // Verifica se a linha atual encerra o bloco define
      if (kind === 'define-end') {
        inDefine = false;
      }

      continue;
    }

    // Verifica se a linha abre um bloco define
    if (kind === 'define-open') {
      inDefine = true;

      continue;
    }

    // Atualiza a profundidade de condicionais conforme a abertura e o fechamento de blocos
    if (kind === 'conditional-open') {
      depth++;
    } else if (kind === 'conditional-end') {
      depth = Math.max(0, depth - 1);
    }
  }

  return Math.max(0, depth);
}

/**
 * Função de desativação da extensão.
 */
export function deactivate () { }
