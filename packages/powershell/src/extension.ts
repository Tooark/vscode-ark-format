import * as vscode from 'vscode';
import { applyEditorConfigOverrides, formatterConfigKeys, getConfig, parseEditorConfig } from './formatters/editorConfigReader';
import { PowerShellFormatter } from './formatters/powerShellFormatter';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './formatters/powerShellIndent';
import { getCodePartsOnly, getQuoteModeAfterLine, isShebang, isFullLineComment } from './formatters/powerShellLex';
import { PowerShellRangeFormatter } from './formatters/powerShellRangeFormatter';
import { POWERSHELL_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from './formatters/types';
import { IndentStyle, LineEnding, PowerShellFormatterOptions, PowerShellLanguageId, QuoteKind } from './formatters/types';

/** DiagnosticCollection compartilhada para erros de formatação */
let diagnosticCollection: vscode.DiagnosticCollection;

/**
 * Função de ativação da extensão. Registra os provedores de formatação para documentos e intervalos.
 * @param context O contexto de extensão fornecido pelo VS Code, usado para registrar os provedores e gerenciar suas assinaturas.
 */
export function activate (context: vscode.ExtensionContext) {
  console.log(vscode.l10n.t('ark.active'));

  diagnosticCollection = vscode.languages.createDiagnosticCollection('ark-format-powershell');
  context.subscriptions.push(diagnosticCollection);

  // Escopo de linguagens configurável
  const config = getConfig('arkFormatPowerShell');
  const effectLanguages = config.get<PowerShellLanguageId[]>(formatterConfigKeys.effectLanguages) ?? [...POWERSHELL_LANGUAGE_IDS];

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
      const cfg = getConfig('arkFormatPowerShell');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>(formatterConfigKeys.enabled) === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      let formatterOptions = buildFormatterOptions(cfg, options);

      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        formatterOptions = applyEditorConfigOverrides(formatterOptions, ecProps);
      }

      const formatter = new PowerShellFormatter(formatterOptions);
      diagnosticCollection.delete(document.uri);

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
      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      // Obter configurações
      const cfg = getConfig('arkFormatPowerShell');
      if (!cfg.get<boolean>(formatterConfigKeys.enabled, true)) {
        return [];
      }

      // Verifica se a formatação de intervalo está habilitada
      if (cfg.get<boolean>(formatterConfigKeys.rangeFormattingEnabled) === false) {
        return [];
      }

      const reindent = cfg.get<boolean>(formatterConfigKeys.rangeFormattingReindent) ?? false;
      const useDocumentContext = cfg.get<boolean>(formatterConfigKeys.rangeFormattingUseDocumentContext) ?? true;

      // Construir opções de formatação, aplicando EditorConfig se configurado
      let formatterOptions = buildFormatterOptions(cfg, options);
      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        formatterOptions = applyEditorConfigOverrides(formatterOptions, ecProps);
      }

      const baseIndent = reindent && useDocumentContext ? computeBaseIndent(document, range.start.line) : 0;

      const formatter = new PowerShellRangeFormatter({
        ...formatterOptions,
        removeLeadingBlankLines: false,
        insertFinalNewline: false,
        lineEnding: 'Auto',
        reindent,
        baseIndent
      });

      return formatter.formatRange(document, range);
    }
  });

  context.subscriptions.push(docProvider, rangeProvider);
}

/**
 * Função para construir as opções do formatador interno a partir da configuração do VS Code e do EditorConfig.
 * As opções do EditorConfig sobrescrevem as opções padrão apenas quando definidas.
 * @param cfg Configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @param editorOptions Opções de formatação fornecidas pelo editor (ex: tabSize), usadas como fallback para algumas configurações.
 * @returns As opções de formatação construídas a partir da configuração do VS Code e do EditorConfig.
 */
function buildFormatterOptions (cfg: vscode.WorkspaceConfiguration, editorOptions: vscode.FormattingOptions): PowerShellFormatterOptions {
  return {
    indentStyle: cfg.get<IndentStyle>(formatterConfigKeys.indentStyle) ?? (editorOptions.insertSpaces === false ? 'tab' : 'space'),
    indentSize: cfg.get<number>(formatterConfigKeys.indentSize) ?? editorOptions.tabSize,
    lineEnding: cfg.get<LineEnding>(formatterConfigKeys.lineEnding) ?? 'CRLF',
    trimTrailingWhitespace: cfg.get<boolean>(formatterConfigKeys.trimTrailingWhitespace) ?? true,
    maxConsecutiveBlankLines: cfg.get<number>(formatterConfigKeys.maxConsecutiveBlankLines) ?? 1,
    removeLeadingBlankLines: cfg.get<boolean>(formatterConfigKeys.removeLeadingBlankLines) ?? true,
    insertFinalNewline: cfg.get<boolean>(formatterConfigKeys.insertFinalNewline) ?? true,
    collapseSpaces: cfg.get<boolean>(formatterConfigKeys.collapseSpaces) ?? true
  };
}

/**
 * Função para calcular o nível de indentação base a partir do contexto do documento,
 * analisando as linhas anteriores à seleção.
 * @param document O documento a ser analisado.
 * @param startLine A linha inicial da seleção.
 * @returns O nível de indentação base.
 */
function computeBaseIndent (document: vscode.TextDocument, startLine: number): number {
  const st = createInitialState();
  let quoteMode: QuoteKind = 'code';

  // Itera sobre as linhas anteriores à seleção para calcular o estado de indentação
  for (let i = 0; i < startLine; i++) {
    const raw = document.lineAt(i).text;
    const rawTrimmed = raw.trim();
    const controlText = getCodePartsOnly(raw, quoteMode).trim();
    const nextQuoteMode = getQuoteModeAfterLine(raw, quoteMode);

    // Ignora conteúdo interno de strings multilinha para cálculo de contexto.
    if (quoteMode !== 'code') {
      quoteMode = nextQuoteMode;

      continue;
    }

    // Linhas vazias, shebangs e comentários de linha inteira não afetam a indentação
    if (rawTrimmed === '' || isShebang(rawTrimmed) || isFullLineComment(rawTrimmed)) {
      quoteMode = nextQuoteMode;

      continue;
    }

    // Atualiza o estado de indentação com base na linha atual
    dedentBeforeLine(controlText, st);
    indentAfterLine(controlText, st);
    quoteMode = nextQuoteMode;
  }

  return Math.max(0, st.indent);
}

/**
 * Função de desativação da extensão
 */
export function deactivate () { }
