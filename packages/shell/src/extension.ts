import * as vscode from 'vscode';
import { applyEditorConfigOverrides, formatterConfigKeys, getConfig, parseEditorConfig, shellConfigKeys } from './formatters/editorConfigReader';
import { ShellFormatter } from './formatters/shellFormatter';
import { createInitialState, dedentBeforeLine, indentAfterLine } from './formatters/shellIndent';
import { detectHeredocInCode, isShebang, isFullLineComment } from './formatters/shellLex';
import { ShellRangeFormatter } from './formatters/shellRangeFormatter';
import { runShfmt } from './formatters/shfmtRunner';
import { SHELL_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES, type IndentStyle, type LineEnding, type ShellLanguageId } from './formatters/types';
import { ShellFormatterOptions, FormatterEngine } from './formatters/types';

/** DiagnosticCollection compartilhada para erros de formatação */
let diagnosticCollection: vscode.DiagnosticCollection;

/**
 * Função de ativação da extensão. Registra os provedores de formatação para documentos e intervalos.
 * @param context O contexto de extensão fornecido pelo VS Code, usado para registrar os provedores e gerenciar suas assinaturas.
 */
export function activate (context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('ark-format-shell');
  context.subscriptions.push(diagnosticCollection);

  // Escopo de linguagens configurável
  const config = getConfig('arkFormatShell');
  const effectLanguages = config.get<ShellLanguageId[]>(formatterConfigKeys.effectLanguages) ?? [...SHELL_LANGUAGE_IDS];

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
      const cfg = getConfig('arkFormatShell');

      // Verifica se a formatação está habilitada globalmente
      if (cfg.get<boolean>(formatterConfigKeys.enabled) === false) {
        return [];
      }

      // Verifica se a operação de formatação foi cancelada
      if (token.isCancellationRequested) {
        return [];
      }

      // Verifica qual engine de formatação usar (interna ou shfmt)
      const engine = (cfg.get<FormatterEngine>(shellConfigKeys.engine) ?? 'internal') as FormatterEngine;

      // Engine externa shfmt
      if (engine === 'shfmt') {
        return formatWithShfmt(document, cfg);
      }

      // Engine interna
      let formatterOptions = buildFormatterOptions(cfg, options);

      // Suporte EditorConfig
      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        formatterOptions = applyEditorConfigOverrides(formatterOptions, ecProps);
      }

      // Cria o formatador interno com as opções construídas
      const formatter = new ShellFormatter(formatterOptions);

      // Limpa diagnósticos ao formatar com sucesso
      diagnosticCollection.delete(document.uri);

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
      const cfg = getConfig('arkFormatShell');

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

      let opts = buildFormatterOptions(cfg, options);

      // EditorConfig no range também
      if (cfg.get<boolean>(formatterConfigKeys.useEditorConfig) === true && document.uri.scheme === 'file') {
        const ecProps = parseEditorConfig(document.uri.fsPath);
        opts = applyEditorConfigOverrides(opts, ecProps);
      }

      // Calcula baseIndent a partir das linhas anteriores à seleção
      const baseIndent = reindent && useDocumentContext ? computeBaseIndent(document, range.start.line) : 0;

      // Cria o formatador de intervalo com as opções construídas, incluindo baseIndent
      const formatter = new ShellRangeFormatter({
        ...opts,
        removeLeadingBlankLines: false,
        insertFinalNewline: false,
        lineEnding: 'Auto' as LineEnding,
        reindent,
        baseIndent
      });

      return formatter.formatRange(document, range);
    }
  });

  // Limpa diagnósticos quando o documento é fechado
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => {
      diagnosticCollection.delete(doc.uri);
    })
  );

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
function buildFormatterOptions (cfg: vscode.WorkspaceConfiguration, editorOptions: vscode.FormattingOptions): ShellFormatterOptions {
  return {
    indentStyle: cfg.get<IndentStyle>(formatterConfigKeys.indentStyle) ?? (editorOptions.insertSpaces === false ? 'tab' : 'space'),
    indentSize: cfg.get<number>(formatterConfigKeys.indentSize) ?? editorOptions.tabSize,
    lineEnding: cfg.get<LineEnding>(formatterConfigKeys.lineEnding) ?? 'LF',
    trimTrailingWhitespace: cfg.get<boolean>(formatterConfigKeys.trimTrailingWhitespace) ?? true,
    maxConsecutiveBlankLines: cfg.get<number>(formatterConfigKeys.maxConsecutiveBlankLines) ?? 1,
    removeLeadingBlankLines: cfg.get<boolean>(formatterConfigKeys.removeLeadingBlankLines) ?? true,
    insertFinalNewline: cfg.get<boolean>(formatterConfigKeys.insertFinalNewline) ?? true,
    collapseSpaces: cfg.get<boolean>(formatterConfigKeys.collapseSpaces) ?? true,
    spacing: {
      spaceBeforeThenDo: cfg.get<boolean>(shellConfigKeys.spacingSpaceBeforeThenDo) ?? true,
      spaceAfterKeywords: cfg.get<boolean>(shellConfigKeys.spacingSpaceAfterKeywords) ?? true,
      spaceBeforeFunctionBrace: cfg.get<boolean>(shellConfigKeys.spacingSpaceBeforeFunctionBrace) ?? true
    }
  };
}

/**
 * Função que formata o documento usando o binário externo shfmt.
 * Registra diagnósticos no painel de Problems em caso de erro.
 * @param document O documento a ser formatado.
 * @param cfg A configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @returns Um array de TextEdit contendo as edições necessárias para formatar o documento,
 * ou um array vazio se não houver alterações.
 * @remarks Esta função é assíncrona e executa o binário shfmt como um processo filho.
 * O resultado da formatação é processado para gerar as edições ou os diagnósticos de erro.
 * Os diagnósticos incluem a linha, coluna e mensagem de erro retornados pelo shfmt em caso
 * de sintaxe inválida. Se a formatação for bem-sucedida mas o texto formatado for idêntico ao original,
 * retorna um array vazio para evitar edições desnecessárias.
 */
async function formatWithShfmt (document: vscode.TextDocument, cfg: vscode.WorkspaceConfiguration): Promise<vscode.TextEdit[]> {
  // Ignora valores de workspace/workspaceFolder para reduzir risco em repositórios não confiáveis.
  const shfmtPath = getUserLevelConfigValue(cfg, shellConfigKeys.shfmtPath, 'shfmt');
  const shfmtFlags = getUserLevelConfigValue(cfg, shellConfigKeys.shfmtFlags, '');

  // Carrega o conteúdo do documento e executa o shfmt para formatar o texto
  const original = document.getText();
  const result = await runShfmt(original, shfmtPath, shfmtFlags, document.fileName);

  // Verifica se a formatação foi bem-sucedida
  if (result.success && result.formatted !== undefined) {
    diagnosticCollection.delete(document.uri);

    // Verifica se o texto formatado é idêntico ao original para evitar edições desnecessárias
    if (result.formatted === original) {
      return [];
    }

    // Usa a extensão total do documento para a edição
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(original.length)
    );

    return [vscode.TextEdit.replace(fullRange, result.formatted)];
  }

  // Registra o erro como diagnóstico
  if (result.errorMessage) {
    const line = Math.max(0, (result.errorLine ?? 1) - 1);
    const column = Math.max(0, (result.errorColumn ?? 1) - 1);
    const pos = new vscode.Position(line, column);

    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(pos, pos),
      result.errorMessage,
      vscode.DiagnosticSeverity.Error
    );

    diagnostic.source = 'ark-format-shell (shfmt)';
    diagnosticCollection.set(document.uri, [diagnostic]);
  }

  return [];
}

/**
 * Função para ler chave de configuração privilegiando escopos de usuário e ignorando escopos de workspace.
 * @param cfg Configuração do VS Code para a extensão, usada para ler as opções de formatação.
 * @param key A chave de configuração a ser lida.
 * @param fallback O valor de fallback a ser retornado caso a chave não esteja definida em nenhum escopo de usuário.
 * @returns O valor da configuração lido do escopo de usuário, ou o valor de fallback se não estiver definido.
 * @remarks Esta função é útil para configurações que afetam a execução de binários externos, onde valores definidos
 * em escopos de workspace podem representar riscos de segurança em repositórios não confiáveis. Ela garante que
 * apenas valores definidos em escopos de usuário (global ou globalLanguage) sejam considerados, ignorando quaisquer
 * valores definidos em escopos de workspace ou workspaceFolder.
 */
function getUserLevelConfigValue<T> (cfg: vscode.WorkspaceConfiguration, key: string, fallback: T): T {
  const inspected = cfg.inspect<T>(key);
  // Se a configuração não estiver definida em nenhum escopo, retorna o fallback
  if (!inspected) {
    return fallback;
  }

  // Verifica se há alguma configuração definida em escopo de workspace ou workspaceFolder
  const hasWorkspaceOverride = inspected.workspaceValue !== undefined
    || inspected.workspaceLanguageValue !== undefined
    || inspected.workspaceFolderValue !== undefined
    || inspected.workspaceFolderLanguageValue !== undefined;

  // Se houver qualquer configuração definida em escopo de workspace, ignora os valores de workspace e retorna apenas os valores de usuário
  if (hasWorkspaceOverride) {
    return inspected.globalLanguageValue
      ?? inspected.globalValue
      ?? inspected.defaultLanguageValue
      ?? inspected.defaultValue
      ?? fallback;
  }

  // Se não houver configuração definida em escopo de workspace
  return inspected.workspaceFolderLanguageValue
    ?? inspected.workspaceFolderValue
    ?? inspected.workspaceLanguageValue
    ?? inspected.workspaceValue
    ?? inspected.globalLanguageValue
    ?? inspected.globalValue
    ?? inspected.defaultLanguageValue
    ?? inspected.defaultValue
    ?? fallback;
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

  // Itera sobre as linhas anteriores à seleção para calcular o estado de indentação
  for (let i = 0; i < startLine; i++) {
    const raw = document.lineAt(i).text;
    const trimmed = raw.trim();

    // Verifica se estamos dentro de um heredoc e atualiza o estado de acordo
    if (st.inHeredoc) {
      // Verifica se a linha atual é o terminador do heredoc
      if (trimmed === st.heredocEnd) {
        st.inHeredoc = false;
        st.heredocEnd = '';
      }

      continue;
    }

    const heredocEnd = detectHeredocInCode(trimmed);

    // Verifica se a linha é vazia, um shebang ou um comentário de linha inteira
    if (trimmed === '' || isShebang(trimmed) || isFullLineComment(trimmed)) {
      // Verifica se há um heredoc na linha atual
      if (heredocEnd) {
        st.inHeredoc = true;
        st.heredocEnd = heredocEnd;
      }

      continue;
    }

    // Aplica a dedentação antes de processar a linha
    dedentBeforeLine(trimmed, st);
    indentAfterLine(trimmed, st);

    // Verifica se há um heredoc na linha atual
    if (heredocEnd) {
      st.inHeredoc = true;
      st.heredocEnd = heredocEnd;
    }
  }

  // O nível de indentação base é o nível atual após processar as linhas anteriores
  return Math.max(0, st.indent);
}

/**
 * Função de desativação da extensão.
 */
export function deactivate () { }
